import { Injectable, Logger } from '@nestjs/common';
import { getEnv } from '../../../../shared/env/get-env.js';
import { HttpTransportError } from '../../../../shared/http/errors/http-transport.error.js';
import { LlmInvalidResponseError } from '../../../../shared/llm/errors/llm-invalid-response.error.js';
import { LlmRateLimitedError } from '../../../../shared/llm/errors/llm-rate-limited.error.js';
import { LlmUnavailableError } from '../../../../shared/llm/errors/llm-unavailable.error.js';
import { LlmPort } from '../../../../shared/llm/ports/llm.port.js';
import { SocialAccountsService } from '../../../social-accounts/application/social-accounts.service.js';
import type { SocialAccountEntity } from '../../../social-accounts/domain/entities/social-account.entity.js';
import { SocialAccountReconnectRequiredError } from '../../../social-accounts/domain/errors/social-account-reconnect-required.error.js';
import { SocialProviderPermissionDeniedError } from '../../../social-accounts/domain/errors/social-provider-permission-denied.error.js';
import { SocialProviderRejectedError } from '../../../social-accounts/domain/errors/social-provider-rejected.error.js';
import { SocialProviderUnavailableError } from '../../../social-accounts/domain/errors/social-provider-unavailable.error.js';
import {
    MAX_SCORED_POSTS_PER_RUN,
    SCORING_BATCH_SIZE,
    SEARCH_ACCESS_TTL_MS,
    SEARCH_LIMIT,
} from '../../domain/discovery/discovery.constants.js';
import { acceptPhrases, acceptScores, freePhraseSlots } from '../../domain/discovery/llm-answers.js';
import { dedupeResults, prefilterCandidates } from '../../domain/discovery/prefilter.js';
import type { DiscoveryRunEntity } from '../../domain/entities/discovery-run.entity.js';
import type { OpportunityFeedEntity } from '../../domain/entities/opportunity-feed.entity.js';
import { DiscoveryQueuePort } from '../../domain/ports/discovery-queue.port.js';
import {
    DiscoveryRunRepositoryPort,
    type RunFence,
    type RunOutcome,
} from '../../domain/ports/discovery-run-repository.port.js';
import {
    DiscoveryWorkPort,
    type ActiveSearchQuery,
    type FoundPost,
} from '../../domain/ports/discovery-work.port.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';
import { phrasesRequest, scoresRequest } from '../discovery/discovery-prompts.js';
import { emptyRunStats, type RunStats } from '../discovery/run-stats.js';

type Run = { feed: OpportunityFeedEntity; fence: RunFence; scoringVersion: number; stats: RunStats };

const HOUR_MS = 60 * 60_000;

class StopRun extends Error {
    constructor(readonly reason: string) {
        super(reason);
    }
}

@Injectable()
export class RunDiscoveryUseCase {
    private readonly logger = new Logger(RunDiscoveryUseCase.name);

    constructor(
        private readonly runs: DiscoveryRunRepositoryPort,
        private readonly work: DiscoveryWorkPort,
        private readonly feeds: OpportunityFeedRepositoryPort,
        private readonly socialAccounts: SocialAccountsService,
        private readonly llm: LlmPort,
        private readonly queue: DiscoveryQueuePort,
    ) {}

    async execute(runId: string) {
        const claim = await this.runs.claim(runId);

        if (claim.outcome !== 'claimed') return;

        const run = await this.start(claim.run);

        try {
            await this.process(run);

            if (run.stats.unscored > 0) run.stats.warnings.push('partial_scoring');

            await this.finish(run, { status: 'SUCCEEDED', error: null, stats: run.stats });
        } catch (error) {
            await this.fail(run, error);
        }
    }

    private async start(claimed: DiscoveryRunEntity): Promise<Run> {
        const feed = await this.feeds.findById(claimed.opportunityFeedId);

        if (!feed) throw new Error(`Feed of run ${claimed.id} is gone.`);

        return {
            feed,
            fence: { runId: claimed.id, attempt: claimed.attempt },
            scoringVersion: claimed.scoringVersion ?? feed.scoringVersion,
            stats: emptyRunStats(),
        };
    }

    private async process(run: Run) {
        const account = await this.safePoint(run);

        await this.checkAccessBeforeSearch(run, account);
        await this.rescore(run);

        const queries = await this.prepareQueries(run);
        const results = await this.search(run, queries);

        await this.checkSuspiciousResults(run, account, results);
        await this.scoreNewPosts(run, account, results);
    }

