import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EncryptionService } from '../../shared/encryption-service/encryption.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { SocialAccountsService } from './application/social-accounts.service.js';
import { AuthorizeSocialAccountUseCase } from './application/use-cases/authorize-social-account.use-case.js';
import { ConnectSocialAccountUseCase } from './application/use-cases/connect-social-account.use-case.js';
import { DisconnectSocialAccountUseCase } from './application/use-cases/disconnect-social-account.use-case.js';
import { GetAccessTokenUseCase } from './application/use-cases/get-access-token.use-case.js';
import { ListSocialAccountsUseCase } from './application/use-cases/list-social-accounts.use-case.js';
import { OAuthStatePort } from './domain/ports/oauth-state.port.js';
import { SocialAccountRepositoryPort } from './domain/ports/social-account-repository.port.js';
import { SocialProviderRegistryPort } from './domain/ports/social-provider-registry.port.js';
import { OAuthStateService } from './infrastructure/oauth-state/oauth-state.service.js';
import { SocialProviderRegistry } from './infrastructure/providers/social-provider.registry.js';
import { SocialAccountRepository } from './infrastructure/repositories/social-account.repository.js';
import { ThreadsAccountApi } from './infrastructure/threads/threads-account-api.js';
import { ThreadsAccountOAuth } from './infrastructure/threads/threads-account-oauth.js';
import { SocialAccountsController } from './presentation/social-accounts.controller.js';

@Module({
    imports: [AuthModule, JwtModule.register({})],
    controllers: [SocialAccountsController],
    providers: [
        EncryptionService,
        ThreadsAccountOAuth,
        ThreadsAccountApi,
        { provide: SocialAccountRepositoryPort, useClass: SocialAccountRepository },
        { provide: OAuthStatePort, useClass: OAuthStateService },
        { provide: SocialProviderRegistryPort, useClass: SocialProviderRegistry },
        AuthorizeSocialAccountUseCase,
        ConnectSocialAccountUseCase,
        ListSocialAccountsUseCase,
        DisconnectSocialAccountUseCase,
        GetAccessTokenUseCase,
        SocialAccountsService,
    ],
    exports: [SocialAccountsService],
})
export class SocialAccountsModule {}
