import type { SocialProvider } from '../entities/social-account.entity.js';

export abstract class OAuthStatePort {
    abstract sign(userId: string, provider: SocialProvider): Promise<string>;
    abstract verify(state: string): Promise<{ userId: string; provider: SocialProvider }>;
}
