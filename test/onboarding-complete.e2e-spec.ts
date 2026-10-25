import type { ChildProcess } from 'node:child_process';
import pg from 'pg';
import { call, signUp, startApp } from './support/e2e-app.js';

const PORT = 3997;
const BASE = `http://localhost:${PORT}`;
const INTENT = {
    intent: 'Find people asking how to evaluate and compare AI agent frameworks for small teams',
    targetAudience: 'Small team founders',
};
const PREFERENCES = { includeTerms: ['ai agents', 'audit logs'], excludeTerms: ['crypto'] };
const FEED = {
    name: 'Other feed',
    intent: 'Find people asking about pricing for indie tools',
    targetAudience: 'Indie founders',
    includeTerms: ['pricing'],
};

let app: ChildProcess;
let database: pg.Client;

beforeAll(async () => {
    app = await startApp(PORT);
    database = new pg.Client({ connectionString: process.env.E2E_DATABASE_URL });
    await database.connect();
}, 20_000);

afterAll(async () => {
    await database?.end();
    app?.kill();
});

async function reachReview(cookie: string) {
    await call(BASE, cookie, 'PATCH', '/onboarding', { step: 'INTENT', version: 0, data: INTENT });
    const res = await call(BASE, cookie, 'PATCH', '/onboarding', {
        step: 'PREFERENCES',
        version: 1,
        data: PREFERENCES,
    });
    return (await res.json()) as { version: number; currentStep: string };
}

async function feeds(cookie: string) {
    const res = await call(BASE, cookie, 'GET', '/opportunity-feeds');
    return (await res.json()) as { id: string; name: string; intent: string }[];
}

