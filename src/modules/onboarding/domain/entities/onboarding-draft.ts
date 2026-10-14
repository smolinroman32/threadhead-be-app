import { normalizeTerms } from '../../../../shared/terms/normalize-terms.js';
import { OnboardingDraftInvalidError } from '../errors/onboarding-draft-invalid.error.js';
import type { IntentStepData, OnboardingDraft, PreferencesStepData } from './onboarding.entity.js';

const MAX_TERMS = 10;
const TERM_MIN_LENGTH = 2;
const TERM_MAX_LENGTH = 50;

export function normalizeIntentStep(data: IntentStepData): OnboardingDraft {
    return {
        intent: requireText('intent', data.intent, 10, 500),
        targetAudience: requireText('targetAudience', data.targetAudience, 3, 200),
    };
}

export function normalizePreferencesStep(data: PreferencesStepData): OnboardingDraft {
    const includeTerms = limitTerms('includeTerms', data.includeTerms);
    const excludeTerms = limitTerms('excludeTerms', data.excludeTerms ?? []);

    if (includeTerms.length === 0) {
        throw new OnboardingDraftInvalidError('includeTerms must contain at least one term.');
    }

    const included = new Set(includeTerms.map((term) => term.toLowerCase()));
    const overlap = excludeTerms.find((term) => included.has(term.toLowerCase()));

    if (overlap) {
        throw new OnboardingDraftInvalidError(`"${overlap}" cannot be both included and excluded.`);
    }

    return { includeTerms, excludeTerms };
}

function requireText(field: string, value: string, min: number, max: number) {
    const text = value.trim();

    if (text.length < min || text.length > max) {
        throw new OnboardingDraftInvalidError(`${field} must be ${min} to ${max} characters.`);
    }

    return text;
}

function limitTerms(field: string, terms: string[]) {
    const result = normalizeTerms(terms);

    for (const term of result) {
        if (term.length < TERM_MIN_LENGTH || term.length > TERM_MAX_LENGTH) {
            throw new OnboardingDraftInvalidError(
                `Each ${field} item must be ${TERM_MIN_LENGTH} to ${TERM_MAX_LENGTH} characters.`,
            );
        }
    }

    if (result.length > MAX_TERMS) {
        throw new OnboardingDraftInvalidError(`${field} can hold at most ${MAX_TERMS} terms.`);
    }

    return result;
}
