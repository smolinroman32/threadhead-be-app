import { normalizeTerms } from '../normalize-terms.js';

describe('normalizeTerms', () => {
    it('trims, drops empty items and keeps the order', () => {
        expect(normalizeTerms(['  ai agents ', '', '   ', 'undo'])).toEqual(['ai agents', 'undo']);
    });

    it('collapses duplicates ignoring case and keeps the first spelling', () => {
        expect(normalizeTerms(['AI Agents', 'ai agents', 'Undo', 'UNDO', ' ai AGENTS '])).toEqual([
            'AI Agents',
            'Undo',
        ]);
    });

    it('returns an empty list for an empty input', () => {
        expect(normalizeTerms([])).toEqual([]);
    });
});
