import { matchExcludedTerm } from '../../../../shared/terms/match-excluded-term.js';
import { MIN_POST_TEXT_LENGTH } from './discovery.constants.js';

export type CandidatePost = {
    id: string;
    text: string;
    username: string;
    publishedAt: Date;
    isReply: boolean;
};

export type Candidate<T extends CandidatePost = CandidatePost> = { post: T; queryIds: string[] };

export type DropReason = 'reply' | 'own' | 'stale' | 'short' | 'excluded' | 'capped';

export type PrefilterOptions = {
    existingPostIds: Set<string>;
    ownUsername: string;
    freshnessHours: number;
    excludeTerms: string[];
    now: Date;
    cap: number;
};

const HOUR_MS = 60 * 60 * 1000;

export function dedupeResults<T extends CandidatePost>(results: { queryId: string; posts: T[] }[]) {
    const byId = new Map<string, Candidate<T>>();

    for (const { queryId, posts } of results) {
        for (const post of posts) {
            const candidate = byId.get(post.id);

            if (!candidate) byId.set(post.id, { post, queryIds: [queryId] });
            else if (!candidate.queryIds.includes(queryId)) candidate.queryIds.push(queryId);
        }
    }

    return [...byId.values()];
}

export function prefilterCandidates<T extends CandidatePost>(
    candidates: Candidate<T>[],
    options: PrefilterOptions,
) {
    const dropped: Record<DropReason, number> = {
        reply: 0,
        own: 0,
        stale: 0,
        short: 0,
        excluded: 0,
        capped: 0,
    };
    const existing: Candidate<T>[] = [];
    const kept: Candidate<T>[] = [];
    const own = options.ownUsername.toLowerCase();
    const oldest = options.now.getTime() - options.freshnessHours * HOUR_MS;

    for (const candidate of candidates) {
        if (options.existingPostIds.has(candidate.post.id)) {
            existing.push(candidate);
            continue;
        }

        const reason = dropReason(candidate.post, own, oldest, options.excludeTerms);

        if (reason) dropped[reason]++;
        else kept.push(candidate);
    }

    const newest = kept.toSorted(
        (left, right) =>
            right.post.publishedAt.getTime() - left.post.publishedAt.getTime() ||
            left.post.id.localeCompare(right.post.id),
    );
    dropped.capped = Math.max(0, newest.length - options.cap);

    return { toScore: newest.slice(0, options.cap), existing, dropped };
}

function dropReason(
    post: CandidatePost,
    own: string,
    oldest: number,
    excludeTerms: string[],
): DropReason | null {
    if (post.isReply) return 'reply';
    if (post.username.toLowerCase() === own) return 'own';
    if (post.publishedAt.getTime() < oldest) return 'stale';
    if (post.text.trim().length < MIN_POST_TEXT_LENGTH) return 'short';
    if (matchExcludedTerm(post.text, excludeTerms)) return 'excluded';

    return null;
}
