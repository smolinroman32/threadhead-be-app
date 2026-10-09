import { Injectable } from '@nestjs/common';
import { UserService } from '../../../users/application/user.service.js';
import { UserNotFoundError } from '../../../users/domain/errors/user-not-found.error.js';
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

        if (!payload) throw new InvalidRefreshTokenError();

        const user = await this.userService.getUserById(payload.sub).catch((error) => {
            throw error instanceof UserNotFoundError ? new InvalidRefreshTokenError() : error;
        });

        if (user.tokenVersion !== payload.tokenVersion) throw new InvalidRefreshTokenError();

        return user;
    }
}
