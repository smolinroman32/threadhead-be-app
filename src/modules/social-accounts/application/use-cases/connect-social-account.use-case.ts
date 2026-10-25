import { Injectable, Logger } from '@nestjs/common';
import { EncryptionService } from '../../../../shared/services/encryption-service/encryption.service.js';
import { InvalidOAuthStateError } from '../../domain/errors/invalid-oauth-state.error.js';
import { SocialAccountAlreadyConnectedError } from '../../domain/errors/social-account-already-connected.error.js';
import { OAuthStatePort } from '../../domain/ports/oauth-state.port.js';
import {
    SocialAccountRepositoryPort,
    type NewSocialAccount,
    type SocialAccountChanges,
} from '../../domain/ports/social-account-repository.port.js';
import { SocialProviderRegistryPort } from '../../domain/ports/social-provider-registry.port.js';
import { CheckSearchAccessUseCase } from './check-search-access.use-case.js';

type ConnectInput = {
    state: string;
    code: string;
    currentUserId: string | null;
};

@Injectable()
export class ConnectSocialAccountUseCase {
    private readonly logger = new Logger(ConnectSocialAccountUseCase.name);

    constructor(
        private readonly oauthState: OAuthStatePort,
        private readonly registry: SocialProviderRegistryPort,
        private readonly repository: SocialAccountRepositoryPort,
        private readonly encryption: EncryptionService,
        private readonly searchAccess: CheckSearchAccessUseCase,
    ) {}

    async execute({ state, code, currentUserId }: ConnectInput) {
        const { userId, provider } = await this.oauthState.verify(state);

        if (currentUserId !== userId) {
            this.logger.warn(
                `State user ${userId} does not match the cookie user ${currentUserId ?? 'none'}`,
            );

            throw new InvalidOAuthStateError();
        }

        const oauth = this.registry.oauth(provider);
        const tokens = await oauth.exchangeCode(code);
        const profile = await this.registry.api(provider).getProfile(tokens.accessToken);

        this.logger.log(`Profile fetched: ${provider} @${profile.username} (${profile.id}), user ${userId}`);

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

        const account = existing
            ? await this.reconnect(existing.id, connection)
            : await this.create({ ...connection, userId, provider, providerAccountId: profile.id });

        this.checkSearchAccess(account.id);

        return account;
    }

    private reconnect(accountId: string, connection: SocialAccountChanges) {
        this.logger.log(`Reconnecting existing account ${accountId}`);

        return this.repository.update(accountId, { ...connection, isActive: true, disconnectedAt: null });
    }

    private create(data: NewSocialAccount) {
        this.logger.log(`Creating a new ${data.provider} account for user ${data.userId}`);

        return this.repository.create(data);
    }

    private checkSearchAccess(accountId: string) {
        this.searchAccess.execute(accountId).catch((error: unknown) => {
            this.logger.warn(`Search access check failed for ${accountId}: ${String(error)}`);
        });
    }
}
