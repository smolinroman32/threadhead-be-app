import { OpportunityFeedAccountLockedError } from '../../errors/opportunity-feed-account-locked.error.js';
import { bindFeedAccount, criteriaChanged } from '../feed-criteria.js';
import type { OpportunityFeedFields } from '../opportunity-feed-fields.js';

const fields: OpportunityFeedFields = {
    name: 'AI agents',
    description: '',
    color: '#5F947B',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['AI agents', 'LLM'],
    excludeTerms: ['crypto'],
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
};

describe('criteriaChanged', () => {
    it('ignores the order and the case of terms and every non-criteria field', () => {
        expect(
            criteriaChanged(fields, {
                ...fields,
                includeTerms: ['llm', 'ai AGENTS'],
                excludeTerms: ['Crypto'],
                name: 'Renamed',
                minScore: 90,
                isActive: false,
            }),
        ).toBe(false);
    });

    it.each([
        { intent: 'Find people comparing AI agent frameworks' },
        { targetAudience: 'CTOs' },
        { includeTerms: ['AI agents'] },
        { includeTerms: ['AI agents', 'LLM', 'RAG'] },
        { excludeTerms: [] },
        { excludeTerms: ['nft'] },
    ])('reports a change of %o', (change) => {
        expect(criteriaChanged(fields, { ...fields, ...change })).toBe(true);
    });
});

describe('bindFeedAccount', () => {
    it('keeps the current account when none is requested', () => {
        expect(bindFeedAccount('account-a', undefined)).toBe('account-a');
        expect(bindFeedAccount(null, undefined)).toBeNull();
    });

    it('sets the account once while it is unset and accepts the same one again', () => {
        expect(bindFeedAccount(null, 'account-a')).toBe('account-a');
        expect(bindFeedAccount('account-a', 'account-a')).toBe('account-a');
    });

    it('refuses to replace a bound account', () => {
        expect(() => bindFeedAccount('account-a', 'account-b')).toThrow(OpportunityFeedAccountLockedError);
    });
});
