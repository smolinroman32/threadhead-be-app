import { Injectable } from '@nestjs/common';
import { UserService } from '../../../users/application/user.service.js';
import { InvalidRefreshTokenError } from '../../domain/errors/invalid-refresh-token.error.js';
import { JwtTokenService } from '../../infrastructure/jwt/jwt.service.js';

@Injectable()
export class RefreshUseCase {
    constructor(
        private readonly jwtTokenService: JwtTokenService,
        private readonly userService: UserService,
    ) {}

    async execute(refreshToken: string | undefined) {
        const payload = await this.jwtTokenService.verifyRefreshToken(refreshToken ?? '').catch(() => null);

        // Looked up by email (the only lookup that returns null): a deleted user, or one who changed
        // email since the token was issued, has to sign in again.
        const user = payload && (await this.userService.getUserByEmail(payload.email));

        if (!user || user.id !== payload.sub) throw new InvalidRefreshTokenError();

        return user;
    }
}
