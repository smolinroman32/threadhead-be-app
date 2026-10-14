import { OnboardingEntity } from '../../../domain/entities/onboarding.entity.js';
import { OnboardingStepAheadError } from '../../../domain/errors/onboarding-step-ahead.error.js';
import type { OnboardingRepositoryPort } from '../../../domain/ports/onboarding-repository.port.js';
import { SaveOnboardingStepUseCase } from '../save-onboarding-step.use-case.js';

const intent = { intent: 'Find people asking about AI agents', targetAudience: 'Founders' };

describe('SaveOnboardingStepUseCase', () => {
    const repository = { findByUserId: vi.fn(), save: vi.fn() };
    const useCase = new SaveOnboardingStepUseCase(repository as unknown as OnboardingRepositoryPort);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('saves the first step from the initial state with expected version 0', async () => {
        repository.findByUserId.mockResolvedValue(null);

        const saved = await useCase.execute('user-id', { step: 'INTENT', version: 0, data: intent });

        expect(saved).toMatchObject({ userId: 'user-id', currentStep: 'PREFERENCES', version: 1 });
        expect(repository.save).toHaveBeenCalledWith(saved, 0);
    });

    it('saves with the version it read', async () => {
        const stored = new OnboardingEntity({
            userId: 'user-id',
            currentStep: 'REVIEW',
            status: 'IN_PROGRESS',
            draft: intent,
            version: 3,
        });
        repository.findByUserId.mockResolvedValue(stored);

        const saved = await useCase.execute('user-id', { step: 'INTENT', version: 3, data: intent });

        expect(repository.save).toHaveBeenCalledWith(saved, 3);
        expect(saved.version).toBe(4);
    });

    it('does not save when the entity rejects the step', async () => {
        repository.findByUserId.mockResolvedValue(null);

        await expect(
            useCase.execute('user-id', { step: 'PREFERENCES', version: 0, data: { includeTerms: ['ai'] } }),
        ).rejects.toBeInstanceOf(OnboardingStepAheadError);
        expect(repository.save).not.toHaveBeenCalled();
    });
});
