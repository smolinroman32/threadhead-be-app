import { OnboardingNotEditableError } from '../errors/onboarding-not-editable.error.js';
import { OnboardingStepAheadError } from '../errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../errors/onboarding-version-conflict.error.js';
import { normalizeIntentStep, normalizePreferencesStep } from './onboarding-draft.js';

export const ONBOARDING_STEP = {
    INTENT: 'INTENT',
    PREFERENCES: 'PREFERENCES',
    REVIEW: 'REVIEW',
} as const;
export type OnboardingStep = (typeof ONBOARDING_STEP)[keyof typeof ONBOARDING_STEP];
export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
    ONBOARDING_STEP.INTENT,
    ONBOARDING_STEP.PREFERENCES,
    ONBOARDING_STEP.REVIEW,
];
export type EditableOnboardingStep = Exclude<OnboardingStep, typeof ONBOARDING_STEP.REVIEW>;

export const ONBOARDING_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETING: 'COMPLETING',
    COMPLETED: 'COMPLETED',
} as const;
export type OnboardingStatus = (typeof ONBOARDING_STATUS)[keyof typeof ONBOARDING_STATUS];

export type OnboardingDraft = {
    intent?: string;
    targetAudience?: string;
    includeTerms?: string[];
    excludeTerms?: string[];
};

export type CompleteOnboardingDraft = {
    intent: string;
    targetAudience: string;
    includeTerms: string[];
    excludeTerms: string[];
};

export type IntentStepData = { intent: string; targetAudience: string };
export type PreferencesStepData = { includeTerms: string[]; excludeTerms?: string[] | null };

export type SaveOnboardingStepInput = { version: number } & (
    | { step: typeof ONBOARDING_STEP.INTENT; data: IntentStepData }
    | { step: typeof ONBOARDING_STEP.PREFERENCES; data: PreferencesStepData }
);

export interface OnboardingProps {
    id?: string;
    userId: string;
    currentStep: OnboardingStep;
    status: OnboardingStatus;
    draft: OnboardingDraft;
    version: number;
    completedAt?: Date | null;
}

export class OnboardingEntity {
    constructor(private readonly props: OnboardingProps) {}

    static initial(userId: string) {
        return new OnboardingEntity({
            userId,
            currentStep: ONBOARDING_STEP.INTENT,
            status: ONBOARDING_STATUS.IN_PROGRESS,
            draft: {},
            version: 0,
        });
    }

    get id() {
        return this.props.id;
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

    get completedAt() {
        return this.props.completedAt ?? null;
    }

    saveStep(input: SaveOnboardingStepInput) {
        if (this.status !== ONBOARDING_STATUS.IN_PROGRESS) throw new OnboardingNotEditableError();
        if (input.version !== this.version) throw new OnboardingVersionConflictError();

        const saved = ONBOARDING_STEPS.indexOf(input.step);
        const current = ONBOARDING_STEPS.indexOf(this.currentStep);

        if (saved > current) throw new OnboardingStepAheadError();

        const fields =
            input.step === ONBOARDING_STEP.INTENT
                ? normalizeIntentStep(input.data)
                : normalizePreferencesStep(input.data);

        return new OnboardingEntity({
            ...this.props,
            currentStep: saved === current ? ONBOARDING_STEPS[current + 1] : this.currentStep,
            draft: { ...this.draft, ...fields },
            version: this.version + 1,
        });
    }

    startCompleting(version: number) {
        if (this.status !== ONBOARDING_STATUS.IN_PROGRESS) throw new OnboardingNotEditableError();
        if (this.currentStep !== ONBOARDING_STEP.REVIEW) throw new OnboardingStepAheadError();
        if (version !== this.version) throw new OnboardingVersionConflictError();

        return new OnboardingEntity({
            ...this.props,
            status: ONBOARDING_STATUS.COMPLETING,
            version: this.version + 1,
        });
    }

    markCompleted() {
        return new OnboardingEntity({
            ...this.props,
            status: ONBOARDING_STATUS.COMPLETED,
            completedAt: new Date(),
            version: this.version + 1,
        });
    }

    completeDraft(): CompleteOnboardingDraft {
        const { intent, targetAudience, includeTerms, excludeTerms } = this.draft;

        if (!intent || !targetAudience || !includeTerms || !excludeTerms) {
            throw new OnboardingStepAheadError();
        }

        return { intent, targetAudience, includeTerms, excludeTerms };
    }
}
