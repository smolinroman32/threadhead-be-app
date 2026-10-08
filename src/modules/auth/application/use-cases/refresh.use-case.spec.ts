import type { UserService } from '../../../users/application/user.service.js';
import type { UserEntity } from '../../../users/domain/entities/user.entity.js';
import { InvalidRefreshTokenError } from '../../domain/errors/invalid-refresh-token.error.js';
import type { JwtTokenService } from '../../infrastructure/jwt/jwt.service.js';
import { RefreshUseCase } from './refresh.use-case.js';

describe('RefreshUseCase', () => {
    const payload = { sub: 'user-id', email: 'user@example.com' };
    const user = { id: 'user-id', email: 'user@example.com' } as UserEntity;
    const jwtTokenService = { verifyRefreshToken: vi.fn() };
    const userService = { getUserByEmail: vi.fn() };
    const useCase = new RefreshUseCase(
        jwtTokenService as unknown as JwtTokenService,
        userService as unknown as UserService,
    );

    beforeEach(() => {
        vi.resetAllMocks();
        jwtTokenService.verifyRefreshToken.mockResolvedValue(payload);
        userService.getUserByEmail.mockResolvedValue(user);
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
        userService.getUserByEmail.mockResolvedValue(null);

        await expect(useCase.execute('refresh-token')).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    });
});
