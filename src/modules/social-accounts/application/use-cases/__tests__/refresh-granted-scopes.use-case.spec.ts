import { SocialAccountNotFoundError } from '../../../domain/errors/social-account-not-found.error.js';
import type { SocialAccountRepositoryPort } from '../../../domain/ports/social-account-repository.port.js';
import type { SocialProviderRegistryPort } from '../../../domain/ports/social-provider-registry.port.js';
import type { GetAccessTokenUseCase } from '../get-access-token.use-case.js';
import { RefreshGrantedScopesUseCase } from '../refresh-granted-scopes.use-case.js';

describe('RefreshGrantedScopesUseCase', () => {
    const oauth = { getGrantedScopes: vi.fn() };
    const registry = { oauth: vi.fn(() => oauth) };
    const repository = { findById: vi.fn(), update: vi.fn() };
    const accessToken = { execute: vi.fn() };
    const useCase = new RefreshGrantedScopesUseCase(
        repository as unknown as SocialAccountRepositoryPort,
        registry as unknown as SocialProviderRegistryPort,
        accessToken as unknown as GetAccessTokenUseCase,
    );

    beforeEach(() => {
        vi.resetAllMocks();
        registry.oauth.mockReturnValue(oauth);
    });

    it('saves the scopes the provider reports for the account token', async () => {
        repository.findById.mockResolvedValue({ provider: 'THREADS' });
        accessToken.execute.mockResolvedValue('token');
        oauth.getGrantedScopes.mockResolvedValue(['threads_basic']);
        repository.update.mockResolvedValue({ id: 'account-id', scopes: ['threads_basic'] });

        await useCase.execute('account-id');

        expect(registry.oauth).toHaveBeenCalledWith('THREADS');
        expect(oauth.getGrantedScopes).toHaveBeenCalledWith('token');
        expect(repository.update).toHaveBeenCalledWith('account-id', { scopes: ['threads_basic'] });
    });

    it('reports a missing account as not found and writes nothing', async () => {
        repository.findById.mockResolvedValue(null);

        await expect(useCase.execute('account-id')).rejects.toBeInstanceOf(SocialAccountNotFoundError);
        expect(repository.update).not.toHaveBeenCalled();
    });
});
