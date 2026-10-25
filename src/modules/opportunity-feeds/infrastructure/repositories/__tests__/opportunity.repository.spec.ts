import type { PrismaService } from '../../../../../shared/prisma.service.js';
import { OpportunityRepository } from '../opportunity.repository.js';

const row = (id: string, scoringVersion = 2) => ({
    id,
    opportunityFeedId: 'feed-id',
    externalPostId: `post-${id}`,
    authorUsername: 'someone',
    text: 'A question',
    permalink: 'https://www.threads.net/@someone/post/1',
    publishedAt: new Date('2026-10-25T10:00:00Z'),
    relevanceScore: 80,
    reason: 'Asks exactly this',
    status: 'NEW',
    scoringVersion,
    excludedTerm: null,
    createdAt: new Date('2026-10-25T10:00:00Z'),
    updatedAt: new Date('2026-10-25T10:00:00Z'),
    opportunitySearchQueries: [{ searchQuery: { query: 'ai agents' } }],
    opportunityFeed: { scoringVersion: 3 },
});

describe('OpportunityRepository', () => {
    const opportunity = { findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn(), update: vi.fn() };
    const repository = new OpportunityRepository({ opportunity } as unknown as PrismaService);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('lists a page of new opportunities with the read filters, the order and the total', async () => {
        opportunity.findMany.mockResolvedValue([row('a', 3), row('b')]);
        opportunity.count.mockResolvedValue(42);
        const since = new Date('2026-10-24T12:00:00Z');

        const result = await repository.list({
            feedId: 'feed-id',
            status: 'NEW',
            newOnly: { minScore: 60, publishedSince: since, excludeAuthor: 'Owner' },
            page: 3,
            pageSize: 20,
        });

        const where = {
            opportunityFeedId: 'feed-id',
            status: 'NEW',
            relevanceScore: { gte: 60 },
            publishedAt: { gte: since },
            excludedTerm: null,
            NOT: { authorUsername: { equals: 'Owner', mode: 'insensitive' } },
        };
        const query = opportunity.findMany.mock.calls[0][0];
        expect(query.where).toEqual(where);
        expect(query.orderBy).toEqual([{ relevanceScore: 'desc' }, { publishedAt: 'desc' }, { id: 'asc' }]);
        expect(query.skip).toBe(40);
        expect(query.take).toBe(20);
        expect(opportunity.count).toHaveBeenCalledWith({ where });
        expect(result.total).toBe(42);
        expect(result.items).toHaveLength(2);
        expect(result.items[0]).toMatchObject({ id: 'a', stale: false, matchedQueries: ['ai agents'] });
    });

    it('lists other statuses without the read filters and marks older versions as stale', async () => {
        opportunity.findMany.mockResolvedValue([row('a')]);
        opportunity.count.mockResolvedValue(1);

        const result = await repository.list({
            feedId: 'feed-id',
            status: 'SAVED',
            newOnly: null,
            page: 1,
            pageSize: 20,
        });

        expect(opportunity.findMany.mock.calls[0][0]).toMatchObject({
            where: { opportunityFeedId: 'feed-id', status: 'SAVED' },
            skip: 0,
        });
        expect(result).toMatchObject({ total: 1, items: [{ stale: true }] });
    });

    it('counts with the same filters as the list', async () => {
        opportunity.count.mockResolvedValue(7);
        const since = new Date('2026-10-24T12:00:00Z');

        await expect(
            repository.count('feed-id', 'NEW', { minScore: 60, publishedSince: since, excludeAuthor: null }),
        ).resolves.toBe(7);
        await repository.count('feed-id', 'DISMISSED', null);

        expect(opportunity.count.mock.calls).toEqual([
            [
                {
                    where: {
                        opportunityFeedId: 'feed-id',
                        status: 'NEW',
                        relevanceScore: { gte: 60 },
                        publishedAt: { gte: since },
                        excludedTerm: null,
                    },
                },
            ],
            [{ where: { opportunityFeedId: 'feed-id', status: 'DISMISSED' } }],
        ]);
    });

    it('finds an opportunity only through a feed of the user', async () => {
        opportunity.findFirst.mockResolvedValue(null);

        await expect(repository.findByIdForUser('opportunity-id', 'user-id')).resolves.toBeNull();
        expect(opportunity.findFirst.mock.calls[0][0].where).toEqual({
            id: 'opportunity-id',
            opportunityFeed: { userId: 'user-id' },
        });
    });
});
