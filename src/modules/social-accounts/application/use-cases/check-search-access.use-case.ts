import { Injectable } from '@nestjs/common';
import { HttpTransportError } from '../../../../shared/http/errors/http-transport.error.js';
import type { SocialAccountEntity } from '../../domain/entities/social-account.entity.js';
import { SocialAccountNotFoundError } from '../../domain/errors/social-account-not-found.error.js';
import { SocialProviderPermissionDeniedError } from '../../domain/errors/social-provider-permission-denied.error.js';
import { SocialProviderRejectedError } from '../../domain/errors/social-provider-rejected.error.js';
import { SocialProviderUnavailableError } from '../../domain/errors/social-provider-unavailable.error.js';
import { SocialAccountRepositoryPort } from '../../domain/ports/social-account-repository.port.js';
import { SocialProviderRegistryPort } from '../../domain/ports/social-provider-registry.port.js';
import { CONTROL_SEARCH, type SearchAccess, searchAccessFromPosts } from '../../domain/search-access.js';
import { GetAccessTokenUseCase } from './get-access-token.use-case.js';

@Injectable()
export class CheckSearchAccessUseCase {
    constructor(
        private readonly repository: SocialAccountRepositoryPort,
        private readonly registry: SocialProviderRegistryPort,
        private readonly accessToken: GetAccessTokenUseCase,
    ) {}

    async execute(accountId: string, userId?: string) {
        const account = await this.repository.findById(accountId);

        if (!account || (userId !== undefined && account.userId !== userId)) {
            throw new SocialAccountNotFoundError();
        }

        const token = await this.accessToken.execute(accountId);
        const searchAccess = await this.probe(account, token);
        const checkedAt = new Date();

        await this.repository.update(accountId, { searchAccess, searchAccessCheckedAt: checkedAt });

        return { searchAccess, checkedAt };
    }

    private async probe(account: SocialAccountEntity, token: string): Promise<SearchAccess> {
        try {
            const posts = await this.registry.api(account.provider).searchPosts(token, CONTROL_SEARCH);

            return searchAccessFromPosts(posts, account.username);
        } catch (error) {
            if (error instanceof SocialProviderPermissionDeniedError) return 'NARROWED';
            if (
                error instanceof SocialProviderUnavailableError ||
                error instanceof SocialProviderRejectedError ||
                error instanceof HttpTransportError
            ) {
                return 'UNKNOWN';
            }

            throw error;
        }
    }
}
