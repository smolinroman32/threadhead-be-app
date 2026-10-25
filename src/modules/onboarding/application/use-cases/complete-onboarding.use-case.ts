import { Injectable } from '@nestjs/common';
import { ONBOARDING_STATUS, OnboardingEntity } from '../../domain/entities/onboarding.entity.js';
import { OnboardingStepAheadError } from '../../domain/errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../../domain/errors/onboarding-version-conflict.error.js';
import { OnboardingFeedPort } from '../../domain/ports/onboarding-feed.port.js';
import { OnboardingRepositoryPort } from '../../domain/ports/onboarding-repository.port.js';

@Injectable()
export class CompleteOnboardingUseCase {
    constructor(
        private readonly repository: OnboardingRepositoryPort,
        private readonly feeds: OnboardingFeedPort,
    ) {}

    async execute(userId: string, version: number) {
        const current = (await this.repository.findByUserId(userId)) ?? OnboardingEntity.initial(userId);

        if (current.status === ONBOARDING_STATUS.COMPLETED) {
            const feedId = current.id ? await this.feeds.findFeedId(userId, current.id) : null;

            return { onboarding: current, feedId };
        }

        let started = current;

        if (current.status === ONBOARDING_STATUS.IN_PROGRESS) {
            started = current.startCompleting(version);
            await this.repository.save(started, current.version);
        }

        if (!started.id) throw new OnboardingStepAheadError();

        const { feedId } = await this.feeds.createFromOnboarding({
            userId,
            onboardingId: started.id,
            draft: started.completeDraft(),
        });
        const completed = started.markCompleted();

        try {
            await this.repository.save(completed, started.version);
        } catch (error) {
            if (!(error instanceof OnboardingVersionConflictError)) throw error;

            const latest = await this.repository.findByUserId(userId);

            if (latest?.status !== ONBOARDING_STATUS.COMPLETED) throw error;

            return { onboarding: latest, feedId };
        }

        return { onboarding: completed, feedId };
    }
}
