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
    hasMore: boolean;
}
