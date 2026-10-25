import { normalizeHexColor } from '../../../../shared/colors/normalize-hex-color.js';
import { normalizeTerms } from '../../../../shared/terms/normalize-terms.js';
import { OpportunityFeedInvalidError } from '../errors/opportunity-feed-invalid.error.js';

export const MAX_FEEDS_PER_USER = 10;
export const FEED_LANGUAGES = ['en'];
export const DEFAULT_FEED_COLOR = '#5F947B';
export const FEED_DEFAULTS = {
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
    color: DEFAULT_FEED_COLOR,
} as const;

const MAX_TERMS = 10;
const TERM_MIN_LENGTH = 2;
const TERM_MAX_LENGTH = 50;
const NAME_MAX_LENGTH = 30;
const DESCRIPTION_MAX_LENGTH = 500;

export type OpportunityFeedFields = {
    name: string;
    description: string;
    color: string;
    intent: string;
    targetAudience: string;
    includeTerms: string[];
    excludeTerms: string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
};

export type NewOpportunityFeedInput = Pick<
    OpportunityFeedFields,
    'name' | 'intent' | 'targetAudience' | 'includeTerms'
> &
    Partial<
        Pick<
            OpportunityFeedFields,
            'description' | 'color' | 'excludeTerms' | 'freshnessHours' | 'minScore' | 'isActive'
        >
    > & { socialAccountId?: string };

export type OpportunityFeedChanges = Partial<OpportunityFeedFields> & { socialAccountId?: string };

export function buildFeedFields(input: NewOpportunityFeedInput) {
    return validateFields({
        name: input.name,
        description: input.description ?? '',
        color: input.color ?? FEED_DEFAULTS.color,
        intent: input.intent,
        targetAudience: input.targetAudience,
        includeTerms: input.includeTerms,
        excludeTerms: input.excludeTerms ?? [],
        freshnessHours: input.freshnessHours ?? FEED_DEFAULTS.freshnessHours,
        minScore: input.minScore ?? FEED_DEFAULTS.minScore,
        isActive: input.isActive ?? FEED_DEFAULTS.isActive,
    });
}

export function mergeFeedFields(current: OpportunityFeedFields, changes: OpportunityFeedChanges) {
    return validateFields({
        name: changes.name ?? current.name,
        description: changes.description ?? current.description,
        color: changes.color ?? current.color,
        intent: changes.intent ?? current.intent,
        targetAudience: changes.targetAudience ?? current.targetAudience,
        includeTerms: changes.includeTerms ?? current.includeTerms,
        excludeTerms: changes.excludeTerms ?? current.excludeTerms,
        freshnessHours: changes.freshnessHours ?? current.freshnessHours,
        minScore: changes.minScore ?? current.minScore,
        isActive: changes.isActive ?? current.isActive,
    });
}

export function feedNameFromIntent(intent: string) {
    const text = intent.trim();

    if (text.length <= NAME_MAX_LENGTH) return text;

    const head = text.slice(0, NAME_MAX_LENGTH);
    const endsOnWord = /\s/.test(text[NAME_MAX_LENGTH]);
    const lastSpace = head.search(/\s\S*$/);
    const cut = endsOnWord || lastSpace <= 0 ? head : head.slice(0, lastSpace);

    return cut.trim();
}

function validateFields(fields: OpportunityFeedFields): OpportunityFeedFields {
    const includeTerms = limitTerms('includeTerms', fields.includeTerms, 1);
    const excludeTerms = limitTerms('excludeTerms', fields.excludeTerms, 0);
    const included = new Set(includeTerms.map((term) => term.toLowerCase()));
    const overlap = excludeTerms.find((term) => included.has(term.toLowerCase()));

    if (overlap) {
        throw new OpportunityFeedInvalidError(`"${overlap}" cannot be both included and excluded.`);
    }

    return {
        name: requireText('name', fields.name, 1, NAME_MAX_LENGTH),
        description: requireText('description', fields.description, 0, DESCRIPTION_MAX_LENGTH),
        color: requireColor(fields.color),
        intent: requireText('intent', fields.intent, 10, 500),
        targetAudience: requireText('targetAudience', fields.targetAudience, 3, 200),
        includeTerms,
        excludeTerms,
        freshnessHours: requireInteger('freshnessHours', fields.freshnessHours, 1, 168),
        minScore: requireInteger('minScore', fields.minScore, 0, 100),
        isActive: fields.isActive,
    };
}

function requireColor(value: string) {
    const color = normalizeHexColor(value);

    if (!color) throw new OpportunityFeedInvalidError('color must be a #RRGGBB hex value.');

    return color;
}

function requireText(field: string, value: string, min: number, max: number) {
    const text = value.trim();

    if (text.length < min || text.length > max) {
        throw new OpportunityFeedInvalidError(`${field} must be ${min} to ${max} characters.`);
    }

    return text;
}

function requireInteger(field: string, value: number, min: number, max: number) {
    if (!Number.isInteger(value) || value < min || value > max) {
        throw new OpportunityFeedInvalidError(`${field} must be an integer from ${min} to ${max}.`);
    }

    return value;
}

function limitTerms(field: string, terms: string[], min: number) {
    const result = normalizeTerms(terms);

    for (const term of result) {
        if (term.length < TERM_MIN_LENGTH || term.length > TERM_MAX_LENGTH) {
            throw new OpportunityFeedInvalidError(
                `Each ${field} item must be ${TERM_MIN_LENGTH} to ${TERM_MAX_LENGTH} characters.`,
            );
        }
    }

    if (result.length < min || result.length > MAX_TERMS) {
        throw new OpportunityFeedInvalidError(`${field} must hold ${min} to ${MAX_TERMS} terms.`);
    }

    return result;
}
