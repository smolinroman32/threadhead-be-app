import { Injectable } from '@nestjs/common';
import { SocialAccountRepositoryPort } from '../../domain/ports/social-account-repository.port.js';

@Injectable()
export class ListSocialAccountsUseCase {
    constructor(private readonly repository: SocialAccountRepositoryPort) {}

    execute(userId: string) {
        return this.repository.listByUser(userId);
    }
}
