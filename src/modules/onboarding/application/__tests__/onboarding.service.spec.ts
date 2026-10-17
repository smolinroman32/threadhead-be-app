import type { CompleteOnboardingUseCase } from '../use-cases/complete-onboarding.use-case.js';
import type { GetOnboardingUseCase } from '../use-cases/get-onboarding.use-case.js';
import type { SaveOnboardingStepUseCase } from '../use-cases/save-onboarding-step.use-case.js';
import { OnboardingService } from '../onboarding.service.js';

describe('OnboardingService', () => {
    const getUseCase = { execute: vi.fn() };
    const saveStepUseCase = { execute: vi.fn() };
    const completeUseCase = { execute: vi.fn() };
    const service = new OnboardingService(
        getUseCase as unknown as GetOnboardingUseCase,
        saveStepUseCase as unknown as SaveOnboardingStepUseCase,
        completeUseCase as unknown as CompleteOnboardingUseCase,
    );

    it('delegates get, saveStep and complete to the use cases', async () => {
        const input = { step: 'INTENT' as const, version: 0, data: { intent: 'x', targetAudience: 'y' } };
        getUseCase.execute.mockResolvedValue('state');
        saveStepUseCase.execute.mockResolvedValue('saved');
        completeUseCase.execute.mockResolvedValue('completed');

        await expect(service.get('user-id')).resolves.toBe('state');
        await expect(service.saveStep('user-id', input)).resolves.toBe('saved');
        await expect(service.complete('user-id', 4)).resolves.toBe('completed');
        expect(getUseCase.execute).toHaveBeenCalledWith('user-id');
        expect(saveStepUseCase.execute).toHaveBeenCalledWith('user-id', input);
        expect(completeUseCase.execute).toHaveBeenCalledWith('user-id', 4);
    });
});
