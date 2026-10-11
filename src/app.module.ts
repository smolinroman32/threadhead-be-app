import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module.js';
import { HttpModule } from './shared/http/http.module.js';
import { PrismaModule } from './shared/prisma.module.js';
import { SocialAccountsModule } from './modules/social-accounts/social-accounts.module.js';
import { UsersModule } from './modules/users/user.module.js';

@Module({
    imports: [PrismaModule, HttpModule, UsersModule, AuthModule, SocialAccountsModule],
})
export class AppModule {}
