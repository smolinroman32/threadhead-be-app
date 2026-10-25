import type { Opportunity } from '../../../../generated/prisma/client.js';
import { OpportunityEntity } from '../../domain/entities/opportunity.entity.js';

type OpportunityRow = Opportunity & {
    opportunitySearchQueries: { searchQuery: { query: string } }[];
    opportunityFeed: { scoringVersion: number };
};

export class OpportunityMapper {
    static toDomain(raw: OpportunityRow): OpportunityEntity {
        return new OpportunityEntity(raw.id, {
            opportunityFeedId: raw.opportunityFeedId,
            externalPostId: raw.externalPostId,
            authorUsername: raw.authorUsername,
            text: raw.text,
            permalink: raw.permalink,
            publishedAt: raw.publishedAt,
            relevanceScore: raw.relevanceScore,
            reason: raw.reason,
            status: raw.status,
            excludedTerm: raw.excludedTerm,
            stale: raw.scoringVersion < raw.opportunityFeed.scoringVersion,
            matchedQueries: raw.opportunitySearchQueries.map((link) => link.searchQuery.query),
        });
    }
}
