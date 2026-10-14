import type { GetOnboardingUseCase } from '../use-cases/get-onboarding.use-case.js';
import type { SaveOnboardingStepUseCase } from '../use-cases/save-onboarding-step.use-case.js';
import { OnboardingService } from '../onboarding.service.js';

describe('OnboardingService', () => {
    const getUseCase = { execute: vi.fn() };
    const saveStepUseCase = { execute: vi.fn() };
    const service = new OnboardingService(
        getUseCase as unknown as GetOnboardingUseCase,
        saveStepUseCase as unknown as SaveOnboardingStepUseCase,
    );

    it('delegates get and saveStep to the use cases', async () => {
        const input = { step: 'INTENT' as const, version: 0, data: { intent: 'x', targetAudience: 'y' } };
        getUseCase.execute.mockResolvedValue('state');
        saveStepUseCase.execute.mockResolvedValue('saved');

        await expect(service.get('user-id')).resolves.toBe('state');
        await expect(service.saveStep('user-id', input)).resolves.toBe('saved');
        expect(getUseCase.execute).toHaveBeenCalledWith('user-id');
        expect(saveStepUseCase.execute).toHaveBeenCalledWith('user-id', input);
    });
});
