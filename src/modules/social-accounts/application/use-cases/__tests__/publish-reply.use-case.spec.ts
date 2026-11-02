import { SocialAccountNotFoundError } from '../../../domain/errors/social-account-not-found.error.js';
import type { SocialAccountRepositoryPort } from '../../../domain/ports/social-account-repository.port.js';
import type { SocialProviderRegistryPort } from '../../../domain/ports/social-provider-registry.port.js';
import type { GetAccessTokenUseCase } from '../get-access-token.use-case.js';
import { PublishReplyUseCase } from '../publish-reply.use-case.js';

describe('PublishReplyUseCase', () => {
    const api = { publishReply: vi.fn() };
    const registry = { api: vi.fn(() => api) };
    const repository = { findById: vi.fn() };
    const accessToken = { execute: vi.fn() };
    const useCase = new PublishReplyUseCase(
        repository as unknown as SocialAccountRepositoryPort,
        registry as unknown as SocialProviderRegistryPort,
        accessToken as unknown as GetAccessTokenUseCase,
    );

    beforeEach(() => {
        vi.resetAllMocks();
        registry.api.mockReturnValue(api);
    });

    it('publishes with the account provider and its token', async () => {
        repository.findById.mockResolvedValue({ provider: 'THREADS' });
        accessToken.execute.mockResolvedValue('token');
        api.publishReply.mockResolvedValue({ id: 'reply-1' });
        const reply = { replyToId: 'post-1', text: 'Hi' };

        await expect(useCase.execute('account-id', reply)).resolves.toEqual({ id: 'reply-1' });
        expect(registry.api).toHaveBeenCalledWith('THREADS');
        expect(api.publishReply).toHaveBeenCalledWith('token', reply);
    });

    it('reports a missing account as not found', async () => {
        repository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('account-id', { replyToId: 'post-1', text: 'Hi' }),
        ).rejects.toBeInstanceOf(SocialAccountNotFoundError);
        expect(api.publishReply).not.toHaveBeenCalled();
    });
});
