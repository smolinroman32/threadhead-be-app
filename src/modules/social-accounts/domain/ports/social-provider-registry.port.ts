import type { SocialProvider } from '../entities/social-account.entity.js';
import type { SocialAccountApiPort } from './social-account-api.port.js';
import type { SocialAccountOauthPort } from './social-account-oauth.port.js';

export abstract class SocialProviderRegistryPort {
    abstract oauth(provider: SocialProvider): SocialAccountOauthPort;
    abstract api(provider: SocialProvider): SocialAccountApiPort;
}
