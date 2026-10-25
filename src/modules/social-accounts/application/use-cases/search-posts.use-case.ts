import { Injectable } from '@nestjs/common';
import { SocialAccountNotFoundError } from '../../domain/errors/social-account-not-found.error.js';
import type { PostSearch } from '../../domain/ports/social-account-api.port.js';
import { SocialAccountRepositoryPort } from '../../domain/ports/social-account-repository.port.js';
import { SocialProviderRegistryPort } from '../../domain/ports/social-provider-registry.port.js';
import { GetAccessTokenUseCase } from './get-access-token.use-case.js';

@Injectable()
export class SearchPostsUseCase {
    constructor(
        private readonly repository: SocialAccountRepositoryPort,
        private readonly registry: SocialProviderRegistryPort,
        private readonly accessToken: GetAccessTokenUseCase,
    ) {}

    async execute(accountId: string, search: PostSearch) {
        const account = await this.repository.findById(accountId);

        if (!account) throw new SocialAccountNotFoundError();

        const token = await this.accessToken.execute(accountId);

        return this.registry.api(account.provider).searchPosts(token, search);
    }
}
