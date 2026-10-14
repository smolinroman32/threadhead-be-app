export class OpportunityFeedResponseDto {
    id: string;
    name: string;
    intent: string;
    targetAudience: string;
    includeTerms: string[];
    excludeTerms: string[];
    languages: string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
