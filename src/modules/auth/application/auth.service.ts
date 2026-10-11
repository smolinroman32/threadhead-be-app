import { Injectable } from '@nestjs/common';
import type { UserEntity } from '../../users/domain/entities/user.entity.js';
import { SignInUseCase, type SignInInput } from './use-cases/sign-in.use-case.js';
import { RefreshUseCase } from './use-cases/refresh.use-case.js';
import { SignOutUseCase } from './use-cases/sign-out.use-case.js';
import { SignUpUseCase, type SignUpInput } from './use-cases/sign-up.use-case.js';
import { JwtTokenService } from '../infrastructure/jwt/jwt.service.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly signUpUseCase: SignUpUseCase,
        private readonly signInUseCase: SignInUseCase,
        private readonly refreshUseCase: RefreshUseCase,
        private readonly signOutUseCase: SignOutUseCase,
        private readonly jwtTokenService: JwtTokenService,
    ) {}

    signUp(signUpData: SignUpInput) {
        return this.signUpUseCase.execute(signUpData);
    }

    async signIn(signInData: SignInInput) {
        const user = await this.signInUseCase.execute(signInData);
        const tokens = await this.issueTokens(user);

        return { user, tokens };
    }

    signOut(refreshToken: string | undefined) {
        return this.signOutUseCase.execute(refreshToken);
    }

    async refresh(refreshToken: string | undefined) {
        const user = await this.refreshUseCase.execute(refreshToken);
        const tokens = await this.issueTokens(user);

        return { user, tokens };
    }

    private issueTokens(user: UserEntity) {
        return this.jwtTokenService.generateTokens({
            sub: user.id,
            email: user.email,
            tokenVersion: user.tokenVersion,
        });
    }
}
