import { Injectable } from '@nestjs/common';
import {
    FEED_LANGUAGES,
    MAX_FEEDS_PER_USER,
    buildFeedFields,
    feedNameFromIntent,
} from '../../domain/entities/opportunity-feed-fields.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

export type CreateFeedFromOnboardingInput = {
    userId: string;
    onboardingId: string;
    intent: string;
    targetAudience: string;
    includeTerms: string[];
    excludeTerms: string[];
};

@Injectable()
export class CreateFeedFromOnboardingUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    execute(input: CreateFeedFromOnboardingInput) {
        const fields = buildFeedFields({
            name: feedNameFromIntent(input.intent),
            intent: input.intent,
            targetAudience: input.targetAudience,
            includeTerms: input.includeTerms,
            excludeTerms: input.excludeTerms,
        });

        return this.repository.createWithinLimit(
            {
                ...fields,
                userId: input.userId,
                onboardingId: input.onboardingId,
                languages: [...FEED_LANGUAGES],
            },
            MAX_FEEDS_PER_USER,
        );
    }
}
