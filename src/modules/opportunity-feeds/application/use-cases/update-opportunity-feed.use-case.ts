import { Injectable } from '@nestjs/common';
import {
    mergeFeedFields,
    type OpportunityFeedChanges,
} from '../../domain/entities/opportunity-feed-fields.js';
import { OpportunityFeedNotFoundError } from '../../domain/errors/opportunity-feed-not-found.error.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class UpdateOpportunityFeedUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    async execute(userId: string, id: string, changes: OpportunityFeedChanges) {
        const feed = await this.repository.updateLocked(id, userId, (current) =>
            mergeFeedFields(current.fields, changes),
        );

        if (!feed) throw new OpportunityFeedNotFoundError();

        return feed;
    }
}
