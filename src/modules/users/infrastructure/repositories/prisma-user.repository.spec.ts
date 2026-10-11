import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
import type { PrismaService } from '../../../../shared/prisma.service.js';
import { PrismaUserRepository } from './prisma-user.repository.js';

describe('PrismaUserRepository.getUserById', () => {
    const findUnique = vi.fn();
    const repository = new PrismaUserRepository({ user: { findUnique } } as unknown as PrismaService);

    it('throws UserNotFoundError when there is no such user', async () => {
        findUnique.mockResolvedValue(null);

        await expect(repository.getUserById('missing-id')).rejects.toBeInstanceOf(UserNotFoundError);
    });
});

describe('PrismaUserRepository.revokeSessions', () => {
    const updateMany = vi.fn();
    const repository = new PrismaUserRepository({ user: { updateMany } } as unknown as PrismaService);

    it('bumps tokenVersion without failing for a deleted user', async () => {
        await repository.revokeSessions('user-id');

        expect(updateMany).toHaveBeenCalledWith({
            where: { id: 'user-id' },
            data: { tokenVersion: { increment: 1 } },
        });
    });
});
