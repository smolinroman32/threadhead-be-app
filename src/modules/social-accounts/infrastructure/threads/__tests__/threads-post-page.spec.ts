import type { HttpClientPort } from '../../../../../shared/http/ports/http-client.port.js';
import { PostMetricsUnavailableError } from '../../../domain/errors/post-metrics-unavailable.error.js';
import { ThreadsPostPage } from '../threads-post-page.js';

const PERMALINK = 'https://www.threads.com/@someone/post/MAIN1';

const post = (code: string, likeCount: number | null, extra: Record<string, unknown> = {}) => ({
    pk: `pk-${code}`,
    code,
    ...(likeCount !== null && { like_count: likeCount }),
    user: { username: 'someone', full_name: 'Some One' },
    text_post_app_info: { direct_reply_count: 3, repost_count: 2, quote_count: 1 },
    ...extra,
});

const script = (data: unknown) => `<script type="application/json" data-sjs>${JSON.stringify(data)}</script>`;

const page = (media: unknown) =>
    `<html><body>${script({ require: [['x', { other: true }]] })}${script({
        require: [['ScheduledServerJS', 'handle', null, [{ __bbox: { result: { data: { media } } } }]]],
    })}</body></html>`;

describe('ThreadsPostPage', () => {
    const http = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
    const postPage = new ThreadsPostPage(http as unknown as HttpClientPort);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('reads the metrics of the post whose code matches, not of its replies or quoted post', async () => {
        const main = post('MAIN1', 875, {
            text_post_app_info: {
                direct_reply_count: 22,
                repost_count: 66,
                share_info: { quoted_post: post('QUOTED', 2) },
                direct_replies: { edges: [{ node: { posts: { edges: [{ node: post('REPLY1', 13) }] } } }] },
            },
            user: { username: 'someone', full_name: 'Jon Someone' },
        });
        http.get.mockResolvedValue({ status: 200, body: page(main) });

        await expect(postPage.getMetrics(PERMALINK)).resolves.toEqual({
            likeCount: 875,
            replyCount: 22,
            repostCount: 66,
            authorDisplayName: 'Jon Someone',
        });
        expect(http.get).toHaveBeenCalledWith(PERMALINK, {
            headers: {
                'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                accept: 'text/html',
                'accept-language': 'en-US,en;q=0.9',
            },
            timeoutMs: 5000,
        });
    });

    it('finds the post when it sits under another path', async () => {
        const body = `<html>${script({ anywhere: [{ deep: post('MAIN1', 4) }] })}</html>`;
        http.get.mockResolvedValue({ status: 200, body });

        await expect(postPage.getMetrics(PERMALINK)).resolves.toMatchObject({ likeCount: 4 });
    });

    it('maps a missing metric to null and keeps a zero', async () => {
        const main = {
            pk: '1',
            code: 'MAIN1',
            like_count: 0,
            user: { username: 'someone', full_name: '' },
            text_post_app_info: { direct_reply_count: 0, repost_count: null },
        };
        http.get.mockResolvedValue({ status: 200, body: page(main) });

        await expect(postPage.getMetrics(PERMALINK)).resolves.toEqual({
            likeCount: 0,
            replyCount: 0,
            repostCount: null,
            authorDisplayName: null,
        });
    });

    it.each([
        ['a login wall', '<html><title>Log in to Threads</title></html>'],
        ['an error page', "<html>Sorry, this page isn't available.</html>"],
        ['a page without the post', page(post('OTHER', 5))],
        ['a post without a like count', page(post('MAIN1', null))],
    ])('fails on %s', async (_, body) => {
        http.get.mockResolvedValue({ status: 200, body });

        await expect(postPage.getMetrics(PERMALINK)).rejects.toBeInstanceOf(PostMetricsUnavailableError);
    });

    it('fails on a non-200 status', async () => {
        http.get.mockResolvedValue({ status: 429, body: '' });

        await expect(postPage.getMetrics(PERMALINK)).rejects.toThrow('status 429');
    });

    it('fails on a permalink without a post code before any request', async () => {
        await expect(postPage.getMetrics('https://www.threads.com/@someone')).rejects.toBeInstanceOf(
            PostMetricsUnavailableError,
        );
        expect(http.get).not.toHaveBeenCalled();
    });
});
