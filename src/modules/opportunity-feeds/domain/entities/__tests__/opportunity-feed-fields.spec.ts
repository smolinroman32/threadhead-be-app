import { OpportunityFeedInvalidError } from '../../errors/opportunity-feed-invalid.error.js';
import {
    buildFeedFields,
    feedNameFromIntent,
    mergeFeedFields,
    type OpportunityFeedFields,
} from '../opportunity-feed-fields.js';

const text = (length: number) => 'x'.repeat(length);
const input = {
    name: 'AI agents',
    description: '',
    color: '#5F947B',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Small team founders',
    includeTerms: ['ai agents'],
};
const stored: OpportunityFeedFields = {
    ...input,
    excludeTerms: ['crypto'],
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
};

describe('buildFeedFields', () => {
    it('fills the defaults', () => {
        expect(buildFeedFields(input)).toEqual({
            ...input,
            excludeTerms: [],
            freshnessHours: 24,
            minScore: 60,
            isActive: true,
        });
    });

    it('keeps the values it was given and normalizes text and terms', () => {
        expect(
            buildFeedFields({
                ...input,
                name: '  Agents  ',
                includeTerms: [' AI agents ', 'ai AGENTS', 'undo'],
                excludeTerms: ['Crypto'],
                freshnessHours: 48,
                minScore: 80,
                isActive: false,
            }),
        ).toMatchObject({
            name: 'Agents',
            includeTerms: ['AI agents', 'undo'],
            excludeTerms: ['Crypto'],
            freshnessHours: 48,
            minScore: 80,
            isActive: false,
        });
    });

    it.each([
        ['empty name', { name: '   ' }],
        ['name over 30', { name: text(31) }],
        ['description over 500', { description: text(501) }],
        ['color without a hash', { color: '5F947B' }],
        ['color in short form', { color: '#5F9' }],
        ['color by name', { color: 'red' }],
        ['intent under 10', { intent: text(9) }],
        ['intent over 500', { intent: text(501) }],
        ['targetAudience under 3', { targetAudience: 'ab' }],
        ['targetAudience over 200', { targetAudience: text(201) }],
        ['no includeTerms', { includeTerms: [] }],
        ['includeTerms empty after trimming', { includeTerms: ['  ', ''] }],
        [
            'more than 10 includeTerms',
            { includeTerms: Array.from({ length: 11 }, (_, index) => `term ${index}`) },
        ],
        [
            'more than 10 excludeTerms',
            { excludeTerms: Array.from({ length: 11 }, (_, index) => `term ${index}`) },
        ],
        ['a term under 2', { includeTerms: ['a'] }],
        ['a term over 50', { includeTerms: [text(51)] }],
        ['a term in both lists ignoring case', { includeTerms: ['AI agents'], excludeTerms: ['ai agents'] }],
        ['freshnessHours 0', { freshnessHours: 0 }],
        ['freshnessHours 169', { freshnessHours: 169 }],
        ['fractional freshnessHours', { freshnessHours: 1.5 }],
        ['minScore -1', { minScore: -1 }],
        ['minScore 101', { minScore: 101 }],
    ])('rejects %s', (_case, override) => {
        expect(() => buildFeedFields({ ...input, ...override })).toThrow(OpportunityFeedInvalidError);
    });

    it('accepts the exact bounds', () => {
        expect(() =>
            buildFeedFields({
                name: text(30),
                description: text(500),
                intent: text(500),
                targetAudience: text(200),
                includeTerms: Array.from({ length: 10 }, (_, index) => `term ${index}`),
                excludeTerms: Array.from({ length: 10 }, (_, index) => `other ${index}`),
                freshnessHours: 168,
                minScore: 100,
            }),
        ).not.toThrow();
        expect(() => buildFeedFields({ ...input, freshnessHours: 1, minScore: 0 })).not.toThrow();
    });
});

describe('mergeFeedFields', () => {
    it('changes only the sent fields', () => {
        expect(mergeFeedFields(stored, { minScore: 80 })).toEqual({ ...stored, minScore: 80 });
    });

    it('treats explicit undefined as not sent', () => {
        expect(
            mergeFeedFields(stored, { name: undefined, minScore: undefined, excludeTerms: undefined }),
        ).toEqual(stored);
    });

    it('is a no-op for an empty change', () => {
        expect(mergeFeedFields(stored, {})).toEqual(stored);
    });

    it('validates the merged state: a new excludeTerm clashing with the stored includeTerms', () => {
        expect(() => mergeFeedFields(stored, { excludeTerms: ['AI Agents'] })).toThrow(
            OpportunityFeedInvalidError,
        );
    });

    it('validates the merged state: new includeTerms clashing with the stored excludeTerms', () => {
        expect(() => mergeFeedFields(stored, { includeTerms: ['Crypto'] })).toThrow(
            OpportunityFeedInvalidError,
        );
    });

    it('allows swapping a term between the lists in one change', () => {
        expect(
            mergeFeedFields(stored, { includeTerms: ['crypto'], excludeTerms: ['ai agents'] }),
        ).toMatchObject({
            includeTerms: ['crypto'],
            excludeTerms: ['ai agents'],
        });
    });

    it('rejects clearing includeTerms', () => {
        expect(() => mergeFeedFields(stored, { includeTerms: [] })).toThrow(OpportunityFeedInvalidError);
    });
});

describe('feed color', () => {
    it('uses the default when none is sent and uppercases a valid one', () => {
        const input = {
            name: 'AI agents',
            intent: text(10),
            targetAudience: 'Founders',
            includeTerms: ['ai'],
        };

        expect(buildFeedFields(input).color).toBe('#5F947B');
        expect(buildFeedFields({ ...input, color: ' #a1b2c3 ' }).color).toBe('#A1B2C3');
    });
});

describe('feedNameFromIntent', () => {
    it('uses an intent of 30 characters or less as it is', () => {
        expect(feedNameFromIntent('Find people asking about AI')).toBe('Find people asking about AI');
        expect(feedNameFromIntent(text(30))).toBe(text(30));
    });

    it('cuts a longer intent at a word boundary', () => {
        const intent = 'Find people who are asking how to evaluate and compare AI agent frameworks for teams';

        const name = feedNameFromIntent(intent);

        expect(name.length).toBeLessThanOrEqual(30);
        expect(intent.startsWith(name)).toBe(true);
        expect(intent[name.length]).toBe(' ');
    });

    it('keeps the 30th word whole when it ends exactly there', () => {
        expect(feedNameFromIntent(`${text(30)} tail`)).toBe(text(30));
    });

    it('cuts a long intent without spaces at 30', () => {
        expect(feedNameFromIntent(text(80))).toBe(text(30));
    });
});
