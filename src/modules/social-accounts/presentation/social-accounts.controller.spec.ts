import type { Request, Response } from 'express';
import type { AuthService } from '../../auth/application/auth.service.js';
import type { JwtPayload } from '../../auth/domain/jwt-payload.js';
import type { SocialAccountsService } from '../application/social-accounts.service.js';
import { SocialAccountEntity } from '../domain/entities/social-account.entity.js';
import { InvalidOAuthStateError } from '../domain/errors/invalid-oauth-state.error.js';
import { SocialAccountAlreadyConnectedError } from '../domain/errors/social-account-already-connected.error.js';
import { SocialAccountsController } from './social-accounts.controller.js';

describe('SocialAccountsController', () => {
    const currentUser: JwtPayload = { sub: 'user-id', email: 'u@x.io', tokenVersion: 0 };
    const service = { authorize: vi.fn(), connect: vi.fn(), list: vi.fn(), disconnect: vi.fn() };
    const auth = { verifyAccessToken: vi.fn() };
    const res = { redirect: vi.fn() };
    const controller = () =>
        new SocialAccountsController(
            service as unknown as SocialAccountsService,
            auth as unknown as AuthService,
        );
    const request = { cookies: { access_token: 'cookie-token' } } as unknown as Request;
    const response = res as unknown as Response;
    const redirectedTo = () => new URL(res.redirect.mock.calls[0][0] as string);

    beforeEach(() => {
        vi.resetAllMocks();
        vi.stubEnv('FRONTEND_URL', 'https://app.example.com');
        vi.stubEnv('FRONTEND_SOCIAL_RESULT_PATH', '/settings/accounts');
        auth.verifyAccessToken.mockResolvedValue(currentUser);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('authorize returns the provider url for the token user', async () => {
        service.authorize.mockResolvedValue('https://threads.net/oauth/authorize?state=s');

        await expect(controller().authorize('THREADS', currentUser)).resolves.toEqual({
            url: 'https://threads.net/oauth/authorize?state=s',
        });
        expect(service.authorize).toHaveBeenCalledWith('user-id', 'THREADS');
    });

    it('callback connects the account and redirects with social=connected', async () => {
        await controller().callback({ code: 'c', state: 's' }, request, response);

        expect(auth.verifyAccessToken).toHaveBeenCalledWith('cookie-token');
        expect(service.connect).toHaveBeenCalledWith({ state: 's', code: 'c', currentUserId: 'user-id' });
        expect(redirectedTo().origin + redirectedTo().pathname).toBe(
            'https://app.example.com/settings/accounts',
        );
        expect(Object.fromEntries(redirectedTo().searchParams)).toEqual({ social: 'connected' });
    });

    it('callback passes a null user when the cookie is missing or invalid', async () => {
        auth.verifyAccessToken.mockResolvedValue(null);

        await controller().callback({ code: 'c', state: 's' }, request, response);

        expect(service.connect).toHaveBeenCalledWith({ state: 's', code: 'c', currentUserId: null });
    });

    it.each([
        ['the user denied consent', { error: 'access_denied', state: 's' }, undefined, 'denied'],
        ['the state is invalid', { code: 'c', state: 's' }, new InvalidOAuthStateError(), 'invalid_state'],
        ['the state is missing', { code: 'c' }, undefined, 'invalid_state'],
        [
            'the account is taken',
            { code: 'c', state: 's' },
            new SocialAccountAlreadyConnectedError(),
            'already_connected',
        ],
        ['the code is missing', { state: 's' }, undefined, 'failed'],
        ['anything else fails', { code: 'c', state: 's' }, new Error('boom'), 'failed'],
    ])('callback redirects with a reason when %s', async (_label, query, failure, reason) => {
        if (failure) service.connect.mockRejectedValue(failure);

        await controller().callback(query, request, response);

        expect(Object.fromEntries(redirectedTo().searchParams)).toEqual({ social: 'error', reason });
        expect(service.connect).toHaveBeenCalledTimes(failure ? 1 : 0);
    });

    it('list never exposes a token or its ciphertext', async () => {
        const entity = new SocialAccountEntity('account-id', {
            userId: 'user-id',
            provider: 'THREADS',
            providerAccountId: 'th-42',
            username: 'name',
            avatarUrl: null,
            accessTokenEncrypted: 'v1.secret.secret.secret',
            refreshTokenEncrypted: 'v1.secret.secret.secret',
            tokenExpiresAt: new Date('2026-12-01'),
            scopes: ['threads_basic'],
            isActive: true,
            createdAt: new Date('2026-10-01'),
            updatedAt: new Date('2026-10-02'),
        });
        service.list.mockResolvedValue([entity]);

        const accounts = await controller().list(currentUser);

        expect(accounts).toEqual([
            {
                id: 'account-id',
                provider: 'THREADS',
                username: 'name',
                avatarUrl: null,
                scopes: ['threads_basic'],
                isActive: true,
                tokenExpiresAt: new Date('2026-12-01'),
                createdAt: new Date('2026-10-01'),
            },
        ]);
        expect(JSON.stringify(accounts)).not.toContain('secret');
        expect(service.list).toHaveBeenCalledWith('user-id');
    });

    it('disconnect removes the account of the token user', async () => {
        await controller().disconnect('account-id', currentUser);

        expect(service.disconnect).toHaveBeenCalledWith('user-id', 'account-id');
    });
});
