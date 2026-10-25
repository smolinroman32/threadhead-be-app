import type { EncryptionService } from '../../../../../shared/services/encryption-service/encryption.service.js';
import { SocialAccountEntity } from '../../../domain/entities/social-account.entity.js';
import { InvalidOAuthStateError } from '../../../domain/errors/invalid-oauth-state.error.js';
import { SocialAccountAlreadyConnectedError } from '../../../domain/errors/social-account-already-connected.error.js';
import type { OAuthStatePort } from '../../../domain/ports/oauth-state.port.js';
import type { SocialAccountRepositoryPort } from '../../../domain/ports/social-account-repository.port.js';
import type { SocialProviderRegistryPort } from '../../../domain/ports/social-provider-registry.port.js';
import { ConnectSocialAccountUseCase } from '../connect-social-account.use-case.js';

describe('ConnectSocialAccountUseCase', () => {
    const expiresAt = new Date('2026-12-08T12:00:00Z');
    const oauthState = { verify: vi.fn() };
    const oauth = { scopes: ['threads_basic', 'threads_keyword_search'], exchangeCode: vi.fn() };
    const api = { getProfile: vi.fn() };
    const registry = { oauth: vi.fn(() => oauth), api: vi.fn(() => api) };
    const repository = { findByProviderAccount: vi.fn(), create: vi.fn(), update: vi.fn() };
    const encryption = { encrypt: vi.fn((value: string) => `enc:${value}`) };
    const useCase = new ConnectSocialAccountUseCase(
        oauthState as unknown as OAuthStatePort,
        registry as unknown as SocialProviderRegistryPort,
        repository as unknown as SocialAccountRepositoryPort,
        encryption as unknown as EncryptionService,
    );

    const existing = (userId: string) =>
        new SocialAccountEntity('account-id', {
            userId,
            provider: 'THREADS',
            providerAccountId: 'th-42',
            username: 'old',
            avatarUrl: null,
            accessTokenEncrypted: 'enc:old',
            refreshTokenEncrypted: null,
            tokenExpiresAt: new Date(),
            scopes: [],
            isActive: false,
            disconnectedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

    beforeEach(() => {
        vi.clearAllMocks();
        oauthState.verify.mockResolvedValue({ userId: 'user-id', provider: 'THREADS' });
        oauth.exchangeCode.mockResolvedValue({ accessToken: 'long', refreshToken: null, expiresAt });
        api.getProfile.mockResolvedValue({ id: 'th-42', username: 'name', avatarUrl: 'https://img/x.png' });
        repository.findByProviderAccount.mockResolvedValue(null);
        repository.create.mockImplementation(async (data) => data);
        repository.update.mockImplementation(async (_id, changes) => changes);
    });

    it('creates the account with an encrypted token and the profile data', async () => {
        await useCase.execute({ state: 'state', code: 'code', currentUserId: 'user-id' });

        expect(oauth.exchangeCode).toHaveBeenCalledWith('code');
        expect(api.getProfile).toHaveBeenCalledWith('long');
        expect(repository.create).toHaveBeenCalledWith({
            userId: 'user-id',
            provider: 'THREADS',
            providerAccountId: 'th-42',
            username: 'name',
            avatarUrl: 'https://img/x.png',
            accessTokenEncrypted: 'enc:long',
            refreshTokenEncrypted: null,
            tokenExpiresAt: expiresAt,
            scopes: ['threads_basic', 'threads_keyword_search'],
        });
    });

    it('updates and reactivates in place an account the same user connects again after a disconnect', async () => {
        repository.findByProviderAccount.mockResolvedValue(existing('user-id'));

        await useCase.execute({ state: 'state', code: 'code', currentUserId: 'user-id' });

        expect(repository.create).not.toHaveBeenCalled();
        expect(repository.update).toHaveBeenCalledWith('account-id', {
            username: 'name',
            avatarUrl: 'https://img/x.png',
            accessTokenEncrypted: 'enc:long',
            refreshTokenEncrypted: null,
            tokenExpiresAt: expiresAt,
            scopes: ['threads_basic', 'threads_keyword_search'],
            isActive: true,
            disconnectedAt: null,
        });
    });

    it('refuses an account that belongs to another user and writes nothing', async () => {
        repository.findByProviderAccount.mockResolvedValue(existing('someone-else'));

        await expect(
            useCase.execute({ state: 'state', code: 'code', currentUserId: 'user-id' }),
        ).rejects.toBeInstanceOf(SocialAccountAlreadyConnectedError);
        expect(repository.create).not.toHaveBeenCalled();
        expect(repository.update).not.toHaveBeenCalled();
    });

    it('rejects an invalid state before touching the provider', async () => {
        oauthState.verify.mockRejectedValue(new InvalidOAuthStateError());

        await expect(
            useCase.execute({ state: 'bad', code: 'code', currentUserId: 'user-id' }),
        ).rejects.toBeInstanceOf(InvalidOAuthStateError);
        expect(oauth.exchangeCode).not.toHaveBeenCalled();
    });

    it('rejects a state that belongs to another user than the cookie', async () => {
        for (const currentUserId of ['someone-else', null]) {
            await expect(
                useCase.execute({ state: 'state', code: 'code', currentUserId }),
            ).rejects.toBeInstanceOf(InvalidOAuthStateError);
        }
        expect(oauth.exchangeCode).not.toHaveBeenCalled();
    });
});
