import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getSecret } from '../../../../shared/env/get-env.js';
import { SOCIAL_PROVIDERS, type SocialProvider } from '../../domain/entities/social-account.entity.js';
import { InvalidOAuthStateError } from '../../domain/errors/invalid-oauth-state.error.js';

const PURPOSE = 'oauth-state';
const EXPIRES_IN = '10m';

type StatePayload = { sub: string; provider: string; purpose: string };

@Injectable()
export class OAuthStateService {
    private readonly secret = getSecret('OAUTH_STATE_SECRET');

    constructor(private readonly jwtService: JwtService) {}

    sign(userId: string, provider: SocialProvider) {
        return this.jwtService.signAsync(
            { sub: userId, provider, purpose: PURPOSE },
            { secret: this.secret, expiresIn: EXPIRES_IN },
        );
    }

    async verify(state: string) {
        const payload = await this.jwtService
            .verifyAsync<StatePayload>(state, { secret: this.secret })
            .catch(() => null);

        if (!payload || payload.purpose !== PURPOSE || !this.isProvider(payload.provider)) {
            throw new InvalidOAuthStateError();
        }

        return { userId: payload.sub, provider: payload.provider };
    }

    private isProvider(value: string): value is SocialProvider {
        return (SOCIAL_PROVIDERS as readonly string[]).includes(value);
    }
}
