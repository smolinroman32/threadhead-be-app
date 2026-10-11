import { Injectable } from '@nestjs/common';
import type { SocialProvider } from '../domain/entities/social-account.entity.js';
import { AuthorizeSocialAccountUseCase } from './use-cases/authorize-social-account.use-case.js';
import { ConnectSocialAccountUseCase } from './use-cases/connect-social-account.use-case.js';
import { DisconnectSocialAccountUseCase } from './use-cases/disconnect-social-account.use-case.js';
import { GetAccessTokenUseCase } from './use-cases/get-access-token.use-case.js';
import { ListSocialAccountsUseCase } from './use-cases/list-social-accounts.use-case.js';

@Injectable()
export class SocialAccountsService {
    constructor(
        private readonly authorizeUseCase: AuthorizeSocialAccountUseCase,
        private readonly connectUseCase: ConnectSocialAccountUseCase,
        private readonly listUseCase: ListSocialAccountsUseCase,
        private readonly disconnectUseCase: DisconnectSocialAccountUseCase,
        private readonly getAccessTokenUseCase: GetAccessTokenUseCase,
    ) {}

    authorize(userId: string, provider: SocialProvider) {
        return this.authorizeUseCase.execute(userId, provider);
    }

    connect(input: Parameters<ConnectSocialAccountUseCase['execute']>[0]) {
        return this.connectUseCase.execute(input);
    }

    list(userId: string) {
        return this.listUseCase.execute(userId);
    }

    disconnect(userId: string, accountId: string) {
        return this.disconnectUseCase.execute(userId, accountId);
    }

    getAccessToken(accountId: string) {
        return this.getAccessTokenUseCase.execute(accountId);
    }
}
