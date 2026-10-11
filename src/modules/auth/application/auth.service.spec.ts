import type { UserEntity } from '../../users/domain/entities/user.entity.js';
import type { JwtTokenService } from '../infrastructure/jwt/jwt.service.js';
import { AuthService } from './auth.service.js';
import type { RefreshUseCase } from './use-cases/refresh.use-case.js';
import type { SignInUseCase } from './use-cases/sign-in.use-case.js';
import type { SignOutUseCase } from './use-cases/sign-out.use-case.js';
import type { SignUpUseCase } from './use-cases/sign-up.use-case.js';

describe('AuthService', () => {
    const user = { id: 'user-id', email: 'u@x.io', tokenVersion: 3 } as UserEntity;
    const expectedPayload = { sub: 'user-id', email: 'u@x.io', tokenVersion: 3 };
    const jwtTokenService = { generateTokens: vi.fn().mockResolvedValue({}), verifyAccessToken: vi.fn() };
    const service = new AuthService(
        {} as SignUpUseCase,
        { execute: vi.fn().mockResolvedValue(user) } as unknown as SignInUseCase,
        { execute: vi.fn().mockResolvedValue(user) } as unknown as RefreshUseCase,
        { execute: vi.fn() } as unknown as SignOutUseCase,
        jwtTokenService as unknown as JwtTokenService,
    );

    it('puts the current tokenVersion into the tokens on sign-in', async () => {
        await service.signIn({ email: 'u@x.io', password: 'x' });

        expect(jwtTokenService.generateTokens).toHaveBeenCalledWith(expectedPayload);
    });

    it('puts the current tokenVersion into the tokens on refresh', async () => {
        await service.refresh('refresh-token');

        expect(jwtTokenService.generateTokens).toHaveBeenLastCalledWith(expectedPayload);
    });

    it('verifyAccessToken returns the payload of a valid token', async () => {
        const payload = { sub: 'user-id', email: 'u@x.io', tokenVersion: 3 };
        jwtTokenService.verifyAccessToken.mockResolvedValue(payload);

        await expect(service.verifyAccessToken('token')).resolves.toBe(payload);
    });

    it('verifyAccessToken returns null for a missing or invalid token', async () => {
        jwtTokenService.verifyAccessToken.mockRejectedValue(new Error('jwt expired'));

        await expect(service.verifyAccessToken('token')).resolves.toBeNull();
        await expect(service.verifyAccessToken(undefined)).resolves.toBeNull();
    });
});
