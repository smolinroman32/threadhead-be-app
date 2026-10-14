# Opportunity Feeds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Feed CRUD for a signed-in user, a cap of 10 feeds per user, and `POST /onboarding/complete`, which turns the onboarding draft into the first feed without duplicates.

**Architecture:** New module `src/modules/opportunity-feeds` on the project template. Field rules live in pure domain functions (`opportunity-feed-fields.ts`), so create and update validate the final state without Nest. Every feed creation goes through one repository method that holds a per-user Postgres advisory lock, which makes the cap atomic and `onboardingId` idempotent. Onboarding gains the `COMPLETING` status, which freezes the draft before the feed is created; it reaches the feeds module only through a port and an adapter in its own infrastructure.

**Tech Stack:** NestJS 12 (ESM, `nodenext`), Prisma 7 on PostgreSQL, class-validator, Vitest.

**Spec:** [docs/specs/opportunity-feeds.md](../../specs/opportunity-feeds.md). Base: [docs/specs/onboarding.md](../../specs/onboarding.md) and the `feat/onboarding` branch (PR #6), which this work is stacked on.

## Global Constraints

- No comments in code: not `//`, not JSDoc, not `TODO`.
- ESM: relative imports end in `.js`.
- Prettier: 4 spaces, single quotes, trailing commas, `printWidth` 110. Run `npm run format` before each commit.
- Files kebab-case with a role suffix; specs in a `__tests__/` folder next to the code.
- The user id comes from the access token (`@CurrentUser()`), never from the URL or body.
- Feed limits: `name` 1–60, `intent` 10–500, `targetAudience` 3–200 (all after trim), `includeTerms` 1–10, `excludeTerms` 0–10, term 2–50 characters, `freshnessHours` 1–168, `minScore` 0–100. Defaults: `excludeTerms []`, `freshnessHours 24`, `minScore 60`, `isActive true`, `languages ["en"]`.
- `MAX_FEEDS_PER_USER = 10`; active and paused feeds both count; over the cap is 409 `OpportunityFeedLimitReachedError`.
- Unknown fields in a body are 400. `null` for a field is 400, not "not sent".
- `application/` never imports from `infrastructure/`; other modules are reached through their facade only.
- Do not apply migrations, push or open a PR. Do not read or edit `.env`.
- `npm run verify` green before a task is called done.
- The working tree holds a user edit in `src/modules/onboarding/presentation/pipes/parse-save-onboarding-step.pipe.ts` (one blank line). Never `git add` it: always stage explicit paths.

## Review Focus

- `{ "name": null }` or `{ "minScore": null }` in a `PATCH` must be 400, not silently ignored. Test: Task 5 pipe spec and feeds e2e.
- A request DTO instance carries every declared field as an own property (`undefined` when not sent, target ES2023). A merge that spreads it would overwrite stored values with `undefined`. Test: Task 3 merge spec with explicit `undefined` values.
- Two parallel `PATCH` on one feed, one adding a term to `includeTerms` and one adding the same term to `excludeTerms`, must never leave the term in both lists. Test: Task 4 repository spec (row locked before it is read) and feeds e2e.
- `complete` for a user already at 10 feeds must stay recoverable: 409, onboarding left in `COMPLETING`, and the retry after one `DELETE` succeeds. Test: Task 7 use case spec and e2e.
- `complete` after the user deleted the created feed must answer 200 with `feedId: null` and must not create a feed. Test: Task 7 use case spec and e2e.

---

### Task 0: Branch, spec amendments, commit the docs

**Files:**
- Modify: `docs/specs/opportunity-feeds.md`
- Add: `docs/superpowers/plans/2026-10-14-opportunity-feeds.md`

- [ ] **Step 1: Create the branch from `feat/onboarding`**

```bash
git switch -c feat/opportunity-feeds
```

- [ ] **Step 2: Amend the spec**

In `docs/specs/opportunity-feeds.md`, section "Feed cap", change step 1 of the atomicity list from

```
1. `SELECT pg_advisory_xact_lock(hashtextextended(<userId>, 0))` (through `$queryRaw`), held to the end of the
   transaction.
```

to

```
1. `SELECT pg_advisory_xact_lock(hashtextextended(<userId>, 0))` through `$executeRaw` (the function returns
   `void`, which `$queryRaw` cannot read), held to the end of the transaction.
```

and add this paragraph after the atomicity list, before "Known limit":

```
`PATCH` runs in a transaction that locks the feed row (`SELECT ... FOR UPDATE`, as `mutateLocked` does in
social-accounts) and validates the merged state after the lock, so two parallel updates cannot leave a term in
both lists. It is not a version lock: the last write still wins.
```

- [ ] **Step 3: Commit the docs**

```bash
git add docs/specs/opportunity-feeds.md docs/superpowers/plans/2026-10-14-opportunity-feeds.md
git commit -m "docs(opportunity-feeds): add the spec and the implementation plan" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 1: Schema and migrations

**Files:**
- Modify: `prisma/models/onboarding.prisma`, `prisma/models/opportunity-feed.prisma`
- Create: `prisma/migrations/20261014140000_onboarding_completing/migration.sql`
- Create: `prisma/migrations/20261014140100_feed_onboarding_id/migration.sql`
- Regenerate: `src/generated/prisma/**` (gitignored)

**Interfaces:**
- Produces: `OnboardingStatus` enum with `COMPLETING`; `OpportunityFeed.onboardingId: string | null` (unique) on the Prisma model and client.

- [ ] **Step 1: Snapshot the schema for the first diff**

```bash
rm -rf .git/schema-before && mkdir .git/schema-before && cp prisma/schema.prisma .git/schema-before/ && cp -R prisma/models .git/schema-before/models
```

- [ ] **Step 2: Add `COMPLETING`** — in `prisma/models/onboarding.prisma` replace the status enum with

```prisma
enum OnboardingStatus {
  IN_PROGRESS
  COMPLETING
  COMPLETED
}
```

- [ ] **Step 3: Generate the first migration**

```bash
mkdir -p prisma/migrations/20261014140000_onboarding_completing
npx prisma migrate diff --from-schema .git/schema-before --to-schema prisma --script > prisma/migrations/20261014140000_onboarding_completing/migration.sql
cat prisma/migrations/20261014140000_onboarding_completing/migration.sql
```

Expected: a single `ALTER TYPE "OnboardingStatus" ADD VALUE 'COMPLETING'` statement (Prisma may add a position clause). Nothing else.

- [ ] **Step 4: Snapshot again, add the column**

```bash
rm -rf .git/schema-before && mkdir .git/schema-before && cp prisma/schema.prisma .git/schema-before/ && cp -R prisma/models .git/schema-before/models
```

In `prisma/models/opportunity-feed.prisma` add `onboardingId String? @unique @db.Uuid` after `targetAudience String`.

- [ ] **Step 5: Generate the second migration**

```bash
mkdir -p prisma/migrations/20261014140100_feed_onboarding_id
npx prisma migrate diff --from-schema .git/schema-before --to-schema prisma --script > prisma/migrations/20261014140100_feed_onboarding_id/migration.sql
cat prisma/migrations/20261014140100_feed_onboarding_id/migration.sql
```

Expected: `ALTER TABLE "OpportunityFeed" ADD COLUMN "onboardingId" UUID;` and `CREATE UNIQUE INDEX "OpportunityFeed_onboardingId_key" ON "OpportunityFeed"("onboardingId");`. Nothing else.

- [ ] **Step 6: Regenerate and type-check**

```bash
rm -rf .git/schema-before
npx prisma generate
npx tsc --noEmit
```

Expected: both succeed. `tsc` may now report a non-exhaustive status somewhere; if it does, stop and note it in the ledger (Task 6 owns onboarding status handling).

- [ ] **Step 7: Commit**

```bash
git add prisma/models/onboarding.prisma prisma/models/opportunity-feed.prisma prisma/migrations/20261014140000_onboarding_completing prisma/migrations/20261014140100_feed_onboarding_id
git commit -m "feat(prisma): add the COMPLETING status and the feed onboardingId" -m "Both migrations are safe on existing rows (a new enum value, a nullable unique column). OpportunityFeed.targetAudience from the earlier migration is NOT NULL without a default: check that the table is empty before applying." -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Shared term normalization

**Files:**
- Create: `src/shared/terms/normalize-terms.ts`
- Test: `src/shared/terms/__tests__/normalize-terms.spec.ts`
- Modify: `src/modules/onboarding/domain/entities/onboarding-draft.ts`

**Interfaces:**
- Produces: `normalizeTerms(terms: string[]): string[]`, which trims, drops empty strings and collapses duplicates ignoring case (first spelling wins, order kept). It throws nothing: count and length limits stay with each module.

- [ ] **Step 1: Write the failing spec** — `src/shared/terms/__tests__/normalize-terms.spec.ts`

```ts
import { normalizeTerms } from '../normalize-terms.js';

describe('normalizeTerms', () => {
    it('trims, drops empty items and keeps the order', () => {
        expect(normalizeTerms(['  ai agents ', '', '   ', 'undo'])).toEqual(['ai agents', 'undo']);
    });

    it('collapses duplicates ignoring case and keeps the first spelling', () => {
        expect(normalizeTerms(['AI Agents', 'ai agents', 'Undo', 'UNDO', ' ai AGENTS '])).toEqual([
            'AI Agents',
            'Undo',
        ]);
    });

    it('returns an empty list for an empty input', () => {
        expect(normalizeTerms([])).toEqual([]);
    });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/shared/terms`
Expected: FAIL, cannot resolve `../normalize-terms.js`.

- [ ] **Step 3: Write it** — `src/shared/terms/normalize-terms.ts`

```ts
export function normalizeTerms(terms: string[]) {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const raw of terms) {
        const term = raw.trim();
        const key = term.toLowerCase();

        if (!term || seen.has(key)) continue;

        seen.add(key);
        result.push(term);
    }

    return result;
}
```

- [ ] **Step 4: Run it to see it pass**

Run: `npx vitest run src/shared/terms`
Expected: PASS, 3 tests.

- [ ] **Step 5: Switch onboarding to it** — in `src/modules/onboarding/domain/entities/onboarding-draft.ts`:

Add the import `import { normalizeTerms } from '../../../../shared/terms/normalize-terms.js';` and replace the `normalizeTerms` function at the bottom (and its two call sites) with:

```ts
function limitTerms(field: string, terms: string[]) {
    const result = normalizeTerms(terms);

    for (const term of result) {
        if (term.length < TERM_MIN_LENGTH || term.length > TERM_MAX_LENGTH) {
            throw new OnboardingDraftInvalidError(
                `Each ${field} item must be ${TERM_MIN_LENGTH} to ${TERM_MAX_LENGTH} characters.`,
            );
        }
    }

    if (result.length > MAX_TERMS) {
        throw new OnboardingDraftInvalidError(`${field} can hold at most ${MAX_TERMS} terms.`);
    }

    return result;
}
```

and in `normalizePreferencesStep` call `limitTerms('includeTerms', data.includeTerms)` and `limitTerms('excludeTerms', data.excludeTerms ?? [])`.

- [ ] **Step 6: Regression gate** — the onboarding specs must pass untouched

Run: `npx vitest run src/modules/onboarding src/shared/terms`
Expected: PASS, every test (no onboarding spec file was edited).

- [ ] **Step 7: Format, verify, commit**

```bash
npm run format
npm run verify
git add src/shared/terms src/modules/onboarding/domain/entities/onboarding-draft.ts
git commit -m "refactor(shared): move term normalization to a shared function" -m "Feeds need the same rules as onboarding; a shared pure function avoids one module importing another module's domain code. Limits and errors stay in each module." -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Feeds domain

**Files:**
- Create: `src/modules/opportunity-feeds/domain/entities/opportunity-feed-fields.ts`
- Create: `src/modules/opportunity-feeds/domain/entities/opportunity-feed.entity.ts`
- Create: `src/modules/opportunity-feeds/domain/errors/opportunity-feed-not-found.error.ts`
- Create: `src/modules/opportunity-feeds/domain/errors/opportunity-feed-limit-reached.error.ts`
- Create: `src/modules/opportunity-feeds/domain/errors/opportunity-feed-invalid.error.ts`
- Create: `src/modules/opportunity-feeds/domain/ports/opportunity-feed-repository.port.ts`
- Test: `src/modules/opportunity-feeds/domain/entities/__tests__/opportunity-feed-fields.spec.ts`

**Interfaces:**
- Consumes: `DomainError` from `src/shared/errors/domain.error.ts`; `normalizeTerms` (Task 2).
- Produces:
  - `MAX_FEEDS_PER_USER = 10`, `FEED_LANGUAGES = ['en']`, `FEED_DEFAULTS = { freshnessHours: 24, minScore: 60, isActive: true }`.
  - `type OpportunityFeedFields = { name; intent; targetAudience: string; includeTerms; excludeTerms: string[]; freshnessHours; minScore: number; isActive: boolean }`.
  - `type NewOpportunityFeedInput` (`name`, `intent`, `targetAudience`, `includeTerms` required; `excludeTerms`, `freshnessHours`, `minScore`, `isActive` optional), `type OpportunityFeedChanges = Partial<OpportunityFeedFields>`.
  - `buildFeedFields(input: NewOpportunityFeedInput): OpportunityFeedFields`, `mergeFeedFields(current: OpportunityFeedFields, changes: OpportunityFeedChanges): OpportunityFeedFields` (both validate and normalize; throw `OpportunityFeedInvalidError`), `feedNameFromIntent(intent: string): string`.
  - `OpportunityFeedEntity(id, props)` with getters `id`, `userId`, `name`, `intent`, `targetAudience`, `includeTerms`, `excludeTerms`, `languages`, `freshnessHours`, `minScore`, `isActive`, `createdAt`, `updatedAt` and `fields: OpportunityFeedFields`.
  - `OpportunityFeedNotFoundError` (`not_found`), `OpportunityFeedLimitReachedError` (`conflict`), `OpportunityFeedInvalidError(message)` (`validation`).
  - `type NewOpportunityFeed = OpportunityFeedFields & { userId: string; languages: string[]; onboardingId: string | null }` and `abstract class OpportunityFeedRepositoryPort`:
    `listByUser(userId): Promise<OpportunityFeedEntity[]>`, `findByIdForUser(id, userId): Promise<OpportunityFeedEntity | null>`, `findByOnboardingId(userId, onboardingId): Promise<OpportunityFeedEntity | null>`, `createWithinLimit(data: NewOpportunityFeed, limit: number): Promise<OpportunityFeedEntity>`, `updateLocked(id, userId, mutate: (current: OpportunityFeedEntity) => OpportunityFeedFields): Promise<OpportunityFeedEntity | null>`, `deleteByIdForUser(id, userId): Promise<boolean>`.

- [ ] **Step 1: Write the failing spec** — `src/modules/opportunity-feeds/domain/entities/__tests__/opportunity-feed-fields.spec.ts`

```ts
import { OpportunityFeedInvalidError } from '../../errors/opportunity-feed-invalid.error.js';
import {
    buildFeedFields,
    feedNameFromIntent,
    mergeFeedFields,
    type OpportunityFeedFields,
} from '../opportunity-feed-fields.js';

const text = (length: number) => 'x'.repeat(length);
const input = {
    name: 'AI agents',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Small team founders',
    includeTerms: ['ai agents'],
};
const stored: OpportunityFeedFields = {
    ...input,
    excludeTerms: ['crypto'],
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
};

describe('buildFeedFields', () => {
    it('fills the defaults', () => {
        expect(buildFeedFields(input)).toEqual({
            ...input,
            excludeTerms: [],
            freshnessHours: 24,
            minScore: 60,
            isActive: true,
        });
    });

    it('keeps the values it was given and normalizes text and terms', () => {
        expect(
            buildFeedFields({
                ...input,
                name: '  Agents  ',
                includeTerms: [' AI agents ', 'ai AGENTS', 'undo'],
                excludeTerms: ['Crypto'],
                freshnessHours: 48,
                minScore: 80,
                isActive: false,
            }),
        ).toMatchObject({
            name: 'Agents',
            includeTerms: ['AI agents', 'undo'],
            excludeTerms: ['Crypto'],
            freshnessHours: 48,
            minScore: 80,
            isActive: false,
        });
    });

    it.each([
        ['empty name', { name: '   ' }],
        ['name over 60', { name: text(61) }],
        ['intent under 10', { intent: text(9) }],
        ['intent over 500', { intent: text(501) }],
        ['targetAudience under 3', { targetAudience: 'ab' }],
        ['targetAudience over 200', { targetAudience: text(201) }],
        ['no includeTerms', { includeTerms: [] }],
        ['includeTerms empty after trimming', { includeTerms: ['  ', ''] }],
        ['more than 10 includeTerms', { includeTerms: Array.from({ length: 11 }, (_, index) => `term ${index}`) }],
        ['more than 10 excludeTerms', { excludeTerms: Array.from({ length: 11 }, (_, index) => `term ${index}`) }],
        ['a term under 2', { includeTerms: ['a'] }],
        ['a term over 50', { includeTerms: [text(51)] }],
        ['a term in both lists ignoring case', { includeTerms: ['AI agents'], excludeTerms: ['ai agents'] }],
        ['freshnessHours 0', { freshnessHours: 0 }],
        ['freshnessHours 169', { freshnessHours: 169 }],
        ['fractional freshnessHours', { freshnessHours: 1.5 }],
        ['minScore -1', { minScore: -1 }],
        ['minScore 101', { minScore: 101 }],
    ])('rejects %s', (_case, override) => {
        expect(() => buildFeedFields({ ...input, ...override })).toThrow(OpportunityFeedInvalidError);
    });

    it('accepts the exact bounds', () => {
        expect(() =>
            buildFeedFields({
                name: text(60),
                intent: text(500),
                targetAudience: text(200),
                includeTerms: Array.from({ length: 10 }, (_, index) => `term ${index}`),
                excludeTerms: Array.from({ length: 10 }, (_, index) => `other ${index}`),
                freshnessHours: 168,
                minScore: 100,
            }),
        ).not.toThrow();
        expect(() => buildFeedFields({ ...input, freshnessHours: 1, minScore: 0 })).not.toThrow();
    });
});

describe('mergeFeedFields', () => {
    it('changes only the sent fields', () => {
        expect(mergeFeedFields(stored, { minScore: 80 })).toEqual({ ...stored, minScore: 80 });
    });

    it('treats explicit undefined as not sent', () => {
        expect(mergeFeedFields(stored, { name: undefined, minScore: undefined, excludeTerms: undefined })).toEqual(
            stored,
        );
    });

    it('is a no-op for an empty change', () => {
        expect(mergeFeedFields(stored, {})).toEqual(stored);
    });

    it('validates the merged state: a new excludeTerm clashing with the stored includeTerms', () => {
        expect(() => mergeFeedFields(stored, { excludeTerms: ['AI Agents'] })).toThrow(
            OpportunityFeedInvalidError,
        );
    });

    it('validates the merged state: new includeTerms clashing with the stored excludeTerms', () => {
        expect(() => mergeFeedFields(stored, { includeTerms: ['Crypto'] })).toThrow(OpportunityFeedInvalidError);
    });

    it('allows swapping a term between the lists in one change', () => {
        expect(mergeFeedFields(stored, { includeTerms: ['crypto'], excludeTerms: ['ai agents'] })).toMatchObject({
            includeTerms: ['crypto'],
            excludeTerms: ['ai agents'],
        });
    });

    it('rejects clearing includeTerms', () => {
        expect(() => mergeFeedFields(stored, { includeTerms: [] })).toThrow(OpportunityFeedInvalidError);
    });
});

describe('feedNameFromIntent', () => {
    it('uses an intent of 60 characters or less as it is', () => {
        expect(feedNameFromIntent('Find people asking about AI agents')).toBe('Find people asking about AI agents');
        expect(feedNameFromIntent(text(60))).toBe(text(60));
    });

    it('cuts a longer intent at a word boundary', () => {
        const intent = 'Find people who are asking how to evaluate and compare AI agent frameworks for teams';

        const name = feedNameFromIntent(intent);

        expect(name.length).toBeLessThanOrEqual(60);
        expect(intent.startsWith(name)).toBe(true);
        expect(intent[name.length]).toBe(' ');
    });

    it('keeps the 60th word whole when it ends exactly there', () => {
        const intent = `${text(59)} tail`;

        expect(feedNameFromIntent(intent)).toBe(text(59));
        expect(feedNameFromIntent(`${text(60)} tail`)).toBe(text(60));
    });

    it('cuts a long intent without spaces at 60', () => {
        expect(feedNameFromIntent(text(80))).toBe(text(60));
    });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/modules/opportunity-feeds/domain`
Expected: FAIL, cannot resolve `../../errors/opportunity-feed-invalid.error.js` and `../opportunity-feed-fields.js`.

- [ ] **Step 3: Write the errors**

`src/modules/opportunity-feeds/domain/errors/opportunity-feed-invalid.error.ts`

```ts
import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityFeedInvalidError extends DomainError {
    readonly kind = 'validation';
}
```

`src/modules/opportunity-feeds/domain/errors/opportunity-feed-not-found.error.ts`

```ts
import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityFeedNotFoundError extends DomainError {
    readonly kind = 'not_found';

    constructor() {
        super('The opportunity feed was not found.');
    }
}
```

`src/modules/opportunity-feeds/domain/errors/opportunity-feed-limit-reached.error.ts`

```ts
import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OpportunityFeedLimitReachedError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('The limit of opportunity feeds is reached. Delete a feed first.');
    }
}
```

- [ ] **Step 4: Write the field rules** — `src/modules/opportunity-feeds/domain/entities/opportunity-feed-fields.ts`

```ts
import { normalizeTerms } from '../../../../shared/terms/normalize-terms.js';
import { OpportunityFeedInvalidError } from '../errors/opportunity-feed-invalid.error.js';

export const MAX_FEEDS_PER_USER = 10;
export const FEED_LANGUAGES = ['en'];
export const FEED_DEFAULTS = { freshnessHours: 24, minScore: 60, isActive: true } as const;

const MAX_TERMS = 10;
const TERM_MIN_LENGTH = 2;
const TERM_MAX_LENGTH = 50;
const NAME_MAX_LENGTH = 60;

export type OpportunityFeedFields = {
    name: string;
    intent: string;
    targetAudience: string;
    includeTerms: string[];
    excludeTerms: string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
};

export type NewOpportunityFeedInput = Pick<
    OpportunityFeedFields,
    'name' | 'intent' | 'targetAudience' | 'includeTerms'
> &
    Partial<Pick<OpportunityFeedFields, 'excludeTerms' | 'freshnessHours' | 'minScore' | 'isActive'>>;

export type OpportunityFeedChanges = Partial<OpportunityFeedFields>;

export function buildFeedFields(input: NewOpportunityFeedInput) {
    return validateFields({
        name: input.name,
        intent: input.intent,
        targetAudience: input.targetAudience,
        includeTerms: input.includeTerms,
        excludeTerms: input.excludeTerms ?? [],
        freshnessHours: input.freshnessHours ?? FEED_DEFAULTS.freshnessHours,
        minScore: input.minScore ?? FEED_DEFAULTS.minScore,
        isActive: input.isActive ?? FEED_DEFAULTS.isActive,
    });
}

export function mergeFeedFields(current: OpportunityFeedFields, changes: OpportunityFeedChanges) {
    return validateFields({
        name: changes.name ?? current.name,
        intent: changes.intent ?? current.intent,
        targetAudience: changes.targetAudience ?? current.targetAudience,
        includeTerms: changes.includeTerms ?? current.includeTerms,
        excludeTerms: changes.excludeTerms ?? current.excludeTerms,
        freshnessHours: changes.freshnessHours ?? current.freshnessHours,
        minScore: changes.minScore ?? current.minScore,
        isActive: changes.isActive ?? current.isActive,
    });
}

export function feedNameFromIntent(intent: string) {
    const text = intent.trim();

    if (text.length <= NAME_MAX_LENGTH) return text;

    const head = text.slice(0, NAME_MAX_LENGTH);
    const endsOnWord = /\s/.test(text[NAME_MAX_LENGTH]);
    const lastSpace = head.search(/\s\S*$/);
    const cut = endsOnWord || lastSpace <= 0 ? head : head.slice(0, lastSpace);

    return cut.trim();
}

function validateFields(fields: OpportunityFeedFields): OpportunityFeedFields {
    const includeTerms = limitTerms('includeTerms', fields.includeTerms, 1);
    const excludeTerms = limitTerms('excludeTerms', fields.excludeTerms, 0);
    const included = new Set(includeTerms.map((term) => term.toLowerCase()));
    const overlap = excludeTerms.find((term) => included.has(term.toLowerCase()));

    if (overlap) {
        throw new OpportunityFeedInvalidError(`"${overlap}" cannot be both included and excluded.`);
    }

    return {
        name: requireText('name', fields.name, 1, NAME_MAX_LENGTH),
        intent: requireText('intent', fields.intent, 10, 500),
        targetAudience: requireText('targetAudience', fields.targetAudience, 3, 200),
        includeTerms,
        excludeTerms,
        freshnessHours: requireInteger('freshnessHours', fields.freshnessHours, 1, 168),
        minScore: requireInteger('minScore', fields.minScore, 0, 100),
        isActive: fields.isActive,
    };
}

function requireText(field: string, value: string, min: number, max: number) {
    const text = value.trim();

    if (text.length < min || text.length > max) {
        throw new OpportunityFeedInvalidError(`${field} must be ${min} to ${max} characters.`);
    }

    return text;
}

function requireInteger(field: string, value: number, min: number, max: number) {
    if (!Number.isInteger(value) || value < min || value > max) {
        throw new OpportunityFeedInvalidError(`${field} must be an integer from ${min} to ${max}.`);
    }

    return value;
}

function limitTerms(field: string, terms: string[], min: number) {
    const result = normalizeTerms(terms);

    for (const term of result) {
        if (term.length < TERM_MIN_LENGTH || term.length > TERM_MAX_LENGTH) {
            throw new OpportunityFeedInvalidError(
                `Each ${field} item must be ${TERM_MIN_LENGTH} to ${TERM_MAX_LENGTH} characters.`,
            );
        }
    }

    if (result.length < min || result.length > MAX_TERMS) {
        throw new OpportunityFeedInvalidError(`${field} must hold ${min} to ${MAX_TERMS} terms.`);
    }

    return result;
}
```

- [ ] **Step 5: Write the entity** — `src/modules/opportunity-feeds/domain/entities/opportunity-feed.entity.ts`

```ts
import type { OpportunityFeedFields } from './opportunity-feed-fields.js';

export interface OpportunityFeedProps extends OpportunityFeedFields {
    userId: string;
    languages: string[];
    createdAt: Date;
    updatedAt: Date;
}

export class OpportunityFeedEntity {
    constructor(
        public readonly id: string,
        private readonly props: OpportunityFeedProps,
    ) {}

    get userId() {
        return this.props.userId;
    }

    get name() {
        return this.props.name;
    }

    get intent() {
        return this.props.intent;
    }

    get targetAudience() {
        return this.props.targetAudience;
    }

    get includeTerms() {
        return this.props.includeTerms;
    }

    get excludeTerms() {
        return this.props.excludeTerms;
    }

    get languages() {
        return this.props.languages;
    }

    get freshnessHours() {
        return this.props.freshnessHours;
    }

    get minScore() {
        return this.props.minScore;
    }

    get isActive() {
        return this.props.isActive;
    }

    get createdAt() {
        return this.props.createdAt;
    }

    get updatedAt() {
        return this.props.updatedAt;
    }

    get fields(): OpportunityFeedFields {
        return {
            name: this.props.name,
            intent: this.props.intent,
            targetAudience: this.props.targetAudience,
            includeTerms: this.props.includeTerms,
            excludeTerms: this.props.excludeTerms,
            freshnessHours: this.props.freshnessHours,
            minScore: this.props.minScore,
            isActive: this.props.isActive,
        };
    }
}
```

- [ ] **Step 6: Write the repository port** — `src/modules/opportunity-feeds/domain/ports/opportunity-feed-repository.port.ts`

```ts
import type { OpportunityFeedFields } from '../entities/opportunity-feed-fields.js';
import type { OpportunityFeedEntity } from '../entities/opportunity-feed.entity.js';

export type NewOpportunityFeed = OpportunityFeedFields & {
    userId: string;
    languages: string[];
    onboardingId: string | null;
};

export abstract class OpportunityFeedRepositoryPort {
    abstract listByUser(userId: string): Promise<OpportunityFeedEntity[]>;
    abstract findByIdForUser(id: string, userId: string): Promise<OpportunityFeedEntity | null>;
    abstract findByOnboardingId(userId: string, onboardingId: string): Promise<OpportunityFeedEntity | null>;
    abstract createWithinLimit(data: NewOpportunityFeed, limit: number): Promise<OpportunityFeedEntity>;
    abstract updateLocked(
        id: string,
        userId: string,
        mutate: (current: OpportunityFeedEntity) => OpportunityFeedFields,
    ): Promise<OpportunityFeedEntity | null>;
    abstract deleteByIdForUser(id: string, userId: string): Promise<boolean>;
}
```

- [ ] **Step 7: Run it to see it pass**

Run: `npx vitest run src/modules/opportunity-feeds/domain`
Expected: PASS, every test. If `feedNameFromIntent` fails the "60th word whole" case, the cut logic is wrong: fix the function, not the test.

- [ ] **Step 8: Format, verify, commit**

```bash
npm run format
npm run verify
git add src/modules/opportunity-feeds/domain
git commit -m "feat(opportunity-feeds): add the feed field rules, entity and errors" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Feeds repository

**Files:**
- Create: `src/modules/opportunity-feeds/infrastructure/mappers/opportunity-feed.mapper.ts`
- Create: `src/modules/opportunity-feeds/infrastructure/repositories/opportunity-feed.repository.ts`
- Test: `src/modules/opportunity-feeds/infrastructure/repositories/__tests__/opportunity-feed.repository.spec.ts`

**Interfaces:**
- Consumes: `OpportunityFeedRepositoryPort`, `NewOpportunityFeed`, `OpportunityFeedEntity`, `OpportunityFeedFields`, `OpportunityFeedLimitReachedError` (Task 3); `PrismaService`; `OpportunityFeed` model from `src/generated/prisma/client.js` (Task 1).
- Produces: `OpportunityFeedRepository implements OpportunityFeedRepositoryPort`; `OpportunityFeedMapper.toDomain(raw: OpportunityFeed): OpportunityFeedEntity`.

- [ ] **Step 1: Write the failing spec**

```ts
import type { PrismaService } from '../../../../../shared/prisma.service.js';
import { OpportunityFeedEntity } from '../../../domain/entities/opportunity-feed.entity.js';
import { OpportunityFeedLimitReachedError } from '../../../domain/errors/opportunity-feed-limit-reached.error.js';
import type { NewOpportunityFeed } from '../../../domain/ports/opportunity-feed-repository.port.js';
import { OpportunityFeedRepository } from '../opportunity-feed.repository.js';

const row = {
    id: 'feed-id',
    userId: 'user-id',
    name: 'AI agents',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: [],
    languages: ['en'],
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
    onboardingId: null,
    createdAt: new Date('2026-10-14'),
    updatedAt: new Date('2026-10-14'),
};

const data: NewOpportunityFeed = {
    userId: 'user-id',
    onboardingId: null,
    languages: ['en'],
    name: row.name,
    intent: row.intent,
    targetAudience: row.targetAudience,
    includeTerms: row.includeTerms,
    excludeTerms: row.excludeTerms,
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
};

describe('OpportunityFeedRepository', () => {
    const tx = {
        $executeRaw: vi.fn(),
        $queryRaw: vi.fn(),
        opportunityFeed: {
            findUnique: vi.fn(),
            findUniqueOrThrow: vi.fn(),
            count: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
    };
    const feed = {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        deleteMany: vi.fn(),
    };
    const $transaction = vi.fn(async (work: (client: typeof tx) => unknown) => work(tx));
    const repository = new OpportunityFeedRepository({
        opportunityFeed: feed,
        $transaction,
    } as unknown as PrismaService);

    beforeEach(() => {
        vi.resetAllMocks();
        $transaction.mockImplementation(async (work: (client: typeof tx) => unknown) => work(tx));
    });

    it('lists only the feeds of the user, newest first', async () => {
        feed.findMany.mockResolvedValue([row]);

        const feeds = await repository.listByUser('user-id');

        expect(feed.findMany).toHaveBeenCalledWith({ where: { userId: 'user-id' }, orderBy: { createdAt: 'desc' } });
        expect(feeds[0]).toBeInstanceOf(OpportunityFeedEntity);
        expect(feeds[0]).toMatchObject({ id: 'feed-id', userId: 'user-id', languages: ['en'] });
    });

    it('finds a feed by id scoped to the owner', async () => {
        feed.findFirst.mockResolvedValue(null);

        await expect(repository.findByIdForUser('feed-id', 'someone-else')).resolves.toBeNull();
        expect(feed.findFirst).toHaveBeenCalledWith({ where: { id: 'feed-id', userId: 'someone-else' } });
    });

    it('finds a feed by onboarding id scoped to the owner', async () => {
        feed.findFirst.mockResolvedValue(row);

        await expect(repository.findByOnboardingId('user-id', 'onboarding-id')).resolves.toMatchObject({
            id: 'feed-id',
        });
        expect(feed.findFirst).toHaveBeenCalledWith({ where: { onboardingId: 'onboarding-id', userId: 'user-id' } });
    });

    it('deletes only a feed owned by the user and reports whether one was removed', async () => {
        feed.deleteMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });

        await expect(repository.deleteByIdForUser('feed-id', 'user-id')).resolves.toBe(true);
        await expect(repository.deleteByIdForUser('feed-id', 'someone-else')).resolves.toBe(false);
        expect(feed.deleteMany).toHaveBeenCalledWith({ where: { id: 'feed-id', userId: 'someone-else' } });
    });

    describe('createWithinLimit', () => {
        it('takes the user lock before it counts and inserts', async () => {
            tx.opportunityFeed.count.mockResolvedValue(3);
            tx.opportunityFeed.create.mockResolvedValue(row);

            const created = await repository.createWithinLimit(data, 10);

            expect(created.id).toBe('feed-id');
            expect(tx.opportunityFeed.create).toHaveBeenCalledWith({ data });
            expect(tx.$executeRaw.mock.invocationCallOrder[0]).toBeLessThan(
                tx.opportunityFeed.count.mock.invocationCallOrder[0],
            );
            expect(tx.opportunityFeed.count).toHaveBeenCalledWith({ where: { userId: 'user-id' } });
        });

        it('throws at the limit and inserts nothing', async () => {
            tx.opportunityFeed.count.mockResolvedValue(10);

            await expect(repository.createWithinLimit(data, 10)).rejects.toBeInstanceOf(
                OpportunityFeedLimitReachedError,
            );
            expect(tx.opportunityFeed.create).not.toHaveBeenCalled();
        });

        it('returns the existing feed of an onboarding without counting', async () => {
            tx.opportunityFeed.findUnique.mockResolvedValue({ ...row, onboardingId: 'onboarding-id' });

            const created = await repository.createWithinLimit({ ...data, onboardingId: 'onboarding-id' }, 10);

            expect(created.id).toBe('feed-id');
            expect(tx.opportunityFeed.findUnique).toHaveBeenCalledWith({ where: { onboardingId: 'onboarding-id' } });
            expect(tx.opportunityFeed.count).not.toHaveBeenCalled();
            expect(tx.opportunityFeed.create).not.toHaveBeenCalled();
        });

        it('creates a feed for an onboarding that has none yet', async () => {
            tx.opportunityFeed.findUnique.mockResolvedValue(null);
            tx.opportunityFeed.count.mockResolvedValue(0);
            tx.opportunityFeed.create.mockResolvedValue({ ...row, onboardingId: 'onboarding-id' });

            await repository.createWithinLimit({ ...data, onboardingId: 'onboarding-id' }, 10);

            expect(tx.opportunityFeed.create).toHaveBeenCalledWith({
                data: { ...data, onboardingId: 'onboarding-id' },
            });
        });
    });

    describe('updateLocked', () => {
        it('returns null without calling mutate when the feed is not the owner\'s', async () => {
            tx.$queryRaw.mockResolvedValue([]);
            const mutate = vi.fn();

            await expect(repository.updateLocked('feed-id', 'someone-else', mutate)).resolves.toBeNull();
            expect(mutate).not.toHaveBeenCalled();
        });

        it('locks the row, reads it, applies the mutation and returns the updated feed', async () => {
            tx.$queryRaw.mockResolvedValue([{ id: 'feed-id' }]);
            tx.opportunityFeed.findUniqueOrThrow.mockResolvedValue(row);
            tx.opportunityFeed.update.mockResolvedValue({ ...row, minScore: 80 });

            const updated = await repository.updateLocked('feed-id', 'user-id', (current) => ({
                ...current.fields,
                minScore: 80,
            }));

            expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
                tx.opportunityFeed.findUniqueOrThrow.mock.invocationCallOrder[0],
            );
            expect(tx.opportunityFeed.update).toHaveBeenCalledWith({
                where: { id: 'feed-id' },
                data: expect.objectContaining({ minScore: 80, name: 'AI agents' }),
            });
            expect(updated?.minScore).toBe(80);
        });

        it('writes nothing when the mutation throws', async () => {
            tx.$queryRaw.mockResolvedValue([{ id: 'feed-id' }]);
            tx.opportunityFeed.findUniqueOrThrow.mockResolvedValue(row);
            const failure = new Error('invalid');

            await expect(
                repository.updateLocked('feed-id', 'user-id', () => {
                    throw failure;
                }),
            ).rejects.toBe(failure);
            expect(tx.opportunityFeed.update).not.toHaveBeenCalled();
        });
    });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/modules/opportunity-feeds/infrastructure`
Expected: FAIL, cannot resolve `../opportunity-feed.repository.js`.

- [ ] **Step 3: Write the mapper** — `src/modules/opportunity-feeds/infrastructure/mappers/opportunity-feed.mapper.ts`

```ts
import type { OpportunityFeed } from '../../../../generated/prisma/client.js';
import { OpportunityFeedEntity } from '../../domain/entities/opportunity-feed.entity.js';

export class OpportunityFeedMapper {
    static toDomain(raw: OpportunityFeed): OpportunityFeedEntity {
        return new OpportunityFeedEntity(raw.id, {
            userId: raw.userId,
            name: raw.name,
            intent: raw.intent,
            targetAudience: raw.targetAudience,
            includeTerms: raw.includeTerms,
            excludeTerms: raw.excludeTerms,
            languages: raw.languages,
            freshnessHours: raw.freshnessHours,
            minScore: raw.minScore,
            isActive: raw.isActive,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
}
```

- [ ] **Step 4: Write the repository** — `src/modules/opportunity-feeds/infrastructure/repositories/opportunity-feed.repository.ts`

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma.service.js';
import type { OpportunityFeedFields } from '../../domain/entities/opportunity-feed-fields.js';
import type { OpportunityFeedEntity } from '../../domain/entities/opportunity-feed.entity.js';
import { OpportunityFeedLimitReachedError } from '../../domain/errors/opportunity-feed-limit-reached.error.js';
import {
    OpportunityFeedRepositoryPort,
    type NewOpportunityFeed,
} from '../../domain/ports/opportunity-feed-repository.port.js';
import { OpportunityFeedMapper } from '../mappers/opportunity-feed.mapper.js';

const TRANSACTION_TIMEOUT_MS = 15_000;

@Injectable()
export class OpportunityFeedRepository implements OpportunityFeedRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async listByUser(userId: string) {
        const rows = await this.prisma.opportunityFeed.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return rows.map(OpportunityFeedMapper.toDomain);
    }

    async findByIdForUser(id: string, userId: string) {
        const row = await this.prisma.opportunityFeed.findFirst({ where: { id, userId } });

        return row && OpportunityFeedMapper.toDomain(row);
    }

    async findByOnboardingId(userId: string, onboardingId: string) {
        const row = await this.prisma.opportunityFeed.findFirst({ where: { onboardingId, userId } });

        return row && OpportunityFeedMapper.toDomain(row);
    }

    createWithinLimit(data: NewOpportunityFeed, limit: number) {
        return this.prisma.$transaction(
            async (tx) => {
                await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${data.userId}, 0))`;

                if (data.onboardingId) {
                    const existing = await tx.opportunityFeed.findUnique({
                        where: { onboardingId: data.onboardingId },
                    });

                    if (existing) return OpportunityFeedMapper.toDomain(existing);
                }

                const count = await tx.opportunityFeed.count({ where: { userId: data.userId } });

                if (count >= limit) throw new OpportunityFeedLimitReachedError();

                const created = await tx.opportunityFeed.create({ data });

                return OpportunityFeedMapper.toDomain(created);
            },
            { timeout: TRANSACTION_TIMEOUT_MS },
        );
    }

    updateLocked(
        id: string,
        userId: string,
        mutate: (current: OpportunityFeedEntity) => OpportunityFeedFields,
    ) {
        return this.prisma.$transaction(
            async (tx) => {
                const locked = await tx.$queryRaw<{ id: string }[]>`
                    SELECT "id" FROM "OpportunityFeed"
                    WHERE "id" = ${id}::uuid AND "userId" = ${userId}::uuid
                    FOR UPDATE
                `;

                if (locked.length === 0) return null;

                const row = await tx.opportunityFeed.findUniqueOrThrow({ where: { id } });
                const fields = mutate(OpportunityFeedMapper.toDomain(row));
                const updated = await tx.opportunityFeed.update({ where: { id }, data: fields });

                return OpportunityFeedMapper.toDomain(updated);
            },
            { timeout: TRANSACTION_TIMEOUT_MS },
        );
    }

    async deleteByIdForUser(id: string, userId: string) {
        const { count } = await this.prisma.opportunityFeed.deleteMany({ where: { id, userId } });

        return count > 0;
    }
}
```

- [ ] **Step 5: Run it to see it pass, and type-check**

Run: `npx vitest run src/modules/opportunity-feeds/infrastructure && npx tsc --noEmit`
Expected: PASS, then `tsc` clean. `tsc` is the first real check that the Prisma create `data` matches the columns; if it rejects `data`, fix the `NewOpportunityFeed` type, not the schema.

- [ ] **Step 6: Format, verify, commit**

```bash
npm run format
npm run verify
git add src/modules/opportunity-feeds/infrastructure
git commit -m "feat(opportunity-feeds): add the repository with the per-user create lock" -m "Creation takes pg_advisory_xact_lock on the user, then looks up the onboarding feed, counts and inserts, so the cap holds and onboardingId stays idempotent under parallel requests. Update locks the feed row so the merged-state check sees the latest data." -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Feeds use cases, facade, routes and wiring

**Files:**
- Create: `src/shared/validation/strict-body.pipe.ts`
- Test: `src/shared/validation/__tests__/strict-body.pipe.spec.ts`
- Create: `src/modules/opportunity-feeds/application/use-cases/create-opportunity-feed.use-case.ts`
- Create: `src/modules/opportunity-feeds/application/use-cases/create-feed-from-onboarding.use-case.ts`
- Create: `src/modules/opportunity-feeds/application/use-cases/list-opportunity-feeds.use-case.ts`
- Create: `src/modules/opportunity-feeds/application/use-cases/get-opportunity-feed.use-case.ts`
- Create: `src/modules/opportunity-feeds/application/use-cases/update-opportunity-feed.use-case.ts`
- Create: `src/modules/opportunity-feeds/application/use-cases/delete-opportunity-feed.use-case.ts`
- Create: `src/modules/opportunity-feeds/application/use-cases/find-feed-by-onboarding.use-case.ts`
- Create: `src/modules/opportunity-feeds/application/opportunity-feeds.service.ts`
- Create: `src/modules/opportunity-feeds/presentation/dto/is-sent.ts`
- Create: `src/modules/opportunity-feeds/presentation/dto/create-opportunity-feed.dto.ts`
- Create: `src/modules/opportunity-feeds/presentation/dto/update-opportunity-feed.dto.ts`
- Create: `src/modules/opportunity-feeds/presentation/dto/opportunity-feed-response.dto.ts`
- Create: `src/modules/opportunity-feeds/presentation/mappers/opportunity-feed-response.mapper.ts`
- Create: `src/modules/opportunity-feeds/presentation/opportunity-feeds.controller.ts`
- Create: `src/modules/opportunity-feeds/opportunity-feeds.module.ts`
- Modify: `src/app.module.ts`
- Test: `src/modules/opportunity-feeds/application/use-cases/__tests__/opportunity-feed.use-cases.spec.ts`
- Test: `src/modules/opportunity-feeds/application/__tests__/opportunity-feeds.service.spec.ts`
- Test: `src/modules/opportunity-feeds/presentation/__tests__/opportunity-feeds.controller.spec.ts`
- Create: `test/support/e2e-app.ts`
- Test: `test/opportunity-feeds.e2e-spec.ts`

**Interfaces:**
- Consumes: everything from Task 3 and 4; `CurrentUser`, `JwtPayload`.
- Produces:
  - `StrictBodyPipe(metatype)` in `src/shared/validation`: validates a body against a DTO class with `whitelist`, `forbidNonWhitelisted`, `transform`.
  - `OpportunityFeedsService`: `create(userId, input: NewOpportunityFeedInput)`, `list(userId)`, `get(userId, id)`, `update(userId, id, changes: OpportunityFeedChanges)`, `delete(userId, id)`, `createFromOnboarding(input: CreateFeedFromOnboardingInput)`, `findByOnboardingId(userId, onboardingId)`; `type CreateFeedFromOnboardingInput = { userId: string; onboardingId: string; intent: string; targetAudience: string; includeTerms: string[]; excludeTerms: string[] }`.
  - Routes `POST|GET /opportunity-feeds`, `GET|PATCH|DELETE /opportunity-feeds/:id`; `OpportunityFeedsModule` exporting `OpportunityFeedsService`.
  - e2e helper `test/support/e2e-app.ts`: `startApp(port): Promise<ChildProcess>`, `signUp(base): Promise<{ cookie: string; userId: string }>`, `call(base, cookie, method, path, body?)`.

- [ ] **Step 1: Write the failing use case spec** — `src/modules/opportunity-feeds/application/use-cases/__tests__/opportunity-feed.use-cases.spec.ts`

```ts
import { OpportunityFeedEntity } from '../../../domain/entities/opportunity-feed.entity.js';
import { MAX_FEEDS_PER_USER } from '../../../domain/entities/opportunity-feed-fields.js';
import { OpportunityFeedInvalidError } from '../../../domain/errors/opportunity-feed-invalid.error.js';
import { OpportunityFeedNotFoundError } from '../../../domain/errors/opportunity-feed-not-found.error.js';
import type { OpportunityFeedRepositoryPort } from '../../../domain/ports/opportunity-feed-repository.port.js';
import { CreateFeedFromOnboardingUseCase } from '../create-feed-from-onboarding.use-case.js';
import { CreateOpportunityFeedUseCase } from '../create-opportunity-feed.use-case.js';
import { DeleteOpportunityFeedUseCase } from '../delete-opportunity-feed.use-case.js';
import { FindFeedByOnboardingUseCase } from '../find-feed-by-onboarding.use-case.js';
import { GetOpportunityFeedUseCase } from '../get-opportunity-feed.use-case.js';
import { ListOpportunityFeedsUseCase } from '../list-opportunity-feeds.use-case.js';
import { UpdateOpportunityFeedUseCase } from '../update-opportunity-feed.use-case.js';

const entity = new OpportunityFeedEntity('feed-id', {
    userId: 'user-id',
    name: 'AI agents',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: [],
    languages: ['en'],
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
    createdAt: new Date('2026-10-14'),
    updatedAt: new Date('2026-10-14'),
});

describe('opportunity feed use cases', () => {
    const repository = {
        listByUser: vi.fn(),
        findByIdForUser: vi.fn(),
        findByOnboardingId: vi.fn(),
        createWithinLimit: vi.fn(),
        updateLocked: vi.fn(),
        deleteByIdForUser: vi.fn(),
    };
    const port = repository as unknown as OpportunityFeedRepositoryPort;

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('create applies the defaults, the language and no onboarding id', async () => {
        repository.createWithinLimit.mockResolvedValue(entity);

        const created = await new CreateOpportunityFeedUseCase(port).execute('user-id', {
            name: 'AI agents',
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
        });

        expect(created).toBe(entity);
        expect(repository.createWithinLimit).toHaveBeenCalledWith(
            {
                userId: 'user-id',
                onboardingId: null,
                languages: ['en'],
                name: 'AI agents',
                intent: 'Find people asking about AI agents',
                targetAudience: 'Founders',
                includeTerms: ['ai agents'],
                excludeTerms: [],
                freshnessHours: 24,
                minScore: 60,
                isActive: true,
            },
            MAX_FEEDS_PER_USER,
        );
    });

    it('create rejects an invalid input before it touches the repository', async () => {
        await expect(
            new CreateOpportunityFeedUseCase(port).execute('user-id', {
                name: '',
                intent: 'Find people asking about AI agents',
                targetAudience: 'Founders',
                includeTerms: ['ai agents'],
            }),
        ).rejects.toBeInstanceOf(OpportunityFeedInvalidError);
        expect(repository.createWithinLimit).not.toHaveBeenCalled();
    });

    it('createFromOnboarding names the feed from the intent and passes the onboarding id', async () => {
        repository.createWithinLimit.mockResolvedValue(entity);

        await new CreateFeedFromOnboardingUseCase(port).execute({
            userId: 'user-id',
            onboardingId: 'onboarding-id',
            intent: 'Find people who are asking how to evaluate and compare AI agent frameworks for teams',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
            excludeTerms: ['crypto'],
        });

        const [data, limit] = repository.createWithinLimit.mock.calls[0];
        expect(data).toMatchObject({
            userId: 'user-id',
            onboardingId: 'onboarding-id',
            languages: ['en'],
            excludeTerms: ['crypto'],
            freshnessHours: 24,
            minScore: 60,
            isActive: true,
        });
        expect(data.name.length).toBeLessThanOrEqual(60);
        expect(limit).toBe(MAX_FEEDS_PER_USER);
    });

    it('list returns the feeds of the user', async () => {
        repository.listByUser.mockResolvedValue([entity]);

        await expect(new ListOpportunityFeedsUseCase(port).execute('user-id')).resolves.toEqual([entity]);
        expect(repository.listByUser).toHaveBeenCalledWith('user-id');
    });

    it('get returns the feed or throws not found', async () => {
        repository.findByIdForUser.mockResolvedValueOnce(entity).mockResolvedValueOnce(null);
        const useCase = new GetOpportunityFeedUseCase(port);

        await expect(useCase.execute('user-id', 'feed-id')).resolves.toBe(entity);
        await expect(useCase.execute('user-id', 'missing')).rejects.toBeInstanceOf(OpportunityFeedNotFoundError);
    });

    it('update merges the changes into the locked feed', async () => {
        repository.updateLocked.mockImplementation(
            async (_id: string, _userId: string, mutate: (current: OpportunityFeedEntity) => unknown) => {
                mutate(entity);
                return entity;
            },
        );

        await new UpdateOpportunityFeedUseCase(port).execute('user-id', 'feed-id', { minScore: 80 });

        expect(repository.updateLocked).toHaveBeenCalledWith('feed-id', 'user-id', expect.any(Function));
        const mutate = repository.updateLocked.mock.calls[0][2] as (current: OpportunityFeedEntity) => unknown;
        expect(mutate(entity)).toMatchObject({ minScore: 80, name: 'AI agents' });
    });

    it('update throws not found when the repository finds no feed of the user', async () => {
        repository.updateLocked.mockResolvedValue(null);

        await expect(
            new UpdateOpportunityFeedUseCase(port).execute('user-id', 'feed-id', { minScore: 80 }),
        ).rejects.toBeInstanceOf(OpportunityFeedNotFoundError);
    });

    it('delete succeeds for an owned feed and throws not found otherwise', async () => {
        repository.deleteByIdForUser.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        const useCase = new DeleteOpportunityFeedUseCase(port);

        await expect(useCase.execute('user-id', 'feed-id')).resolves.toBeUndefined();
        await expect(useCase.execute('user-id', 'feed-id')).rejects.toBeInstanceOf(OpportunityFeedNotFoundError);
    });

    it('findByOnboardingId returns the feed or null', async () => {
        repository.findByOnboardingId.mockResolvedValueOnce(entity).mockResolvedValueOnce(null);
        const useCase = new FindFeedByOnboardingUseCase(port);

        await expect(useCase.execute('user-id', 'onboarding-id')).resolves.toBe(entity);
        await expect(useCase.execute('user-id', 'onboarding-id')).resolves.toBeNull();
    });
});
```

- [ ] **Step 2: Write the failing strict pipe spec** — `src/shared/validation/__tests__/strict-body.pipe.spec.ts`

```ts
import { BadRequestException } from '@nestjs/common';
import { IsInt, IsString } from 'class-validator';
import { StrictBodyPipe } from '../strict-body.pipe.js';

class SampleDto {
    @IsString()
    name: string;

    @IsInt()
    size: number;
}

describe('StrictBodyPipe', () => {
    const pipe = new StrictBodyPipe(SampleDto);

    it('returns a valid body', async () => {
        await expect(pipe.transform({ name: 'a', size: 1 })).resolves.toMatchObject({ name: 'a', size: 1 });
    });

    it.each([
        ['an unknown field', { name: 'a', size: 1, extra: true }],
        ['a wrong type', { name: 'a', size: '1' }],
        ['a missing field', { name: 'a' }],
        ['an array body', []],
        ['a null body', null],
    ])('rejects %s with 400', async (_case, body) => {
        await expect(pipe.transform(body)).rejects.toBeInstanceOf(BadRequestException);
    });
});
```

- [ ] **Step 3: Write the failing controller spec** — `src/modules/opportunity-feeds/presentation/__tests__/opportunity-feeds.controller.spec.ts`

```ts
import type { JwtPayload } from '../../../auth/domain/jwt-payload.js';
import type { OpportunityFeedsService } from '../../application/opportunity-feeds.service.js';
import { OpportunityFeedEntity } from '../../domain/entities/opportunity-feed.entity.js';
import { OpportunityFeedsController } from '../opportunity-feeds.controller.js';

const entity = new OpportunityFeedEntity('feed-id', {
    userId: 'user-id',
    name: 'AI agents',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: [],
    languages: ['en'],
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
    createdAt: new Date('2026-10-14'),
    updatedAt: new Date('2026-10-15'),
});

const expected = {
    id: 'feed-id',
    name: 'AI agents',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: [],
    languages: ['en'],
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
    createdAt: new Date('2026-10-14'),
    updatedAt: new Date('2026-10-15'),
};

describe('OpportunityFeedsController', () => {
    const currentUser: JwtPayload = { sub: 'user-id', email: 'u@x.io', tokenVersion: 0 };
    const service = { create: vi.fn(), list: vi.fn(), get: vi.fn(), update: vi.fn(), delete: vi.fn() };
    const controller = new OpportunityFeedsController(service as unknown as OpportunityFeedsService);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('create passes the token user and returns the feed without internal fields', async () => {
        const input = {
            name: 'AI agents',
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
        };
        service.create.mockResolvedValue(entity);

        await expect(controller.create(currentUser, input)).resolves.toEqual(expected);
        expect(service.create).toHaveBeenCalledWith('user-id', input);
    });

    it('list maps every feed of the token user', async () => {
        service.list.mockResolvedValue([entity]);

        await expect(controller.list(currentUser)).resolves.toEqual([expected]);
        expect(service.list).toHaveBeenCalledWith('user-id');
    });

    it('get, update and delete scope the call to the token user', async () => {
        service.get.mockResolvedValue(entity);
        service.update.mockResolvedValue(entity);

        await expect(controller.get(currentUser, 'feed-id')).resolves.toEqual(expected);
        await expect(controller.update(currentUser, 'feed-id', { minScore: 80 })).resolves.toEqual(expected);
        await controller.remove(currentUser, 'feed-id');

        expect(service.get).toHaveBeenCalledWith('user-id', 'feed-id');
        expect(service.update).toHaveBeenCalledWith('user-id', 'feed-id', { minScore: 80 });
        expect(service.delete).toHaveBeenCalledWith('user-id', 'feed-id');
    });
});
```

- [ ] **Step 4: Write the failing service spec** — `src/modules/opportunity-feeds/application/__tests__/opportunity-feeds.service.spec.ts`

```ts
import type { CreateFeedFromOnboardingUseCase } from '../use-cases/create-feed-from-onboarding.use-case.js';
import type { CreateOpportunityFeedUseCase } from '../use-cases/create-opportunity-feed.use-case.js';
import type { DeleteOpportunityFeedUseCase } from '../use-cases/delete-opportunity-feed.use-case.js';
import type { FindFeedByOnboardingUseCase } from '../use-cases/find-feed-by-onboarding.use-case.js';
import type { GetOpportunityFeedUseCase } from '../use-cases/get-opportunity-feed.use-case.js';
import type { ListOpportunityFeedsUseCase } from '../use-cases/list-opportunity-feeds.use-case.js';
import type { UpdateOpportunityFeedUseCase } from '../use-cases/update-opportunity-feed.use-case.js';
import { OpportunityFeedsService } from '../opportunity-feeds.service.js';

describe('OpportunityFeedsService', () => {
    const useCases = {
        create: { execute: vi.fn() },
        fromOnboarding: { execute: vi.fn() },
        list: { execute: vi.fn() },
        get: { execute: vi.fn() },
        update: { execute: vi.fn() },
        remove: { execute: vi.fn() },
        byOnboarding: { execute: vi.fn() },
    };
    const service = new OpportunityFeedsService(
        useCases.create as unknown as CreateOpportunityFeedUseCase,
        useCases.fromOnboarding as unknown as CreateFeedFromOnboardingUseCase,
        useCases.list as unknown as ListOpportunityFeedsUseCase,
        useCases.get as unknown as GetOpportunityFeedUseCase,
        useCases.update as unknown as UpdateOpportunityFeedUseCase,
        useCases.remove as unknown as DeleteOpportunityFeedUseCase,
        useCases.byOnboarding as unknown as FindFeedByOnboardingUseCase,
    );

    it('delegates every operation to its use case', async () => {
        const input = {
            name: 'AI agents',
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
        };
        const fromOnboarding = {
            userId: 'user-id',
            onboardingId: 'onboarding-id',
            intent: input.intent,
            targetAudience: input.targetAudience,
            includeTerms: input.includeTerms,
            excludeTerms: [],
        };

        await service.create('user-id', input);
        await service.createFromOnboarding(fromOnboarding);
        await service.list('user-id');
        await service.get('user-id', 'feed-id');
        await service.update('user-id', 'feed-id', { minScore: 80 });
        await service.delete('user-id', 'feed-id');
        await service.findByOnboardingId('user-id', 'onboarding-id');

        expect(useCases.create.execute).toHaveBeenCalledWith('user-id', input);
        expect(useCases.fromOnboarding.execute).toHaveBeenCalledWith(fromOnboarding);
        expect(useCases.list.execute).toHaveBeenCalledWith('user-id');
        expect(useCases.get.execute).toHaveBeenCalledWith('user-id', 'feed-id');
        expect(useCases.update.execute).toHaveBeenCalledWith('user-id', 'feed-id', { minScore: 80 });
        expect(useCases.remove.execute).toHaveBeenCalledWith('user-id', 'feed-id');
        expect(useCases.byOnboarding.execute).toHaveBeenCalledWith('user-id', 'onboarding-id');
    });
});
```

- [ ] **Step 5: Run the specs to see them fail**

Run: `npx vitest run src/modules/opportunity-feeds/application src/modules/opportunity-feeds/presentation src/shared/validation`
Expected: FAIL, cannot resolve the use case, service, controller and pipe files.

- [ ] **Step 6: Write the strict pipe** — `src/shared/validation/strict-body.pipe.ts`

```ts
import { ValidationPipe, type PipeTransform, type Type } from '@nestjs/common';

export class StrictBodyPipe implements PipeTransform {
    private readonly strict = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    });

    constructor(private readonly metatype: Type<unknown>) {}

    transform(value: unknown) {
        return this.strict.transform(value, { type: 'body', metatype: this.metatype });
    }
}
```

- [ ] **Step 7: Write the use cases**

`create-opportunity-feed.use-case.ts`

```ts
import { Injectable } from '@nestjs/common';
import {
    FEED_LANGUAGES,
    MAX_FEEDS_PER_USER,
    buildFeedFields,
    type NewOpportunityFeedInput,
} from '../../domain/entities/opportunity-feed-fields.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class CreateOpportunityFeedUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    execute(userId: string, input: NewOpportunityFeedInput) {
        const fields = buildFeedFields(input);

        return this.repository.createWithinLimit(
            { ...fields, userId, onboardingId: null, languages: [...FEED_LANGUAGES] },
            MAX_FEEDS_PER_USER,
        );
    }
}
```

`create-feed-from-onboarding.use-case.ts`

```ts
import { Injectable } from '@nestjs/common';
import {
    FEED_LANGUAGES,
    MAX_FEEDS_PER_USER,
    buildFeedFields,
    feedNameFromIntent,
} from '../../domain/entities/opportunity-feed-fields.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

export type CreateFeedFromOnboardingInput = {
    userId: string;
    onboardingId: string;
    intent: string;
    targetAudience: string;
    includeTerms: string[];
    excludeTerms: string[];
};

@Injectable()
export class CreateFeedFromOnboardingUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    execute(input: CreateFeedFromOnboardingInput) {
        const fields = buildFeedFields({
            name: feedNameFromIntent(input.intent),
            intent: input.intent,
            targetAudience: input.targetAudience,
            includeTerms: input.includeTerms,
            excludeTerms: input.excludeTerms,
        });

        return this.repository.createWithinLimit(
            {
                ...fields,
                userId: input.userId,
                onboardingId: input.onboardingId,
                languages: [...FEED_LANGUAGES],
            },
            MAX_FEEDS_PER_USER,
        );
    }
}
```

`list-opportunity-feeds.use-case.ts`

```ts
import { Injectable } from '@nestjs/common';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class ListOpportunityFeedsUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    execute(userId: string) {
        return this.repository.listByUser(userId);
    }
}
```

`get-opportunity-feed.use-case.ts`

```ts
import { Injectable } from '@nestjs/common';
import { OpportunityFeedNotFoundError } from '../../domain/errors/opportunity-feed-not-found.error.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class GetOpportunityFeedUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    async execute(userId: string, id: string) {
        const feed = await this.repository.findByIdForUser(id, userId);

        if (!feed) throw new OpportunityFeedNotFoundError();

        return feed;
    }
}
```

`update-opportunity-feed.use-case.ts`

```ts
import { Injectable } from '@nestjs/common';
import {
    mergeFeedFields,
    type OpportunityFeedChanges,
} from '../../domain/entities/opportunity-feed-fields.js';
import { OpportunityFeedNotFoundError } from '../../domain/errors/opportunity-feed-not-found.error.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class UpdateOpportunityFeedUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    async execute(userId: string, id: string, changes: OpportunityFeedChanges) {
        const feed = await this.repository.updateLocked(id, userId, (current) =>
            mergeFeedFields(current.fields, changes),
        );

        if (!feed) throw new OpportunityFeedNotFoundError();

        return feed;
    }
}
```

`delete-opportunity-feed.use-case.ts`

```ts
import { Injectable } from '@nestjs/common';
import { OpportunityFeedNotFoundError } from '../../domain/errors/opportunity-feed-not-found.error.js';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class DeleteOpportunityFeedUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    async execute(userId: string, id: string) {
        const removed = await this.repository.deleteByIdForUser(id, userId);

        if (!removed) throw new OpportunityFeedNotFoundError();
    }
}
```

`find-feed-by-onboarding.use-case.ts`

```ts
import { Injectable } from '@nestjs/common';
import { OpportunityFeedRepositoryPort } from '../../domain/ports/opportunity-feed-repository.port.js';

@Injectable()
export class FindFeedByOnboardingUseCase {
    constructor(private readonly repository: OpportunityFeedRepositoryPort) {}

    execute(userId: string, onboardingId: string) {
        return this.repository.findByOnboardingId(userId, onboardingId);
    }
}
```

- [ ] **Step 8: Write the facade** — `src/modules/opportunity-feeds/application/opportunity-feeds.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import type {
    NewOpportunityFeedInput,
    OpportunityFeedChanges,
} from '../domain/entities/opportunity-feed-fields.js';
import {
    CreateFeedFromOnboardingUseCase,
    type CreateFeedFromOnboardingInput,
} from './use-cases/create-feed-from-onboarding.use-case.js';
import { CreateOpportunityFeedUseCase } from './use-cases/create-opportunity-feed.use-case.js';
import { DeleteOpportunityFeedUseCase } from './use-cases/delete-opportunity-feed.use-case.js';
import { FindFeedByOnboardingUseCase } from './use-cases/find-feed-by-onboarding.use-case.js';
import { GetOpportunityFeedUseCase } from './use-cases/get-opportunity-feed.use-case.js';
import { ListOpportunityFeedsUseCase } from './use-cases/list-opportunity-feeds.use-case.js';
import { UpdateOpportunityFeedUseCase } from './use-cases/update-opportunity-feed.use-case.js';

@Injectable()
export class OpportunityFeedsService {
    constructor(
        private readonly createUseCase: CreateOpportunityFeedUseCase,
        private readonly createFromOnboardingUseCase: CreateFeedFromOnboardingUseCase,
        private readonly listUseCase: ListOpportunityFeedsUseCase,
        private readonly getUseCase: GetOpportunityFeedUseCase,
        private readonly updateUseCase: UpdateOpportunityFeedUseCase,
        private readonly deleteUseCase: DeleteOpportunityFeedUseCase,
        private readonly findByOnboardingUseCase: FindFeedByOnboardingUseCase,
    ) {}

    create(userId: string, input: NewOpportunityFeedInput) {
        return this.createUseCase.execute(userId, input);
    }

    createFromOnboarding(input: CreateFeedFromOnboardingInput) {
        return this.createFromOnboardingUseCase.execute(input);
    }

    list(userId: string) {
        return this.listUseCase.execute(userId);
    }

    get(userId: string, id: string) {
        return this.getUseCase.execute(userId, id);
    }

    update(userId: string, id: string, changes: OpportunityFeedChanges) {
        return this.updateUseCase.execute(userId, id, changes);
    }

    delete(userId: string, id: string) {
        return this.deleteUseCase.execute(userId, id);
    }

    findByOnboardingId(userId: string, onboardingId: string) {
        return this.findByOnboardingUseCase.execute(userId, onboardingId);
    }
}
```

- [ ] **Step 9: Write the presentation layer**

`presentation/dto/is-sent.ts`

```ts
export const isSent = (_object: unknown, value: unknown) => value !== undefined;
```

`presentation/dto/create-opportunity-feed.dto.ts`

```ts
import { IsArray, IsBoolean, IsInt, IsString, ValidateIf } from 'class-validator';
import { isSent } from './is-sent.js';

export class CreateOpportunityFeedDto {
    @IsString()
    name: string;

    @IsString()
    intent: string;

    @IsString()
    targetAudience: string;

    @IsArray()
    @IsString({ each: true })
    includeTerms: string[];

    @ValidateIf(isSent)
    @IsArray()
    @IsString({ each: true })
    excludeTerms?: string[];

    @ValidateIf(isSent)
    @IsInt()
    freshnessHours?: number;

    @ValidateIf(isSent)
    @IsInt()
    minScore?: number;

    @ValidateIf(isSent)
    @IsBoolean()
    isActive?: boolean;
}
```

`presentation/dto/update-opportunity-feed.dto.ts`

```ts
import { IsArray, IsBoolean, IsInt, IsString, ValidateIf } from 'class-validator';
import { isSent } from './is-sent.js';

export class UpdateOpportunityFeedDto {
    @ValidateIf(isSent)
    @IsString()
    name?: string;

    @ValidateIf(isSent)
    @IsString()
    intent?: string;

    @ValidateIf(isSent)
    @IsString()
    targetAudience?: string;

    @ValidateIf(isSent)
    @IsArray()
    @IsString({ each: true })
    includeTerms?: string[];

    @ValidateIf(isSent)
    @IsArray()
    @IsString({ each: true })
    excludeTerms?: string[];

    @ValidateIf(isSent)
    @IsInt()
    freshnessHours?: number;

    @ValidateIf(isSent)
    @IsInt()
    minScore?: number;

    @ValidateIf(isSent)
    @IsBoolean()
    isActive?: boolean;
}
```

`presentation/dto/opportunity-feed-response.dto.ts`

```ts
export class OpportunityFeedResponseDto {
    id: string;
    name: string;
    intent: string;
    targetAudience: string;
    includeTerms: string[];
    excludeTerms: string[];
    languages: string[];
    freshnessHours: number;
    minScore: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
```

`presentation/mappers/opportunity-feed-response.mapper.ts`

```ts
import type { OpportunityFeedEntity } from '../../domain/entities/opportunity-feed.entity.js';
import type { OpportunityFeedResponseDto } from '../dto/opportunity-feed-response.dto.js';

export class OpportunityFeedResponseMapper {
    static toDto(feed: OpportunityFeedEntity): OpportunityFeedResponseDto {
        return {
            id: feed.id,
            name: feed.name,
            intent: feed.intent,
            targetAudience: feed.targetAudience,
            includeTerms: feed.includeTerms,
            excludeTerms: feed.excludeTerms,
            languages: feed.languages,
            freshnessHours: feed.freshnessHours,
            minScore: feed.minScore,
            isActive: feed.isActive,
            createdAt: feed.createdAt,
            updatedAt: feed.updatedAt,
        };
    }
}
```

`presentation/opportunity-feeds.controller.ts`

```ts
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { StrictBodyPipe } from '../../../shared/validation/strict-body.pipe.js';
import type { JwtPayload } from '../../auth/domain/jwt-payload.js';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator.js';
import { OpportunityFeedsService } from '../application/opportunity-feeds.service.js';
import type {
    NewOpportunityFeedInput,
    OpportunityFeedChanges,
} from '../domain/entities/opportunity-feed-fields.js';
import { CreateOpportunityFeedDto } from './dto/create-opportunity-feed.dto.js';
import { UpdateOpportunityFeedDto } from './dto/update-opportunity-feed.dto.js';
import { OpportunityFeedResponseMapper } from './mappers/opportunity-feed-response.mapper.js';

@Controller('opportunity-feeds')
export class OpportunityFeedsController {
    constructor(private readonly feedsService: OpportunityFeedsService) {}

    @Post()
    async create(
        @CurrentUser() currentUser: JwtPayload,
        @Body(new StrictBodyPipe(CreateOpportunityFeedDto)) input: NewOpportunityFeedInput,
    ) {
        const feed = await this.feedsService.create(currentUser.sub, input);

        return OpportunityFeedResponseMapper.toDto(feed);
    }

    @Get()
    async list(@CurrentUser() currentUser: JwtPayload) {
        const feeds = await this.feedsService.list(currentUser.sub);

        return feeds.map(OpportunityFeedResponseMapper.toDto);
    }

    @Get(':id')
    async get(@CurrentUser() currentUser: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
        const feed = await this.feedsService.get(currentUser.sub, id);

        return OpportunityFeedResponseMapper.toDto(feed);
    }

    @Patch(':id')
    async update(
        @CurrentUser() currentUser: JwtPayload,
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new StrictBodyPipe(UpdateOpportunityFeedDto)) changes: OpportunityFeedChanges,
    ) {
        const feed = await this.feedsService.update(currentUser.sub, id, changes);

        return OpportunityFeedResponseMapper.toDto(feed);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@CurrentUser() currentUser: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
        await this.feedsService.delete(currentUser.sub, id);
    }
}
```

The `@Body()` parameters are typed with plain object types (`NewOpportunityFeedInput`, `OpportunityFeedChanges`), so their reflected metatype is `Object` and the global `ValidationPipe` skips them; only `StrictBodyPipe` validates, which is what makes unknown fields 400 instead of silently stripped.

- [ ] **Step 10: Write the module and register it** — `src/modules/opportunity-feeds/opportunity-feeds.module.ts`

```ts
import { Module } from '@nestjs/common';
import { OpportunityFeedsService } from './application/opportunity-feeds.service.js';
import { CreateFeedFromOnboardingUseCase } from './application/use-cases/create-feed-from-onboarding.use-case.js';
import { CreateOpportunityFeedUseCase } from './application/use-cases/create-opportunity-feed.use-case.js';
import { DeleteOpportunityFeedUseCase } from './application/use-cases/delete-opportunity-feed.use-case.js';
import { FindFeedByOnboardingUseCase } from './application/use-cases/find-feed-by-onboarding.use-case.js';
import { GetOpportunityFeedUseCase } from './application/use-cases/get-opportunity-feed.use-case.js';
import { ListOpportunityFeedsUseCase } from './application/use-cases/list-opportunity-feeds.use-case.js';
import { UpdateOpportunityFeedUseCase } from './application/use-cases/update-opportunity-feed.use-case.js';
import { OpportunityFeedRepositoryPort } from './domain/ports/opportunity-feed-repository.port.js';
import { OpportunityFeedRepository } from './infrastructure/repositories/opportunity-feed.repository.js';
import { OpportunityFeedsController } from './presentation/opportunity-feeds.controller.js';

@Module({
    controllers: [OpportunityFeedsController],
    providers: [
        { provide: OpportunityFeedRepositoryPort, useClass: OpportunityFeedRepository },
        CreateOpportunityFeedUseCase,
        CreateFeedFromOnboardingUseCase,
        ListOpportunityFeedsUseCase,
        GetOpportunityFeedUseCase,
        UpdateOpportunityFeedUseCase,
        DeleteOpportunityFeedUseCase,
        FindFeedByOnboardingUseCase,
        OpportunityFeedsService,
    ],
    exports: [OpportunityFeedsService],
})
export class OpportunityFeedsModule {}
```

`src/app.module.ts` — add the import and the module:

```ts
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module.js';
import { HttpModule } from './shared/http/http.module.js';
import { PrismaModule } from './shared/prisma.module.js';
import { OnboardingModule } from './modules/onboarding/onboarding.module.js';
import { OpportunityFeedsModule } from './modules/opportunity-feeds/opportunity-feeds.module.js';
import { SocialAccountsModule } from './modules/social-accounts/social-accounts.module.js';
import { UsersModule } from './modules/users/user.module.js';

@Module({
    imports: [
        PrismaModule,
        HttpModule,
        UsersModule,
        AuthModule,
        SocialAccountsModule,
        OnboardingModule,
        OpportunityFeedsModule,
    ],
})
export class AppModule {}
```

- [ ] **Step 11: Run the specs to see them pass, then type-check**

Run: `npx vitest run src/modules/opportunity-feeds src/shared/validation && npx tsc --noEmit`
Expected: PASS, then `tsc` clean.

- [ ] **Step 12: Write the e2e helper** — `test/support/e2e-app.ts`

```ts
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';

export const JSON_HEADERS = { 'content-type': 'application/json' };

export async function startApp(port: number): Promise<ChildProcess> {
    const databaseUrl = process.env.E2E_DATABASE_URL;

    if (!databaseUrl) throw new Error('Set E2E_DATABASE_URL to a scratch database with all migrations applied.');

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
```

- [ ] **Step 13: Write the feeds e2e suite** — `test/opportunity-feeds.e2e-spec.ts`

```ts
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

    it('GET lists only the caller\'s feeds, newest first, and GET by id works', async () => {
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

    it('another user\'s feed and a missing feed are 404 for GET, PATCH and DELETE', async () => {
        const { cookie } = await signUp(BASE);
        const other = await signUp(BASE);
        const { body } = await createFeed(other.cookie);
        const missing = '00000000-0000-4000-8000-000000000000';

        for (const id of [body.id, missing]) {
            expect((await call(BASE, cookie, 'GET', `/opportunity-feeds/${id}`)).status).toBe(404);
            expect((await call(BASE, cookie, 'PATCH', `/opportunity-feeds/${id}`, { minScore: 70 })).status).toBe(404);
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
        expect(await changed.json()).toMatchObject({ ...FEED, minScore: 80, isActive: false, freshnessHours: 24 });

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
        expect((await call(BASE, null, 'GET', '/opportunity-feeds/00000000-0000-4000-8000-000000000000')).status).toBe(
            401,
        );
    });
});
```

- [ ] **Step 14: Format, verify, build, check the wiring**

```bash
npm run format
npm run verify
npm run build
```

Expected: verify green; build succeeds. Then start `PORT=3996 node dist/main.js`, check the log lists `Mapped {/opportunity-feeds, POST|GET}` and `{/opportunity-feeds/:id, GET|PATCH|DELETE}`, `curl -i http://localhost:3996/opportunity-feeds` answers 401, then stop the server.

- [ ] **Step 15: Run the feeds e2e suite**

Prerequisite: a throwaway database with every migration applied, for example a disposable `postgres:18` container on a free port with `DATABASE_URL=<its url> npx prisma migrate deploy`. Never the dev database.

```bash
E2E_DATABASE_URL='<scratch url>' npx vitest run --config ./vitest.config.e2e.ts test/opportunity-feeds.e2e-spec.ts
```

Expected: PASS, 10 tests. If `createWithinLimit` fails with a Prisma error about deserializing `void`, the `$executeRaw` line is the cause; fix the call, do not drop the lock.

- [ ] **Step 16: Commit**

```bash
git add src/shared/validation src/modules/opportunity-feeds src/app.module.ts test/support test/opportunity-feeds.e2e-spec.ts
git commit -m "feat(opportunity-feeds): add the feed routes" -m "The body parameters are typed as plain object types so the global ValidationPipe skips them and StrictBodyPipe can reject unknown fields instead of stripping them." -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Onboarding domain: completing transitions

**Files:**
- Create: `src/modules/onboarding/domain/errors/onboarding-not-editable.error.ts`
- Modify: `src/modules/onboarding/domain/entities/onboarding.entity.ts`
- Modify: `src/modules/onboarding/infrastructure/mappers/onboarding.mapper.ts`
- Modify: `src/modules/onboarding/infrastructure/repositories/onboarding.repository.ts`
- Modify: `src/modules/onboarding/infrastructure/repositories/__tests__/onboarding.repository.spec.ts`
- Test: `src/modules/onboarding/domain/entities/__tests__/onboarding-completing.spec.ts`

**Interfaces:**
- Consumes: `OnboardingStepAheadError`, `OnboardingVersionConflictError` (existing).
- Produces:
  - `OnboardingStatus = 'IN_PROGRESS' | 'COMPLETING' | 'COMPLETED'`; `OnboardingProps` gains optional `id?: string` and `completedAt?: Date | null`.
  - `OnboardingEntity` getters `id: string | undefined`, `completedAt: Date | null`; methods `startCompleting(version: number): OnboardingEntity`, `markCompleted(): OnboardingEntity`, `completeDraft(): CompleteOnboardingDraft`.
  - `type CompleteOnboardingDraft = { intent: string; targetAudience: string; includeTerms: string[]; excludeTerms: string[] }`.
  - `OnboardingNotEditableError` (`conflict`); `saveStep` throws it when `status` is not `IN_PROGRESS`.
  - `OnboardingRepository.save` also writes `completedAt`.

- [ ] **Step 1: Write the failing spec** — `src/modules/onboarding/domain/entities/__tests__/onboarding-completing.spec.ts`

```ts
import { OnboardingNotEditableError } from '../../errors/onboarding-not-editable.error.js';
import { OnboardingStepAheadError } from '../../errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../../errors/onboarding-version-conflict.error.js';
import {
    OnboardingEntity,
    type OnboardingDraft,
    type OnboardingStatus,
    type OnboardingStep,
} from '../onboarding.entity.js';

const draft: OnboardingDraft = {
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: ['crypto'],
};

const at = (
    status: OnboardingStatus,
    version: number,
    currentStep: OnboardingStep = 'REVIEW',
    value: OnboardingDraft = draft,
) =>
    new OnboardingEntity({ id: 'onboarding-id', userId: 'user-id', currentStep, status, draft: value, version });

describe('OnboardingEntity completing', () => {
    it('startCompleting moves a matching REVIEW state to COMPLETING and increments the version', () => {
        const started = at('IN_PROGRESS', 2).startCompleting(2);

        expect(started).toMatchObject({
            id: 'onboarding-id',
            status: 'COMPLETING',
            currentStep: 'REVIEW',
            version: 3,
            draft,
        });
    });

    it('startCompleting rejects a step before REVIEW', () => {
        expect(() => at('IN_PROGRESS', 1, 'PREFERENCES').startCompleting(1)).toThrow(OnboardingStepAheadError);
    });

    it('startCompleting rejects a stale version', () => {
        expect(() => at('IN_PROGRESS', 2).startCompleting(1)).toThrow(OnboardingVersionConflictError);
    });

    it('startCompleting rejects a state that is not IN_PROGRESS', () => {
        expect(() => at('COMPLETING', 3).startCompleting(3)).toThrow(OnboardingNotEditableError);
        expect(() => at('COMPLETED', 4).startCompleting(4)).toThrow(OnboardingNotEditableError);
    });

    it('markCompleted sets COMPLETED, completedAt and increments the version', () => {
        const completed = at('COMPLETING', 3).markCompleted();

        expect(completed).toMatchObject({ status: 'COMPLETED', version: 4, draft });
        expect(completed.completedAt).toBeInstanceOf(Date);
    });

    it('saveStep is rejected once the onboarding is COMPLETING or COMPLETED', () => {
        const input = {
            step: 'INTENT' as const,
            version: 3,
            data: { intent: 'Find people comparing frameworks', targetAudience: 'CTOs' },
        };

        expect(() => at('COMPLETING', 3).saveStep(input)).toThrow(OnboardingNotEditableError);
        expect(() => at('COMPLETED', 3).saveStep(input)).toThrow(OnboardingNotEditableError);
    });

    it('completeDraft returns the four draft fields', () => {
        expect(at('COMPLETING', 3).completeDraft()).toEqual({
            intent: draft.intent,
            targetAudience: draft.targetAudience,
            includeTerms: draft.includeTerms,
            excludeTerms: draft.excludeTerms,
        });
    });

    it('completeDraft rejects an incomplete draft', () => {
        expect(() => at('COMPLETING', 3, 'REVIEW', { intent: 'only an intent here' }).completeDraft()).toThrow(
            OnboardingStepAheadError,
        );
    });

    it('a fresh initial state has no id and no completedAt', () => {
        const initial = OnboardingEntity.initial('user-id');

        expect(initial.id).toBeUndefined();
        expect(initial.completedAt).toBeNull();
    });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/modules/onboarding/domain/entities/__tests__/onboarding-completing.spec.ts`
Expected: FAIL, cannot resolve `../../errors/onboarding-not-editable.error.js`.

- [ ] **Step 3: Write the error** — `src/modules/onboarding/domain/errors/onboarding-not-editable.error.ts`

```ts
import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OnboardingNotEditableError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('Onboarding is already being completed or is completed and cannot be edited.');
    }
}
```

- [ ] **Step 4: Replace the entity** — `src/modules/onboarding/domain/entities/onboarding.entity.ts`

```ts
import { OnboardingNotEditableError } from '../errors/onboarding-not-editable.error.js';
import { OnboardingStepAheadError } from '../errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../errors/onboarding-version-conflict.error.js';
import { normalizeIntentStep, normalizePreferencesStep } from './onboarding-draft.js';

export const ONBOARDING_STEPS = ['INTENT', 'PREFERENCES', 'REVIEW'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type EditableOnboardingStep = Exclude<OnboardingStep, 'REVIEW'>;
export type OnboardingStatus = 'IN_PROGRESS' | 'COMPLETING' | 'COMPLETED';

export type OnboardingDraft = {
    intent?: string;
    targetAudience?: string;
    includeTerms?: string[];
    excludeTerms?: string[];
};

export type CompleteOnboardingDraft = {
    intent: string;
    targetAudience: string;
    includeTerms: string[];
    excludeTerms: string[];
};

export type IntentStepData = { intent: string; targetAudience: string };
export type PreferencesStepData = { includeTerms: string[]; excludeTerms?: string[] | null };

export type SaveOnboardingStepInput = { version: number } & (
    | { step: 'INTENT'; data: IntentStepData }
    | { step: 'PREFERENCES'; data: PreferencesStepData }
);

export interface OnboardingProps {
    id?: string;
    userId: string;
    currentStep: OnboardingStep;
    status: OnboardingStatus;
    draft: OnboardingDraft;
    version: number;
    completedAt?: Date | null;
}

export class OnboardingEntity {
    constructor(private readonly props: OnboardingProps) {}

    static initial(userId: string) {
        return new OnboardingEntity({
            userId,
            currentStep: 'INTENT',
            status: 'IN_PROGRESS',
            draft: {},
            version: 0,
        });
    }

    get id() {
        return this.props.id;
    }

    get userId() {
        return this.props.userId;
    }

    get currentStep() {
        return this.props.currentStep;
    }

    get status() {
        return this.props.status;
    }

    get draft() {
        return this.props.draft;
    }

    get version() {
        return this.props.version;
    }

    get completedAt() {
        return this.props.completedAt ?? null;
    }

    saveStep(input: SaveOnboardingStepInput) {
        if (this.status !== 'IN_PROGRESS') throw new OnboardingNotEditableError();
        if (input.version !== this.version) throw new OnboardingVersionConflictError();

        const saved = ONBOARDING_STEPS.indexOf(input.step);
        const current = ONBOARDING_STEPS.indexOf(this.currentStep);

        if (saved > current) throw new OnboardingStepAheadError();

        const fields =
            input.step === 'INTENT' ? normalizeIntentStep(input.data) : normalizePreferencesStep(input.data);

        return new OnboardingEntity({
            ...this.props,
            currentStep: saved === current ? ONBOARDING_STEPS[current + 1] : this.currentStep,
            draft: { ...this.draft, ...fields },
            version: this.version + 1,
        });
    }

    startCompleting(version: number) {
        if (this.status !== 'IN_PROGRESS') throw new OnboardingNotEditableError();
        if (this.currentStep !== 'REVIEW') throw new OnboardingStepAheadError();
        if (version !== this.version) throw new OnboardingVersionConflictError();

        return new OnboardingEntity({ ...this.props, status: 'COMPLETING', version: this.version + 1 });
    }

    markCompleted() {
        return new OnboardingEntity({
            ...this.props,
            status: 'COMPLETED',
            completedAt: new Date(),
            version: this.version + 1,
        });
    }

    completeDraft(): CompleteOnboardingDraft {
        const { intent, targetAudience, includeTerms, excludeTerms } = this.draft;

        if (!intent || !targetAudience || !includeTerms || !excludeTerms) {
            throw new OnboardingStepAheadError();
        }

        return { intent, targetAudience, includeTerms, excludeTerms };
    }
}
```

- [ ] **Step 5: Map `id` and `completedAt`** — in `src/modules/onboarding/infrastructure/mappers/onboarding.mapper.ts` add to the props object: `id: raw.id,` before `userId`, and `completedAt: raw.completedAt,` after `version`.

- [ ] **Step 6: Write `completedAt` in the repository** — in `src/modules/onboarding/infrastructure/repositories/onboarding.repository.ts` add `completedAt: onboarding.completedAt,` to the `data` object in `save`, after `version`.

- [ ] **Step 7: Update the repository spec for the new column** — in `src/modules/onboarding/infrastructure/repositories/__tests__/onboarding.repository.spec.ts` add `completedAt: null,` to the two expected `data` objects:

```ts
        expect(onboarding.create).toHaveBeenCalledWith({
            data: {
                userId: 'user-id',
                currentStep: 'PREFERENCES',
                status: 'IN_PROGRESS',
                draft: row.draft,
                version: 1,
                completedAt: null,
            },
        });
```

```ts
        expect(onboarding.updateMany).toHaveBeenCalledWith({
            where: { userId: 'user-id', version: 2 },
            data: {
                currentStep: 'PREFERENCES',
                status: 'IN_PROGRESS',
                draft: row.draft,
                version: 3,
                completedAt: null,
            },
        });
```

and add this test to the same file, inside the `describe`:

```ts
    it('maps id and completedAt from the row and writes completedAt on save', async () => {
        const finished = new Date('2026-10-15');
        onboarding.findUnique.mockResolvedValue({ ...row, status: 'COMPLETED', completedAt: finished });
        onboarding.updateMany.mockResolvedValue({ count: 1 });

        const found = await repository.findByUserId('user-id');

        expect(found).toMatchObject({ id: 'onboarding-id', status: 'COMPLETED' });
        expect(found?.completedAt).toBe(finished);
        await repository.save(found!, 5);
        expect(onboarding.updateMany).toHaveBeenCalledWith({
            where: { userId: 'user-id', version: 5 },
            data: expect.objectContaining({ status: 'COMPLETED', completedAt: finished }),
        });
    });
```

- [ ] **Step 8: Run all onboarding specs and type-check**

Run: `npx vitest run src/modules/onboarding && npx tsc --noEmit`
Expected: PASS, every onboarding spec (the earlier entity and use case specs are unchanged and still green), then `tsc` clean.

- [ ] **Step 9: Format, verify, commit**

```bash
npm run format
npm run verify
git add src/modules/onboarding/domain src/modules/onboarding/infrastructure
git commit -m "feat(onboarding): add the COMPLETING and COMPLETED transitions" -m "The draft is frozen once the status leaves IN_PROGRESS: saving a step is a conflict from COMPLETING on." -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Onboarding complete: port, adapter, use case, route

**Files:**
- Create: `src/modules/onboarding/domain/ports/onboarding-feed.port.ts`
- Create: `src/modules/onboarding/infrastructure/feeds/onboarding-feed.adapter.ts`
- Create: `src/modules/onboarding/application/use-cases/complete-onboarding.use-case.ts`
- Create: `src/modules/onboarding/presentation/dto/complete-onboarding.dto.ts`
- Create: `src/modules/onboarding/presentation/dto/complete-onboarding-response.dto.ts`
- Modify: `src/modules/onboarding/application/onboarding.service.ts`
- Modify: `src/modules/onboarding/presentation/onboarding.controller.ts`
- Modify: `src/modules/onboarding/presentation/mappers/onboarding-response.mapper.ts`
- Modify: `src/modules/onboarding/onboarding.module.ts`
- Test: `src/modules/onboarding/application/use-cases/__tests__/complete-onboarding.use-case.spec.ts`
- Test: `src/modules/onboarding/infrastructure/feeds/__tests__/onboarding-feed.adapter.spec.ts`
- Modify: `src/modules/onboarding/application/__tests__/onboarding.service.spec.ts`
- Modify: `src/modules/onboarding/presentation/__tests__/onboarding.controller.spec.ts`
- Test: `test/onboarding-complete.e2e-spec.ts`

**Interfaces:**
- Consumes: Task 6 entity; `OpportunityFeedsService.createFromOnboarding` and `.findByOnboardingId` (Task 5); `StrictBodyPipe`; `test/support/e2e-app.ts`.
- Produces:
  - `abstract class OnboardingFeedPort { createFromOnboarding(input: { userId: string; onboardingId: string; draft: CompleteOnboardingDraft }): Promise<{ feedId: string }>; findFeedId(userId: string, onboardingId: string): Promise<string | null> }`.
  - `CompleteOnboardingUseCase.execute(userId: string, version: number): Promise<{ onboarding: OnboardingEntity; feedId: string | null }>`.
  - `OnboardingService.complete(userId, version)`; route `POST /onboarding/complete` returning `{ currentStep, status, version, draft, feedId }`.

- [ ] **Step 1: Write the failing use case spec** — `src/modules/onboarding/application/use-cases/__tests__/complete-onboarding.use-case.spec.ts`

```ts
import {
    OnboardingEntity,
    type OnboardingStatus,
    type OnboardingStep,
} from '../../../domain/entities/onboarding.entity.js';
import { OnboardingStepAheadError } from '../../../domain/errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../../../domain/errors/onboarding-version-conflict.error.js';
import type { OnboardingFeedPort } from '../../../domain/ports/onboarding-feed.port.js';
import type { OnboardingRepositoryPort } from '../../../domain/ports/onboarding-repository.port.js';
import { CompleteOnboardingUseCase } from '../complete-onboarding.use-case.js';

const draft = {
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: ['crypto'],
};

const row = (status: OnboardingStatus, version: number, currentStep: OnboardingStep = 'REVIEW') =>
    new OnboardingEntity({ id: 'onboarding-id', userId: 'user-id', currentStep, status, draft, version });

describe('CompleteOnboardingUseCase', () => {
    const repository = { findByUserId: vi.fn(), save: vi.fn() };
    const feeds = { createFromOnboarding: vi.fn(), findFeedId: vi.fn() };
    const useCase = new CompleteOnboardingUseCase(
        repository as unknown as OnboardingRepositoryPort,
        feeds as unknown as OnboardingFeedPort,
    );

    beforeEach(() => {
        vi.resetAllMocks();
        feeds.createFromOnboarding.mockResolvedValue({ feedId: 'feed-id' });
    });

    it('claims, creates the feed from the frozen draft, then completes', async () => {
        repository.findByUserId.mockResolvedValue(row('IN_PROGRESS', 2));

        const result = await useCase.execute('user-id', 2);

        expect(repository.save).toHaveBeenCalledTimes(2);
        const [claimed, claimVersion] = repository.save.mock.calls[0];
        const [completed, completeVersion] = repository.save.mock.calls[1];
        expect(claimed).toMatchObject({ status: 'COMPLETING', version: 3 });
        expect(claimVersion).toBe(2);
        expect(completed).toMatchObject({ status: 'COMPLETED', version: 4 });
        expect(completeVersion).toBe(3);
        expect(feeds.createFromOnboarding).toHaveBeenCalledWith({
            userId: 'user-id',
            onboardingId: 'onboarding-id',
            draft,
        });
        expect(repository.save.mock.invocationCallOrder[0]).toBeLessThan(
            feeds.createFromOnboarding.mock.invocationCallOrder[0],
        );
        expect(feeds.createFromOnboarding.mock.invocationCallOrder[0]).toBeLessThan(
            repository.save.mock.invocationCallOrder[1],
        );
        expect(result.feedId).toBe('feed-id');
        expect(result.onboarding).toMatchObject({ status: 'COMPLETED', version: 4 });
    });

    it('a feed failure leaves COMPLETING in place and is rethrown', async () => {
        repository.findByUserId.mockResolvedValue(row('IN_PROGRESS', 2));
        const failure = new Error('cap reached');
        feeds.createFromOnboarding.mockRejectedValue(failure);

        await expect(useCase.execute('user-id', 2)).rejects.toBe(failure);
        expect(repository.save).toHaveBeenCalledTimes(1);
        expect(repository.save.mock.calls[0][0]).toMatchObject({ status: 'COMPLETING' });
    });

    it('continues from COMPLETING without checking the version', async () => {
        repository.findByUserId.mockResolvedValue(row('COMPLETING', 3));

        const result = await useCase.execute('user-id', 0);

        expect(repository.save).toHaveBeenCalledTimes(1);
        expect(repository.save.mock.calls[0][0]).toMatchObject({ status: 'COMPLETED', version: 4 });
        expect(repository.save.mock.calls[0][1]).toBe(3);
        expect(result.feedId).toBe('feed-id');
    });

    it('answers a COMPLETED onboarding with its feed id and writes nothing', async () => {
        repository.findByUserId.mockResolvedValue(row('COMPLETED', 4));
        feeds.findFeedId.mockResolvedValue('feed-id');

        const result = await useCase.execute('user-id', 0);

        expect(result).toMatchObject({ feedId: 'feed-id', onboarding: { status: 'COMPLETED' } });
        expect(feeds.findFeedId).toHaveBeenCalledWith('user-id', 'onboarding-id');
        expect(repository.save).not.toHaveBeenCalled();
        expect(feeds.createFromOnboarding).not.toHaveBeenCalled();
    });

    it('answers a COMPLETED onboarding whose feed was deleted with feedId null and creates nothing', async () => {
        repository.findByUserId.mockResolvedValue(row('COMPLETED', 4));
        feeds.findFeedId.mockResolvedValue(null);

        const result = await useCase.execute('user-id', 0);

        expect(result.feedId).toBeNull();
        expect(feeds.createFromOnboarding).not.toHaveBeenCalled();
    });

    it('rejects a step before REVIEW without writing or creating a feed', async () => {
        repository.findByUserId.mockResolvedValue(row('IN_PROGRESS', 1, 'PREFERENCES'));

        await expect(useCase.execute('user-id', 1)).rejects.toBeInstanceOf(OnboardingStepAheadError);
        expect(repository.save).not.toHaveBeenCalled();
        expect(feeds.createFromOnboarding).not.toHaveBeenCalled();
    });

    it('rejects a user without any onboarding row as a step ahead', async () => {
        repository.findByUserId.mockResolvedValue(null);

        await expect(useCase.execute('user-id', 0)).rejects.toBeInstanceOf(OnboardingStepAheadError);
        expect(feeds.createFromOnboarding).not.toHaveBeenCalled();
    });

    it('rejects a stale version before any feed is created', async () => {
        repository.findByUserId.mockResolvedValue(row('IN_PROGRESS', 2));

        await expect(useCase.execute('user-id', 1)).rejects.toBeInstanceOf(OnboardingVersionConflictError);
        expect(feeds.createFromOnboarding).not.toHaveBeenCalled();
    });

    it('lets the loser of the claim race fail with 409 and create no feed', async () => {
        repository.findByUserId.mockResolvedValue(row('IN_PROGRESS', 2));
        repository.save.mockRejectedValueOnce(new OnboardingVersionConflictError());

        await expect(useCase.execute('user-id', 2)).rejects.toBeInstanceOf(OnboardingVersionConflictError);
        expect(feeds.createFromOnboarding).not.toHaveBeenCalled();
    });

    it('answers 200 when another request finished first', async () => {
        repository.findByUserId
            .mockResolvedValueOnce(row('COMPLETING', 3))
            .mockResolvedValueOnce(row('COMPLETED', 4));
        repository.save.mockRejectedValueOnce(new OnboardingVersionConflictError());

        const result = await useCase.execute('user-id', 0);

        expect(result).toMatchObject({ feedId: 'feed-id', onboarding: { status: 'COMPLETED' } });
    });

    it('rethrows the conflict when the onboarding is still not completed', async () => {
        repository.findByUserId
            .mockResolvedValueOnce(row('COMPLETING', 3))
            .mockResolvedValueOnce(row('COMPLETING', 3));
        repository.save.mockRejectedValueOnce(new OnboardingVersionConflictError());

        await expect(useCase.execute('user-id', 0)).rejects.toBeInstanceOf(OnboardingVersionConflictError);
    });
});
```

- [ ] **Step 2: Write the failing adapter spec** — `src/modules/onboarding/infrastructure/feeds/__tests__/onboarding-feed.adapter.spec.ts`

```ts
import type { OpportunityFeedsService } from '../../../../opportunity-feeds/application/opportunity-feeds.service.js';
import { OnboardingFeedAdapter } from '../onboarding-feed.adapter.js';

describe('OnboardingFeedAdapter', () => {
    const feeds = { createFromOnboarding: vi.fn(), findByOnboardingId: vi.fn() };
    const adapter = new OnboardingFeedAdapter(feeds as unknown as OpportunityFeedsService);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('creates the feed from the draft and returns only its id', async () => {
        feeds.createFromOnboarding.mockResolvedValue({ id: 'feed-id', name: 'AI agents' });
        const draft = {
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
            excludeTerms: [],
        };

        await expect(
            adapter.createFromOnboarding({ userId: 'user-id', onboardingId: 'onboarding-id', draft }),
        ).resolves.toEqual({ feedId: 'feed-id' });
        expect(feeds.createFromOnboarding).toHaveBeenCalledWith({
            userId: 'user-id',
            onboardingId: 'onboarding-id',
            ...draft,
        });
    });

    it('returns the id of the existing feed or null', async () => {
        feeds.findByOnboardingId.mockResolvedValueOnce({ id: 'feed-id' }).mockResolvedValueOnce(null);

        await expect(adapter.findFeedId('user-id', 'onboarding-id')).resolves.toBe('feed-id');
        await expect(adapter.findFeedId('user-id', 'onboarding-id')).resolves.toBeNull();
        expect(feeds.findByOnboardingId).toHaveBeenCalledWith('user-id', 'onboarding-id');
    });
});
```

- [ ] **Step 3: Update the service and controller specs**

In `src/modules/onboarding/application/__tests__/onboarding.service.spec.ts` replace the whole file with:

```ts
import type { CompleteOnboardingUseCase } from '../use-cases/complete-onboarding.use-case.js';
import type { GetOnboardingUseCase } from '../use-cases/get-onboarding.use-case.js';
import type { SaveOnboardingStepUseCase } from '../use-cases/save-onboarding-step.use-case.js';
import { OnboardingService } from '../onboarding.service.js';

describe('OnboardingService', () => {
    const getUseCase = { execute: vi.fn() };
    const saveStepUseCase = { execute: vi.fn() };
    const completeUseCase = { execute: vi.fn() };
    const service = new OnboardingService(
        getUseCase as unknown as GetOnboardingUseCase,
        saveStepUseCase as unknown as SaveOnboardingStepUseCase,
        completeUseCase as unknown as CompleteOnboardingUseCase,
    );

    it('delegates get, saveStep and complete to the use cases', async () => {
        const input = { step: 'INTENT' as const, version: 0, data: { intent: 'x', targetAudience: 'y' } };
        getUseCase.execute.mockResolvedValue('state');
        saveStepUseCase.execute.mockResolvedValue('saved');
        completeUseCase.execute.mockResolvedValue('completed');

        await expect(service.get('user-id')).resolves.toBe('state');
        await expect(service.saveStep('user-id', input)).resolves.toBe('saved');
        await expect(service.complete('user-id', 4)).resolves.toBe('completed');
        expect(getUseCase.execute).toHaveBeenCalledWith('user-id');
        expect(saveStepUseCase.execute).toHaveBeenCalledWith('user-id', input);
        expect(completeUseCase.execute).toHaveBeenCalledWith('user-id', 4);
    });
});
```

In `src/modules/onboarding/presentation/__tests__/onboarding.controller.spec.ts` change `const service = { get: vi.fn(), saveStep: vi.fn() };` to `const service = { get: vi.fn(), saveStep: vi.fn(), complete: vi.fn() };` and add inside the `describe`:

```ts
    it('complete returns the onboarding state with the feed id for the token user', async () => {
        const completed = new OnboardingEntity({
            id: 'onboarding-id',
            userId: 'user-id',
            currentStep: 'REVIEW',
            status: 'COMPLETED',
            draft: { intent: 'Find people asking about AI agents' },
            version: 4,
        });
        service.complete.mockResolvedValue({ onboarding: completed, feedId: 'feed-id' });

        await expect(controller.complete(currentUser, { version: 2 })).resolves.toEqual({
            currentStep: 'REVIEW',
            status: 'COMPLETED',
            version: 4,
            draft: { intent: 'Find people asking about AI agents' },
            feedId: 'feed-id',
        });
        expect(service.complete).toHaveBeenCalledWith('user-id', 2);
    });
```

- [ ] **Step 4: Run the specs to see them fail**

Run: `npx vitest run src/modules/onboarding`
Expected: FAIL, cannot resolve `complete-onboarding.use-case.js`, `onboarding-feed.port.js` and `onboarding-feed.adapter.js`.

- [ ] **Step 5: Write the port and the adapter**

`src/modules/onboarding/domain/ports/onboarding-feed.port.ts`

```ts
import type { CompleteOnboardingDraft } from '../entities/onboarding.entity.js';

export abstract class OnboardingFeedPort {
    abstract createFromOnboarding(input: {
        userId: string;
        onboardingId: string;
        draft: CompleteOnboardingDraft;
    }): Promise<{ feedId: string }>;
    abstract findFeedId(userId: string, onboardingId: string): Promise<string | null>;
}
```

`src/modules/onboarding/infrastructure/feeds/onboarding-feed.adapter.ts`

```ts
import { Injectable } from '@nestjs/common';
import { OpportunityFeedsService } from '../../../opportunity-feeds/application/opportunity-feeds.service.js';
import type { CompleteOnboardingDraft } from '../../domain/entities/onboarding.entity.js';
import { OnboardingFeedPort } from '../../domain/ports/onboarding-feed.port.js';

@Injectable()
export class OnboardingFeedAdapter implements OnboardingFeedPort {
    constructor(private readonly feeds: OpportunityFeedsService) {}

    async createFromOnboarding(input: {
        userId: string;
        onboardingId: string;
        draft: CompleteOnboardingDraft;
    }) {
        const feed = await this.feeds.createFromOnboarding({
            userId: input.userId,
            onboardingId: input.onboardingId,
            ...input.draft,
        });

        return { feedId: feed.id };
    }

    async findFeedId(userId: string, onboardingId: string) {
        const feed = await this.feeds.findByOnboardingId(userId, onboardingId);

        return feed?.id ?? null;
    }
}
```

- [ ] **Step 6: Write the use case** — `src/modules/onboarding/application/use-cases/complete-onboarding.use-case.ts`

```ts
import { Injectable } from '@nestjs/common';
import { OnboardingEntity } from '../../domain/entities/onboarding.entity.js';
import { OnboardingStepAheadError } from '../../domain/errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../../domain/errors/onboarding-version-conflict.error.js';
import { OnboardingFeedPort } from '../../domain/ports/onboarding-feed.port.js';
import { OnboardingRepositoryPort } from '../../domain/ports/onboarding-repository.port.js';

@Injectable()
export class CompleteOnboardingUseCase {
    constructor(
        private readonly repository: OnboardingRepositoryPort,
        private readonly feeds: OnboardingFeedPort,
    ) {}

    async execute(userId: string, version: number) {
        const current = (await this.repository.findByUserId(userId)) ?? OnboardingEntity.initial(userId);

        if (current.status === 'COMPLETED') {
            const feedId = current.id ? await this.feeds.findFeedId(userId, current.id) : null;

            return { onboarding: current, feedId };
        }

        let started = current;

        if (current.status === 'IN_PROGRESS') {
            started = current.startCompleting(version);
            await this.repository.save(started, current.version);
        }

        if (!started.id) throw new OnboardingStepAheadError();

        const { feedId } = await this.feeds.createFromOnboarding({
            userId,
            onboardingId: started.id,
            draft: started.completeDraft(),
        });
        const completed = started.markCompleted();

        try {
            await this.repository.save(completed, started.version);
        } catch (error) {
            if (!(error instanceof OnboardingVersionConflictError)) throw error;

            const latest = await this.repository.findByUserId(userId);

            if (latest?.status !== 'COMPLETED') throw error;

            return { onboarding: latest, feedId };
        }

        return { onboarding: completed, feedId };
    }
}
```

- [ ] **Step 7: Write the DTOs and extend the mapper**

`src/modules/onboarding/presentation/dto/complete-onboarding.dto.ts`

```ts
import { IsInt, Min } from 'class-validator';

export class CompleteOnboardingDto {
    @IsInt()
    @Min(0)
    version: number;
}
```

`src/modules/onboarding/presentation/dto/complete-onboarding-response.dto.ts`

```ts
import { OnboardingResponseDto } from './onboarding-response.dto.js';

export class CompleteOnboardingResponseDto extends OnboardingResponseDto {
    feedId: string | null;
}
```

Replace `src/modules/onboarding/presentation/mappers/onboarding-response.mapper.ts` with:

```ts
import type { OnboardingEntity } from '../../domain/entities/onboarding.entity.js';
import type { CompleteOnboardingResponseDto } from '../dto/complete-onboarding-response.dto.js';
import type { OnboardingResponseDto } from '../dto/onboarding-response.dto.js';

export class OnboardingResponseMapper {
    static toDto(onboarding: OnboardingEntity): OnboardingResponseDto {
        return {
            currentStep: onboarding.currentStep,
            status: onboarding.status,
            version: onboarding.version,
            draft: onboarding.draft,
        };
    }

    static toCompleteDto(onboarding: OnboardingEntity, feedId: string | null): CompleteOnboardingResponseDto {
        return { ...OnboardingResponseMapper.toDto(onboarding), feedId };
    }
}
```

- [ ] **Step 8: Extend the service** — replace `src/modules/onboarding/application/onboarding.service.ts` with:

```ts
import { Injectable } from '@nestjs/common';
import type { SaveOnboardingStepInput } from '../domain/entities/onboarding.entity.js';
import { CompleteOnboardingUseCase } from './use-cases/complete-onboarding.use-case.js';
import { GetOnboardingUseCase } from './use-cases/get-onboarding.use-case.js';
import { SaveOnboardingStepUseCase } from './use-cases/save-onboarding-step.use-case.js';

@Injectable()
export class OnboardingService {
    constructor(
        private readonly getUseCase: GetOnboardingUseCase,
        private readonly saveStepUseCase: SaveOnboardingStepUseCase,
        private readonly completeUseCase: CompleteOnboardingUseCase,
    ) {}

    get(userId: string) {
        return this.getUseCase.execute(userId);
    }

    saveStep(userId: string, input: SaveOnboardingStepInput) {
        return this.saveStepUseCase.execute(userId, input);
    }

    complete(userId: string, version: number) {
        return this.completeUseCase.execute(userId, version);
    }
}
```

- [ ] **Step 9: Add the route** — replace `src/modules/onboarding/presentation/onboarding.controller.ts` with:

```ts
import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { StrictBodyPipe } from '../../../shared/validation/strict-body.pipe.js';
import type { JwtPayload } from '../../auth/domain/jwt-payload.js';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator.js';
import { OnboardingService } from '../application/onboarding.service.js';
import type { SaveOnboardingStepInput } from '../domain/entities/onboarding.entity.js';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto.js';
import { OnboardingResponseMapper } from './mappers/onboarding-response.mapper.js';
import { ParseSaveOnboardingStepPipe } from './pipes/parse-save-onboarding-step.pipe.js';

type CompleteOnboardingInput = { version: number };

@Controller('onboarding')
export class OnboardingController {
    constructor(private readonly onboardingService: OnboardingService) {}

    @Get()
    async get(@CurrentUser() currentUser: JwtPayload) {
        const onboarding = await this.onboardingService.get(currentUser.sub);

        return OnboardingResponseMapper.toDto(onboarding);
    }

    @Patch()
    async saveStep(
        @CurrentUser() currentUser: JwtPayload,
        @Body(ParseSaveOnboardingStepPipe) input: SaveOnboardingStepInput,
    ) {
        const onboarding = await this.onboardingService.saveStep(currentUser.sub, input);

        return OnboardingResponseMapper.toDto(onboarding);
    }

    @Post('complete')
    @HttpCode(HttpStatus.OK)
    async complete(
        @CurrentUser() currentUser: JwtPayload,
        @Body(new StrictBodyPipe(CompleteOnboardingDto)) input: CompleteOnboardingInput,
    ) {
        const { onboarding, feedId } = await this.onboardingService.complete(currentUser.sub, input.version);

        return OnboardingResponseMapper.toCompleteDto(onboarding, feedId);
    }
}
```

- [ ] **Step 10: Wire the module** — replace `src/modules/onboarding/onboarding.module.ts` with:

```ts
import { Module } from '@nestjs/common';
import { OpportunityFeedsModule } from '../opportunity-feeds/opportunity-feeds.module.js';
import { OnboardingService } from './application/onboarding.service.js';
import { CompleteOnboardingUseCase } from './application/use-cases/complete-onboarding.use-case.js';
import { GetOnboardingUseCase } from './application/use-cases/get-onboarding.use-case.js';
import { SaveOnboardingStepUseCase } from './application/use-cases/save-onboarding-step.use-case.js';
import { OnboardingFeedPort } from './domain/ports/onboarding-feed.port.js';
import { OnboardingRepositoryPort } from './domain/ports/onboarding-repository.port.js';
import { OnboardingFeedAdapter } from './infrastructure/feeds/onboarding-feed.adapter.js';
import { OnboardingRepository } from './infrastructure/repositories/onboarding.repository.js';
import { OnboardingController } from './presentation/onboarding.controller.js';

@Module({
    imports: [OpportunityFeedsModule],
    controllers: [OnboardingController],
    providers: [
        { provide: OnboardingRepositoryPort, useClass: OnboardingRepository },
        { provide: OnboardingFeedPort, useClass: OnboardingFeedAdapter },
        GetOnboardingUseCase,
        SaveOnboardingStepUseCase,
        CompleteOnboardingUseCase,
        OnboardingService,
    ],
    exports: [OnboardingService],
})
export class OnboardingModule {}
```

- [ ] **Step 11: Run the specs to see them pass, then type-check and check the layer rule**

```bash
npx vitest run src/modules/onboarding src/modules/opportunity-feeds
npx tsc --noEmit
grep -rn "infrastructure" src/modules/onboarding/application src/modules/opportunity-feeds/application
```

Expected: PASS, `tsc` clean, and the `grep` prints nothing.

- [ ] **Step 12: Write the e2e suite** — `test/onboarding-complete.e2e-spec.ts`

```ts
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

        await call(BASE, cookie, 'PATCH', '/onboarding', { step: 'PREFERENCES', version: 1, data: PREFERENCES });
        const stale = await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 1 });
        expect(stale.status).toBe(409);
        expect(await stale.json()).toMatchObject({ error: 'OnboardingVersionConflictError' });
        expect(await feeds(cookie)).toHaveLength(0);
    });

    it('rejects a body without version or with unknown fields with 400', async () => {
        const { cookie } = await signUp(BASE);

        expect((await call(BASE, cookie, 'POST', '/onboarding/complete', {})).status).toBe(400);
        expect((await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 0, extra: true })).status).toBe(
            400,
        );
        expect((await call(BASE, cookie, 'POST', '/onboarding/complete', { version: '0' })).status).toBe(400);
    });

    it('freezes the draft: PATCH /onboarding is 409 once COMPLETED', async () => {
        const { cookie } = await signUp(BASE);
        await reachReview(cookie);
        await call(BASE, cookie, 'POST', '/onboarding/complete', { version: 2 });

        const res = await call(BASE, cookie, 'PATCH', '/onboarding', { step: 'INTENT', version: 4, data: INTENT });

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
        expect((await call(BASE, cookie, 'PATCH', '/onboarding', { step: 'INTENT', version: 3, data: INTENT })).status).toBe(
            409,
        );

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
            const res = await call(BASE, cookie, 'POST', '/opportunity-feeds', { ...FEED, name: `Feed ${index}` });
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
        ).json()) as { feedId: string };

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
```

- [ ] **Step 13: Format, verify, build**

```bash
npm run format
npm run verify
npm run build
```

Expected: verify green; build succeeds. Start `PORT=3996 node dist/main.js` and check the log maps `{/onboarding/complete, POST}`; then stop it.

- [ ] **Step 14: Run every e2e suite**

Prerequisite as in Task 5 step 15 (a throwaway database with all migrations applied, never the dev database).

```bash
E2E_DATABASE_URL='<scratch url>' npm run test:e2e
```

Expected: PASS: the earlier onboarding suite (7), the feeds suite (10) and this suite (9). The earlier suite is unchanged; if its "PATCH" checks fail on a status value, the `COMPLETING` enum change is the cause.

- [ ] **Step 15: Commit**

```bash
git add src/modules/onboarding test/onboarding-complete.e2e-spec.ts
git commit -m "feat(onboarding): complete onboarding into the first feed" -m "complete claims COMPLETING with the version check, which freezes the draft, then creates the feed idempotently by onboardingId and marks COMPLETED. A failure after the claim leaves COMPLETING and the call is repeatable; onboarding reaches the feeds module through a port and an adapter." -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Close the spec and report

**Files:**
- Modify: `docs/specs/opportunity-feeds.md` (tick the tasks)
- Modify: `docs/architecture.md` (the "Data" paragraph)

- [ ] **Step 1: Update the data paragraph** — in `docs/architecture.md`, section "Data", replace the sentence that lists the models and says only `User` is used by code with:

```
Current models: `User`, `SocialAccount`, `Onboarding`, `OpportunityFeed`, `SearchQuery`, `Opportunity` and the
`OpportunitySearchQuery` join. `SearchQuery` and `Opportunity` are not used by code yet.
```

- [ ] **Step 2: Tick the spec tasks** — in `docs/specs/opportunity-feeds.md` change every `- [ ]` under `## Tasks` to `- [x]` except the last line (the PR), which stays open.

- [ ] **Step 3: Final run**

```bash
npm run verify
```

Expected: green. Record the unit test count and the three e2e suites' results in the final message.

- [ ] **Step 4: Commit**

```bash
git add docs/specs/opportunity-feeds.md docs/architecture.md
git commit -m "docs(opportunity-feeds): close the spec tasks and update the data overview" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Report, do not push** — list the commits, the migrations that need an empty-table check (`OpportunityFeed.targetAudience` NOT NULL without a default), and the open PR question. Open the PR only when the user asks; base it on `feat/onboarding` (PR #6 is not merged).
