import { SocialAccountNotFoundError } from '../../domain/errors/social-account-not-found.error.js';
import type { SocialAccountRepositoryPort } from '../../domain/ports/social-account-repository.port.js';
import { DisconnectSocialAccountUseCase } from './disconnect-social-account.use-case.js';

describe('DisconnectSocialAccountUseCase', () => {
    const repository = { deleteByIdForUser: vi.fn() };
    const useCase = new DisconnectSocialAccountUseCase(repository as unknown as SocialAccountRepositoryPort);

    it('removes an account owned by the user', async () => {
        repository.deleteByIdForUser.mockResolvedValue(true);

        await expect(useCase.execute('user-id', 'account-id')).resolves.toBeUndefined();
        expect(repository.deleteByIdForUser).toHaveBeenCalledWith('account-id', 'user-id');
    });

    it('reports an account that is missing or owned by someone else as not found', async () => {
        repository.deleteByIdForUser.mockResolvedValue(false);

        await expect(useCase.execute('user-id', 'account-id')).rejects.toBeInstanceOf(
            SocialAccountNotFoundError,
        );
    });
});
