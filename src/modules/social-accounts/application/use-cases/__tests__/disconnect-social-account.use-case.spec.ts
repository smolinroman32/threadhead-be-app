import { SocialAccountNotFoundError } from '../../../domain/errors/social-account-not-found.error.js';
import type { SocialAccountRepositoryPort } from '../../../domain/ports/social-account-repository.port.js';
import { DisconnectSocialAccountUseCase } from '../disconnect-social-account.use-case.js';

describe('DisconnectSocialAccountUseCase', () => {
    const repository = { disconnectForUser: vi.fn() };
    const useCase = new DisconnectSocialAccountUseCase(repository as unknown as SocialAccountRepositoryPort);

    it('disconnects an account owned by the user', async () => {
        repository.disconnectForUser.mockResolvedValue(true);

        await expect(useCase.execute('user-id', 'account-id')).resolves.toBeUndefined();
        expect(repository.disconnectForUser).toHaveBeenCalledWith('account-id', 'user-id');
    });

    it('reports an account that is missing, already disconnected or owned by someone else as not found', async () => {
        repository.disconnectForUser.mockResolvedValue(false);

        await expect(useCase.execute('user-id', 'account-id')).rejects.toBeInstanceOf(
            SocialAccountNotFoundError,
        );
    });
});
