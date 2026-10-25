import type { PrismaService } from '../../../../../shared/prisma.service.js';
import { OpportunityFeedEntity } from '../../../domain/entities/opportunity-feed.entity.js';
import { OpportunityFeedLimitReachedError } from '../../../domain/errors/opportunity-feed-limit-reached.error.js';
import type { NewOpportunityFeed } from '../../../domain/ports/opportunity-feed-repository.port.js';
import { OpportunityFeedRepository } from '../opportunity-feed.repository.js';

const row = {
    id: 'feed-id',
    userId: 'user-id',
    name: 'AI agents',
    description: '',
    color: '#5F947B',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: [],
    languages: ['en'],
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
    onboardingId: null,
    createdAt: new Date('2026-10-14'),
    updatedAt: new Date('2026-10-14'),
};

const data: NewOpportunityFeed = {
    userId: 'user-id',
    onboardingId: null,
    languages: ['en'],
    name: row.name,
    description: row.description,
    color: row.color,
    intent: row.intent,
    targetAudience: row.targetAudience,
    includeTerms: row.includeTerms,
    excludeTerms: row.excludeTerms,
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
};

describe('OpportunityFeedRepository', () => {
    const tx = {
        $executeRaw: vi.fn(),
        $queryRaw: vi.fn(),
        opportunityFeed: {
            findUnique: vi.fn(),
            findUniqueOrThrow: vi.fn(),
            count: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
    };
    const feed = {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        deleteMany: vi.fn(),
    };
    const $transaction = vi.fn();
    const repository = new OpportunityFeedRepository({
        opportunityFeed: feed,
        $transaction,
    } as unknown as PrismaService);

    beforeEach(() => {
        vi.resetAllMocks();
        $transaction.mockImplementation(async (work: (client: typeof tx) => unknown) => work(tx));
    });

    it('lists only the feeds of the user, newest first', async () => {
        feed.findMany.mockResolvedValue([row]);

        const feeds = await repository.listByUser('user-id');

        expect(feed.findMany).toHaveBeenCalledWith({
            where: { userId: 'user-id' },
            orderBy: { createdAt: 'desc' },
        });
        expect(feeds[0]).toBeInstanceOf(OpportunityFeedEntity);
        expect(feeds[0]).toMatchObject({ id: 'feed-id', userId: 'user-id', languages: ['en'] });
    });

    it('finds a feed by id scoped to the owner', async () => {
        feed.findFirst.mockResolvedValue(null);

        await expect(repository.findByIdForUser('feed-id', 'someone-else')).resolves.toBeNull();
        expect(feed.findFirst).toHaveBeenCalledWith({ where: { id: 'feed-id', userId: 'someone-else' } });
    });

    it('finds a feed by onboarding id scoped to the owner', async () => {
        feed.findFirst.mockResolvedValue(row);

        await expect(repository.findByOnboardingId('user-id', 'onboarding-id')).resolves.toMatchObject({
            id: 'feed-id',
        });
        expect(feed.findFirst).toHaveBeenCalledWith({
            where: { onboardingId: 'onboarding-id', userId: 'user-id' },
        });
    });

    it('deletes only a feed owned by the user and reports whether one was removed', async () => {
        feed.deleteMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });

        await expect(repository.deleteByIdForUser('feed-id', 'user-id')).resolves.toBe(true);
        await expect(repository.deleteByIdForUser('feed-id', 'someone-else')).resolves.toBe(false);
        expect(feed.deleteMany).toHaveBeenCalledWith({ where: { id: 'feed-id', userId: 'someone-else' } });
    });

    describe('createWithinLimit', () => {
        it('takes the user lock before it counts and inserts', async () => {
            tx.opportunityFeed.count.mockResolvedValue(3);
            tx.opportunityFeed.create.mockResolvedValue(row);

            const created = await repository.createWithinLimit(data, 10);

            expect(created.id).toBe('feed-id');
            expect(tx.opportunityFeed.create).toHaveBeenCalledWith({ data });
            expect(tx.$executeRaw.mock.invocationCallOrder[0]).toBeLessThan(
                tx.opportunityFeed.count.mock.invocationCallOrder[0],
            );
            expect(tx.opportunityFeed.count).toHaveBeenCalledWith({ where: { userId: 'user-id' } });
        });

        it('throws at the limit and inserts nothing', async () => {
            tx.opportunityFeed.count.mockResolvedValue(10);

            await expect(repository.createWithinLimit(data, 10)).rejects.toBeInstanceOf(
                OpportunityFeedLimitReachedError,
            );
            expect(tx.opportunityFeed.create).not.toHaveBeenCalled();
        });

        it('returns the existing feed of an onboarding without counting', async () => {
            tx.opportunityFeed.findUnique.mockResolvedValue({ ...row, onboardingId: 'onboarding-id' });

            const created = await repository.createWithinLimit(
                { ...data, onboardingId: 'onboarding-id' },
                10,
            );

            expect(created.id).toBe('feed-id');
            expect(tx.opportunityFeed.findUnique).toHaveBeenCalledWith({
                where: { onboardingId: 'onboarding-id' },
            });
            expect(tx.opportunityFeed.count).not.toHaveBeenCalled();
            expect(tx.opportunityFeed.create).not.toHaveBeenCalled();
        });

        it('creates a feed for an onboarding that has none yet', async () => {
            tx.opportunityFeed.findUnique.mockResolvedValue(null);
            tx.opportunityFeed.count.mockResolvedValue(0);
            tx.opportunityFeed.create.mockResolvedValue({ ...row, onboardingId: 'onboarding-id' });

            await repository.createWithinLimit({ ...data, onboardingId: 'onboarding-id' }, 10);

            expect(tx.opportunityFeed.create).toHaveBeenCalledWith({
                data: { ...data, onboardingId: 'onboarding-id' },
            });
        });
    });

    describe('updateLocked', () => {
        it("returns null without calling mutate when the feed is not the owner's", async () => {
            tx.$queryRaw.mockResolvedValue([]);
            const mutate = vi.fn();

            await expect(repository.updateLocked('feed-id', 'someone-else', mutate)).resolves.toBeNull();
            expect(mutate).not.toHaveBeenCalled();
        });

        it('locks the row, reads it, applies the mutation and returns the updated feed', async () => {
            tx.$queryRaw.mockResolvedValue([{ id: 'feed-id' }]);
            tx.opportunityFeed.findUniqueOrThrow.mockResolvedValue(row);
            tx.opportunityFeed.update.mockResolvedValue({ ...row, minScore: 80 });

            const updated = await repository.updateLocked('feed-id', 'user-id', (current) => ({
                ...current.fields,
                minScore: 80,
            }));

            expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
                tx.opportunityFeed.findUniqueOrThrow.mock.invocationCallOrder[0],
            );
            expect(tx.opportunityFeed.update).toHaveBeenCalledWith({
                where: { id: 'feed-id' },
                data: expect.objectContaining({ minScore: 80, name: 'AI agents' }),
            });
            expect(updated?.minScore).toBe(80);
        });

        it('writes nothing when the mutation throws', async () => {
            tx.$queryRaw.mockResolvedValue([{ id: 'feed-id' }]);
            tx.opportunityFeed.findUniqueOrThrow.mockResolvedValue(row);
            const failure = new Error('invalid');

            await expect(
                repository.updateLocked('feed-id', 'user-id', () => {
                    throw failure;
                }),
            ).rejects.toBe(failure);
            expect(tx.opportunityFeed.update).not.toHaveBeenCalled();
        });
    });
});
