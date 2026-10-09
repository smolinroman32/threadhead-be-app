import { Injectable } from '@nestjs/common';
import { UserService } from '../../../users/application/user.service.js';
import { JwtTokenService } from '../../infrastructure/jwt/jwt.service.js';

@Injectable()
export class SignOutUseCase {
    constructor(
        private readonly jwtTokenService: JwtTokenService,
        private readonly userService: UserService,
    ) {}

    // An unreadable token has nothing to revoke; sign-out must still succeed.
    async execute(refreshToken: string | undefined) {
        const payload = await this.jwtTokenService.verifyRefreshToken(refreshToken ?? '').catch(() => null);

        if (payload) await this.userService.revokeSessions(payload.sub);
    }
}
