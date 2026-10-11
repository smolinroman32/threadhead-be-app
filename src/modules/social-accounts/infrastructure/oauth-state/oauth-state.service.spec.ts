import { JwtService } from '@nestjs/jwt';
import { InvalidOAuthStateError } from '../../domain/errors/invalid-oauth-state.error.js';
import { OAuthStateService } from './oauth-state.service.js';

const SECRET = 's'.repeat(40);

describe('OAuthStateService', () => {
    const jwt = new JwtService();

    beforeEach(() => {
        vi.stubEnv('OAUTH_STATE_SECRET', SECRET);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.useRealTimers();
    });

    it('round-trips the user and the provider', async () => {
        const service = new OAuthStateService(jwt);

        const state = await service.sign('user-id', 'THREADS');

        await expect(service.verify(state)).resolves.toEqual({ userId: 'user-id', provider: 'THREADS' });
    });

    it('rejects a state after ten minutes', async () => {
        vi.useFakeTimers({ now: new Date('2026-10-09T12:00:00Z'), toFake: ['Date'] });
        const service = new OAuthStateService(jwt);
        const state = await service.sign('user-id', 'THREADS');

        vi.setSystemTime(new Date('2026-10-09T12:10:01Z'));

        await expect(service.verify(state)).rejects.toBeInstanceOf(InvalidOAuthStateError);
    });

    it('rejects a state signed with another secret', async () => {
        const forged = await jwt.signAsync(
            { sub: 'user-id', provider: 'THREADS', purpose: 'oauth-state' },
            { secret: 'x'.repeat(40) },
        );

        await expect(new OAuthStateService(jwt).verify(forged)).rejects.toBeInstanceOf(
            InvalidOAuthStateError,
        );
    });

    it('rejects a token without the oauth-state purpose', async () => {
        const token = await jwt.signAsync({ sub: 'user-id', provider: 'THREADS' }, { secret: SECRET });

        await expect(new OAuthStateService(jwt).verify(token)).rejects.toBeInstanceOf(InvalidOAuthStateError);
    });

    it('rejects an unknown provider and garbage', async () => {
        const token = await jwt.signAsync(
            { sub: 'user-id', provider: 'MYSPACE', purpose: 'oauth-state' },
            { secret: SECRET },
        );
        const service = new OAuthStateService(jwt);

        await expect(service.verify(token)).rejects.toBeInstanceOf(InvalidOAuthStateError);
        await expect(service.verify('not-a-jwt')).rejects.toBeInstanceOf(InvalidOAuthStateError);
    });

    it('refuses to start with a secret shorter than 32 characters', () => {
        vi.stubEnv('OAUTH_STATE_SECRET', 'short');

        expect(() => new OAuthStateService(jwt)).toThrow('OAUTH_STATE_SECRET must be at least 32 characters');
    });
});
