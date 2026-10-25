import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../shared/prisma.service.js';
import {
    HEARTBEAT_STALE_MS,
    MAX_RUN_ATTEMPTS,
    QUEUED_STALE_MS,
    RETRY_DELAY_MS,
} from '../../domain/discovery/discovery.constants.js';
import type { DiscoveryRunStats } from '../../domain/entities/discovery-run.entity.js';
import {
    DiscoveryRunRepositoryPort,
    type ClaimResult,
    type RetryResult,
    type RunFence,
    type RunOutcome,
} from '../../domain/ports/discovery-run-repository.port.js';
import { DiscoveryRunMapper } from '../mappers/discovery-run.mapper.js';

type Tx = Prisma.TransactionClient;

const TRANSACTION_TIMEOUT_MS = 15_000;

@Injectable()
export class DiscoveryRunRepository implements DiscoveryRunRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    request(feedId: string) {
        return this.transaction(async (tx) => {
            await lockFeed(tx, feedId);

            const running = await freshRunningCount(tx, feedId);
            const queued = await tx.discoveryRun.findFirst({
                where: { opportunityFeedId: feedId, status: 'QUEUED' },
            });
            const run =
                queued ??
                (await tx.discoveryRun.create({ data: { opportunityFeedId: feedId, status: 'QUEUED' } }));

            return { run: DiscoveryRunMapper.toDomain(run), enqueue: running === 0 };
        });
    }

    claim(runId: string) {
        return this.transaction(async (tx): Promise<ClaimResult> => {
            const found = await tx.discoveryRun.findUnique({ where: { id: runId } });

            if (!found) return { outcome: 'skipped' };

            await lockFeed(tx, found.opportunityFeedId);

            const run = await tx.discoveryRun.findUniqueOrThrow({ where: { id: runId } });
            const feed = await tx.opportunityFeed.findUniqueOrThrow({ where: { id: run.opportunityFeedId } });
            const now = new Date();
            const claimable =
                (run.status === 'QUEUED' && (!run.notBefore || run.notBefore <= now)) ||
                (run.status === 'RUNNING' && isStale(run.heartbeatAt, now));

            if (!claimable || (await freshRunningCount(tx, feed.id, run.id)) > 0)
                return { outcome: 'skipped' };

            if (!feed.isActive) {
                await tx.discoveryRun.update({ where: { id: runId }, data: { status: 'QUEUED' } });

                return { outcome: 'paused' };
            }

            const claimed = await tx.discoveryRun.update({
                where: { id: runId },
                data: {
                    status: 'RUNNING',
                    attempt: { increment: 1 },
                    heartbeatAt: now,
                    startedAt: run.startedAt ?? now,
                    notBefore: null,
                    scoringVersion: feed.scoringVersion,
                },
            });

            return { outcome: 'claimed', run: DiscoveryRunMapper.toDomain(claimed) };
        });
    }

    async heartbeat(fence: RunFence, stats: DiscoveryRunStats) {
        const done = await this.fenced(fence, (tx) =>
            tx.discoveryRun.update({ where: { id: fence.runId }, data: { stats: json(stats) } }),
        );

        return done !== null;
    }

    async finish(fence: RunFence, outcome: RunOutcome) {
        const next = await this.fenced(fence, async (tx) => {
            const run = await tx.discoveryRun.update({
                where: { id: fence.runId },
                data: {
                    status: outcome.status,
                    error: outcome.error,
                    stats: json(outcome.stats),
                    finishedAt: new Date(),
                },
            });

            return nextQueuedId(tx, run.opportunityFeedId);
        });

        return next ?? null;
    }

    async retryLater(fence: RunFence, stats: DiscoveryRunStats, error: string) {
        const result = await this.fenced(fence, async (tx): Promise<RetryResult> => {
            if (fence.attempt < MAX_RUN_ATTEMPTS) {
                const notBefore = new Date(Date.now() + RETRY_DELAY_MS);

                await tx.discoveryRun.update({
                    where: { id: fence.runId },
                    data: { status: 'QUEUED', notBefore, error, stats: json(stats) },
                });

                return { outcome: 'requeued', notBefore };
            }

            const run = await tx.discoveryRun.update({
                where: { id: fence.runId },
                data: { status: 'FAILED', error, stats: json(stats), finishedAt: new Date() },
            });

            return { outcome: 'failed', nextRunId: await nextQueuedId(tx, run.opportunityFeedId) };
        });

        return result ?? { outcome: 'fenced' };
    }

    async pause(fence: RunFence, stats: DiscoveryRunStats) {
        const done = await this.fenced(fence, (tx) =>
            tx.discoveryRun.update({
                where: { id: fence.runId },
                data: { status: 'QUEUED', stats: json(stats) },
            }),
        );

        return done !== null;
    }

    async findByIdForFeed(feedId: string, runId: string) {
        const row = await this.prisma.discoveryRun.findFirst({
            where: { id: runId, opportunityFeedId: feedId },
        });

        return row && DiscoveryRunMapper.toDomain(row);
    }

    async findLatestForFeed(feedId: string) {
        const row = await this.prisma.discoveryRun.findFirst({
            where: { opportunityFeedId: feedId },
            orderBy: { createdAt: 'desc' },
        });

        return row && DiscoveryRunMapper.toDomain(row);
    }

    async findLastCountedRunAt(feedId: string) {
        const row = await this.prisma.discoveryRun.findFirst({
            where: { opportunityFeedId: feedId, status: { not: 'FAILED' } },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
        });

        return row?.createdAt ?? null;
    }

    async reconcile() {
        const now = new Date();
        const staleBefore = new Date(now.getTime() - HEARTBEAT_STALE_MS);
        const stale = await this.prisma.discoveryRun.findMany({
            where: { status: 'RUNNING', heartbeatAt: { lt: staleBefore } },
        });

        for (const run of stale) {
            const queued = await this.prisma.discoveryRun.count({
                where: { opportunityFeedId: run.opportunityFeedId, status: 'QUEUED' },
            });
            const retry = run.attempt < MAX_RUN_ATTEMPTS && queued === 0;

            await this.prisma.discoveryRun.updateMany({
                where: { id: run.id, status: 'RUNNING', heartbeatAt: { lt: staleBefore } },
                data: retry
                    ? { status: 'QUEUED', notBefore: null }
                    : { status: 'FAILED', error: 'worker_lost', finishedAt: now },
            });
        }

        const queued = await this.prisma.discoveryRun.findMany({
            where: {
                status: 'QUEUED',
                createdAt: { lt: new Date(now.getTime() - QUEUED_STALE_MS) },
                OR: [{ notBefore: null }, { notBefore: { lte: now } }],
                opportunityFeed: {
                    isActive: true,
                    discoveryRuns: { none: { status: 'RUNNING', heartbeatAt: { gte: staleBefore } } },
                },
            },
            select: { id: true },
        });

        return queued.map((run) => run.id);
    }

    private fenced<T>(fence: RunFence, work: (tx: Tx) => Promise<T>) {
        return fencedTransaction(this.prisma, fence, work);
    }

    private transaction<T>(work: (tx: Tx) => Promise<T>) {
        return this.prisma.$transaction(work, { timeout: TRANSACTION_TIMEOUT_MS });
    }
}

