import type { DiscoveryRunEntity } from '../../domain/entities/discovery-run.entity.js';
import type { OpportunityEntity } from '../../domain/entities/opportunity.entity.js';
import type { DiscoveryRunResponseDto } from '../dto/discovery-run-response.dto.js';
import type { OpportunityResponseDto } from '../dto/opportunity-response.dto.js';

export class DiscoveryResponseMapper {
    static run(run: DiscoveryRunEntity, nextRunAt: Date | null): DiscoveryRunResponseDto {
        return {
            id: run.id,
            status: run.status.toLowerCase() as DiscoveryRunResponseDto['status'],
            error: run.error,
            stats: run.stats,
            createdAt: run.createdAt,
            startedAt: run.startedAt,
            finishedAt: run.finishedAt,
            nextRunAt,
        };
    }

    static opportunity(opportunity: OpportunityEntity): OpportunityResponseDto {
        return {
            id: opportunity.id,
            externalPostId: opportunity.externalPostId,
            authorUsername: opportunity.authorUsername,
            text: opportunity.text,
            permalink: opportunity.permalink,
            publishedAt: opportunity.publishedAt,
            relevanceScore: opportunity.relevanceScore,
            reason: opportunity.reason,
            status: opportunity.status.toLowerCase() as OpportunityResponseDto['status'],
            stale: opportunity.stale,
            excludedTerm: opportunity.excludedTerm,
            matchedQueries: opportunity.matchedQueries,
        };
    }
}
