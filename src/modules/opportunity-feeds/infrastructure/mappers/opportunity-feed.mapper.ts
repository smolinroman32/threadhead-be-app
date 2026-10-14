import type { OpportunityFeed } from '../../../../generated/prisma/client.js';
import { OpportunityFeedEntity } from '../../domain/entities/opportunity-feed.entity.js';

export class OpportunityFeedMapper {
    static toDomain(raw: OpportunityFeed): OpportunityFeedEntity {
        return new OpportunityFeedEntity(raw.id, {
            userId: raw.userId,
            name: raw.name,
            intent: raw.intent,
            targetAudience: raw.targetAudience,
            includeTerms: raw.includeTerms,
            excludeTerms: raw.excludeTerms,
            languages: raw.languages,
            freshnessHours: raw.freshnessHours,
            minScore: raw.minScore,
            isActive: raw.isActive,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
}