    private async safePoint(run: Run) {
        if (!(await this.runs.heartbeat(run.fence, run.stats))) throw new StopRun('fenced');

        const feed = await this.feeds.findById(run.feed.id);

        if (!feed?.isActive) throw new StopRun('paused');
        if (!feed.socialAccountId) throw new StopRun('account_required');

        const accounts = await this.socialAccounts.list(feed.userId);
        const account = accounts.find((candidate) => candidate.id === feed.socialAccountId);

        if (!account) throw new StopRun('account_disconnected');
        if (!account.isActive) throw new StopRun('reconnect_required');

        return account;
    }

    private async checkAccessBeforeSearch(run: Run, account: SocialAccountEntity) {
        if (account.searchAccess !== 'NARROWED') return;

        const checkedAt = account.searchAccessCheckedAt?.getTime() ?? 0;

        if (Date.now() - checkedAt < SEARCH_ACCESS_TTL_MS) throw new StopRun('search_permission_narrowed');

        const access = await this.checkAccess(run, account);

        if (access !== 'OK') throw new StopRun('search_permission_narrowed');
    }

    private async rescore(run: Run) {
        const stale = await this.work.staleOpportunities(
            run.feed.id,
            run.scoringVersion,
            this.freshSince(run),
        );

        for (const batch of chunks(stale, SCORING_BATCH_SIZE)) {
            await this.safePoint(run);

            const refs = batch.map((opportunity, index) => ({
                ref: `p${index + 1}`,
                text: opportunity.text,
            }));
            const scores = await this.score(run, refs);
            const rescores = batch.flatMap((opportunity, index) => {
                const score = scores.get(refs[index].ref);

                return score ? [{ id: opportunity.id, ...score }] : [];
            });

            if (
                rescores.length > 0 &&
                !(await this.work.saveRescored(run.fence, run.scoringVersion, rescores))
            ) {
                throw new StopRun('fenced');
            }

            run.stats.rescored += rescores.length;
            run.stats.unscored += batch.length - rescores.length;
        }
    }

    private async prepareQueries(run: Run) {
        const { feed } = run;
        let queries = await this.work.activeQueries(feed.id);

        if (!queries.some((query) => query.type === 'KEYWORD')) {
            const keywords = feed.includeTerms.map((query) => ({ query, type: 'KEYWORD' as const }));

            queries = [...queries, ...(await this.work.createQueries(feed.id, keywords))];
        }

        const slots = freePhraseSlots(feed.includeTerms.length);

        if (slots > 0 && !queries.some((query) => query.type === 'PHRASE')) {
            queries = [...queries, ...(await this.generatePhrases(run, slots))];
        }

        run.stats.queries = queries.length;

        return queries;
    }

    private async generatePhrases(run: Run, slots: number) {
        try {
            const answer = await this.llm.completeJson(
                phrasesRequest(getEnv('DISCOVERY_QUERY_MODEL'), run.feed, slots),
            );
            const phrases = acceptPhrases(answer, run.feed.includeTerms, slots);

            if (phrases.length === 0) throw new LlmInvalidResponseError('no usable phrases');

            return this.work.createQueries(
                run.feed.id,
                phrases.map((query) => ({ query, type: 'PHRASE' as const })),
            );
        } catch (error) {
            if (!isLlmError(error)) throw error;

            run.stats.warnings.push('query_generation_failed');

            return [];
        }
    }

    private async search(run: Run, queries: ActiveSearchQuery[]) {
        const results: { queryId: string; posts: FoundPost[] }[] = [];
        const since = this.freshSince(run);

        for (const query of queries) {
            const account = await this.safePoint(run);
            const posts = await this.socialAccounts.searchPosts(account.id, {
                query: query.query,
                since,
                limit: SEARCH_LIMIT,
            });

            if (posts.length >= SEARCH_LIMIT) run.stats.truncatedQueries.push(query.query);

            await this.work.addMatched(query.id, posts.length);
            run.stats.fetched += posts.length;
            results.push({ queryId: query.id, posts });
        }

        return results;
    }

    private async checkSuspiciousResults(
        run: Run,
        account: SocialAccountEntity,
        results: { posts: FoundPost[] }[],
    ) {
        const posts = results.flatMap((result) => result.posts);
        const own = account.username.toLowerCase();

        if (posts.length === 0 || posts.some((post) => post.username.toLowerCase() !== own)) return;

        const access = await this.checkAccess(run, account);

        if (access === 'NARROWED') throw new StopRun('search_permission_narrowed');
        if (access === 'UNKNOWN') run.stats.warnings.push('permission_check_inconclusive');
    }

