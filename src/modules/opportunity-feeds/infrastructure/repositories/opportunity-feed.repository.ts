import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma.service.js';
import type { OpportunityFeedFields } from '../../domain/entities/opportunity-feed-fields.js';
import type { OpportunityFeedEntity } from '../../domain/entities/opportunity-feed.entity.js';
import { OpportunityFeedLimitReachedError } from '../../domain/errors/opportunity-feed-limit-reached.error.js';
import {
    OpportunityFeedRepositoryPort,
    type NewOpportunityFeed,
} from '../../domain/ports/opportunity-feed-repository.port.js';
import { OpportunityFeedMapper } from '../mappers/opportunity-feed.mapper.js';

const TRANSACTION_TIMEOUT_MS = 15_000;

@Injectable()
export class OpportunityFeedRepository implements OpportunityFeedRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async listByUser(userId: string) {
        const rows = await this.prisma.opportunityFeed.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return rows.map(OpportunityFeedMapper.toDomain);
    }

    async findByIdForUser(id: string, userId: string) {
        const row = await this.prisma.opportunityFeed.findFirst({ where: { id, userId } });

        return row && OpportunityFeedMapper.toDomain(row);
    }

    async findByOnboardingId(userId: string, onboardingId: string) {
        const row = await this.prisma.opportunityFeed.findFirst({ where: { onboardingId, userId } });

        return row && OpportunityFeedMapper.toDomain(row);
    }

    createWithinLimit(data: NewOpportunityFeed, limit: number) {
        return this.prisma.$transaction(
            async (tx) => {
                await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${data.userId}, 0))`;

                if (data.onboardingId) {
                    const existing = await tx.opportunityFeed.findUnique({
                        where: { onboardingId: data.onboardingId },
                    });

                    if (existing) return OpportunityFeedMapper.toDomain(existing);
                }

                const count = await tx.opportunityFeed.count({ where: { userId: data.userId } });

                if (count >= limit) throw new OpportunityFeedLimitReachedError();

                const created = await tx.opportunityFeed.create({ data });

                return OpportunityFeedMapper.toDomain(created);
            },
            { timeout: TRANSACTION_TIMEOUT_MS },
        );
    }

    updateLocked(
        id: string,
        userId: string,
        mutate: (current: OpportunityFeedEntity) => OpportunityFeedFields,
    ) {
        return this.prisma.$transaction(
            async (tx) => {
                const locked = await tx.$queryRaw<{ id: string }[]>`
                    SELECT "id" FROM "OpportunityFeed"
                    WHERE "id" = ${id}::uuid AND "userId" = ${userId}::uuid
                    FOR UPDATE
                `;

                if (locked.length === 0) return null;

                const row = await tx.opportunityFeed.findUniqueOrThrow({ where: { id } });
                const fields = mutate(OpportunityFeedMapper.toDomain(row));
                const updated = await tx.opportunityFeed.update({ where: { id }, data: fields });

                return OpportunityFeedMapper.toDomain(updated);
            },
            { timeout: TRANSACTION_TIMEOUT_MS },
        );
    }

    async deleteByIdForUser(id: string, userId: string) {
        const { count } = await this.prisma.opportunityFeed.deleteMany({ where: { id, userId } });

        return count > 0;
    }
}
