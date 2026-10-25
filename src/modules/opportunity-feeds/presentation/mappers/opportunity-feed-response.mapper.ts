import type { OpportunityFeedEntity } from '../../domain/entities/opportunity-feed.entity.js';
import type { OpportunityFeedResponseDto } from '../dto/opportunity-feed-response.dto.js';

export class OpportunityFeedResponseMapper {
    static toDto(feed: OpportunityFeedEntity): OpportunityFeedResponseDto {
        return {
            id: feed.id,
            name: feed.name,
            description: feed.description,
            color: feed.color,
            intent: feed.intent,
            targetAudience: feed.targetAudience,
            includeTerms: feed.includeTerms,
            excludeTerms: feed.excludeTerms,
            languages: feed.languages,
            socialAccountId: feed.socialAccountId,
            freshnessHours: feed.freshnessHours,
            minScore: feed.minScore,
            isActive: feed.isActive,
            createdAt: feed.createdAt,
            updatedAt: feed.updatedAt,
        };
    }
}