    private async scoreNewPosts(
        run: Run,
        account: SocialAccountEntity,
        results: { queryId: string; posts: FoundPost[] }[],
    ) {
        const { feed } = run;
        const candidates = dedupeResults(results);
        const existingPostIds = await this.work.existingPostIds(
            feed.id,
            candidates.map((candidate) => candidate.post.id),
        );
        const { toScore, existing, dropped } = prefilterCandidates(candidates, {
            existingPostIds,
            ownUsername: account.username,
            freshnessHours: feed.freshnessHours,
            excludeTerms: feed.excludeTerms,
            now: new Date(),
            cap: MAX_SCORED_POSTS_PER_RUN,
        });

        run.stats.deduped = run.stats.fetched - candidates.length;
        run.stats.dropped = dropped;

        await this.work.linkExisting(
            feed.id,
            existing.map((candidate) => ({
                externalPostId: candidate.post.id,
                queryIds: candidate.queryIds,
            })),
        );

        for (const batch of chunks(toScore, SCORING_BATCH_SIZE)) {
            await this.safePoint(run);

            const refs = batch.map((candidate, index) => ({
                ref: `p${index + 1}`,
                text: candidate.post.text,
            }));
            const scores = await this.score(run, refs);
            const scored = batch.flatMap((candidate, index) => {
                const score = scores.get(refs[index].ref);

                return score ? [{ post: candidate.post, queryIds: candidate.queryIds, ...score }] : [];
            });

            if (
                scored.length > 0 &&
                !(await this.work.saveScored(
                    run.fence,
                    { id: feed.id, scoringVersion: run.scoringVersion, minScore: feed.minScore },
                    scored,
                ))
            ) {
                throw new StopRun('fenced');
            }

            run.stats.scored += scored.length;
            run.stats.unscored += batch.length - scored.length;
        }
    }

    private async score(run: Run, posts: { ref: string; text: string }[]) {
        const request = scoresRequest(getEnv('DISCOVERY_SCORING_MODEL'), run.feed, posts);
        const refs = posts.map((post) => post.ref);

        try {
            return acceptScores(refs, await this.llm.completeJson(request));
        } catch (error) {
            if (!(error instanceof LlmInvalidResponseError)) throw error;
        }

        try {
            return acceptScores(refs, await this.llm.completeJson(request));
        } catch (error) {
            if (!(error instanceof LlmInvalidResponseError)) throw error;

            return new Map();
        }
    }

    private async checkAccess(run: Run, account: SocialAccountEntity) {
        const { searchAccess } = await this.socialAccounts.checkSearchAccess(account.id);

        run.stats.searchAccessCheck = searchAccess.toLowerCase() as RunStats['searchAccessCheck'];

        return searchAccess;
    }

    private freshSince(run: Run) {
        return new Date(Date.now() - run.feed.freshnessHours * HOUR_MS);
    }

    private async finish(run: Run, outcome: RunOutcome) {
        const next = await this.runs.finish(run.fence, outcome);

        if (next) await this.queue.enqueue(next);
    }

    private async fail(run: Run, error: unknown) {
        if (error instanceof StopRun) {
            if (error.reason === 'fenced') return;
            if (error.reason === 'paused') {
                await this.runs.pause(run.fence, run.stats);
                return;
            }

            await this.finish(run, { status: 'FAILED', error: error.reason, stats: run.stats });
            return;
        }

        const retryable = retryReason(error);

        if (retryable) {
            const result = await this.runs.retryLater(run.fence, run.stats, retryable);

            if (result.outcome === 'requeued') {
                await this.queue.enqueue(run.fence.runId, result.notBefore.getTime() - Date.now());
            }
            if (result.outcome === 'failed' && result.nextRunId) await this.queue.enqueue(result.nextRunId);

            return;
        }

        const reason = failureReason(error);

        if (reason === 'internal_error') this.logger.error(`Run ${run.fence.runId} failed`, error as Error);

        await this.finish(run, { status: 'FAILED', error: reason, stats: run.stats });
    }
}

function retryReason(error: unknown) {
    if (error instanceof LlmRateLimitedError) return 'llm_rate_limited';
    if (error instanceof LlmUnavailableError) return 'llm_unavailable';
    if (error instanceof SocialProviderUnavailableError || error instanceof HttpTransportError) {
        return 'threads_unavailable';
    }

    return null;
}

function failureReason(error: unknown) {
    if (error instanceof SocialAccountReconnectRequiredError) return 'reconnect_required';
    if (error instanceof SocialProviderPermissionDeniedError) return 'search_permission_narrowed';
    if (error instanceof SocialProviderRejectedError) return 'threads_rejected';

    return 'internal_error';
}

function isLlmError(error: unknown) {
    return (
        error instanceof LlmRateLimitedError ||
        error instanceof LlmUnavailableError ||
        error instanceof LlmInvalidResponseError
    );
}

function chunks<T>(items: T[], size: number) {
    const result: T[][] = [];

    for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));

    return result;
}
