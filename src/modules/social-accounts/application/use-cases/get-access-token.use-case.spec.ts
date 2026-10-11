import type { EncryptionService } from '../../../../shared/encryption-service/encryption.service.js';
import { HttpTransportError } from '../../../../shared/http/errors/http-transport.error.js';
import { SocialAccountEntity } from '../../domain/entities/social-account.entity.js';
import { SocialAccountNotFoundError } from '../../domain/errors/social-account-not-found.error.js';
import { SocialAccountReconnectRequiredError } from '../../domain/errors/social-account-reconnect-required.error.js';
import { SocialProviderRejectedError } from '../../domain/errors/social-provider-rejected.error.js';
import { SocialProviderUnavailableError } from '../../domain/errors/social-provider-unavailable.error.js';
import type {
    SocialAccountChanges,
    SocialAccountRepositoryPort,
} from '../../domain/ports/social-account-repository.port.js';
import type { SocialProviderRegistryPort } from '../../domain/ports/social-provider-registry.port.js';
import { GetAccessTokenUseCase } from './get-access-token.use-case.js';

const NOW = new Date('2026-10-09T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

describe('GetAccessTokenUseCase', () => {
    let stored: SocialAccountEntity | null;
    const oauth = { refreshToken: vi.fn() };
    const registry = { oauth: vi.fn(() => oauth) };
    const encryption = {
        encrypt: vi.fn((value: string) => `enc:${value}`),
        decrypt: vi.fn((value: string) => value.replace('enc:', '')),
    };
    const repository = {
        findById: vi.fn(async () => stored),
        mutateLocked: vi.fn(
            async (
                _id: string,
                mutate: (account: SocialAccountEntity) => Promise<SocialAccountChanges | null>,
            ) => {
                if (!stored) return null;
                const changes = await mutate(stored);
                if (changes) stored = account({ ...props(stored), ...changes });
                return stored;
            },
        ),
    };
    const useCase = new GetAccessTokenUseCase(
        registry as unknown as SocialProviderRegistryPort,
        repository as unknown as SocialAccountRepositoryPort,
        encryption as unknown as EncryptionService,
    );

    const props = (entity: SocialAccountEntity) => ({
        userId: entity.userId,
        provider: entity.provider,
        providerAccountId: entity.providerAccountId,
        username: entity.username,
        avatarUrl: entity.avatarUrl,
        accessTokenEncrypted: entity.accessTokenEncrypted,
        refreshTokenEncrypted: entity.refreshTokenEncrypted,
        tokenExpiresAt: entity.tokenExpiresAt,
        scopes: entity.scopes,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
    });

    const account = (overrides: Partial<ReturnType<typeof props>> = {}) =>
        new SocialAccountEntity('account-id', {
            userId: 'user-id',
            provider: 'THREADS',
            providerAccountId: 'th-42',
            username: 'name',
            avatarUrl: null,
            accessTokenEncrypted: 'enc:current',
            refreshTokenEncrypted: null,
            tokenExpiresAt: new Date(NOW.getTime() + 30 * DAY),
            scopes: [],
            isActive: true,
            createdAt: NOW,
            updatedAt: NOW,
            ...overrides,
        });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
        stored = account();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns the decrypted token without a refresh when it is not close to expiry', async () => {
        await expect(useCase.execute('account-id')).resolves.toBe('current');

        expect(oauth.refreshToken).not.toHaveBeenCalled();
        expect(repository.mutateLocked).not.toHaveBeenCalled();
    });

    it('refreshes a token that expires within seven days and stores the new one encrypted', async () => {
        const newExpiry = new Date(NOW.getTime() + 60 * DAY);
        stored = account({ tokenExpiresAt: new Date(NOW.getTime() + 3 * DAY) });
        oauth.refreshToken.mockResolvedValue({
            accessToken: 'newer',
            refreshToken: null,
            expiresAt: newExpiry,
        });

        await expect(useCase.execute('account-id')).resolves.toBe('newer');

        expect(oauth.refreshToken).toHaveBeenCalledWith('current');
        expect(stored?.accessTokenEncrypted).toBe('enc:newer');
        expect(stored?.tokenExpiresAt).toEqual(newExpiry);
    });

    it('skips the refresh when another call already renewed the token while this one waited for the lock', async () => {
        stored = account({ tokenExpiresAt: new Date(NOW.getTime() + 3 * DAY) });
        repository.findById.mockImplementationOnce(async () => stored);
        repository.mutateLocked.mockImplementationOnce(async (_id, mutate) => {
            stored = account({ accessTokenEncrypted: 'enc:renewed' });
            await mutate(stored);
            return stored;
        });

        await expect(useCase.execute('account-id')).resolves.toBe('renewed');
        expect(oauth.refreshToken).not.toHaveBeenCalled();
    });

    it('deactivates the account and asks to reconnect when the provider rejects the token', async () => {
        stored = account({ tokenExpiresAt: new Date(NOW.getTime() + 3 * DAY) });
        oauth.refreshToken.mockRejectedValue(new SocialProviderRejectedError());

        await expect(useCase.execute('account-id')).rejects.toBeInstanceOf(
            SocialAccountReconnectRequiredError,
        );
        expect(stored?.isActive).toBe(false);
    });

    it.each([
        new SocialProviderUnavailableError(),
        new HttpTransportError('https://x', new Error('timeout')),
    ])('changes nothing on a transient failure (%s)', async (failure) => {
        stored = account({ tokenExpiresAt: new Date(NOW.getTime() + 3 * DAY) });
        oauth.refreshToken.mockRejectedValue(failure);

        await expect(useCase.execute('account-id')).rejects.toBe(failure);
        expect(stored?.isActive).toBe(true);
        expect(stored?.accessTokenEncrypted).toBe('enc:current');
    });

    it('asks to reconnect an inactive account without calling the provider', async () => {
        stored = account({ isActive: false });

        await expect(useCase.execute('account-id')).rejects.toBeInstanceOf(
            SocialAccountReconnectRequiredError,
        );
        expect(oauth.refreshToken).not.toHaveBeenCalled();
    });

    it('reports a missing account as not found', async () => {
        stored = null;

        await expect(useCase.execute('account-id')).rejects.toBeInstanceOf(SocialAccountNotFoundError);
    });
});
