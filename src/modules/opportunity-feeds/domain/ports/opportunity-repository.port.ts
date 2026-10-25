import type { OpportunityEntity, OpportunityStatus, ReviewStatus } from '../entities/opportunity.entity.js';

export type OpportunityListFilter = {
    feedId: string;
    status: OpportunityStatus;
    newOnly: { minScore: number; publishedSince: Date; excludeAuthor: string | null } | null;
    limit: number;
};

export abstract class OpportunityRepositoryPort {
    abstract list(filter: OpportunityListFilter): Promise<{ items: OpportunityEntity[]; hasMore: boolean }>;
    abstract findByIdForUser(id: string, userId: string): Promise<OpportunityEntity | null>;
    abstract updateStatus(id: string, status: ReviewStatus): Promise<OpportunityEntity>;
}
