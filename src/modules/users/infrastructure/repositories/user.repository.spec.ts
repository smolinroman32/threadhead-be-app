import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
import type { PrismaService } from '../../../../shared/prisma.service.js';
import { UserRepository } from './user.repository.js';

describe('UserRepository.getUserById', () => {
    const findUnique = vi.fn();
    const repository = new UserRepository({ user: { findUnique } } as unknown as PrismaService);

    it('throws UserNotFoundError when there is no such user', async () => {
        findUnique.mockResolvedValue(null);

        await expect(repository.getUserById('missing-id')).rejects.toBeInstanceOf(UserNotFoundError);
    });
});

describe('UserRepository.revokeSessions', () => {
    const updateMany = vi.fn();
    const repository = new UserRepository({ user: { updateMany } } as unknown as PrismaService);

    it('bumps tokenVersion without failing for a deleted user', async () => {
        await repository.revokeSessions('user-id');

        expect(updateMany).toHaveBeenCalledWith({
            where: { id: 'user-id' },
            data: { tokenVersion: { increment: 1 } },
        });
    });
});
