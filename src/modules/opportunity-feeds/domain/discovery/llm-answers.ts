import { normalizeTerms } from '../../../../shared/terms/normalize-terms.js';
import { MAX_PHRASE_QUERIES, MAX_SEARCH_QUERIES, REASON_MAX_LENGTH } from './discovery.constants.js';

export type AcceptedScore = { relevanceScore: number; reason: string };

const PHRASE_MIN_LENGTH = 2;
const PHRASE_MAX_LENGTH = 50;

export function acceptScores(sentRefs: string[], answer: unknown) {
    const items = arrayField(answer, 'scores');
    const sent = new Set(sentRefs);
    const counts = new Map<string, number>();

    for (const item of items) {
        if (isRecord(item) && typeof item.ref === 'string')
            counts.set(item.ref, (counts.get(item.ref) ?? 0) + 1);
    }

    const accepted = new Map<string, AcceptedScore>();

    for (const item of items) {
        if (!isRecord(item) || typeof item.ref !== 'string') continue;
        if (!sent.has(item.ref) || counts.get(item.ref) !== 1) continue;

        const score = item.relevanceScore;
        const reason = typeof item.reason === 'string' ? item.reason.trim() : '';
        const validScore = typeof score === 'number' && Number.isInteger(score) && score >= 0 && score <= 100;

        if (validScore && reason.length > 0 && reason.length <= REASON_MAX_LENGTH) {
            accepted.set(item.ref, { relevanceScore: score, reason });
        }
    }

    return accepted;
}

export function acceptPhrases(answer: unknown, includeTerms: string[], slots: number) {
    const phrases = arrayField(answer, 'phrases').filter((item): item is string => typeof item === 'string');
    const included = new Set(includeTerms.map((term) => term.toLowerCase()));

    return normalizeTerms(phrases)
        .filter((phrase) => phrase.length >= PHRASE_MIN_LENGTH && phrase.length <= PHRASE_MAX_LENGTH)
        .filter((phrase) => !included.has(phrase.toLowerCase()))
        .slice(0, Math.max(0, slots));
}

export function freePhraseSlots(includeTermCount: number) {
    return Math.max(0, Math.min(MAX_PHRASE_QUERIES, MAX_SEARCH_QUERIES - includeTermCount));
}

function arrayField(answer: unknown, field: string): unknown[] {
    const value = isRecord(answer) ? answer[field] : undefined;

    return Array.isArray(value) ? value : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
