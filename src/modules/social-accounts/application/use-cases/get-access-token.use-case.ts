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
        if (!account.isActive) throw new SocialAccountReconnectRequiredError();
        if (!this.isExpiringSoon(account)) return this.encryption.decrypt(account.accessTokenEncrypted);

        const current = await this.repository.mutateLocked(accountId, (locked) => this.refresh(locked));

        if (!current) throw new SocialAccountNotFoundError();
        if (!current.isActive) throw new SocialAccountReconnectRequiredError();

        return this.encryption.decrypt(current.accessTokenEncrypted);
    }

    private async refresh(account: SocialAccountEntity) {
        if (!account.isActive || !this.isExpiringSoon(account)) return null;

        try {
            const oauth = this.registry.oauth(account.provider);
            const tokens = await oauth.refreshToken(this.encryption.decrypt(account.accessTokenEncrypted));

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

    private isExpiringSoon(account: SocialAccountEntity) {
        return account.tokenExpiresAt.getTime() - Date.now() <= REFRESH_WINDOW_MS;
    }
}
