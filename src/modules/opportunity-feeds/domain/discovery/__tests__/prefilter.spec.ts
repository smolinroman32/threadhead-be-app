import { dedupeResults, prefilterCandidates, type CandidatePost } from '../prefilter.js';

const NOW = new Date('2026-10-25T12:00:00Z');
const HOUR = 60 * 60 * 1000;

const post = (id: string, overrides: Partial<CandidatePost> = {}): CandidatePost => ({
    id,
    text: 'How do you evaluate AI agent frameworks for a small team?',
    username: 'someone',
    publishedAt: new Date(NOW.getTime() - HOUR),
    isReply: false,
    ...overrides,
});

const options = {
    existingPostIds: new Set<string>(),
    ownUsername: 'Owner',
    freshnessHours: 24,
    excludeTerms: ['crypto'],
    now: NOW,
    cap: 300,
};

describe('dedupeResults', () => {
    it('keeps one candidate per post id with every query that found it, in first-seen order', () => {
        const candidates = dedupeResults([
            { queryId: 'q1', posts: [post('a'), post('b')] },
            { queryId: 'q2', posts: [post('b'), post('c')] },
            { queryId: 'q3', posts: [post('a')] },
        ]);

        expect(candidates.map((candidate) => [candidate.post.id, candidate.queryIds])).toEqual([
            ['a', ['q1', 'q3']],
            ['b', ['q1', 'q2']],
            ['c', ['q2']],
        ]);
    });
});

describe('prefilterCandidates', () => {
    const candidate = (value: CandidatePost) => ({ post: value, queryIds: ['q1'] });

    it('drops each kind of miss and counts it by reason', () => {
        const result = prefilterCandidates(
            [
                candidate(post('keep')),
                candidate(post('known')),
                candidate(post('reply', { isReply: true })),
                candidate(post('own', { username: 'OWNER' })),
                candidate(post('stale', { publishedAt: new Date(NOW.getTime() - 25 * HOUR) })),
                candidate(post('short', { text: '  too short  ' })),
                candidate(post('empty', { text: '' })),
                candidate(post('excluded', { text: 'Buy Crypto signals here, best agent ever' })),
            ],
            { ...options, existingPostIds: new Set(['known']) },
        );

        expect(result.toScore.map((item) => item.post.id)).toEqual(['keep']);
        expect(result.existing.map((item) => item.post.id)).toEqual(['known']);
        expect(result.dropped).toEqual({ reply: 1, own: 1, stale: 1, short: 2, excluded: 1, capped: 0 });
    });

    it('checks known posts before anything else, so a known reply is linked, not dropped', () => {
        const result = prefilterCandidates([candidate(post('known', { isReply: true }))], {
            ...options,
            existingPostIds: new Set(['known']),
        });

        expect(result.existing).toHaveLength(1);
        expect(result.dropped.reply).toBe(0);
    });

    it('keeps the newest posts across all queries up to the cap and counts the rest as capped', () => {
        const result = prefilterCandidates(
            [
                { post: post('old', { publishedAt: new Date(NOW.getTime() - 5 * HOUR) }), queryIds: ['q1'] },
                { post: post('new', { publishedAt: new Date(NOW.getTime() - 1 * HOUR) }), queryIds: ['q2'] },
                { post: post('mid', { publishedAt: new Date(NOW.getTime() - 3 * HOUR) }), queryIds: ['q1'] },
            ],
            { ...options, cap: 2 },
        );

        expect(result.toScore.map((item) => item.post.id)).toEqual(['new', 'mid']);
        expect(result.dropped.capped).toBe(1);
    });

    it('accepts a post published exactly at the freshness boundary', () => {
        const result = prefilterCandidates(
            [candidate(post('edge', { publishedAt: new Date(NOW.getTime() - 24 * HOUR) }))],
            options,
        );

        expect(result.toScore).toHaveLength(1);
    });
});
