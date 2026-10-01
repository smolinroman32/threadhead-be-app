import { Injectable } from '@nestjs/common';
import { SignInUseCase, type SignInInput } from './use-cases/sign-in.use-case.js';
import { SignUpUseCase, type SignUpInput } from './use-cases/sign-up.use-case.js';
import { JwtTokenService } from '../infrastructure/jwt/jwt.service.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly signUpUseCase: SignUpUseCase,
        private readonly signInUseCase: SignInUseCase,
        private readonly jwtTokenService: JwtTokenService,
    ) {}

    signUp(signUpData: SignUpInput) {
        return this.signUpUseCase.execute(signUpData);
    }

    async signIn(signInData: SignInInput) {
        const user = await this.signInUseCase.execute(signInData);
        const tokens = await this.jwtTokenService.generateTokens({ sub: user.id, email: user.email });

        return { user, tokens };
    }
}