export function fencedTransaction<T>(prisma: PrismaService, fence: RunFence, work: (tx: Tx) => Promise<T>) {
    return prisma.$transaction(
        async (tx) => {
            const { count } = await tx.discoveryRun.updateMany({
                where: { id: fence.runId, attempt: fence.attempt, status: 'RUNNING' },
                data: { heartbeatAt: new Date() },
            });

            return count === 0 ? null : work(tx);
        },
        { timeout: TRANSACTION_TIMEOUT_MS },
    );
}

async function lockFeed(tx: Tx, feedId: string) {
    await tx.$queryRaw`SELECT "id" FROM "OpportunityFeed" WHERE "id" = ${feedId}::uuid FOR UPDATE`;
}

function freshRunningCount(tx: Tx, feedId: string, exceptRunId?: string) {
    return tx.discoveryRun.count({
        where: {
            opportunityFeedId: feedId,
            status: 'RUNNING',
            heartbeatAt: { gte: new Date(Date.now() - HEARTBEAT_STALE_MS) },
            ...(exceptRunId && { id: { not: exceptRunId } }),
        },
    });
}

async function nextQueuedId(tx: Tx, feedId: string) {
    const next = await tx.discoveryRun.findFirst({
        where: { opportunityFeedId: feedId, status: 'QUEUED', opportunityFeed: { isActive: true } },
        select: { id: true },
    });

    return next?.id ?? null;
}

function isStale(heartbeatAt: Date | null, now: Date) {
    return !heartbeatAt || heartbeatAt.getTime() < now.getTime() - HEARTBEAT_STALE_MS;
}

function json(stats: DiscoveryRunStats) {
    return stats as Prisma.InputJsonObject;
}
