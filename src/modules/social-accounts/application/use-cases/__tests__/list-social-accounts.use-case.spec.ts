import type { SocialAccountEntity } from '../../../domain/entities/social-account.entity.js';
import type { SocialAccountRepositoryPort } from '../../../domain/ports/social-account-repository.port.js';
import { ListSocialAccountsUseCase } from '../list-social-accounts.use-case.js';

describe('ListSocialAccountsUseCase', () => {
    const repository = { listByUser: vi.fn() };
    const useCase = new ListSocialAccountsUseCase(repository as unknown as SocialAccountRepositoryPort);

    it('returns the accounts of the given user', async () => {
        const accounts = [{ id: 'a' }, { id: 'b' }] as SocialAccountEntity[];
        repository.listByUser.mockResolvedValue(accounts);

        await expect(useCase.execute('user-id')).resolves.toBe(accounts);
        expect(repository.listByUser).toHaveBeenCalledWith('user-id');
    });
});
