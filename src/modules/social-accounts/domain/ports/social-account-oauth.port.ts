import type { SocialProvider } from '../entities/social-account.entity.js';

export type OAuthTokens = {
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date;
};

export abstract class SocialAccountOauthPort {
    abstract readonly provider: SocialProvider;
    abstract readonly scopes: readonly string[];
    abstract getAuthorizationUrl(state: string): string;
    abstract exchangeCode(code: string): Promise<OAuthTokens>;
    abstract refreshToken(accessToken: string): Promise<OAuthTokens>;
}
