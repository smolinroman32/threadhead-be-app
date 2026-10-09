import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getSecret } from '../../../../shared/env/get-env.js';
import type { JwtPayload } from '../../domain/jwt-payload.js';

@Injectable()
export class JwtTokenService {
    constructor(private readonly jwtService: JwtService) {}

    async generateTokens(payload: JwtPayload) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: getSecret('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }),

            this.jwtService.signAsync(payload, {
                secret: getSecret('JWT_REFRESH_SECRET'),
                expiresIn: '30d',
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    verifyAccessToken(token: string) {
        return this.jwtService.verifyAsync<JwtPayload>(token, {
            secret: getSecret('JWT_ACCESS_SECRET'),
        });
    }

    verifyRefreshToken(token: string) {
        return this.jwtService.verifyAsync<JwtPayload>(token, {
            secret: getSecret('JWT_REFRESH_SECRET'),
        });
    }
}
