import { Injectable } from '@nestjs/common';
import { OpportunityFeedsService } from '../../../opportunity-feeds/application/opportunity-feeds.service.js';
import type { CompleteOnboardingDraft } from '../../domain/entities/onboarding.entity.js';
import { OnboardingFeedPort } from '../../domain/ports/onboarding-feed.port.js';

@Injectable()
export class OnboardingFeedAdapter implements OnboardingFeedPort {
    constructor(private readonly feeds: OpportunityFeedsService) {}

    async createFromOnboarding(input: {
        userId: string;
        onboardingId: string;
        draft: CompleteOnboardingDraft;
    }) {
        const feed = await this.feeds.createFromOnboarding({
            userId: input.userId,
            onboardingId: input.onboardingId,
            ...input.draft,
        });

        return { feedId: feed.id };
    }

    async findFeedId(userId: string, onboardingId: string) {
        const feed = await this.feeds.findByOnboardingId(userId, onboardingId);

        return feed?.id ?? null;
    }
}