describe('onboarding complete (dist)', () => {
    it('completes from REVIEW, creates exactly one feed from the draft, and repeats idempotently', async () => {
        const { cookie } = await signUp(BASE);
        const review = await reachReview(cookie);
        expect(review).toMatchObject({ currentStep: 'REVIEW', version: 2 });

        const done = await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 2 });
        const body = (await done.json()) as Record<string, unknown>;

        expect(done.status).toBe(200);
        expect(body).toMatchObject({
            currentStep: 'REVIEW',
            status: 'COMPLETED',
            version: 4,
            draft: { ...INTENT, ...PREFERENCES },
        });
        expect(typeof body.feedId).toBe('string');

        const created = await feeds(cookie);
        expect(created).toHaveLength(1);
        expect(created[0]).toMatchObject({
            id: body.feedId,
            intent: INTENT.intent,
            includeTerms: PREFERENCES.includeTerms,
            excludeTerms: PREFERENCES.excludeTerms,
            languages: ['en'],
            freshnessHours: 24,
            minScore: 60,
            isActive: true,
        });
        expect(created[0].name.length).toBeLessThanOrEqual(60);
        expect(INTENT.intent.startsWith(created[0].name)).toBe(true);

        const again = await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 0 });
        expect(again.status).toBe(200);
        expect(await again.json()).toMatchObject({ status: 'COMPLETED', feedId: body.feedId });
        expect(await feeds(cookie)).toHaveLength(1);
    });

    it('rejects complete before REVIEW and a stale version with 409, and creates no feed', async () => {
        const { cookie } = await signUp(BASE);
        await call(BASE, cookie, 'PATCH', '/onboarding', { step: 'INTENT', version: 0, data: INTENT });

        const early = await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 1 });
        expect(early.status).toBe(409);
        expect(await early.json()).toMatchObject({ error: 'OnboardingStepAheadError' });

        await call(BASE, cookie, 'PATCH', '/onboarding', {
            step: 'PREFERENCES',
            version: 1,
            data: PREFERENCES,
        });
        const stale = await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 1 });
        expect(stale.status).toBe(409);
        expect(await stale.json()).toMatchObject({ error: 'OnboardingVersionConflictError' });
        expect(await feeds(cookie)).toHaveLength(0);
    });

    it('rejects a body without version or with unknown fields with 400', async () => {
        const { cookie } = await signUp(BASE);

        expect((await call(BASE, cookie, 'POST', '/onboarding/complete', {})).status).toBe(400);
        expect(
            (await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 0, extra: true })).status,
        ).toBe(400);
        expect((await call(BASE, cookie, 'POST', '/onboarding/complete', { version: '0' })).status).toBe(400);
    });

    it('freezes the draft: PATCH /onboarding is 409 once COMPLETED', async () => {
        const { cookie } = await signUp(BASE);
        await reachReview(cookie);
        await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 2 });

        const res = await call(BASE, cookie, 'PATCH', '/onboarding', {
            step: 'INTENT',
            version: 4,
            data: INTENT,
        });

        expect(res.status).toBe(409);
        expect(await res.json()).toMatchObject({ error: 'OnboardingNotEditableError' });
    });

    it('two parallel complete calls create one feed and never answer 500', async () => {
        const { cookie } = await signUp(BASE);
        await reachReview(cookie);

        const responses = await Promise.all([
            call(BASE, cookie, 'POST', '/onboarding/complete', { version: 2 }),
            call(BASE, cookie, 'POST', '/onboarding/complete', { version: 2 }),
        ]);

        const statuses = responses.map((res) => res.status).sort();
        expect(statuses.every((status) => status === 200 || status === 409)).toBe(true);
        expect(statuses).toContain(200);
        expect(await feeds(cookie)).toHaveLength(1);
        const state = await call(BASE, cookie, 'GET', '/onboarding');
        expect(await state.json()).toMatchObject({ status: 'COMPLETED' });
    });

    it('finishes an onboarding stuck in COMPLETING (crash recovery) with any version', async () => {
        const { cookie, userId } = await signUp(BASE);
        await reachReview(cookie);
        await database.query(
            `UPDATE "Onboarding" SET "status" = 'COMPLETING', "version" = "version" + 1 WHERE "userId" = $1`,
            [userId],
        );

        const state = await call(BASE, cookie, 'GET', '/onboarding');
        expect(await state.json()).toMatchObject({ status: 'COMPLETING', version: 3 });
        expect(
            (await call(BASE, cookie, 'PATCH', '/onboarding', { step: 'INTENT', version: 3, data: INTENT }))
                .status,
        ).toBe(409);

        const done = await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 0 });
        expect(done.status).toBe(200);
        expect(await done.json()).toMatchObject({ status: 'COMPLETED', version: 4 });
        expect(await feeds(cookie)).toHaveLength(1);
    });

    it('at the cap complete is 409 and stays COMPLETING; after one DELETE the retry completes', async () => {
        const { cookie } = await signUp(BASE);
        await reachReview(cookie);
        const ids: string[] = [];
        for (let index = 0; index < 10; index++) {
            const res = await call(BASE, cookie, 'POST', '/opportunity-feeds', {
                ...FEED,
                name: `Feed ${index}`,
            });
            ids.push(((await res.json()) as { id: string }).id);
        }

        const blocked = await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 2 });
        expect(blocked.status).toBe(409);
        expect(await blocked.json()).toMatchObject({ error: 'OpportunityFeedLimitReachedError' });
        const stuck = await call(BASE, cookie, 'GET', '/onboarding');
        expect(await stuck.json()).toMatchObject({ status: 'COMPLETING' });

        expect((await call(BASE, cookie, 'DELETE', `/opportunity-feeds/${ids[0]}`)).status).toBe(204);
        const retry = await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 0 });

        expect(retry.status).toBe(200);
        expect(await retry.json()).toMatchObject({ status: 'COMPLETED' });
        expect(await feeds(cookie)).toHaveLength(10);
    });

    it('after the created feed is deleted, complete answers 200 with feedId null and creates nothing', async () => {
        const { cookie } = await signUp(BASE);
        await reachReview(cookie);
        const done = (await (
            await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 2 })
        ).json()) as {
            feedId: string;
        };

        expect((await call(BASE, cookie, 'DELETE', `/opportunity-feeds/${done.feedId}`)).status).toBe(204);
        const again = await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 0 });

        expect(again.status).toBe(200);
        expect(await again.json()).toMatchObject({ status: 'COMPLETED', feedId: null });
        expect(await feeds(cookie)).toHaveLength(0);
    });

    it('answers 401 without the cookie', async () => {
        expect((await call(BASE, null, 'POST', '/onboarding/complete', { version: 0 })).status).toBe(401);
    });
});
