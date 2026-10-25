import type { HttpClientPort } from '../../../../../shared/http/ports/http-client.port.js';
import { SocialProviderPermissionDeniedError } from '../../../domain/errors/social-provider-permission-denied.error.js';
import { SocialProviderRejectedError } from '../../../domain/errors/social-provider-rejected.error.js';
import { SocialProviderUnavailableError } from '../../../domain/errors/social-provider-unavailable.error.js';
import { ThreadsAccountApi } from '../threads-account-api.js';

describe('ThreadsAccountApi', () => {
    const http = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
    const api = new ThreadsAccountApi(http as unknown as HttpClientPort);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('maps the profile', async () => {
        http.get.mockResolvedValue({
            status: 200,
            body: { id: '42', username: 'name', threads_profile_picture_url: 'https://img/x.png' },
        });

        await expect(api.getProfile('token')).resolves.toEqual({
            id: '42',
            username: 'name',
            avatarUrl: 'https://img/x.png',
        });
        expect(http.get).toHaveBeenCalledWith('https://graph.threads.net/v1.0/me', {
            query: { fields: 'id,username,threads_profile_picture_url', access_token: 'token' },
        });
    });

    it('uses a null avatar when the profile has none', async () => {
        http.get.mockResolvedValue({ status: 200, body: { id: '42', username: 'name' } });

        await expect(api.getProfile('token')).resolves.toMatchObject({ avatarUrl: null });
    });

    it('reports a 4xx as a rejection and a 5xx as unavailable', async () => {
        http.get.mockResolvedValueOnce({ status: 401, body: null });
        await expect(api.getProfile('token')).rejects.toBeInstanceOf(SocialProviderRejectedError);

        http.get.mockResolvedValueOnce({ status: 500, body: null });
        await expect(api.getProfile('token')).rejects.toBeInstanceOf(SocialProviderUnavailableError);
    });

    describe('searchPosts', () => {
        const raw = {
            id: '1',
            text: 'Hello',
            username: 'someone',
            timestamp: '2026-10-25T10:00:00+0000',
            permalink: 'https://www.threads.net/@someone/post/abc',
            has_replies: true,
            is_reply: false,
            media_type: 'TEXT_POST',
            is_quote_post: false,
        };

        it('searches recent posts by keyword and maps them', async () => {
            http.get.mockResolvedValue({
                status: 200,
                body: { data: [raw, { id: '2', timestamp: raw.timestamp }] },
            });

            const posts = await api.searchPosts('token', {
                query: 'ai agents',
                since: new Date('2026-10-24T10:00:00Z'),
                limit: 100,
            });

            expect(http.get).toHaveBeenCalledWith('https://graph.threads.net/v1.0/keyword_search', {
                query: {
                    q: 'ai agents',
                    search_type: 'RECENT',
                    search_mode: 'KEYWORD',
                    fields: 'id,text,username,timestamp,permalink,has_replies,is_reply,media_type,is_quote_post',
                    limit: '100',
                    since: '1792836000',
                    access_token: 'token',
                },
            });
            expect(posts).toEqual([
                {
                    id: '1',
                    text: 'Hello',
                    username: 'someone',
                    publishedAt: new Date('2026-10-25T10:00:00Z'),
                    permalink: 'https://www.threads.net/@someone/post/abc',
                    hasReplies: true,
                    isReply: false,
                    mediaType: 'TEXT_POST',
                    isQuotePost: false,
                },
                {
                    id: '2',
                    text: '',
                    username: '',
                    publishedAt: new Date('2026-10-25T10:00:00Z'),
                    permalink: '',
                    hasReplies: false,
                    isReply: false,
                    mediaType: null,
                    isQuotePost: false,
                },
            ]);
        });

        it('omits since when none is given and returns an empty list for no data', async () => {
            http.get.mockResolvedValue({ status: 200, body: {} });

            await expect(api.searchPosts('token', { query: 'today', limit: 25 })).resolves.toEqual([]);
            expect(http.get.mock.calls[0][1].query).not.toHaveProperty('since');
        });

        it.each([
            { status: 403, body: null },
            { status: 400, body: { error: { code: 10 } } },
            { status: 400, body: { error: { code: 200 } } },
        ])('reports a missing permission as denied (%o)', async (response) => {
            http.get.mockResolvedValue(response);

            await expect(api.searchPosts('token', { query: 'x', limit: 1 })).rejects.toBeInstanceOf(
                SocialProviderPermissionDeniedError,
            );
        });

        it.each([
            { status: 500, body: null },
            { status: 429, body: null },
            { status: 400, body: { error: { code: 4 } } },
            { status: 400, body: { error: { code: 613 } } },
        ])('reports a server error or a rate limit as unavailable (%o)', async (response) => {
            http.get.mockResolvedValue(response);

            await expect(api.searchPosts('token', { query: 'x', limit: 1 })).rejects.toBeInstanceOf(
                SocialProviderUnavailableError,
            );
        });

        it('reports any other 4xx as a rejection', async () => {
            http.get.mockResolvedValue({ status: 400, body: { error: { code: 190 } } });

            await expect(api.searchPosts('token', { query: 'x', limit: 1 })).rejects.toBeInstanceOf(
                SocialProviderRejectedError,
            );
        });
    });
});
