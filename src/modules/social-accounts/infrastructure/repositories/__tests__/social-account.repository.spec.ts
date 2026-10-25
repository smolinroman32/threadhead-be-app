import type { PrismaService } from '../../../../../shared/prisma.service.js';
import { SocialAccountEntity } from '../../../domain/entities/social-account.entity.js';
import { SocialAccountRepository } from '../social-account.repository.js';

const row = {
    id: 'account-id',
    userId: 'user-id',
    provider: 'THREADS' as const,
    providerAccountId: 'th-42',
    username: 'name',
    avatarUrl: null,
    accessTokenEncrypted: 'v1.x.y.z',
    refreshTokenEncrypted: null,
    tokenExpiresAt: new Date('2026-12-01'),
    scopes: ['threads_basic'],
    isActive: true,
    disconnectedAt: null,
    searchAccess: null,
    searchAccessCheckedAt: null,
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date('2026-10-02'),
};

describe('SocialAccountRepository', () => {
    const socialAccount = {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
    };
    const repository = new SocialAccountRepository({ socialAccount } as unknown as PrismaService);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('lists only the connected accounts of the given user, newest first', async () => {
        socialAccount.findMany.mockResolvedValue([row]);

        const accounts = await repository.listByUser('user-id');

        expect(socialAccount.findMany).toHaveBeenCalledWith({
            where: { userId: 'user-id', disconnectedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        expect(accounts[0]).toBeInstanceOf(SocialAccountEntity);
        expect(accounts).toHaveLength(1);
        expect(accounts[0]).toMatchObject({ id: row.id, userId: row.userId, username: row.username });
        expect(accounts[0].accessTokenEncrypted).toBe(row.accessTokenEncrypted);
    });

    it('returns null when the account does not exist', async () => {
        socialAccount.findUnique.mockResolvedValue(null);

        await expect(repository.findById('missing')).resolves.toBeNull();
    });

    it('disconnects only a connected account of the user, erasing its tokens', async () => {
        vi.useFakeTimers({ now: new Date('2026-10-25T12:00:00Z'), toFake: ['Date'] });
        socialAccount.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });

        await expect(repository.disconnectForUser('account-id', 'user-id')).resolves.toBe(true);
        await expect(repository.disconnectForUser('account-id', 'someone-else')).resolves.toBe(false);
        expect(socialAccount.updateMany).toHaveBeenCalledWith({
            where: { id: 'account-id', userId: 'user-id', disconnectedAt: null },
            data: {
                disconnectedAt: new Date('2026-10-25T12:00:00Z'),
                isActive: false,
                accessTokenEncrypted: null,
                refreshTokenEncrypted: null,
                tokenExpiresAt: null,
            },
        });
        vi.useRealTimers();
    });

    describe('mutateLocked', () => {
        const queryRaw = vi.fn();
        const tx = { $queryRaw: queryRaw, socialAccount: { findUniqueOrThrow: vi.fn(), update: vi.fn() } };
        const $transaction = vi.fn(async (work: (client: typeof tx) => unknown) => work(tx));
        const locking = new SocialAccountRepository({ $transaction } as unknown as PrismaService);

        it('returns null without calling mutate when the row does not exist', async () => {
            queryRaw.mockResolvedValue([]);
            const mutate = vi.fn();

            await expect(locking.mutateLocked('missing', mutate)).resolves.toBeNull();
            expect(mutate).not.toHaveBeenCalled();
        });

        it('locks the row, applies the changes and returns the updated account', async () => {
            queryRaw.mockResolvedValue([{ id: 'account-id' }]);
            tx.socialAccount.findUniqueOrThrow.mockResolvedValue(row);
            tx.socialAccount.update.mockResolvedValue({ ...row, isActive: false });

            const result = await locking.mutateLocked('account-id', async () => ({ isActive: false }));

            expect(tx.socialAccount.update).toHaveBeenCalledWith({
                where: { id: 'account-id' },
                data: { isActive: false },
            });
            expect(result?.isActive).toBe(false);
        });

        it('does not write when mutate returns null', async () => {
            queryRaw.mockResolvedValue([{ id: 'account-id' }]);
            tx.socialAccount.findUniqueOrThrow.mockResolvedValue(row);

            const result = await locking.mutateLocked('account-id', async () => null);

            expect(tx.socialAccount.update).not.toHaveBeenCalled();
            expect(result?.id).toBe('account-id');
        });
    });
});
