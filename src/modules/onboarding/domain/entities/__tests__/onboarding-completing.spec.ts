import { OnboardingNotEditableError } from '../../errors/onboarding-not-editable.error.js';
import { OnboardingStepAheadError } from '../../errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../../errors/onboarding-version-conflict.error.js';
import {
    OnboardingEntity,
    type OnboardingDraft,
    type OnboardingStatus,
    type OnboardingStep,
} from '../onboarding.entity.js';

const draft: OnboardingDraft = {
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: ['crypto'],
};

const at = (
    status: OnboardingStatus,
    version: number,
    currentStep: OnboardingStep = 'REVIEW',
    value: OnboardingDraft = draft,
) =>
    new OnboardingEntity({
        id: 'onboarding-id',
        userId: 'user-id',
        currentStep,
        status,
        draft: value,
        version,
    });

describe('OnboardingEntity completing', () => {
    it('startCompleting moves a matching REVIEW state to COMPLETING and increments the version', () => {
        const started = at('IN_PROGRESS', 2).startCompleting(2);

        expect(started).toMatchObject({
            id: 'onboarding-id',
            status: 'COMPLETING',
            currentStep: 'REVIEW',
            version: 3,
            draft,
        });
    });

    it('startCompleting rejects a step before REVIEW', () => {
        expect(() => at('IN_PROGRESS', 1, 'PREFERENCES').startCompleting(1)).toThrow(
            OnboardingStepAheadError,
        );
    });

    it('startCompleting rejects a stale version', () => {
        expect(() => at('IN_PROGRESS', 2).startCompleting(1)).toThrow(OnboardingVersionConflictError);
    });

    it('startCompleting rejects a state that is not IN_PROGRESS', () => {
        expect(() => at('COMPLETING', 3).startCompleting(3)).toThrow(OnboardingNotEditableError);
        expect(() => at('COMPLETED', 4).startCompleting(4)).toThrow(OnboardingNotEditableError);
    });

    it('markCompleted sets COMPLETED, completedAt and increments the version', () => {
        const completed = at('COMPLETING', 3).markCompleted();

        expect(completed).toMatchObject({ status: 'COMPLETED', version: 4, draft });
        expect(completed.completedAt).toBeInstanceOf(Date);
    });

    it('saveStep is rejected once the onboarding is COMPLETING or COMPLETED', () => {
        const input = {
            step: 'INTENT' as const,
            version: 3,
            data: { intent: 'Find people comparing frameworks', targetAudience: 'CTOs' },
        };

        expect(() => at('COMPLETING', 3).saveStep(input)).toThrow(OnboardingNotEditableError);
        expect(() => at('COMPLETED', 3).saveStep(input)).toThrow(OnboardingNotEditableError);
    });

    it('completeDraft returns the four draft fields', () => {
        expect(at('COMPLETING', 3).completeDraft()).toEqual({
            intent: draft.intent,
            targetAudience: draft.targetAudience,
            includeTerms: draft.includeTerms,
            excludeTerms: draft.excludeTerms,
        });
    });

    it('completeDraft rejects an incomplete draft', () => {
        expect(() =>
            at('COMPLETING', 3, 'REVIEW', { intent: 'only an intent here' }).completeDraft(),
        ).toThrow(OnboardingStepAheadError);
    });

    it('a fresh initial state has no id and no completedAt', () => {
        const initial = OnboardingEntity.initial('user-id');

        expect(initial.id).toBeUndefined();
        expect(initial.completedAt).toBeNull();
    });
});
