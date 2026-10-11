import type { OAuthStatePort } from '../../domain/ports/oauth-state.port.js';
import type { SocialProviderRegistryPort } from '../../domain/ports/social-provider-registry.port.js';
import { AuthorizeSocialAccountUseCase } from './authorize-social-account.use-case.js';

describe('AuthorizeSocialAccountUseCase', () => {
    const oauthState = { sign: vi.fn() };
    const oauth = { getAuthorizationUrl: vi.fn() };
    const registry = { oauth: vi.fn() };
    const useCase = new AuthorizeSocialAccountUseCase(
        oauthState as unknown as OAuthStatePort,
        registry as unknown as SocialProviderRegistryPort,
    );

    it('returns the provider authorization url built from a state signed for the user', async () => {
        oauthState.sign.mockResolvedValue('signed-state');
        registry.oauth.mockReturnValue(oauth);
        oauth.getAuthorizationUrl.mockReturnValue('https://threads.net/oauth/authorize?state=signed-state');

        const url = await useCase.execute('user-id', 'THREADS');

        expect(oauthState.sign).toHaveBeenCalledWith('user-id', 'THREADS');
        expect(registry.oauth).toHaveBeenCalledWith('THREADS');
        expect(oauth.getAuthorizationUrl).toHaveBeenCalledWith('signed-state');
        expect(url).toBe('https://threads.net/oauth/authorize?state=signed-state');
    });
});
