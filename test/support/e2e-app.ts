import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';

export const JSON_HEADERS = { 'content-type': 'application/json' };

export async function startApp(port: number): Promise<ChildProcess> {
    const databaseUrl = process.env.E2E_DATABASE_URL;

    if (!databaseUrl)
        throw new Error('Set E2E_DATABASE_URL to a scratch database with all migrations applied.');

    const app = spawn('node', ['dist/main.js'], {
        env: { ...process.env, PORT: String(port), DATABASE_URL: databaseUrl },
        stdio: 'inherit',
    });

    for (let attempt = 0; attempt < 50; attempt++) {
        try {
            await fetch(`http://localhost:${port}/onboarding`);
            return app;
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }

    app.kill();
    throw new Error('dist/main.js did not start');
}

export async function signUp(base: string) {
    const email = `e2e-${randomUUID()}@example.com`;
    const password = 'correct-horse-battery-staple';

    const created = await fetch(`${base}/auth/sign-up`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ name: 'E2E', age: 30, email, password }),
    });
    const { id } = (await created.json()) as { id: string };
    const signIn = await fetch(`${base}/auth/sign-in`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, password }),
    });
    const access = signIn.headers.getSetCookie().find((cookie) => cookie.startsWith('access_token='));

    if (!access) throw new Error('sign-in did not set access_token');

    return { cookie: access.split(';')[0], userId: id };
}

export function call(
    base: string,
    cookie: string | null,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
) {
    return fetch(`${base}${path}`, {
        method,
        headers: cookie ? { ...JSON_HEADERS, cookie } : JSON_HEADERS,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
}
