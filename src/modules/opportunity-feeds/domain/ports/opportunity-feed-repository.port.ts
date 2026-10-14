import type { OpportunityFeedFields } from '../entities/opportunity-feed-fields.js';
import type { OpportunityFeedEntity } from '../entities/opportunity-feed.entity.js';

export type NewOpportunityFeed = OpportunityFeedFields & {
    userId: string;
    languages: string[];
    onboardingId: string | null;
};

export abstract class OpportunityFeedRepositoryPort {
    abstract listByUser(userId: string): Promise<OpportunityFeedEntity[]>;
    abstract findByIdForUser(id: string, userId: string): Promise<OpportunityFeedEntity | null>;
    abstract findByOnboardingId(userId: string, onboardingId: string): Promise<OpportunityFeedEntity | null>;
    abstract createWithinLimit(data: NewOpportunityFeed, limit: number): Promise<OpportunityFeedEntity>;
    abstract updateLocked(
        id: string,
        userId: string,
        mutate: (current: OpportunityFeedEntity) => OpportunityFeedFields,
    ): Promise<OpportunityFeedEntity | null>;
    abstract deleteByIdForUser(id: string, userId: string): Promise<boolean>;
}
