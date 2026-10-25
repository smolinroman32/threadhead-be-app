import { Injectable } from '@nestjs/common';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class ListOpportunityFeedsUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    execute(userId: string) {
        return this.repository.listByUser(userId);
    }
}
