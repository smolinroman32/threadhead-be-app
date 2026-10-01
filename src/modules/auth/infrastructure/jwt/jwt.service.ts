import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getEnv } from '../../../../shared/env/get-env.js';

type TokenPayload = {
    sub: string;
    email: string;
};

@Injectable()
export class JwtTokenService {
    constructor(private readonly jwtService: JwtService) {}

    async generateTokens(payload: TokenPayload) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: getEnv('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }),

            this.jwtService.signAsync(payload, {
                secret: getEnv('JWT_REFRESH_SECRET'),
                expiresIn: '30d',
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    verifyAccessToken(token: string) {
        return this.jwtService.verifyAsync<TokenPayload>(token, {
            secret: getEnv('JWT_ACCESS_SECRET'),
        });
    }

    verifyRefreshToken(token: string) {
        return this.jwtService.verifyAsync<TokenPayload>(token, {
            secret: getEnv('JWT_REFRESH_SECRET'),
        });
    }
}