import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { CredentialsService } from '../../shared/services/credential-service/credential.service.js';
import { AuthService } from './application/auth.service.js';
import { RefreshUseCase } from './application/use-cases/refresh.use-case.js';
import { SignInUseCase } from './application/use-cases/sign-in.use-case.js';
import { SignOutUseCase } from './application/use-cases/sign-out.use-case.js';
import { SignUpUseCase } from './application/use-cases/sign-up.use-case.js';
import { AuthController } from './presentation/auth.controller.js';
import { UsersModule } from '../users/user.module.js';
import { JwtTokenService } from './infrastructure/jwt/jwt.service.js';
import { JwtAuthGuard } from './infrastructure/jwt/jwt-auth.guard.js';
import { JwtStrategy } from './infrastructure/jwt/jwt.strategy.js';

@Module({
    imports: [UsersModule, JwtModule.register({})],
    controllers: [AuthController],
    exports: [AuthService],
    providers: [
        CredentialsService,
        AuthService,
        SignUpUseCase,
        SignInUseCase,
        RefreshUseCase,
        SignOutUseCase,
        JwtTokenService,
        JwtStrategy,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
})
export class AuthModule {}
