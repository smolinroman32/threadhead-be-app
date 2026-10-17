import { Injectable } from '@nestjs/common';
import {
    FEED_LANGUAGES,
    MAX_FEEDS_PER_USER,
    buildFeedFields,
    type NewOpportunityFeedInput,
} from '../../domain/entities/opportunity-feed-fields.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class CreateOpportunityFeedUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    execute(userId: string, input: NewOpportunityFeedInput) {
        const fields = buildFeedFields(input);

        return this.repository.createWithinLimit(
            { ...fields, userId, onboardingId: null, languages: [...FEED_LANGUAGES] },
            MAX_FEEDS_PER_USER,
        );
    }
}
