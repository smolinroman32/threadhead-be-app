import type { CandidatePost } from '../discovery/prefilter.js';
import type { RunFence } from './discovery-run-repository.port.js';

export type SearchQueryType = 'KEYWORD' | 'PHRASE';

export type ActiveSearchQuery = { id: string; query: string; type: SearchQueryType };

export type FoundPost = CandidatePost & { permalink: string };

export type ScoredPost = { post: FoundPost; queryIds: string[]; relevanceScore: number; reason: string };

export type StaleOpportunity = { id: string; text: string };

export type Rescore = { id: string; relevanceScore: number; reason: string };

export abstract class DiscoveryWorkPort {
    abstract activeQueries(feedId: string): Promise<ActiveSearchQuery[]>;
    abstract createQueries(
        feedId: string,
        queries: { query: string; type: SearchQueryType }[],
    ): Promise<ActiveSearchQuery[]>;
    abstract addMatched(queryId: string, count: number): Promise<void>;
    abstract existingPostIds(feedId: string, externalPostIds: string[]): Promise<Set<string>>;
    abstract linkExisting(
        feedId: string,
        links: { externalPostId: string; queryIds: string[] }[],
    ): Promise<void>;
    abstract staleOpportunities(
        feedId: string,
        scoringVersion: number,
        since: Date,
    ): Promise<StaleOpportunity[]>;
    abstract saveScored(
        fence: RunFence,
        feed: { id: string; scoringVersion: number; minScore: number },
        posts: ScoredPost[],
    ): Promise<boolean>;
    abstract saveRescored(fence: RunFence, scoringVersion: number, rescores: Rescore[]): Promise<boolean>;
}
