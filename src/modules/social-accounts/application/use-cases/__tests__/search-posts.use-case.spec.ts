import { SocialAccountNotFoundError } from '../../../domain/errors/social-account-not-found.error.js';
import type { SocialAccountRepositoryPort } from '../../../domain/ports/social-account-repository.port.js';
import type { SocialProviderRegistryPort } from '../../../domain/ports/social-provider-registry.port.js';
import type { GetAccessTokenUseCase } from '../get-access-token.use-case.js';
import { SearchPostsUseCase } from '../search-posts.use-case.js';

describe('SearchPostsUseCase', () => {
    const api = { searchPosts: vi.fn() };
    const registry = { api: vi.fn(() => api) };
    const repository = { findById: vi.fn() };
    const accessToken = { execute: vi.fn() };
    const useCase = new SearchPostsUseCase(
        repository as unknown as SocialAccountRepositoryPort,
        registry as unknown as SocialProviderRegistryPort,
        accessToken as unknown as GetAccessTokenUseCase,
    );

    beforeEach(() => {
        vi.resetAllMocks();
        registry.api.mockReturnValue(api);
    });

    it('searches with the account provider and its token', async () => {
        repository.findById.mockResolvedValue({ provider: 'THREADS' });
        accessToken.execute.mockResolvedValue('token');
        api.searchPosts.mockResolvedValue([{ id: '1' }]);
        const search = { query: 'ai', limit: 100 };

        await expect(useCase.execute('account-id', search)).resolves.toEqual([{ id: '1' }]);
        expect(registry.api).toHaveBeenCalledWith('THREADS');
        expect(api.searchPosts).toHaveBeenCalledWith('token', search);
    });

    it('reports a missing account as not found', async () => {
        repository.findById.mockResolvedValue(null);

        await expect(useCase.execute('account-id', { query: 'ai', limit: 1 })).rejects.toBeInstanceOf(
            SocialAccountNotFoundError,
        );
    });
});
