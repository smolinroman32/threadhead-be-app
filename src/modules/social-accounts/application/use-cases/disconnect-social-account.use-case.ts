import { Injectable } from '@nestjs/common';
import { SocialAccountNotFoundError } from '../../domain/errors/social-account-not-found.error.js';
import { SocialAccountRepositoryPort } from '../../domain/ports/social-account-repository.port.js';

@Injectable()
export class DisconnectSocialAccountUseCase {
    constructor(private readonly repository: SocialAccountRepositoryPort) {}

    async execute(userId: string, accountId: string) {
        const removed = await this.repository.deleteByIdForUser(accountId, userId);

        if (!removed) throw new SocialAccountNotFoundError();
    }
}
