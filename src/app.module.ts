import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/user.module.js';

@Module({
    imports: [UsersModule, AuthModule],
})
export class AppModule {}
