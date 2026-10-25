import { acceptPhrases, acceptScores, freePhraseSlots } from '../llm-answers.js';

describe('acceptScores', () => {
    const sent = ['p1', 'p2', 'p3', 'p4'];

    it('accepts each valid item once and trims the reason', () => {
        const scores = acceptScores(sent, {
            scores: [
                { ref: 'p1', relevanceScore: 82, reason: '  Asks for exactly this  ' },
                { ref: 'p2', relevanceScore: 0, reason: 'not English' },
            ],
        });

        expect([...scores]).toEqual([
            ['p1', { relevanceScore: 82, reason: 'Asks for exactly this' }],
            ['p2', { relevanceScore: 0, reason: 'not English' }],
        ]);
    });

    it('leaves unknown, repeated and invalid items unscored', () => {
        const scores = acceptScores(sent, {
            scores: [
                { ref: 'p9', relevanceScore: 50, reason: 'not sent' },
                { ref: 'p1', relevanceScore: 50, reason: 'first' },
                { ref: 'p1', relevanceScore: 60, reason: 'second' },
                { ref: 'p2', relevanceScore: 101, reason: 'too high' },
                { ref: 'p3', relevanceScore: 4.5, reason: 'not an integer' },
                { ref: 'p4', relevanceScore: 40, reason: 'x'.repeat(201) },
            ],
        });

        expect(scores.size).toBe(0);
    });

    it.each([null, 'text', {}, { scores: 'nope' }, { scores: [null, 3, { ref: 'p1' }] }])(
        'returns nothing for a malformed answer (%o)',
        (answer) => {
            expect(acceptScores(sent, answer).size).toBe(0);
        },
    );

    it('rejects an empty reason', () => {
        expect(acceptScores(sent, { scores: [{ ref: 'p1', relevanceScore: 10, reason: '   ' }] }).size).toBe(
            0,
        );
    });
});

describe('acceptPhrases', () => {
    it('normalizes, drops invalid lengths and include terms, and keeps the free slots', () => {
        expect(
            acceptPhrases(
                {
                    phrases: [
                        ' compare agent frameworks ',
                        'Compare Agent Frameworks',
                        'AI agents',
                        'x',
                        'y'.repeat(51),
                        'agent tooling for teams',
                        'llm orchestration',
                    ],
                },
                ['ai agents'],
                2,
            ),
        ).toEqual(['compare agent frameworks', 'agent tooling for teams']);
    });

    it.each([null, {}, { phrases: 'one' }, { phrases: [1, null] }])(
        'returns no phrases for a malformed answer (%o)',
        (answer) => {
            expect(acceptPhrases(answer, [], 6)).toEqual([]);
        },
    );
});

describe('freePhraseSlots', () => {
    it('leaves up to six phrase queries within the ten-query budget', () => {
        expect(freePhraseSlots(1)).toBe(6);
        expect(freePhraseSlots(4)).toBe(6);
        expect(freePhraseSlots(7)).toBe(3);
        expect(freePhraseSlots(10)).toBe(0);
    });
});
