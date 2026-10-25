import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../shared/prisma.service.js';
import type { ReviewStatus } from '../../domain/entities/opportunity.entity.js';
import {
    OpportunityRepositoryPort,
    type OpportunityListFilter,
} from '../../domain/ports/opportunity-repository.port.js';
import { OpportunityMapper } from '../mappers/opportunity.mapper.js';

const INCLUDE = {
    opportunitySearchQueries: { select: { searchQuery: { select: { query: true } } } },
    opportunityFeed: { select: { scoringVersion: true } },
} as const;

@Injectable()
export class OpportunityRepository implements OpportunityRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async list(filter: OpportunityListFilter) {
        const where: Prisma.OpportunityWhereInput = {
            opportunityFeedId: filter.feedId,
            status: filter.status,
        };

        if (filter.newOnly) {
            where.relevanceScore = { gte: filter.newOnly.minScore };
            where.publishedAt = { gte: filter.newOnly.publishedSince };
            where.excludedTerm = null;
            if (filter.newOnly.excludeAuthor) {
                where.NOT = { authorUsername: { equals: filter.newOnly.excludeAuthor, mode: 'insensitive' } };
            }
        }

        const rows = await this.prisma.opportunity.findMany({
            where,
            include: INCLUDE,
            orderBy: [{ relevanceScore: 'desc' }, { publishedAt: 'desc' }, { id: 'asc' }],
            take: filter.limit + 1,
        });

        return {
            items: rows.slice(0, filter.limit).map(OpportunityMapper.toDomain),
            hasMore: rows.length > filter.limit,
        };
    }

    async findByIdForUser(id: string, userId: string) {
        const row = await this.prisma.opportunity.findFirst({
            where: { id, opportunityFeed: { userId } },
            include: INCLUDE,
        });

        return row && OpportunityMapper.toDomain(row);
    }

    async updateStatus(id: string, status: ReviewStatus) {
        const row = await this.prisma.opportunity.update({
            where: { id },
            data: { status },
            include: INCLUDE,
        });

        return OpportunityMapper.toDomain(row);
    }
}
