import type { HttpClientPort } from '../../../../shared/http/ports/http-client.port.js';
import { HttpTransportError } from '../../../../shared/http/errors/http-transport.error.js';
import { SocialProviderRejectedError } from '../../domain/errors/social-provider-rejected.error.js';
import { SocialProviderUnavailableError } from '../../domain/errors/social-provider-unavailable.error.js';
import { ThreadsAccountOAuth } from './threads-account-oauth.js';

describe('ThreadsAccountOAuth', () => {
    const http = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
    const REDIRECT = 'https://api.example.com/social-accounts/threads/callback';

    const create = () => new ThreadsAccountOAuth(http as unknown as HttpClientPort);

    beforeEach(() => {
        vi.resetAllMocks();
        vi.stubEnv('THREADS_APP_ID', 'app-id');
        vi.stubEnv('THREADS_APP_SECRET', 'app-secret');
        vi.stubEnv('NEST_URL', 'https://api.example.com/');
        vi.useFakeTimers({ now: new Date('2026-10-09T12:00:00Z'), toFake: ['Date'] });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.useRealTimers();
    });

    it('builds the authorization url from NEST_URL, the scopes and the state', () => {
        const url = new URL(create().getAuthorizationUrl('the-state'));

        expect(`${url.origin}${url.pathname}`).toBe('https://threads.net/oauth/authorize');
        expect(Object.fromEntries(url.searchParams)).toEqual({
            client_id: 'app-id',
            redirect_uri: REDIRECT,
            scope: 'threads_basic,threads_keyword_search,threads_read_replies',
            response_type: 'code',
            state: 'the-state',
        });
    });

    it('exchanges the code for a long-lived token with the same redirect_uri', async () => {
        http.post.mockResolvedValue({ status: 200, body: { access_token: 'short', user_id: 42 } });
        http.get.mockResolvedValue({ status: 200, body: { access_token: 'long', expires_in: 5_184_000 } });

        const tokens = await create().exchangeCode('the-code');

        expect(http.post).toHaveBeenCalledWith('https://graph.threads.net/oauth/access_token', {
            form: {
                client_id: 'app-id',
                client_secret: 'app-secret',
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT,
                code: 'the-code',
            },
        });
        expect(http.get).toHaveBeenCalledWith('https://graph.threads.net/access_token', {
            query: { grant_type: 'th_exchange_token', client_secret: 'app-secret', access_token: 'short' },
        });
        expect(tokens).toEqual({
            accessToken: 'long',
            refreshToken: null,
            expiresAt: new Date('2026-12-08T12:00:00Z'),
        });
    });

    it('refreshes a token', async () => {
        http.get.mockResolvedValue({ status: 200, body: { access_token: 'newer', expires_in: 5_184_000 } });

        const tokens = await create().refreshToken('old');

        expect(http.get).toHaveBeenCalledWith('https://graph.threads.net/refresh_access_token', {
            query: { grant_type: 'th_refresh_token', access_token: 'old' },
        });
        expect(tokens).toEqual({
            accessToken: 'newer',
            refreshToken: null,
            expiresAt: new Date('2026-12-08T12:00:00Z'),
        });
    });

    it('reports a 4xx as a rejection, a 5xx as unavailable and lets transport errors through', async () => {
        const oauth = create();

        http.get.mockResolvedValueOnce({ status: 400, body: { error: { message: 'bad token' } } });
        await expect(oauth.refreshToken('old')).rejects.toBeInstanceOf(SocialProviderRejectedError);

        http.get.mockResolvedValueOnce({ status: 503, body: null });
        await expect(oauth.refreshToken('old')).rejects.toBeInstanceOf(SocialProviderUnavailableError);

        const transport = new HttpTransportError('https://graph.threads.net', new Error('timeout'));
        http.get.mockRejectedValueOnce(transport);
        await expect(oauth.refreshToken('old')).rejects.toBe(transport);
    });

    it('rejects a code the provider refuses', async () => {
        http.post.mockResolvedValue({ status: 400, body: { error_message: 'code used' } });

        await expect(create().exchangeCode('used')).rejects.toBeInstanceOf(SocialProviderRejectedError);
    });

    it('refuses to start without NEST_URL', () => {
        vi.stubEnv('NEST_URL', '');

        expect(() => create()).toThrow('Missing required environment variable: NEST_URL');
    });
});
