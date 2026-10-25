import type { DiscoveryRunEntity, DiscoveryRunStats } from '../entities/discovery-run.entity.js';

export type RunFence = { runId: string; attempt: number };

export type RequestedRun = { run: DiscoveryRunEntity; enqueue: boolean };

export type ClaimResult =
    { outcome: 'claimed'; run: DiscoveryRunEntity } | { outcome: 'paused' } | { outcome: 'skipped' };

export type RunOutcome = { status: 'SUCCEEDED' | 'FAILED'; error: string | null; stats: DiscoveryRunStats };

export type RetryResult =
    | { outcome: 'requeued'; notBefore: Date }
    | { outcome: 'failed'; nextRunId: string | null }
    | { outcome: 'fenced' };

export abstract class DiscoveryRunRepositoryPort {
    abstract request(feedId: string): Promise<RequestedRun>;
    abstract claim(runId: string): Promise<ClaimResult>;
    abstract heartbeat(fence: RunFence, stats: DiscoveryRunStats): Promise<boolean>;
    abstract finish(fence: RunFence, outcome: RunOutcome): Promise<string | null>;
    abstract retryLater(fence: RunFence, stats: DiscoveryRunStats, error: string): Promise<RetryResult>;
    abstract pause(fence: RunFence, stats: DiscoveryRunStats): Promise<boolean>;
    abstract findByIdForFeed(feedId: string, runId: string): Promise<DiscoveryRunEntity | null>;
    abstract findLatestForFeed(feedId: string): Promise<DiscoveryRunEntity | null>;
    abstract findLastCountedRunAt(feedId: string): Promise<Date | null>;
    abstract reconcile(): Promise<string[]>;
}
