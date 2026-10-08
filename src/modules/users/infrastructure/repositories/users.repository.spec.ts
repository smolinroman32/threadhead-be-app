import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
import type { PrismaService } from '../../../../shared/prisma.service.js';
import { UserRepository } from './users.repository.js';

describe('UserRepository.getUserById', () => {
    const findUnique = vi.fn();
    const repository = new UserRepository({ user: { findUnique } } as unknown as PrismaService);

    it('throws UserNotFoundError when there is no such user', async () => {
        findUnique.mockResolvedValue(null);

        await expect(repository.getUserById('missing-id')).rejects.toBeInstanceOf(UserNotFoundError);
    });
});
