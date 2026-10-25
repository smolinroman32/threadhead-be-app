import { OpportunityFeedAccountLockedError } from '../errors/opportunity-feed-account-locked.error.js';
import type { OpportunityFeedFields } from './opportunity-feed-fields.js';

export function criteriaChanged(before: OpportunityFeedFields, after: OpportunityFeedFields) {
    return (
        before.intent !== after.intent ||
        before.targetAudience !== after.targetAudience ||
        !sameTerms(before.includeTerms, after.includeTerms) ||
        !sameTerms(before.excludeTerms, after.excludeTerms)
    );
}

export function bindFeedAccount(current: string | null, requested: string | undefined) {
    if (requested === undefined || requested === current) return current;
    if (current !== null) throw new OpportunityFeedAccountLockedError();

    return requested;
}

function sameTerms(left: string[], right: string[]) {
    const keys = new Set(left.map((term) => term.toLowerCase()));
    const other = new Set(right.map((term) => term.toLowerCase()));

    return keys.size === other.size && [...keys].every((key) => other.has(key));
}
