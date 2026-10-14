import { OnboardingEntity } from '../../../domain/entities/onboarding.entity.js';
import type { OnboardingRepositoryPort } from '../../../domain/ports/onboarding-repository.port.js';
import { GetOnboardingUseCase } from '../get-onboarding.use-case.js';

describe('GetOnboardingUseCase', () => {
    const repository = { findByUserId: vi.fn(), save: vi.fn() };
    const useCase = new GetOnboardingUseCase(repository as unknown as OnboardingRepositoryPort);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns the stored onboarding', async () => {
        const stored = OnboardingEntity.initial('user-id');
        repository.findByUserId.mockResolvedValue(stored);

        await expect(useCase.execute('user-id')).resolves.toBe(stored);
        expect(repository.findByUserId).toHaveBeenCalledWith('user-id');
    });

    it('returns the initial state without saving when the user has no row', async () => {
        repository.findByUserId.mockResolvedValue(null);

        await expect(useCase.execute('user-id')).resolves.toMatchObject({
            currentStep: 'INTENT',
            version: 0,
        });
        expect(repository.save).not.toHaveBeenCalled();
    });
});
