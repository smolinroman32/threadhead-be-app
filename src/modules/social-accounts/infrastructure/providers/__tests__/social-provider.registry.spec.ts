import type { SocialAccountApiPort } from '../../../domain/ports/social-account-api.port.js';
import type { SocialAccountOauthPort } from '../../../domain/ports/social-account-oauth.port.js';
import { SocialProviderRegistry } from '../social-provider.registry.js';

describe('SocialProviderRegistry', () => {
    const oauth = { provider: 'THREADS' } as SocialAccountOauthPort;
    const api = {} as SocialAccountApiPort;
    const registry = new SocialProviderRegistry(oauth as never, api as never);

    it('returns the adapters of a provider', () => {
        expect(registry.oauth('THREADS')).toBe(oauth);
        expect(registry.api('THREADS')).toBe(api);
    });
});
