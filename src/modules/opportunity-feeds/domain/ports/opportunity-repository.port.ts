import type { OpportunityEntity, OpportunityStatus, ReviewStatus } from '../entities/opportunity.entity.js';

export type OpportunityReadFilter = { minScore: number; publishedSince: Date; excludeAuthor: string | null };

export type OpportunityListFilter = {
    feedId: string;
    status: OpportunityStatus;
    newOnly: OpportunityReadFilter | null;
    page: number;
    pageSize: number;
};

export abstract class OpportunityRepositoryPort {
    abstract list(filter: OpportunityListFilter): Promise<{ items: OpportunityEntity[]; total: number }>;
    abstract count(
        feedId: string,
        status: OpportunityStatus,
        newOnly: OpportunityReadFilter | null,
    ): Promise<number>;
    abstract findByIdForUser(id: string, userId: string): Promise<OpportunityEntity | null>;
    abstract updateStatus(id: string, status: ReviewStatus): Promise<OpportunityEntity>;
}
