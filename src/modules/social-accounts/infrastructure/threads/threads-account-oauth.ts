import { Injectable } from '@nestjs/common';
import { getEnv } from '../../../../shared/env/get-env.js';
import { HttpClientPort } from '../../../../shared/http/ports/http-client.port.js';
import { SocialAccountOauthPort, type OAuthTokens } from '../../domain/ports/social-account-oauth.port.js';
import { readProviderBody } from '../providers/read-provider-body.js';

const AUTHORIZE_URL = 'https://threads.net/oauth/authorize';
const API_URL = 'https://graph.threads.net';

type TokenBody = { access_token: string; expires_in?: number };

@Injectable()
export class ThreadsAccountOAuth implements SocialAccountOauthPort {
    readonly provider = 'THREADS' as const;
    readonly scopes = ['threads_basic', 'threads_keyword_search', 'threads_read_replies'] as const;

    private readonly appId = getEnv('THREADS_APP_ID');
    private readonly appSecret = getEnv('THREADS_APP_SECRET');
    private readonly redirectUri = `${getEnv('NEST_URL').replace(/\/+$/, '')}/social-accounts/threads/callback`;

    constructor(private readonly http: HttpClientPort) {}

    getAuthorizationUrl(state: string) {
        const url = new URL(AUTHORIZE_URL);
        url.searchParams.set('client_id', this.appId);
        url.searchParams.set('redirect_uri', this.redirectUri);
        url.searchParams.set('scope', this.scopes.join(','));
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('state', state);

        return url.toString();
    }

    async exchangeCode(code: string) {
        const shortLived = await this.http.post(`${API_URL}/oauth/access_token`, {
            form: {
                client_id: this.appId,
                client_secret: this.appSecret,
                grant_type: 'authorization_code',
                redirect_uri: this.redirectUri,
                code,
            },
        });
        const { access_token } = readProviderBody<TokenBody>(shortLived);

        const longLived = await this.http.get(`${API_URL}/access_token`, {
            query: { grant_type: 'th_exchange_token', client_secret: this.appSecret, access_token },
        });

        return this.toTokens(readProviderBody<TokenBody>(longLived));
    }

    async refreshToken(accessToken: string) {
        const response = await this.http.get(`${API_URL}/refresh_access_token`, {
            query: { grant_type: 'th_refresh_token', access_token: accessToken },
        });

        return this.toTokens(readProviderBody<TokenBody>(response));
    }

    private toTokens(body: TokenBody): OAuthTokens {
        return {
            accessToken: body.access_token,
            refreshToken: null,
            expiresAt: new Date(Date.now() + (body.expires_in ?? 0) * 1000),
        };
    }
}
