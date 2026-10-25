import { Injectable } from '@nestjs/common';
import type { SocialProvider } from '../domain/entities/social-account.entity.js';
import type { PostSearch } from '../domain/ports/social-account-api.port.js';
import { AuthorizeSocialAccountUseCase } from './use-cases/authorize-social-account.use-case.js';
import { CheckSearchAccessUseCase } from './use-cases/check-search-access.use-case.js';
import { ConnectSocialAccountUseCase } from './use-cases/connect-social-account.use-case.js';
import { DisconnectSocialAccountUseCase } from './use-cases/disconnect-social-account.use-case.js';
import { GetAccessTokenUseCase } from './use-cases/get-access-token.use-case.js';
import { ListSocialAccountsUseCase } from './use-cases/list-social-accounts.use-case.js';
import { SearchPostsUseCase } from './use-cases/search-posts.use-case.js';

@Injectable()
export class SocialAccountsService {
    constructor(
        private readonly authorizeUseCase: AuthorizeSocialAccountUseCase,
        private readonly connectUseCase: ConnectSocialAccountUseCase,
        private readonly listUseCase: ListSocialAccountsUseCase,
        private readonly disconnectUseCase: DisconnectSocialAccountUseCase,
        private readonly getAccessTokenUseCase: GetAccessTokenUseCase,
        private readonly searchPostsUseCase: SearchPostsUseCase,
        private readonly checkSearchAccessUseCase: CheckSearchAccessUseCase,
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

    searchPosts(accountId: string, search: PostSearch) {
        return this.searchPostsUseCase.execute(accountId, search);
    }

    checkSearchAccess(accountId: string, userId?: string) {
        return this.checkSearchAccessUseCase.execute(accountId, userId);
    }
}
