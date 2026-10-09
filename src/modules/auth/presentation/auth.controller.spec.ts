import type { Request, Response } from 'express';
import type { AuthService } from '../application/auth.service.js';
import { AuthController } from './auth.controller.js';

describe('AuthController', () => {
    const user = { id: 'user-id', email: 'user@example.com' };
    const tokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };
    const authService = { refresh: vi.fn(), signOut: vi.fn() };
    const controller = new AuthController(authService as unknown as AuthService);
    const response = { cookie: vi.fn(), clearCookie: vi.fn() };
    const res = response as unknown as Response;

    beforeEach(() => {
        vi.resetAllMocks();
        authService.refresh.mockResolvedValue({ user, tokens });
    });

    it('refresh reads the refresh cookie and sets a new token pair', async () => {
        const req = { cookies: { refresh_token: 'old-refresh' } } as unknown as Request;

        await controller.refresh(req, res);

        expect(authService.refresh).toHaveBeenCalledWith('old-refresh');
        expect(response.cookie).toHaveBeenCalledWith('access_token', 'new-access', expect.objectContaining({ path: '/' }));
        expect(response.cookie).toHaveBeenCalledWith(
            'refresh_token',
            'new-refresh',
            expect.objectContaining({ path: '/auth' }),
        );
    });

    it('sign-out revokes the sessions of the refresh cookie user and clears both cookies', async () => {
        const req = { cookies: { refresh_token: 'old-refresh' } } as unknown as Request;

        await controller.signOut(req, res);

        expect(authService.signOut).toHaveBeenCalledWith('old-refresh');
        expect(response.clearCookie).toHaveBeenCalledWith('access_token', expect.objectContaining({ path: '/' }));
        expect(response.clearCookie).toHaveBeenCalledWith('refresh_token', expect.objectContaining({ path: '/auth' }));
    });
});
