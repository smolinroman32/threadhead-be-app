import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma.service.js';
import type { RunFence } from '../../domain/ports/discovery-run-repository.port.js';
import {
    DiscoveryWorkPort,
    type Rescore,
    type ScoredPost,
    type SearchQueryType,
} from '../../domain/ports/discovery-work.port.js';
import { fencedTransaction } from './discovery-run.repository.js';

@Injectable()
export class DiscoveryWorkRepository implements DiscoveryWorkPort {
    constructor(private readonly prisma: PrismaService) {}

    activeQueries(feedId: string) {
        return this.prisma.searchQuery.findMany({
            where: { opportunityFeedId: feedId, isActive: true },
            select: { id: true, query: true, type: true },
            orderBy: { createdAt: 'asc' },
        });
    }

    createQueries(feedId: string, queries: { query: string; type: SearchQueryType }[]) {
        return this.prisma.searchQuery.createManyAndReturn({
            data: queries.map(({ query, type }) => ({
                opportunityFeedId: feedId,
                query,
                type,
                matchedPosts: 0,
                relevantPosts: 0,
            })),
            select: { id: true, query: true, type: true },
        });
    }

    async addMatched(queryId: string, count: number) {
        await this.prisma.searchQuery.update({
            where: { id: queryId },
            data: { matchedPosts: { increment: count } },
        });
    }

    async existingPostIds(feedId: string, externalPostIds: string[]) {
        const rows = await this.prisma.opportunity.findMany({
            where: { opportunityFeedId: feedId, externalPostId: { in: externalPostIds } },
            select: { externalPostId: true },
        });

        return new Set(rows.map((row) => row.externalPostId));
    }

    async linkExisting(feedId: string, links: { externalPostId: string; queryIds: string[] }[]) {
        if (links.length === 0) return;

        const rows = await this.prisma.opportunity.findMany({
            where: {
                opportunityFeedId: feedId,
                externalPostId: { in: links.map((link) => link.externalPostId) },
            },
            select: { id: true, externalPostId: true },
        });
        const idByPost = new Map(rows.map((row) => [row.externalPostId, row.id]));

        await this.prisma.opportunitySearchQuery.createMany({
            data: links.flatMap((link) => {
                const opportunityId = idByPost.get(link.externalPostId);

                return opportunityId
                    ? link.queryIds.map((searchQueryId) => ({ opportunityId, searchQueryId }))
                    : [];
            }),
            skipDuplicates: true,
        });
    }

    staleOpportunities(feedId: string, scoringVersion: number, since: Date) {
        return this.prisma.opportunity.findMany({
            where: {
                opportunityFeedId: feedId,
                scoringVersion: { lt: scoringVersion },
                status: { in: ['NEW', 'SAVED'] },
                excludedTerm: null,
                publishedAt: { gte: since },
            },
            select: { id: true, text: true },
            orderBy: { publishedAt: 'desc' },
        });
    }

    async saveScored(
        fence: RunFence,
        feed: { id: string; scoringVersion: number; minScore: number },
        posts: ScoredPost[],
    ) {
        const saved = await fencedTransaction(this.prisma, fence, async (tx) => {
            const created = await tx.opportunity.createManyAndReturn({
                data: posts.map(({ post, relevanceScore, reason }) => ({
                    opportunityFeedId: feed.id,
                    externalPostId: post.id,
                    authorUsername: post.username,
                    text: post.text,
                    permalink: post.permalink,
                    publishedAt: post.publishedAt,
                    relevanceScore,
                    reason,
                    status: 'NEW' as const,
                    scoringVersion: feed.scoringVersion,
                })),
                skipDuplicates: true,
                select: { id: true, externalPostId: true },
            });
            const idByPost = new Map(created.map((row) => [row.externalPostId, row.id]));
            const createdPosts = posts.filter(({ post }) => idByPost.has(post.id));

            await tx.opportunitySearchQuery.createMany({
                data: createdPosts.flatMap(({ post, queryIds }) =>
                    queryIds.map((searchQueryId) => ({
                        opportunityId: idByPost.get(post.id)!,
                        searchQueryId,
                    })),
                ),
                skipDuplicates: true,
            });

            const relevantByQuery = new Map<string, number>();

            for (const { queryIds, relevanceScore } of createdPosts) {
                if (relevanceScore < feed.minScore) continue;
                for (const queryId of queryIds)
                    relevantByQuery.set(queryId, (relevantByQuery.get(queryId) ?? 0) + 1);
            }

            for (const [queryId, count] of relevantByQuery) {
                await tx.searchQuery.update({
                    where: { id: queryId },
                    data: { relevantPosts: { increment: count } },
                });
            }

            return true;
        });

        return saved !== null;
    }

    async saveRescored(fence: RunFence, scoringVersion: number, rescores: Rescore[]) {
        const saved = await fencedTransaction(this.prisma, fence, async (tx) => {
            for (const { id, relevanceScore, reason } of rescores) {
                await tx.opportunity.updateMany({
                    where: { id, scoringVersion: { lte: scoringVersion } },
                    data: { relevanceScore, reason, scoringVersion },
                });
            }

            return true;
        });

        return saved !== null;
    }
}
