import type { UserService } from '../../../../users/application/user.service.js';
import type { JwtTokenService } from '../../../infrastructure/jwt/jwt.service.js';
import { SignOutUseCase } from '../sign-out.use-case.js';

describe('SignOutUseCase', () => {
    const jwtTokenService = { verifyRefreshToken: vi.fn() };
    const userService = { revokeSessions: vi.fn() };
    const useCase = new SignOutUseCase(
        jwtTokenService as unknown as JwtTokenService,
        userService as unknown as UserService,
    );

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('revokes the sessions of the refresh token user', async () => {
        jwtTokenService.verifyRefreshToken.mockResolvedValue({
            sub: 'user-id',
            email: 'u@x.io',
            tokenVersion: 0,
        });

        await useCase.execute('refresh-token');

        expect(userService.revokeSessions).toHaveBeenCalledWith('user-id');
    });

    it('does nothing and does not fail for a missing or invalid token', async () => {
        jwtTokenService.verifyRefreshToken.mockRejectedValue(new Error('jwt expired'));

        await expect(useCase.execute(undefined)).resolves.toBeUndefined();
        expect(userService.revokeSessions).not.toHaveBeenCalled();
    });
});
