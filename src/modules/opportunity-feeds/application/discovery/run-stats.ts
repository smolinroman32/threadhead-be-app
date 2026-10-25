import type { DropReason } from '../../domain/discovery/prefilter.js';

export type RunStats = {
    queries: number;
    fetched: number;
    deduped: number;
    dropped: Partial<Record<DropReason, number>>;
    scored: number;
    rescored: number;
    unscored: number;
    truncatedQueries: string[];
    searchAccessCheck: 'ok' | 'narrowed' | 'unknown' | 'skipped';
    warnings: string[];
};

export function emptyRunStats(): RunStats {
    return {
        queries: 0,
        fetched: 0,
        deduped: 0,
        dropped: {},
        scored: 0,
        rescored: 0,
        unscored: 0,
        truncatedQueries: [],
        searchAccessCheck: 'skipped',
        warnings: [],
    };
}
