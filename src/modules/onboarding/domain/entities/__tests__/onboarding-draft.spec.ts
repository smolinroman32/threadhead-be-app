import { OnboardingDraftInvalidError } from '../../errors/onboarding-draft-invalid.error.js';
import { normalizeIntentStep, normalizePreferencesStep } from '../onboarding-draft.js';

const text = (length: number) => 'x'.repeat(length);

describe('normalizeIntentStep', () => {
    it('trims both fields', () => {
        expect(normalizeIntentStep({ intent: `  ${text(10)}  `, targetAudience: ' founders ' })).toEqual({
            intent: text(10),
            targetAudience: 'founders',
        });
    });

    it.each([
        ['intent too short', { intent: text(9), targetAudience: 'founders' }],
        ['intent too long', { intent: text(501), targetAudience: 'founders' }],
        ['intent only whitespace', { intent: ' '.repeat(20), targetAudience: 'founders' }],
        ['targetAudience too short', { intent: text(10), targetAudience: 'ab' }],
        ['targetAudience too long', { intent: text(10), targetAudience: text(201) }],
    ])('rejects %s', (_case, data) => {
        expect(() => normalizeIntentStep(data)).toThrow(OnboardingDraftInvalidError);
    });

    it('accepts the exact bounds', () => {
        expect(() => normalizeIntentStep({ intent: text(500), targetAudience: text(3) })).not.toThrow();
        expect(() => normalizeIntentStep({ intent: text(10), targetAudience: text(200) })).not.toThrow();
    });
});

describe('normalizeIntentStep color', () => {
    const base = { intent: text(10), targetAudience: text(3) };

    it('keeps an uppercased color and leaves the draft untouched without one', () => {
        expect(normalizeIntentStep({ ...base, color: '#a1b2c3' }).color).toBe('#A1B2C3');
        expect(normalizeIntentStep(base)).not.toHaveProperty('color');
    });

    it('rejects a color that is not #RRGGBB', () => {
        expect(() => normalizeIntentStep({ ...base, color: 'red' })).toThrow(OnboardingDraftInvalidError);
    });
});

describe('normalizePreferencesStep', () => {
    it('trims, drops empty items and collapses duplicates ignoring case, keeping the first spelling', () => {
        expect(
            normalizePreferencesStep({
                includeTerms: ['  AI agents ', '', '   ', 'ai AGENTS', 'undo'],
                excludeTerms: [' Crypto', 'crypto'],
            }),
        ).toEqual({ includeTerms: ['AI agents', 'undo'], excludeTerms: ['Crypto'] });
    });

    it('stores a missing or null excludeTerms as an empty list', () => {
        expect(normalizePreferencesStep({ includeTerms: ['ai'] })).toEqual({
            includeTerms: ['ai'],
            excludeTerms: [],
        });
        expect(normalizePreferencesStep({ includeTerms: ['ai'], excludeTerms: null })).toEqual({
            includeTerms: ['ai'],
            excludeTerms: [],
        });
    });

    it('counts terms after deduplication', () => {
        const ten = Array.from({ length: 10 }, (_, index) => `term ${index}`);

        expect(normalizePreferencesStep({ includeTerms: [...ten, 'TERM 0', 'term 1'] }).includeTerms).toEqual(
            ten,
        );
    });

    it.each([
        ['includeTerms empty', { includeTerms: [] }],
        ['includeTerms empty after trimming', { includeTerms: ['  ', ''] }],
        [
            'more than 10 includeTerms',
            { includeTerms: Array.from({ length: 11 }, (_, index) => `term ${index}`) },
        ],
        [
            'more than 10 excludeTerms',
            { includeTerms: ['ai'], excludeTerms: Array.from({ length: 11 }, (_, index) => `term ${index}`) },
        ],
        ['a term shorter than 2', { includeTerms: ['a'] }],
        ['a term longer than 50', { includeTerms: [text(51)] }],
        ['a term in both lists ignoring case', { includeTerms: ['AI agents'], excludeTerms: ['ai agents'] }],
    ])('rejects %s', (_case, data) => {
        expect(() => normalizePreferencesStep(data)).toThrow(OnboardingDraftInvalidError);
    });
});
