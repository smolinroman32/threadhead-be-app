import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../../../../shared/services/encryption-service/encryption.service.js';
import type { SocialAccountEntity } from '../../domain/entities/social-account.entity.js';
import { SocialAccountNotFoundError } from '../../domain/errors/social-account-not-found.error.js';
import { SocialAccountReconnectRequiredError } from '../../domain/errors/social-account-reconnect-required.error.js';
import { SocialProviderRejectedError } from '../../domain/errors/social-provider-rejected.error.js';
import { SocialAccountRepositoryPort } from '../../domain/ports/social-account-repository.port.js';
import { SocialProviderRegistryPort } from '../../domain/ports/social-provider-registry.port.js';

const REFRESH_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class GetAccessTokenUseCase {
    constructor(
        private readonly registry: SocialProviderRegistryPort,
        private readonly repository: SocialAccountRepositoryPort,
        private readonly encryption: EncryptionService,
    ) {}

    async execute(accountId: string) {
        const account = await this.repository.findById(accountId);

        if (!account) throw new SocialAccountNotFoundError();

        const token = this.storedToken(account);

        if (!token) throw new SocialAccountReconnectRequiredError();
        if (!this.isExpiringSoon(token.expiresAt)) return this.encryption.decrypt(token.encrypted);

        const current = await this.repository.mutateLocked(accountId, (locked) => this.refresh(locked));

        if (!current) throw new SocialAccountNotFoundError();

        const currentToken = this.storedToken(current);

        if (!currentToken) throw new SocialAccountReconnectRequiredError();

        return this.encryption.decrypt(currentToken.encrypted);
    }

    private async refresh(account: SocialAccountEntity) {
        const token = this.storedToken(account);

        if (!token || !this.isExpiringSoon(token.expiresAt)) return null;

        try {
            const oauth = this.registry.oauth(account.provider);
            const tokens = await oauth.refreshToken(this.encryption.decrypt(token.encrypted));

            return {
                accessTokenEncrypted: this.encryption.encrypt(tokens.accessToken),
                refreshTokenEncrypted: tokens.refreshToken && this.encryption.encrypt(tokens.refreshToken),
                tokenExpiresAt: tokens.expiresAt,
            };
        } catch (error) {
            if (error instanceof SocialProviderRejectedError) return { isActive: false };

            throw error;
        }
    }

    private storedToken(account: SocialAccountEntity) {
        if (!account.isActive || !account.accessTokenEncrypted || !account.tokenExpiresAt) return null;

        return { encrypted: account.accessTokenEncrypted, expiresAt: account.tokenExpiresAt };
    }

    private isExpiringSoon(expiresAt: Date) {
        return expiresAt.getTime() - Date.now() <= REFRESH_WINDOW_MS;
    }
}
