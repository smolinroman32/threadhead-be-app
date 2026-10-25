import { Injectable } from '@nestjs/common';
import { HttpClientPort, type HttpResponse } from '../../../../shared/http/ports/http-client.port.js';
import { SocialProviderPermissionDeniedError } from '../../domain/errors/social-provider-permission-denied.error.js';
import { SocialProviderRejectedError } from '../../domain/errors/social-provider-rejected.error.js';
import { SocialProviderUnavailableError } from '../../domain/errors/social-provider-unavailable.error.js';
import type { PostSearch, SocialAccountApiPort } from '../../domain/ports/social-account-api.port.js';
import { readProviderBody } from '../providers/read-provider-body.js';

type ProfileBody = { id: string; username: string; threads_profile_picture_url?: string };

type SearchBody = {
    data?: {
        id: string;
        text?: string;
        username?: string;
        timestamp: string;
        permalink?: string;
        has_replies?: boolean;
        is_reply?: boolean;
        media_type?: string;
        is_quote_post?: boolean;
    }[];
};

type ErrorBody = { error?: { code?: number } } | null;

const API_URL = 'https://graph.threads.net/v1.0';
const SEARCH_FIELDS = 'id,text,username,timestamp,permalink,has_replies,is_reply,media_type,is_quote_post';
const RATE_LIMIT_CODES = new Set([4, 17, 32, 613]);

@Injectable()
export class ThreadsAccountApi implements SocialAccountApiPort {
    constructor(private readonly http: HttpClientPort) {}

    async getProfile(accessToken: string) {
        const response = await this.http.get(`${API_URL}/me`, {
            query: { fields: 'id,username,threads_profile_picture_url', access_token: accessToken },
        });

        const profile = readProviderBody<ProfileBody>(response);

        return {
            id: profile.id,
            username: profile.username,
            avatarUrl: profile.threads_profile_picture_url ?? null,
        };
    }

    async searchPosts(accessToken: string, search: PostSearch) {
        const response = await this.http.get(`${API_URL}/keyword_search`, {
            query: {
                q: search.query,
                search_type: 'RECENT',
                search_mode: 'KEYWORD',
                fields: SEARCH_FIELDS,
                limit: String(search.limit),
                ...(search.since && { since: String(Math.floor(search.since.getTime() / 1000)) }),
                access_token: accessToken,
            },
        });

        const body = readSearchBody(response);

        return (body.data ?? []).map((post) => ({
            id: post.id,
            text: post.text ?? '',
            username: post.username ?? '',
            publishedAt: new Date(post.timestamp),
            permalink: post.permalink ?? '',
            hasReplies: post.has_replies ?? false,
            isReply: post.is_reply ?? false,
            mediaType: post.media_type ?? null,
            isQuotePost: post.is_quote_post ?? false,
        }));
    }
}

function readSearchBody(response: HttpResponse) {
    if (response.status < 400) return response.body as SearchBody;

    const code = (response.body as ErrorBody)?.error?.code ?? 0;

    if (response.status >= 500 || response.status === 429 || RATE_LIMIT_CODES.has(code)) {
        throw new SocialProviderUnavailableError();
    }
    if (response.status === 403 || code === 10 || (code >= 200 && code <= 299)) {
        throw new SocialProviderPermissionDeniedError();
    }

    throw new SocialProviderRejectedError();
}
