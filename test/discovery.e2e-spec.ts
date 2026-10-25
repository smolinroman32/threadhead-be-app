import type { ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { call, signUp, startApp } from './support/e2e-app.js';

const PORT = 3996;
const BASE = `http://localhost:${PORT}`;
const FEED = {
    name: 'AI agents',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Small team founders',
    includeTerms: ['ai agents'],
};

let app: ChildProcess;
let prisma: PrismaClient;

beforeAll(async () => {
    app = await startApp(PORT);
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.E2E_DATABASE_URL! }) });
}, 20_000);

afterAll(async () => {
    app?.kill();
    await prisma?.$disconnect();
});

async function json(res: Response) {
    return (await res.json()) as Record<string, unknown>;
}

async function createFeed(cookie: string) {
    return json(await call(BASE, cookie, 'POST', '/opportunity-feeds', FEED)) as Promise<{ id: string }>;
}

function opportunity(feedId: string, overrides: Record<string, unknown> = {}) {
    return prisma.opportunity.create({
        data: {
            opportunityFeedId: feedId,
            externalPostId: randomUUID(),
            authorUsername: 'someone',
            text: 'How do you pick an AI agent framework for a small team?',
            permalink: 'https://www.threads.net/@someone/post/1',
            publishedAt: new Date(),
            relevanceScore: 80,
            reason: 'Asks exactly this',
            status: 'NEW',
            scoringVersion: 1,
            ...overrides,
        },
    });
}

describe('discovery (dist)', () => {
    it('refuses a run for a feed without an account, a paused feed and a foreign feed', async () => {
        const { cookie } = await signUp(BASE);
        const other = await signUp(BASE);
        const feed = await createFeed(cookie);
        const runs = `/opportunity-feeds/${feed.id}/discovery-runs`;

        const noAccount = await call(BASE, cookie, 'POST', runs);
        expect(noAccount.status).toBe(409);
        expect((await json(noAccount)).error).toBe('OpportunityFeedAccountRequiredError');

        expect((await call(BASE, other.cookie, 'POST', runs)).status).toBe(404);
        expect((await call(BASE, cookie, 'GET', `${runs}/latest`)).status).toBe(404);
        expect((await call(BASE, cookie, 'GET', `${runs}/${randomUUID()}`)).status).toBe(404);

        await call(BASE, cookie, 'PATCH', `/opportunity-feeds/${feed.id}`, { isActive: false });
        const paused = await call(BASE, cookie, 'POST', runs);
        expect(paused.status).toBe(409);
        expect((await json(paused)).error).toBe('OpportunityFeedPausedError');
    });

    it('lists new opportunities with the read filters and every other status without them', async () => {
        const { cookie } = await signUp(BASE);
        const feed = await createFeed(cookie);
        const list = (status?: string) =>
            call(
                BASE,
                cookie,
                'GET',
                `/opportunity-feeds/${feed.id}/opportunities${status ? `?status=${status}` : ''}`,
            );

        const shown = await opportunity(feed.id);
        await opportunity(feed.id, { relevanceScore: 10 });
        await opportunity(feed.id, { publishedAt: new Date(Date.now() - 25 * 60 * 60 * 1000) });
        await opportunity(feed.id, { excludedTerm: 'crypto' });
        const savedOld = await opportunity(feed.id, {
            status: 'SAVED',
            relevanceScore: 5,
            publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        });

        const fresh = await json(await list());
        expect(fresh.hasMore).toBe(false);
        expect(
            (fresh.items as { id: string; status: string }[]).map((item) => [item.id, item.status]),
        ).toEqual([[shown.id, 'new']]);

        const saved = await json(await list('saved'));
        expect((saved.items as { id: string }[]).map((item) => item.id)).toEqual([savedOld.id]);

        expect((await list('bogus')).status).toBe(400);
    });

    it('moves an opportunity between review statuses and never out of replied', async () => {
        const { cookie } = await signUp(BASE);
        const other = await signUp(BASE);
        const feed = await createFeed(cookie);
        const created = await opportunity(feed.id);
        const patch = (who: string, body: unknown) =>
            call(BASE, who, 'PATCH', `/opportunities/${created.id}`, body);

        expect((await patch(other.cookie, { status: 'saved' })).status).toBe(404);
        expect((await patch(cookie, { status: 'replied' })).status).toBe(400);
        expect((await patch(cookie, { status: 'saved', extra: true })).status).toBe(400);

        const saved = await patch(cookie, { status: 'saved' });
        expect(saved.status).toBe(200);
        expect((await json(saved)).status).toBe('saved');
        expect((await json(await patch(cookie, { status: 'dismissed' }))).status).toBe('dismissed');
        expect((await json(await patch(cookie, { status: 'new' }))).status).toBe('new');

        await prisma.opportunity.update({ where: { id: created.id }, data: { status: 'REPLIED' } });
        const replied = await patch(cookie, { status: 'new' });
        expect(replied.status).toBe(409);
        expect((await json(replied)).error).toBe('OpportunityRepliedError');
    });

    it('deletes a user whose feed is bound to an account and refuses to delete the bound account row', async () => {
        const { cookie, userId } = await signUp(BASE);
        const feed = await createFeed(cookie);
        const account = await prisma.socialAccount.create({
            data: {
                userId,
                provider: 'THREADS',
                providerAccountId: randomUUID(),
                username: 'owner',
                scopes: [],
                accessTokenEncrypted: null,
                tokenExpiresAt: null,
            },
        });
        await prisma.opportunityFeed.update({
            where: { id: feed.id },
            data: { socialAccountId: account.id },
        });

        await expect(prisma.socialAccount.delete({ where: { id: account.id } })).rejects.toThrow();

        expect((await call(BASE, cookie, 'DELETE', '/users/me')).status).toBe(200);
        expect(await prisma.opportunityFeed.findUnique({ where: { id: feed.id } })).toBeNull();
        expect(await prisma.socialAccount.findUnique({ where: { id: account.id } })).toBeNull();
    });
});
