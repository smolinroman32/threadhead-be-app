import { Injectable } from '@nestjs/common';
import type { SocialProvider } from '../../domain/entities/social-account.entity.js';
import { OAuthStatePort } from '../../domain/ports/oauth-state.port.js';
import { SocialProviderRegistryPort } from '../../domain/ports/social-provider-registry.port.js';

@Injectable()
export class AuthorizeSocialAccountUseCase {
    constructor(
        private readonly oauthState: OAuthStatePort,
        private readonly registry: SocialProviderRegistryPort,
    ) {}

    async execute(userId: string, provider: SocialProvider) {
        const state = await this.oauthState.sign(userId, provider);

        return this.registry.oauth(provider).getAuthorizationUrl(state);
    }
}
