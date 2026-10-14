import { OnboardingStepAheadError } from '../../errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../../errors/onboarding-version-conflict.error.js';
import { OnboardingEntity, type OnboardingDraft, type OnboardingStep } from '../onboarding.entity.js';

const intent = { intent: 'Find people asking about AI agents', targetAudience: 'Small team founders' };
const preferences = { includeTerms: ['ai agents'], excludeTerms: ['crypto'] };

const at = (currentStep: OnboardingStep, version: number, draft: OnboardingDraft = {}) =>
    new OnboardingEntity({ userId: 'user-id', currentStep, status: 'IN_PROGRESS', draft, version });

describe('OnboardingEntity', () => {
    it('starts on INTENT with an empty draft and version 0', () => {
        expect(OnboardingEntity.initial('user-id')).toMatchObject({
            userId: 'user-id',
            currentStep: 'INTENT',
            status: 'IN_PROGRESS',
            draft: {},
            version: 0,
        });
    });

    it('saving the current step stores it, advances the step and increments the version', () => {
        const next = OnboardingEntity.initial('user-id').saveStep({
            step: 'INTENT',
            version: 0,
            data: intent,
        });

        expect(next).toMatchObject({ currentStep: 'PREFERENCES', draft: intent, version: 1 });
    });

    it('saving PREFERENCES moves to REVIEW and keeps the intent fields', () => {
        const next = at('PREFERENCES', 1, intent).saveStep({
            step: 'PREFERENCES',
            version: 1,
            data: preferences,
        });

        expect(next).toMatchObject({
            currentStep: 'REVIEW',
            draft: { ...intent, ...preferences },
            version: 2,
        });
    });

    it('saving an earlier step overwrites only its fields and keeps the current step', () => {
        const changed = { intent: 'Find people comparing agent frameworks', targetAudience: 'CTOs' };

        const next = at('REVIEW', 2, { ...intent, ...preferences }).saveStep({
            step: 'INTENT',
            version: 2,
            data: changed,
        });

        expect(next).toMatchObject({
            currentStep: 'REVIEW',
            draft: { ...changed, ...preferences },
            version: 3,
        });
    });

    it('rejects a step ahead of the current one', () => {
        expect(() =>
            OnboardingEntity.initial('user-id').saveStep({
                step: 'PREFERENCES',
                version: 0,
                data: preferences,
            }),
        ).toThrow(OnboardingStepAheadError);
    });

    it('rejects a stale version before it checks the step order', () => {
        expect(() =>
            at('INTENT', 1).saveStep({ step: 'PREFERENCES', version: 0, data: preferences }),
        ).toThrow(OnboardingVersionConflictError);
    });

    it('does not change the entity it was called on', () => {
        const initial = OnboardingEntity.initial('user-id');

        initial.saveStep({ step: 'INTENT', version: 0, data: intent });

        expect(initial).toMatchObject({ currentStep: 'INTENT', draft: {}, version: 0 });
    });
});
