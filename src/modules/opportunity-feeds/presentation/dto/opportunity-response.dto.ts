export class OpportunityResponseDto {
    id: string;
    externalPostId: string;
    authorUsername: string;
    text: string;
    permalink: string;
    publishedAt: Date;
    relevanceScore: number;
    reason: string;
    status: 'new' | 'saved' | 'dismissed' | 'replied';
    stale: boolean;
    excludedTerm: string | null;
    matchedQueries: string[];
}

export class OpportunityListResponseDto {
    items: OpportunityResponseDto[];
    total: number;
    page: number;
    pageSize: number;
}

export class OpportunityCountsResponseDto {
    new: number;
    saved: number;
    dismissed: number;
}
