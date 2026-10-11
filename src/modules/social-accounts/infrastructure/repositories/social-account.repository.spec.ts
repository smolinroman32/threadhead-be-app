import type { PrismaService } from '../../../../shared/prisma.service.js';
import { SocialAccountEntity } from '../../domain/entities/social-account.entity.js';
import { SocialAccountRepository } from './social-account.repository.js';

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
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date('2026-10-02'),
};

describe('SocialAccountRepository', () => {
    const socialAccount = {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn(),
    };
    const repository = new SocialAccountRepository({ socialAccount } as unknown as PrismaService);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('lists only the accounts of the given user, newest first', async () => {
        socialAccount.findMany.mockResolvedValue([row]);

        const accounts = await repository.listByUser('user-id');

        expect(socialAccount.findMany).toHaveBeenCalledWith({
            where: { userId: 'user-id' },
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

    it('deletes only an account owned by the user and reports whether one was removed', async () => {
        socialAccount.deleteMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });

        await expect(repository.deleteByIdForUser('account-id', 'user-id')).resolves.toBe(true);
        await expect(repository.deleteByIdForUser('account-id', 'someone-else')).resolves.toBe(false);
        expect(socialAccount.deleteMany).toHaveBeenCalledWith({
            where: { id: 'account-id', userId: 'user-id' },
        });
    });
});
