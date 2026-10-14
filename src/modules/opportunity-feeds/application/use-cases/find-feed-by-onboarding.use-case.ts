import { Injectable } from '@nestjs/common';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class FindFeedByOnboardingUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    execute(userId: string, onboardingId: string) {
        return this.repository.findByOnboardingId(userId, onboardingId);
    }
}
