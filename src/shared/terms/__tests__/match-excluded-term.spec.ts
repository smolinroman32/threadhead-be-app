import { matchExcludedTerm } from '../match-excluded-term.js';

describe('matchExcludedTerm', () => {
    it('returns the first term found as a whole word, ignoring case', () => {
        expect(matchExcludedTerm('Hiring a Crypto dev', ['nft', 'crypto', 'dev'])).toBe('crypto');
    });

    it('does not match a term inside a longer word', () => {
        expect(matchExcludedTerm('She said it was fine', ['ai'])).toBeNull();
        expect(matchExcludedTerm('Two cafés downtown', ['café'])).toBeNull();
        expect(matchExcludedTerm('Moving to c++17', ['c++'])).toBeNull();
    });

    it('matches terms with punctuation and non-ASCII letters literally', () => {
        expect(matchExcludedTerm('Learning C++ this year', ['c++'])).toBe('c++');
        expect(matchExcludedTerm('Best CAFÉ in town', ['café'])).toBe('café');
        expect(matchExcludedTerm('Use #buildinpublic daily', ['#buildinpublic'])).toBe('#buildinpublic');
        expect(matchExcludedTerm('Price is 5.99 now', ['5.99'])).toBe('5.99');
        expect(matchExcludedTerm('Price is 5x99 now', ['5.99'])).toBeNull();
    });

    it('matches a phrase across any whitespace', () => {
        expect(matchExcludedTerm('New AI\n  agents everywhere', ['ai agents'])).toBe('ai agents');
        expect(matchExcludedTerm('ai and agents', ['ai agents'])).toBeNull();
    });

    it('returns null when there are no terms or no match', () => {
        expect(matchExcludedTerm('anything', [])).toBeNull();
        expect(matchExcludedTerm('anything', ['nothing'])).toBeNull();
    });
});
