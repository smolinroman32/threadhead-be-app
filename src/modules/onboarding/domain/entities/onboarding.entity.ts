import { OnboardingNotEditableError } from '../errors/onboarding-not-editable.error.js';
import { OnboardingStepAheadError } from '../errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../errors/onboarding-version-conflict.error.js';
import { normalizeIntentStep, normalizePreferencesStep } from './onboarding-draft.js';

export const ONBOARDING_STEPS = ['INTENT', 'PREFERENCES', 'REVIEW'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type EditableOnboardingStep = Exclude<OnboardingStep, 'REVIEW'>;
export type OnboardingStatus = 'IN_PROGRESS' | 'COMPLETING' | 'COMPLETED';

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
    { step: 'INTENT'; data: IntentStepData } | { step: 'PREFERENCES'; data: PreferencesStepData }
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
            currentStep: 'INTENT',
            status: 'IN_PROGRESS',
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
        if (this.status !== 'IN_PROGRESS') throw new OnboardingNotEditableError();
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

    startCompleting(version: number) {
        if (this.status !== 'IN_PROGRESS') throw new OnboardingNotEditableError();
        if (this.currentStep !== 'REVIEW') throw new OnboardingStepAheadError();
        if (version !== this.version) throw new OnboardingVersionConflictError();

        return new OnboardingEntity({ ...this.props, status: 'COMPLETING', version: this.version + 1 });
    }

    markCompleted() {
        return new OnboardingEntity({
            ...this.props,
            status: 'COMPLETED',
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
