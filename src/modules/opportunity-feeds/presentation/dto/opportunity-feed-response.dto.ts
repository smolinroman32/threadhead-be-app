export class OpportunityFeedResponseDto {
    id: string;
    name: string;
    description: string;
    color: string;
    intent: string;
    targetAudience: string;
    includeTerms: string[];
    excludeTerms: string[];
    languages: string[];
    socialAccountId: string | null;
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
