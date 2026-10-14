import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const PORT = 3999;
const BASE = `http://localhost:${PORT}`;
const JSON_HEADERS = { 'content-type': 'application/json' };
const INTENT = { intent: 'Find people asking about AI agents', targetAudience: 'Small team founders' };
const PREFERENCES = { includeTerms: ['ai agents', 'audit logs'], excludeTerms: ['crypto'] };

let app: ChildProcess;

async function waitForServer() {
    for (let attempt = 0; attempt < 50; attempt++) {
        try {
            await fetch(`${BASE}/onboarding`);
            return;
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }

    throw new Error('dist/main.js did not start');
}

async function signedInCookie() {
    const email = `onboarding-${randomUUID()}@example.com`;
    const password = 'correct-horse-battery-staple';

    await fetch(`${BASE}/auth/sign-up`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ name: 'E2E', age: 30, email, password }),
    });
    const signIn = await fetch(`${BASE}/auth/sign-in`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, password }),
    });
    const access = signIn.headers.getSetCookie().find((cookie) => cookie.startsWith('access_token='));

    if (!access) throw new Error('sign-in did not set access_token');

    return access.split(';')[0];
}

function onboarding(cookie: string | null, method: 'GET' | 'PATCH', body?: unknown) {
    return fetch(`${BASE}/onboarding`, {
        method,
        headers: cookie ? { ...JSON_HEADERS, cookie } : JSON_HEADERS,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
}

beforeAll(async () => {
    const databaseUrl = process.env.E2E_DATABASE_URL;

    if (!databaseUrl)
        throw new Error('Set E2E_DATABASE_URL to a scratch database with all migrations applied.');

    app = spawn('node', ['dist/main.js'], {
        env: { ...process.env, PORT: String(PORT), DATABASE_URL: databaseUrl },
        stdio: 'inherit',
    });
    await waitForServer();
}, 20_000);

afterAll(() => {
    app?.kill();
});

describe('onboarding (dist)', () => {
    it('GET with no row returns the initial state and does not create a row', async () => {
        const cookie = await signedInCookie();

        for (let read = 0; read < 2; read++) {
            const res = await onboarding(cookie, 'GET');
            expect(res.status).toBe(200);
            expect(await res.json()).toEqual({
                currentStep: 'INTENT',
                status: 'IN_PROGRESS',
                version: 0,
                draft: {},
            });
        }

        const firstSave = await onboarding(cookie, 'PATCH', { step: 'INTENT', version: 0, data: INTENT });
        expect(firstSave.status).toBe(200);
    });

    it('walks INTENT -> PREFERENCES -> REVIEW and edits an earlier step without moving back', async () => {
        const cookie = await signedInCookie();

        const intent = await onboarding(cookie, 'PATCH', { step: 'INTENT', version: 0, data: INTENT });
        expect(intent.status).toBe(200);
        expect(await intent.json()).toMatchObject({ currentStep: 'PREFERENCES', version: 1, draft: INTENT });

        const preferences = await onboarding(cookie, 'PATCH', {
            step: 'PREFERENCES',
            version: 1,
            data: PREFERENCES,
        });
        expect(preferences.status).toBe(200);
        expect(await preferences.json()).toMatchObject({
            currentStep: 'REVIEW',
            version: 2,
            draft: { ...INTENT, ...PREFERENCES },
        });

        const changed = { intent: 'Find people comparing agent frameworks', targetAudience: 'CTOs' };
        const edit = await onboarding(cookie, 'PATCH', { step: 'INTENT', version: 2, data: changed });
        expect(edit.status).toBe(200);
        expect(await edit.json()).toEqual({
            currentStep: 'REVIEW',
            status: 'IN_PROGRESS',
            version: 3,
            draft: { ...changed, ...PREFERENCES },
        });
    });

    it('rejects PREFERENCES while the user is on INTENT with 409', async () => {
        const cookie = await signedInCookie();

        const res = await onboarding(cookie, 'PATCH', { step: 'PREFERENCES', version: 0, data: PREFERENCES });

        expect(res.status).toBe(409);
        expect(await res.json()).toMatchObject({ error: 'OnboardingStepAheadError' });
    });

    it('answers 400 for every invalid body and saves nothing', async () => {
        const cookie = await signedInCookie();
        await onboarding(cookie, 'PATCH', { step: 'INTENT', version: 0, data: INTENT });
        const text = (length: number) => 'x'.repeat(length);
        const invalid = [
            { step: 'INTENT', version: 1, data: { ...INTENT, intent: text(9) } },
            { step: 'INTENT', version: 1, data: { ...INTENT, intent: text(501) } },
            { step: 'INTENT', version: 1, data: { ...INTENT, intent: ' '.repeat(20) } },
            { step: 'INTENT', version: 1, data: { ...INTENT, targetAudience: 'ab' } },
            { step: 'INTENT', version: 1, data: { ...INTENT, targetAudience: text(201) } },
            { step: 'INTENT', data: INTENT },
            { step: 'INTENT', version: '1', data: INTENT },
            { step: 'INTENT', version: 1, data: INTENT, extra: true },
            { step: 'INTENT', version: 1, data: { ...INTENT, extra: true } },
            { step: 'REVIEW', version: 1, data: {} },
            { step: 'PREFERENCES', version: 1, data: { excludeTerms: [] } },
            { step: 'PREFERENCES', version: 1, data: { includeTerms: ['  ', ''] } },
            {
                step: 'PREFERENCES',
                version: 1,
                data: { includeTerms: Array.from({ length: 11 }, (_, i) => `t${i}x`) },
            },
            { step: 'PREFERENCES', version: 1, data: { includeTerms: ['a'] } },
            { step: 'PREFERENCES', version: 1, data: { includeTerms: [text(51)] } },
            {
                step: 'PREFERENCES',
                version: 1,
                data: { includeTerms: ['AI agents'], excludeTerms: ['ai agents'] },
            },
        ];

        for (const body of invalid) {
            const res = await onboarding(cookie, 'PATCH', body);
            expect(res.status, JSON.stringify(body)).toBe(400);
        }

        const state = await onboarding(cookie, 'GET');
        expect(await state.json()).toMatchObject({ currentStep: 'PREFERENCES', version: 1, draft: INTENT });
    });

    it('two parallel first saves give one 200 and one 409, never a 500, and keep the winner whole', async () => {
        const cookie = await signedInCookie();
        const a = { intent: 'Payload A about AI agents', targetAudience: 'Audience A' };
        const b = { intent: 'Payload B about pricing', targetAudience: 'Audience B' };

        const responses = await Promise.all([
            onboarding(cookie, 'PATCH', { step: 'INTENT', version: 0, data: a }),
            onboarding(cookie, 'PATCH', { step: 'INTENT', version: 0, data: b }),
        ]);

        expect(responses.map((res) => res.status).sort()).toEqual([200, 409]);
        const winner = responses.find((res) => res.status === 200)!;
        const won = (await winner.json()) as { draft: unknown };

        const state = await onboarding(cookie, 'GET');
        const stored = (await state.json()) as { draft: unknown; version: number; currentStep: string };
        expect(stored).toMatchObject({ currentStep: 'PREFERENCES', version: 1 });
        expect(stored.draft).toEqual(won.draft);
        expect([a, b]).toContainEqual(stored.draft);
    });

    it('a stale version is 409 and does not overwrite the newer save', async () => {
        const cookie = await signedInCookie();
        await onboarding(cookie, 'PATCH', { step: 'INTENT', version: 0, data: INTENT });

        const fresh = await onboarding(cookie, 'PATCH', {
            step: 'PREFERENCES',
            version: 1,
            data: PREFERENCES,
        });
        expect(fresh.status).toBe(200);

        const stale = await onboarding(cookie, 'PATCH', {
            step: 'INTENT',
            version: 1,
            data: { intent: 'A stale tab writing over everything', targetAudience: 'Nobody' },
        });
        expect(stale.status).toBe(409);
        expect(await stale.json()).toMatchObject({ error: 'OnboardingVersionConflictError' });

        const state = await onboarding(cookie, 'GET');
        expect(await state.json()).toMatchObject({ version: 2, draft: { ...INTENT, ...PREFERENCES } });
    });

    it('both routes answer 401 without the cookie', async () => {
        expect((await onboarding(null, 'GET')).status).toBe(401);
        expect((await onboarding(null, 'PATCH', { step: 'INTENT', version: 0, data: INTENT })).status).toBe(
            401,
        );
    });
});
