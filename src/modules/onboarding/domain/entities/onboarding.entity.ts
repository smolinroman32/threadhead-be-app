import { OnboardingStepAheadError } from '../errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../errors/onboarding-version-conflict.error.js';
import { normalizeIntentStep, normalizePreferencesStep } from './onboarding-draft.js';

export const ONBOARDING_STEPS = ['INTENT', 'PREFERENCES', 'REVIEW'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type EditableOnboardingStep = Exclude<OnboardingStep, 'REVIEW'>;
export type OnboardingStatus = 'IN_PROGRESS' | 'COMPLETED';

export type OnboardingDraft = {
    intent?: string;
    targetAudience?: string;
    includeTerms?: string[];
    excludeTerms?: string[];
};

export type IntentStepData = { intent: string; targetAudience: string };
export type PreferencesStepData = { includeTerms: string[]; excludeTerms?: string[] | null };

export type SaveOnboardingStepInput = { version: number } & (
    { step: 'INTENT'; data: IntentStepData } | { step: 'PREFERENCES'; data: PreferencesStepData }
);

export interface OnboardingProps {
    userId: string;
    currentStep: OnboardingStep;
    status: OnboardingStatus;
    draft: OnboardingDraft;
    version: number;
}

export class OnboardingEntity {
    constructor(private readonly props: OnboardingProps) {}

    static initial(userId: string) {
        return new OnboardingEntity({
            userId,
            currentStep: 'INTENT',
            status: 'IN_PROGRESS',
            draft: {},
            version: 0,
        });
    }

    get userId() {
        return this.props.userId;
    }

    get currentStep() {
        return this.props.currentStep;
    }

    get status() {
        return this.props.status;
    }

    get draft() {
        return this.props.draft;
    }

    get version() {
        return this.props.version;
    }

    saveStep(input: SaveOnboardingStepInput) {
        if (input.version !== this.version) throw new OnboardingVersionConflictError();

        const saved = ONBOARDING_STEPS.indexOf(input.step);
        const current = ONBOARDING_STEPS.indexOf(this.currentStep);

        if (saved > current) throw new OnboardingStepAheadError();

        const fields =
            input.step === 'INTENT' ? normalizeIntentStep(input.data) : normalizePreferencesStep(input.data);

        return new OnboardingEntity({
            ...this.props,
            currentStep: saved === current ? ONBOARDING_STEPS[current + 1] : this.currentStep,
            draft: { ...this.draft, ...fields },
            version: this.version + 1,
        });
    }
}
