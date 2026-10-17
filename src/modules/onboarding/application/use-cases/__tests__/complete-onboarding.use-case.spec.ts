import {
    OnboardingEntity,
    type OnboardingStatus,
    type OnboardingStep,
} from '../../../domain/entities/onboarding.entity.js';
import { OnboardingStepAheadError } from '../../../domain/errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../../../domain/errors/onboarding-version-conflict.error.js';
import type { OnboardingFeedPort } from '../../../domain/ports/onboarding-feed.port.js';
import type { OnboardingRepositoryPort } from '../../../domain/ports/onboarding-repository.port.js';
import { CompleteOnboardingUseCase } from '../complete-onboarding.use-case.js';

const draft = {
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: ['crypto'],
};

const row = (status: OnboardingStatus, version: number, currentStep: OnboardingStep = 'REVIEW') =>
    new OnboardingEntity({ id: 'onboarding-id', userId: 'user-id', currentStep, status, draft, version });

describe('CompleteOnboardingUseCase', () => {
    const repository = { findByUserId: vi.fn(), save: vi.fn() };
    const feeds = { createFromOnboarding: vi.fn(), findFeedId: vi.fn() };
    const useCase = new CompleteOnboardingUseCase(
        repository as unknown as OnboardingRepositoryPort,
        feeds as unknown as OnboardingFeedPort,
    );

    beforeEach(() => {
        vi.resetAllMocks();
        feeds.createFromOnboarding.mockResolvedValue({ feedId: 'feed-id' });
    });

    it('claims, creates the feed from the frozen draft, then completes', async () => {
        repository.findByUserId.mockResolvedValue(row('IN_PROGRESS', 2));

        const result = await useCase.execute('user-id', 2);

        expect(repository.save).toHaveBeenCalledTimes(2);
        const [claimed, claimVersion] = repository.save.mock.calls[0];
        const [completed, completeVersion] = repository.save.mock.calls[1];
        expect(claimed).toMatchObject({ status: 'COMPLETING', version: 3 });
        expect(claimVersion).toBe(2);
        expect(completed).toMatchObject({ status: 'COMPLETED', version: 4 });
        expect(completeVersion).toBe(3);
        expect(feeds.createFromOnboarding).toHaveBeenCalledWith({
            userId: 'user-id',
            onboardingId: 'onboarding-id',
            draft,
        });
        expect(repository.save.mock.invocationCallOrder[0]).toBeLessThan(
            feeds.createFromOnboarding.mock.invocationCallOrder[0],
        );
        expect(feeds.createFromOnboarding.mock.invocationCallOrder[0]).toBeLessThan(
            repository.save.mock.invocationCallOrder[1],
        );
        expect(result.feedId).toBe('feed-id');
        expect(result.onboarding).toMatchObject({ status: 'COMPLETED', version: 4 });
    });

    it('a feed failure leaves COMPLETING in place and is rethrown', async () => {
        repository.findByUserId.mockResolvedValue(row('IN_PROGRESS', 2));
        const failure = new Error('cap reached');
        feeds.createFromOnboarding.mockRejectedValue(failure);

        await expect(useCase.execute('user-id', 2)).rejects.toBe(failure);
        expect(repository.save).toHaveBeenCalledTimes(1);
        expect(repository.save.mock.calls[0][0]).toMatchObject({ status: 'COMPLETING' });
    });

    it('continues from COMPLETING without checking the version', async () => {
        repository.findByUserId.mockResolvedValue(row('COMPLETING', 3));

        const result = await useCase.execute('user-id', 0);

        expect(repository.save).toHaveBeenCalledTimes(1);
        expect(repository.save.mock.calls[0][0]).toMatchObject({ status: 'COMPLETED', version: 4 });
        expect(repository.save.mock.calls[0][1]).toBe(3);
        expect(result.feedId).toBe('feed-id');
    });

    it('answers a COMPLETED onboarding with its feed id and writes nothing', async () => {
        repository.findByUserId.mockResolvedValue(row('COMPLETED', 4));
        feeds.findFeedId.mockResolvedValue('feed-id');

        const result = await useCase.execute('user-id', 0);

        expect(result).toMatchObject({ feedId: 'feed-id', onboarding: { status: 'COMPLETED' } });
        expect(feeds.findFeedId).toHaveBeenCalledWith('user-id', 'onboarding-id');
        expect(repository.save).not.toHaveBeenCalled();
        expect(feeds.createFromOnboarding).not.toHaveBeenCalled();
    });

    it('answers a COMPLETED onboarding whose feed was deleted with feedId null and creates nothing', async () => {
        repository.findByUserId.mockResolvedValue(row('COMPLETED', 4));
        feeds.findFeedId.mockResolvedValue(null);

        const result = await useCase.execute('user-id', 0);

        expect(result.feedId).toBeNull();
        expect(feeds.createFromOnboarding).not.toHaveBeenCalled();
    });

    it('rejects a step before REVIEW without writing or creating a feed', async () => {
        repository.findByUserId.mockResolvedValue(row('IN_PROGRESS', 1, 'PREFERENCES'));

        await expect(useCase.execute('user-id', 1)).rejects.toBeInstanceOf(OnboardingStepAheadError);
        expect(repository.save).not.toHaveBeenCalled();
        expect(feeds.createFromOnboarding).not.toHaveBeenCalled();
    });

    it('rejects a user without any onboarding row as a step ahead', async () => {
        repository.findByUserId.mockResolvedValue(null);

        await expect(useCase.execute('user-id', 0)).rejects.toBeInstanceOf(OnboardingStepAheadError);
        expect(feeds.createFromOnboarding).not.toHaveBeenCalled();
    });

    it('rejects a stale version before any feed is created', async () => {
        repository.findByUserId.mockResolvedValue(row('IN_PROGRESS', 2));

        await expect(useCase.execute('user-id', 1)).rejects.toBeInstanceOf(OnboardingVersionConflictError);
        expect(feeds.createFromOnboarding).not.toHaveBeenCalled();
    });

    it('lets the loser of the claim race fail with 409 and create no feed', async () => {
        repository.findByUserId.mockResolvedValue(row('IN_PROGRESS', 2));
        repository.save.mockRejectedValueOnce(new OnboardingVersionConflictError());

        await expect(useCase.execute('user-id', 2)).rejects.toBeInstanceOf(OnboardingVersionConflictError);
        expect(feeds.createFromOnboarding).not.toHaveBeenCalled();
    });

    it('answers 200 when another request finished first', async () => {
        repository.findByUserId
            .mockResolvedValueOnce(row('COMPLETING', 3))
            .mockResolvedValueOnce(row('COMPLETED', 4));
        repository.save.mockRejectedValueOnce(new OnboardingVersionConflictError());

        const result = await useCase.execute('user-id', 0);

        expect(result).toMatchObject({ feedId: 'feed-id', onboarding: { status: 'COMPLETED' } });
    });

    it('rethrows the conflict when the onboarding is still not completed', async () => {
        repository.findByUserId
            .mockResolvedValueOnce(row('COMPLETING', 3))
            .mockResolvedValueOnce(row('COMPLETING', 3));
        repository.save.mockRejectedValueOnce(new OnboardingVersionConflictError());

        await expect(useCase.execute('user-id', 0)).rejects.toBeInstanceOf(OnboardingVersionConflictError);
    });
});
