import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../../../../shared/encryption-service/encryption.service.js';
import { InvalidOAuthStateError } from '../../domain/errors/invalid-oauth-state.error.js';
import { SocialAccountAlreadyConnectedError } from '../../domain/errors/social-account-already-connected.error.js';
import { OAuthStatePort } from '../../domain/ports/oauth-state.port.js';
import { SocialAccountRepositoryPort } from '../../domain/ports/social-account-repository.port.js';
import { SocialProviderRegistryPort } from '../../domain/ports/social-provider-registry.port.js';

type ConnectInput = {
    state: string;
    code: string;
    currentUserId: string | null;
};

@Injectable()
export class ConnectSocialAccountUseCase {
    constructor(
        private readonly oauthState: OAuthStatePort,
        private readonly registry: SocialProviderRegistryPort,
        private readonly repository: SocialAccountRepositoryPort,
        private readonly encryption: EncryptionService,
    ) {}

    async execute({ state, code, currentUserId }: ConnectInput) {
        const { userId, provider } = await this.oauthState.verify(state);

        if (currentUserId !== userId) throw new InvalidOAuthStateError();

        const oauth = this.registry.oauth(provider);
        const tokens = await oauth.exchangeCode(code);
        const profile = await this.registry.api(provider).getProfile(tokens.accessToken);

        const existing = await this.repository.findByProviderAccount(provider, profile.id);

        if (existing && existing.userId !== userId) throw new SocialAccountAlreadyConnectedError();

        const connection = {
            username: profile.username,
            avatarUrl: profile.avatarUrl,
            accessTokenEncrypted: this.encryption.encrypt(tokens.accessToken),
            refreshTokenEncrypted: tokens.refreshToken && this.encryption.encrypt(tokens.refreshToken),
            tokenExpiresAt: tokens.expiresAt,
            scopes: [...oauth.scopes],
        };

        if (existing) return this.repository.update(existing.id, { ...connection, isActive: true });

        return this.repository.create({ ...connection, userId, provider, providerAccountId: profile.id });
    }
}
