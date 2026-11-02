import { Injectable } from '@nestjs/common';
import { HttpClientPort } from '../../../../shared/http/ports/http-client.port.js';
import { PostMetricsUnavailableError } from '../../domain/errors/post-metrics-unavailable.error.js';
import type { PostMetrics, PostPagePort } from '../../domain/ports/post-page.port.js';

type JsonObject = Record<string, unknown>;

const CRAWLER_USER_AGENT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const TIMEOUT_MS = 5000;
const JSON_SCRIPT = /<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/g;
const POST_CODE = /\/post\/([^/?#]+)/;

@Injectable()
export class ThreadsPostPage implements PostPagePort {
    constructor(private readonly http: HttpClientPort) {}

    async getMetrics(permalink: string): Promise<PostMetrics> {
        const code = POST_CODE.exec(permalink)?.[1];

        if (!code) throw new PostMetricsUnavailableError('no post code in the permalink');

        const response = await this.http.get(permalink, {
            headers: {
                'user-agent': CRAWLER_USER_AGENT,
                accept: 'text/html',
                'accept-language': 'en-US,en;q=0.9',
            },
            timeoutMs: TIMEOUT_MS,
        });

        if (response.status !== 200) throw new PostMetricsUnavailableError(`status ${response.status}`);

        const post = typeof response.body === 'string' ? findPost(response.body, code) : null;

        if (!post) throw new PostMetricsUnavailableError('post not found on the page');

        const info = asObject(post.text_post_app_info);
        const name = asObject(post.user)?.full_name;

        return {
            likeCount: asCount(post.like_count),
            replyCount: asCount(info?.direct_reply_count),
            repostCount: asCount(info?.repost_count),
            authorDisplayName: typeof name === 'string' && name !== '' ? name : null,
        };
    }
}

function findPost(html: string, code: string) {
    for (const [, raw] of html.matchAll(JSON_SCRIPT)) {
        if (!raw.includes(code)) continue;

        try {
            const post = findByCode(JSON.parse(raw), code);

            if (post) return post;
        } catch {
            continue;
        }
    }

    return null;
}

function findByCode(node: unknown, code: string): JsonObject | null {
    if (Array.isArray(node)) {
        for (const item of node) {
            const found = findByCode(item, code);

            if (found) return found;
        }

        return null;
    }

    const object = asObject(node);

    if (!object) return null;
    if (object.code === code && 'like_count' in object) return object;

    return findByCode(Object.values(object), code);
}

function asObject(value: unknown) {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonObject) : null;
}

function asCount(value: unknown) {
    return typeof value === 'number' ? value : null;
}
