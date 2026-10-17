import type { ChildProcess } from 'node:child_process';
import { call, signUp, startApp } from './support/e2e-app.js';

const PORT = 3998;
const BASE = `http://localhost:${PORT}`;
const FEED = {
    name: 'AI agents',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Small team founders',
    includeTerms: ['ai agents', 'audit logs'],
};

let app: ChildProcess;

beforeAll(async () => {
    app = await startApp(PORT);
}, 20_000);

afterAll(() => {
    app?.kill();
});

async function createFeed(cookie: string, override: Record<string, unknown> = {}) {
    const res = await call(BASE, cookie, 'POST', '/opportunity-feeds', { ...FEED, ...override });
    return { res, body: (await res.json()) as Record<string, unknown> };
}

describe('opportunity feeds (dist)', () => {
    it('POST applies the defaults and hides internal fields', async () => {
        const { cookie } = await signUp(BASE);

        const { res, body } = await createFeed(cookie);

        expect(res.status).toBe(201);
        expect(body).toMatchObject({
            ...FEED,
            excludeTerms: [],
            languages: ['en'],
            freshnessHours: 24,
            minScore: 60,
            isActive: true,
        });
        expect(body).not.toHaveProperty('userId');
        expect(body).not.toHaveProperty('onboardingId');
    });

    it("GET lists only the caller's feeds, newest first, and GET by id works", async () => {
        const { cookie } = await signUp(BASE);
        const other = await signUp(BASE);
        const first = await createFeed(cookie, { name: 'First' });
        const second = await createFeed(cookie, { name: 'Second' });
        await createFeed(other.cookie, { name: 'Foreign' });

        const list = await call(BASE, cookie, 'GET', '/opportunity-feeds');
        const feeds = (await list.json()) as { id: string; name: string }[];

        expect(list.status).toBe(200);
        expect(feeds.map((feed) => feed.name)).toEqual(['Second', 'First']);
        const one = await call(BASE, cookie, 'GET', `/opportunity-feeds/${first.body.id}`);
        expect(one.status).toBe(200);
        expect(await one.json()).toMatchObject({ id: first.body.id, name: 'First' });
        expect(second.res.status).toBe(201);
    });

    it("another user's feed and a missing feed are 404 for GET, PATCH and DELETE", async () => {
        const { cookie } = await signUp(BASE);
        const other = await signUp(BASE);
        const { body } = await createFeed(other.cookie);
        const missing = '00000000-0000-4000-8000-000000000000';

        for (const id of [body.id, missing]) {
            expect((await call(BASE, cookie, 'GET', `/opportunity-feeds/${id}`)).status).toBe(404);
            expect(
                (await call(BASE, cookie, 'PATCH', `/opportunity-feeds/${id}`, { minScore: 70 })).status,
            ).toBe(404);
            expect((await call(BASE, cookie, 'DELETE', `/opportunity-feeds/${id}`)).status).toBe(404);
        }
    });

    it('PATCH changes only the sent fields, pauses, and an empty body changes nothing', async () => {
        const { cookie } = await signUp(BASE);
        const { body } = await createFeed(cookie);

        const changed = await call(BASE, cookie, 'PATCH', `/opportunity-feeds/${body.id}`, {
            minScore: 80,
            isActive: false,
        });
        expect(changed.status).toBe(200);
        expect(await changed.json()).toMatchObject({
            ...FEED,
            minScore: 80,
            isActive: false,
            freshnessHours: 24,
        });

        const empty = await call(BASE, cookie, 'PATCH', `/opportunity-feeds/${body.id}`, {});
        expect(empty.status).toBe(200);
        expect(await empty.json()).toMatchObject({ minScore: 80, isActive: false });
    });

    it('PATCH validates the merged state: a stored includeTerm cannot be excluded', async () => {
        const { cookie } = await signUp(BASE);
        const { body } = await createFeed(cookie);

        const res = await call(BASE, cookie, 'PATCH', `/opportunity-feeds/${body.id}`, {
            excludeTerms: ['AI Agents'],
        });

        expect(res.status).toBe(400);
    });

    it('answers 400 for every invalid body', async () => {
        const { cookie } = await signUp(BASE);
        const { body } = await createFeed(cookie);
        const text = (length: number) => 'x'.repeat(length);
        const invalid: Record<string, unknown>[] = [
            { name: '' },
            { name: text(61) },
            { intent: text(9) },
            { intent: text(501) },
            { targetAudience: 'ab' },
            { targetAudience: text(201) },
            { includeTerms: [] },
            { includeTerms: ['  ', ''] },
            { includeTerms: Array.from({ length: 11 }, (_, index) => `term ${index}`) },
            { excludeTerms: Array.from({ length: 11 }, (_, index) => `term ${index}`) },
            { includeTerms: ['a'] },
            { freshnessHours: 0 },
            { freshnessHours: 169 },
            { minScore: -1 },
            { minScore: 101 },
            { minScore: '60' },
            { minScore: null },
            { name: null },
            { languages: ['ru'] },
            { extra: true },
        ];

        for (const override of invalid) {
            const patch = await call(BASE, cookie, 'PATCH', `/opportunity-feeds/${body.id}`, override);
            expect(patch.status, `PATCH ${JSON.stringify(override)}`).toBe(400);
        }

        const post = await call(BASE, cookie, 'POST', '/opportunity-feeds', { ...FEED, languages: ['ru'] });
        expect(post.status).toBe(400);
        const missing = await call(BASE, cookie, 'POST', '/opportunity-feeds', { name: 'No intent' });
        expect(missing.status).toBe(400);
    });

    it('two parallel PATCH that would put a term in both lists never leave it in both', async () => {
        const { cookie } = await signUp(BASE);
        const { body } = await createFeed(cookie, { includeTerms: ['gamma', 'delta'] });
        const path = `/opportunity-feeds/${body.id}`;

        const responses = await Promise.all([
            call(BASE, cookie, 'PATCH', path, { includeTerms: ['alpha beta'] }),
            call(BASE, cookie, 'PATCH', path, { excludeTerms: ['alpha beta'] }),
        ]);

        expect(responses.map((res) => res.status).sort()).toEqual([200, 400]);
        const state = (await (await call(BASE, cookie, 'GET', path)).json()) as {
            includeTerms: string[];
            excludeTerms: string[];
        };
        const included = new Set(state.includeTerms.map((term) => term.toLowerCase()));
        expect(state.excludeTerms.some((term) => included.has(term.toLowerCase()))).toBe(false);
    });

    it('DELETE removes the feed', async () => {
        const { cookie } = await signUp(BASE);
        const { body } = await createFeed(cookie);

        expect((await call(BASE, cookie, 'DELETE', `/opportunity-feeds/${body.id}`)).status).toBe(204);
        expect((await call(BASE, cookie, 'GET', `/opportunity-feeds/${body.id}`)).status).toBe(404);
    });

    it('caps a user at 10 feeds, counts paused ones, and survives two parallel creates at 9', async () => {
        const { cookie } = await signUp(BASE);

        for (let index = 0; index < 8; index++) {
            expect((await createFeed(cookie, { name: `Feed ${index}` })).res.status).toBe(201);
        }
        const ninth = await createFeed(cookie, { name: 'Paused', isActive: false });
        expect(ninth.res.status).toBe(201);

        const responses = await Promise.all([
            call(BASE, cookie, 'POST', '/opportunity-feeds', { ...FEED, name: 'Racer A' }),
            call(BASE, cookie, 'POST', '/opportunity-feeds', { ...FEED, name: 'Racer B' }),
        ]);

        expect(responses.map((res) => res.status).sort()).toEqual([201, 409]);
        const loser = responses.find((res) => res.status === 409)!;
        expect(await loser.json()).toMatchObject({ error: 'OpportunityFeedLimitReachedError' });
        const list = (await (await call(BASE, cookie, 'GET', '/opportunity-feeds')).json()) as unknown[];
        expect(list).toHaveLength(10);
    });

    it('all routes answer 401 without the cookie', async () => {
        expect((await call(BASE, null, 'POST', '/opportunity-feeds', FEED)).status).toBe(401);
        expect((await call(BASE, null, 'GET', '/opportunity-feeds')).status).toBe(401);
        expect(
            (await call(BASE, null, 'GET', '/opportunity-feeds/00000000-0000-4000-8000-000000000000')).status,
        ).toBe(401);
    });
});
