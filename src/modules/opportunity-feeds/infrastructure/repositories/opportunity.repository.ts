import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../shared/prisma.service.js';
import type { OpportunityStatus, ReviewStatus } from '../../domain/entities/opportunity.entity.js';
import {
    OpportunityRepositoryPort,
    type OpportunityListFilter,
    type OpportunityReadFilter,
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
        const where = listWhere(filter.feedId, filter.status, filter.newOnly);
        const [rows, total] = await Promise.all([
            this.prisma.opportunity.findMany({
                where,
                include: INCLUDE,
                orderBy: [{ relevanceScore: 'desc' }, { publishedAt: 'desc' }, { id: 'asc' }],
                skip: (filter.page - 1) * filter.pageSize,
                take: filter.pageSize,
            }),
            this.prisma.opportunity.count({ where }),
        ]);

        return { items: rows.map(OpportunityMapper.toDomain), total };
    }

    count(feedId: string, status: OpportunityStatus, newOnly: OpportunityReadFilter | null) {
        return this.prisma.opportunity.count({ where: listWhere(feedId, status, newOnly) });
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

function listWhere(
    feedId: string,
    status: OpportunityStatus,
    newOnly: OpportunityReadFilter | null,
): Prisma.OpportunityWhereInput {
    const where: Prisma.OpportunityWhereInput = { opportunityFeedId: feedId, status };

    if (newOnly) {
        where.relevanceScore = { gte: newOnly.minScore };
        where.publishedAt = { gte: newOnly.publishedSince };
        where.excludedTerm = null;
        if (newOnly.excludeAuthor) {
            where.NOT = { authorUsername: { equals: newOnly.excludeAuthor, mode: 'insensitive' } };
        }
    }

    return where;
}
