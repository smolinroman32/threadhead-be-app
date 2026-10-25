import { Injectable } from '@nestjs/common';
import { SocialAccountNotFoundError } from '../../domain/errors/social-account-not-found.error.js';
import { SocialAccountRepositoryPort } from '../../domain/ports/social-account-repository.port.js';

@Injectable()
export class DisconnectSocialAccountUseCase {
    constructor(private readonly repository: SocialAccountRepositoryPort) {}

    async execute(userId: string, accountId: string) {
        const disconnected = await this.repository.disconnectForUser(accountId, userId);

        if (!disconnected) throw new SocialAccountNotFoundError();
    }
}
