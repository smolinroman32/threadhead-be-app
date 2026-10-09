import type { UserService } from '../../../users/application/user.service.js';
import type { UserEntity } from '../../../users/domain/entities/user.entity.js';
import { UserNotFoundError } from '../../../users/domain/errors/user-not-found.error.js';
import { InvalidRefreshTokenError } from '../../domain/errors/invalid-refresh-token.error.js';
import type { JwtTokenService } from '../../infrastructure/jwt/jwt.service.js';
import { RefreshUseCase } from './refresh.use-case.js';

describe('RefreshUseCase', () => {
    const payload = { sub: 'user-id', email: 'user@example.com', tokenVersion: 0 };
    const user = { id: 'user-id', email: 'user@example.com', tokenVersion: 0 } as UserEntity;
    const jwtTokenService = { verifyRefreshToken: vi.fn() };
    const userService = { getUserById: vi.fn() };
    const useCase = new RefreshUseCase(
        jwtTokenService as unknown as JwtTokenService,
        userService as unknown as UserService,
    );

    beforeEach(() => {
        vi.resetAllMocks();
        jwtTokenService.verifyRefreshToken.mockResolvedValue(payload);
        userService.getUserById.mockResolvedValue(user);
    });

    it('returns the user for a valid refresh token', async () => {
        await expect(useCase.execute('refresh-token')).resolves.toBe(user);
    });

    it('rejects an invalid or expired refresh token', async () => {
        jwtTokenService.verifyRefreshToken.mockRejectedValue(new Error('jwt expired'));

        await expect(useCase.execute('refresh-token')).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    });

    it('rejects a missing refresh token', async () => {
        jwtTokenService.verifyRefreshToken.mockRejectedValue(new Error('jwt must be provided'));

        await expect(useCase.execute(undefined)).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    });

    it('rejects a token whose user no longer exists', async () => {
        userService.getUserById.mockRejectedValue(new UserNotFoundError('user-id'));

        await expect(useCase.execute('refresh-token')).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    });

    it('rejects a token issued before the sessions were revoked', async () => {
        userService.getUserById.mockResolvedValue({ ...user, tokenVersion: 1 });

        await expect(useCase.execute('refresh-token')).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    });

    it('does not turn a database failure into an invalid token', async () => {
        const failure = new Error('connection lost');
        userService.getUserById.mockRejectedValue(failure);

        await expect(useCase.execute('refresh-token')).rejects.toBe(failure);
    });
});
