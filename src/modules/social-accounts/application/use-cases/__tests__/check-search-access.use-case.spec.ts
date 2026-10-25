import { HttpTransportError } from '../../../../../shared/http/errors/http-transport.error.js';
import { SocialAccountEntity } from '../../../domain/entities/social-account.entity.js';
import { SocialAccountNotFoundError } from '../../../domain/errors/social-account-not-found.error.js';
import { SocialProviderPermissionDeniedError } from '../../../domain/errors/social-provider-permission-denied.error.js';
import { SocialProviderRejectedError } from '../../../domain/errors/social-provider-rejected.error.js';
import { SocialProviderUnavailableError } from '../../../domain/errors/social-provider-unavailable.error.js';
import type { SocialAccountRepositoryPort } from '../../../domain/ports/social-account-repository.port.js';
import type { SocialProviderRegistryPort } from '../../../domain/ports/social-provider-registry.port.js';
import { CheckSearchAccessUseCase } from '../check-search-access.use-case.js';
import type { GetAccessTokenUseCase } from '../get-access-token.use-case.js';

const NOW = new Date('2026-10-25T12:00:00Z');

describe('CheckSearchAccessUseCase', () => {
    const api = { searchPosts: vi.fn() };
    const registry = { api: vi.fn(() => api) };
    const repository = { findById: vi.fn(), update: vi.fn() };
    const accessToken = { execute: vi.fn() };
    const useCase = new CheckSearchAccessUseCase(
        repository as unknown as SocialAccountRepositoryPort,
        registry as unknown as SocialProviderRegistryPort,
        accessToken as unknown as GetAccessTokenUseCase,
    );

    const account = (userId = 'user-id') =>
        new SocialAccountEntity('account-id', {
            userId,
            provider: 'THREADS',
            providerAccountId: 'th-42',
            username: 'Owner',
            avatarUrl: null,
            accessTokenEncrypted: 'enc:token',
            refreshTokenEncrypted: null,
            tokenExpiresAt: NOW,
            scopes: [],
            isActive: true,
            disconnectedAt: null,
            searchAccess: 'NARROWED',
            searchAccessCheckedAt: NOW,
            createdAt: NOW,
            updatedAt: NOW,
        });
    const post = (username: string) => ({ username });

    beforeEach(() => {
        vi.resetAllMocks();
        vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
        registry.api.mockReturnValue(api);
        repository.findById.mockResolvedValue(account());
        accessToken.execute.mockResolvedValue('token');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('runs the control search with the account token, even right after a check', async () => {
        api.searchPosts.mockResolvedValue([post('someone')]);

        await useCase.execute('account-id', 'user-id');

        expect(accessToken.execute).toHaveBeenCalledWith('account-id');
        expect(api.searchPosts).toHaveBeenCalledWith('token', { query: 'today', limit: 25 });
    });

    it.each([
        { name: 'a post by another author', result: () => [post('owner'), post('someone')], access: 'OK' },
        { name: 'only own posts', result: () => [post('owner'), post('OWNER')], access: 'NARROWED' },
        { name: 'an empty result', result: () => [], access: 'UNKNOWN' },
    ])('stores $access for $name', async ({ result, access }) => {
        api.searchPosts.mockResolvedValue(result());

        await expect(useCase.execute('account-id')).resolves.toEqual({
            searchAccess: access,
            checkedAt: NOW,
        });
        expect(repository.update).toHaveBeenCalledWith('account-id', {
            searchAccess: access,
            searchAccessCheckedAt: NOW,
        });
    });

    it.each([
        { failure: new SocialProviderPermissionDeniedError(), access: 'NARROWED' },
        { failure: new SocialProviderUnavailableError(), access: 'UNKNOWN' },
        { failure: new HttpTransportError('https://x', new Error('timeout')), access: 'UNKNOWN' },
        { failure: new SocialProviderRejectedError(), access: 'UNKNOWN' },
    ])('stores $access when the search fails with $failure.name', async ({ failure, access }) => {
        api.searchPosts.mockRejectedValue(failure);

        await expect(useCase.execute('account-id')).resolves.toMatchObject({ searchAccess: access });
        expect(repository.update).toHaveBeenCalledWith('account-id', {
            searchAccess: access,
            searchAccessCheckedAt: NOW,
        });
    });

    it('reports an account of another user as not found without searching', async () => {
        repository.findById.mockResolvedValue(account('someone-else'));

        await expect(useCase.execute('account-id', 'user-id')).rejects.toBeInstanceOf(
            SocialAccountNotFoundError,
        );
        expect(api.searchPosts).not.toHaveBeenCalled();
        expect(repository.update).not.toHaveBeenCalled();
    });

    it('reports a missing account as not found', async () => {
        repository.findById.mockResolvedValue(null);

        await expect(useCase.execute('account-id')).rejects.toBeInstanceOf(SocialAccountNotFoundError);
    });

    it('lets a token failure through without storing a result', async () => {
        const failure = new Error('reconnect');
        accessToken.execute.mockRejectedValue(failure);

        await expect(useCase.execute('account-id')).rejects.toBe(failure);
        expect(repository.update).not.toHaveBeenCalled();
    });
});
