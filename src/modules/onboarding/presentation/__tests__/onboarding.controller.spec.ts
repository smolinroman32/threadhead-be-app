import type { JwtPayload } from '../../../auth/domain/jwt-payload.js';
import type { OnboardingService } from '../../application/onboarding.service.js';
import { OnboardingEntity } from '../../domain/entities/onboarding.entity.js';
import { OnboardingController } from '../onboarding.controller.js';

describe('OnboardingController', () => {
    const currentUser: JwtPayload = { sub: 'user-id', email: 'u@x.io', tokenVersion: 0 };
    const service = { get: vi.fn(), saveStep: vi.fn() };
    const controller = new OnboardingController(service as unknown as OnboardingService);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('get returns the state of the token user without the user id', async () => {
        service.get.mockResolvedValue(OnboardingEntity.initial('user-id'));

        await expect(controller.get(currentUser)).resolves.toEqual({
            currentStep: 'INTENT',
            status: 'IN_PROGRESS',
            version: 0,
            draft: {},
        });
        expect(service.get).toHaveBeenCalledWith('user-id');
    });

    it('saveStep saves for the token user and returns the new state', async () => {
        const input = {
            step: 'INTENT' as const,
            version: 0,
            data: { intent: 'Find people asking about AI agents', targetAudience: 'Founders' },
        };
        const saved = OnboardingEntity.initial('user-id').saveStep(input);
        service.saveStep.mockResolvedValue(saved);

        await expect(controller.saveStep(currentUser, input)).resolves.toEqual({
            currentStep: 'PREFERENCES',
            status: 'IN_PROGRESS',
            version: 1,
            draft: input.data,
        });
        expect(service.saveStep).toHaveBeenCalledWith('user-id', input);
    });
});
