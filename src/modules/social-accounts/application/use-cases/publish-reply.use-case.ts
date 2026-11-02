import { Injectable } from '@nestjs/common';
import { SocialAccountNotFoundError } from '../../domain/errors/social-account-not-found.error.js';
import type { ReplyDraft } from '../../domain/ports/social-account-api.port.js';
import { SocialAccountRepositoryPort } from '../../domain/ports/social-account-repository.port.js';
import { SocialProviderRegistryPort } from '../../domain/ports/social-provider-registry.port.js';
import { GetAccessTokenUseCase } from './get-access-token.use-case.js';

@Injectable()
export class PublishReplyUseCase {
    constructor(
        private readonly repository: SocialAccountRepositoryPort,
        private readonly registry: SocialProviderRegistryPort,
        private readonly accessToken: GetAccessTokenUseCase,
    ) {}

    async execute(accountId: string, reply: ReplyDraft) {
        const account = await this.repository.findById(accountId);

        if (!account) throw new SocialAccountNotFoundError();

        const token = await this.accessToken.execute(accountId);

        return this.registry.api(account.provider).publishReply(token, reply);
    }
}
