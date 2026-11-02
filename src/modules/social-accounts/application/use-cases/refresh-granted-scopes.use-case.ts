import { Injectable } from '@nestjs/common';
import { SocialAccountNotFoundError } from '../../domain/errors/social-account-not-found.error.js';
import { SocialAccountRepositoryPort } from '../../domain/ports/social-account-repository.port.js';
import { SocialProviderRegistryPort } from '../../domain/ports/social-provider-registry.port.js';
import { GetAccessTokenUseCase } from './get-access-token.use-case.js';

@Injectable()
export class RefreshGrantedScopesUseCase {
    constructor(
        private readonly repository: SocialAccountRepositoryPort,
        private readonly registry: SocialProviderRegistryPort,
        private readonly accessToken: GetAccessTokenUseCase,
    ) {}

    async execute(accountId: string) {
        const account = await this.repository.findById(accountId);

        if (!account) throw new SocialAccountNotFoundError();

        const token = await this.accessToken.execute(accountId);
        const scopes = await this.registry.oauth(account.provider).getGrantedScopes(token);

        return this.repository.update(accountId, { scopes });
    }
}
