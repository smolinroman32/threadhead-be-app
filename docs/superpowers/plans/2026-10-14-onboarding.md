# Onboarding Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `GET /onboarding` and `PATCH /onboarding` that keep a user's onboarding step and draft, with an optimistic lock on `version`.

**Architecture:** New module `src/modules/onboarding` on the project template (domain / application / infrastructure / presentation). All value rules (step order, version check, trimming, term normalization, limits) live in `OnboardingEntity` and `onboarding-draft.ts`, so they are unit tested without Nest. The repository writes with `INSERT` (first save) or `UPDATE ... WHERE version = expected` and turns a lost race into `OnboardingVersionConflictError` (409).

**Tech Stack:** NestJS 12 (ESM, `nodenext`), Prisma 7 on PostgreSQL, class-validator, Vitest.

**Spec:** [docs/specs/onboarding.md](../../specs/onboarding.md)

## Global Constraints

- No comments in code: not `//`, not JSDoc, not `TODO`.
- ESM: relative imports end in `.js`.
- Prettier: 4 spaces, single quotes, trailing commas, `printWidth` 110. Run `npm run format` before each commit.
- Files kebab-case with role suffix; specs in a `__tests__/` folder next to the code.
- The user id comes from the access token (`@CurrentUser()`), never from the URL or body.
- Enums: `OnboardingStatus { IN_PROGRESS, COMPLETED }`, `OnboardingStep { INTENT, PREFERENCES, REVIEW }`; the API uses these exact values.
- Limits: `intent` 10–500, `targetAudience` 3–200, `includeTerms` 1–10 items, `excludeTerms` 0–10 items, each term 2–50 characters, all after trim; terms deduplicated ignoring case (first spelling wins); one term in both lists is 400.
- `version` is the number of successful saves; initial state (no row) is `version: 0`.
- Do not apply migrations, push or open a PR. Do not read or edit `.env`.
- `npm run verify` green before a task is called done.

## Review Focus

- A body or `data` that is not an object (`[]`, `null`, a string) must answer 400, never 500. Test: Task 5 pipe spec.
- `version` sent as `"0"`, `-1` or `1.5` must be 400 (no coercion). Test: Task 5 pipe spec.
- A whitespace-only `intent` passes `@IsString()` but must be 400 after trim. Test: Task 2 draft spec.
- `excludeTerms: null` must be stored as `[]`, not crash. Test: Task 2 draft spec and Task 5 pipe spec.
- A database error other than the `userId` unique violation (for example `P2003` when the user row was deleted while the access token is still valid) must propagate unchanged, not be reported as a version conflict. Test: Task 3 repository spec.

---

### Task 0: Prerequisites (needs the user's go-ahead)

The working tree holds uncommitted schema work that this plan builds on: `prisma/models/onboarding.prisma` (staged and modified), `prisma/models/user.prisma` and `prisma/models/opportunity-feed.prisma` (modified), untracked migrations `20261013184229_add_target_audience_to_opportunity_feed` and `20261013192039_add_onboarding`, and `docs/prd.md` (staged).

- [ ] **Step 1: Create the branch** from the current branch `feat/social-accounts-and-threads` (it carries the `SocialAccount` schema the migrations depend on):

```bash
git switch -c feat/onboarding
```

- [ ] **Step 2: Commit the pending schema work as its own commit**, only after the user confirms it is theirs to commit as is:

```bash
git add docs/prd.md prisma/models/onboarding.prisma prisma/models/user.prisma prisma/models/opportunity-feed.prisma prisma/migrations/20261013184229_add_target_audience_to_opportunity_feed prisma/migrations/20261013192039_add_onboarding
git commit -m "feat(prisma): add the onboarding model and the feed target audience"
```

---

### Task 1: Enums in the schema and the migration

**Files:**
- Modify: `prisma/models/onboarding.prisma`
- Create: `prisma/migrations/20261014120000_onboarding_enums/migration.sql`
- Regenerate: `src/generated/prisma/**` (gitignored)

**Interfaces:**
- Produces: Prisma model `Onboarding` with `currentStep: OnboardingStep`, `status: OnboardingStatus`, `draft: Json`, `version: Int`; client accessor `prisma.onboarding`; types `Onboarding` and `Prisma` from `src/generated/prisma/client.js`.

- [ ] **Step 1: Snapshot the current schema for the diff**

```bash
rm -rf /tmp/onboarding-schema-before && mkdir -p /tmp/onboarding-schema-before && cp prisma/schema.prisma /tmp/onboarding-schema-before/ && cp -R prisma/models /tmp/onboarding-schema-before/models
```

- [ ] **Step 2: Replace `prisma/models/onboarding.prisma`**

```prisma
enum OnboardingStatus {
  IN_PROGRESS
  COMPLETED
}

enum OnboardingStep {
  INTENT
  PREFERENCES
  REVIEW
}

model Onboarding {
  id          String           @id @default(uuid()) @db.Uuid
  userId      String           @unique @db.Uuid
  currentStep OnboardingStep
  status      OnboardingStatus
  draft       Json
  version     Int              @default(1)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  completedAt DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 3: Generate the migration SQL**

```bash
mkdir -p prisma/migrations/20261014120000_onboarding_enums
npx prisma migrate diff --from-schema /tmp/onboarding-schema-before --to-schema prisma --script > prisma/migrations/20261014120000_onboarding_enums/migration.sql
cat prisma/migrations/20261014120000_onboarding_enums/migration.sql
```

Expected: `CREATE TYPE "OnboardingStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');`, `CREATE TYPE "OnboardingStep" AS ENUM ('INTENT', 'PREFERENCES', 'REVIEW');` and an `ALTER TABLE "Onboarding"` that changes `currentStep` and `status` (Prisma may drop and re-add the columns; that is accepted by the spec because no code writes to the table yet). Nothing else. If other tables appear in the diff, stop: the snapshot was not the committed schema.

- [ ] **Step 4: Regenerate the client and type-check**

```bash
npx prisma generate
npx tsc --noEmit
```

Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add prisma/models/onboarding.prisma prisma/migrations/20261014120000_onboarding_enums
git commit -m "feat(prisma): store the onboarding step and status as enums" -m "The table has no writer yet. If the generated SQL drops and re-adds the columns, existing values are lost; check that \"Onboarding\" is empty before applying."
```

---

### Task 2: Domain — entity, draft rules, errors, repository port

**Files:**
- Create: `src/modules/onboarding/domain/entities/onboarding.entity.ts`
- Create: `src/modules/onboarding/domain/entities/onboarding-draft.ts`
- Create: `src/modules/onboarding/domain/errors/onboarding-step-ahead.error.ts`
- Create: `src/modules/onboarding/domain/errors/onboarding-version-conflict.error.ts`
- Create: `src/modules/onboarding/domain/errors/onboarding-draft-invalid.error.ts`
- Create: `src/modules/onboarding/domain/ports/onboarding-repository.port.ts`
- Test: `src/modules/onboarding/domain/entities/__tests__/onboarding.entity.spec.ts`
- Test: `src/modules/onboarding/domain/entities/__tests__/onboarding-draft.spec.ts`

**Interfaces:**
- Consumes: `DomainError` from `src/shared/errors/domain.error.ts` (`abstract kind: 'not_found' | 'conflict' | 'validation' | 'unauthorized' | 'forbidden'`).
- Produces:
  - `ONBOARDING_STEPS = ['INTENT', 'PREFERENCES', 'REVIEW'] as const`, `type OnboardingStep`, `type EditableOnboardingStep = 'INTENT' | 'PREFERENCES'`, `type OnboardingStatus = 'IN_PROGRESS' | 'COMPLETED'`
  - `type OnboardingDraft = { intent?: string; targetAudience?: string; includeTerms?: string[]; excludeTerms?: string[] }`
  - `type IntentStepData = { intent: string; targetAudience: string }`, `type PreferencesStepData = { includeTerms: string[]; excludeTerms?: string[] | null }`
  - `type SaveOnboardingStepInput = { version: number } & ({ step: 'INTENT'; data: IntentStepData } | { step: 'PREFERENCES'; data: PreferencesStepData })`
  - `class OnboardingEntity` with `static initial(userId: string): OnboardingEntity`, getters `userId`, `currentStep`, `status`, `draft`, `version`, and `saveStep(input: SaveOnboardingStepInput): OnboardingEntity`
  - `normalizeIntentStep(data: IntentStepData): OnboardingDraft`, `normalizePreferencesStep(data: PreferencesStepData): OnboardingDraft`
  - `OnboardingStepAheadError` (`conflict`), `OnboardingVersionConflictError` (`conflict`), `OnboardingDraftInvalidError(message)` (`validation`)
  - `abstract class OnboardingRepositoryPort { findByUserId(userId: string): Promise<OnboardingEntity | null>; save(onboarding: OnboardingEntity, expectedVersion: number): Promise<void> }`

- [ ] **Step 1: Write the failing draft spec** — `src/modules/onboarding/domain/entities/__tests__/onboarding-draft.spec.ts`

```ts
import { OnboardingDraftInvalidError } from '../../errors/onboarding-draft-invalid.error.js';
import { normalizeIntentStep, normalizePreferencesStep } from '../onboarding-draft.js';

const text = (length: number) => 'x'.repeat(length);

describe('normalizeIntentStep', () => {
    it('trims both fields', () => {
        expect(normalizeIntentStep({ intent: `  ${text(10)}  `, targetAudience: ' founders ' })).toEqual({
            intent: text(10),
            targetAudience: 'founders',
        });
    });

    it.each([
        ['intent too short', { intent: text(9), targetAudience: 'founders' }],
        ['intent too long', { intent: text(501), targetAudience: 'founders' }],
        ['intent only whitespace', { intent: ' '.repeat(20), targetAudience: 'founders' }],
        ['targetAudience too short', { intent: text(10), targetAudience: 'ab' }],
        ['targetAudience too long', { intent: text(10), targetAudience: text(201) }],
    ])('rejects %s', (_case, data) => {
        expect(() => normalizeIntentStep(data)).toThrow(OnboardingDraftInvalidError);
    });

    it('accepts the exact bounds', () => {
        expect(() => normalizeIntentStep({ intent: text(500), targetAudience: text(3) })).not.toThrow();
        expect(() => normalizeIntentStep({ intent: text(10), targetAudience: text(200) })).not.toThrow();
    });
});

describe('normalizePreferencesStep', () => {
    it('trims, drops empty items and collapses duplicates ignoring case, keeping the first spelling', () => {
        expect(
            normalizePreferencesStep({
                includeTerms: ['  AI agents ', '', '   ', 'ai AGENTS', 'undo'],
                excludeTerms: [' Crypto', 'crypto'],
            }),
        ).toEqual({ includeTerms: ['AI agents', 'undo'], excludeTerms: ['Crypto'] });
    });

    it('stores a missing or null excludeTerms as an empty list', () => {
        expect(normalizePreferencesStep({ includeTerms: ['ai'] })).toEqual({
            includeTerms: ['ai'],
            excludeTerms: [],
        });
        expect(normalizePreferencesStep({ includeTerms: ['ai'], excludeTerms: null })).toEqual({
            includeTerms: ['ai'],
            excludeTerms: [],
        });
    });

    it('counts terms after deduplication', () => {
        const ten = Array.from({ length: 10 }, (_, index) => `term ${index}`);

        expect(normalizePreferencesStep({ includeTerms: [...ten, 'TERM 0', 'term 1'] }).includeTerms).toEqual(ten);
    });

    it.each([
        ['includeTerms empty', { includeTerms: [] }],
        ['includeTerms empty after trimming', { includeTerms: ['  ', ''] }],
        ['more than 10 includeTerms', { includeTerms: Array.from({ length: 11 }, (_, index) => `term ${index}`) }],
        [
            'more than 10 excludeTerms',
            { includeTerms: ['ai'], excludeTerms: Array.from({ length: 11 }, (_, index) => `term ${index}`) },
        ],
        ['a term shorter than 2', { includeTerms: ['a'] }],
        ['a term longer than 50', { includeTerms: [text(51)] }],
        ['a term in both lists ignoring case', { includeTerms: ['AI agents'], excludeTerms: ['ai agents'] }],
    ])('rejects %s', (_case, data) => {
        expect(() => normalizePreferencesStep(data)).toThrow(OnboardingDraftInvalidError);
    });
});
```

- [ ] **Step 2: Write the failing entity spec** — `src/modules/onboarding/domain/entities/__tests__/onboarding.entity.spec.ts`

```ts
import { OnboardingStepAheadError } from '../../errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../../errors/onboarding-version-conflict.error.js';
import { OnboardingEntity, type OnboardingDraft, type OnboardingStep } from '../onboarding.entity.js';

const intent = { intent: 'Find people asking about AI agents', targetAudience: 'Small team founders' };
const preferences = { includeTerms: ['ai agents'], excludeTerms: ['crypto'] };

const at = (currentStep: OnboardingStep, version: number, draft: OnboardingDraft = {}) =>
    new OnboardingEntity({ userId: 'user-id', currentStep, status: 'IN_PROGRESS', draft, version });

describe('OnboardingEntity', () => {
    it('starts on INTENT with an empty draft and version 0', () => {
        expect(OnboardingEntity.initial('user-id')).toMatchObject({
            userId: 'user-id',
            currentStep: 'INTENT',
            status: 'IN_PROGRESS',
            draft: {},
            version: 0,
        });
    });

    it('saving the current step stores it, advances the step and increments the version', () => {
        const next = OnboardingEntity.initial('user-id').saveStep({ step: 'INTENT', version: 0, data: intent });

        expect(next).toMatchObject({ currentStep: 'PREFERENCES', draft: intent, version: 1 });
    });

    it('saving PREFERENCES moves to REVIEW and keeps the intent fields', () => {
        const next = at('PREFERENCES', 1, intent).saveStep({ step: 'PREFERENCES', version: 1, data: preferences });

        expect(next).toMatchObject({ currentStep: 'REVIEW', draft: { ...intent, ...preferences }, version: 2 });
    });

    it('saving an earlier step overwrites only its fields and keeps the current step', () => {
        const changed = { intent: 'Find people comparing agent frameworks', targetAudience: 'CTOs' };

        const next = at('REVIEW', 2, { ...intent, ...preferences }).saveStep({
            step: 'INTENT',
            version: 2,
            data: changed,
        });

        expect(next).toMatchObject({ currentStep: 'REVIEW', draft: { ...changed, ...preferences }, version: 3 });
    });

    it('rejects a step ahead of the current one', () => {
        expect(() =>
            OnboardingEntity.initial('user-id').saveStep({ step: 'PREFERENCES', version: 0, data: preferences }),
        ).toThrow(OnboardingStepAheadError);
    });

    it('rejects a stale version before it checks the step order', () => {
        expect(() => at('INTENT', 1).saveStep({ step: 'PREFERENCES', version: 0, data: preferences })).toThrow(
            OnboardingVersionConflictError,
        );
    });

    it('does not change the entity it was called on', () => {
        const initial = OnboardingEntity.initial('user-id');

        initial.saveStep({ step: 'INTENT', version: 0, data: intent });

        expect(initial).toMatchObject({ currentStep: 'INTENT', draft: {}, version: 0 });
    });
});
```

- [ ] **Step 3: Run the specs to see them fail**

Run: `npx vitest run src/modules/onboarding/domain`
Expected: FAIL, cannot resolve `../onboarding-draft.js` and `../onboarding.entity.js`.

- [ ] **Step 4: Write the errors**

`src/modules/onboarding/domain/errors/onboarding-step-ahead.error.ts`

```ts
import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OnboardingStepAheadError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('Save the current onboarding step first.');
    }
}
```

`src/modules/onboarding/domain/errors/onboarding-version-conflict.error.ts`

```ts
import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OnboardingVersionConflictError extends DomainError {
    readonly kind = 'conflict';

    constructor() {
        super('Onboarding changed since it was read. Load it again and retry.');
    }
}
```

`src/modules/onboarding/domain/errors/onboarding-draft-invalid.error.ts`

```ts
import { DomainError } from '../../../../shared/errors/domain.error.js';

export class OnboardingDraftInvalidError extends DomainError {
    readonly kind = 'validation';
}
```

- [ ] **Step 5: Write the draft rules** — `src/modules/onboarding/domain/entities/onboarding-draft.ts`

```ts
import { OnboardingDraftInvalidError } from '../errors/onboarding-draft-invalid.error.js';
import type { IntentStepData, OnboardingDraft, PreferencesStepData } from './onboarding.entity.js';

const MAX_TERMS = 10;
const TERM_MIN_LENGTH = 2;
const TERM_MAX_LENGTH = 50;

export function normalizeIntentStep(data: IntentStepData): OnboardingDraft {
    return {
        intent: requireText('intent', data.intent, 10, 500),
        targetAudience: requireText('targetAudience', data.targetAudience, 3, 200),
    };
}

export function normalizePreferencesStep(data: PreferencesStepData): OnboardingDraft {
    const includeTerms = normalizeTerms('includeTerms', data.includeTerms);
    const excludeTerms = normalizeTerms('excludeTerms', data.excludeTerms ?? []);

    if (includeTerms.length === 0) {
        throw new OnboardingDraftInvalidError('includeTerms must contain at least one term.');
    }

    const included = new Set(includeTerms.map((term) => term.toLowerCase()));
    const overlap = excludeTerms.find((term) => included.has(term.toLowerCase()));

    if (overlap) {
        throw new OnboardingDraftInvalidError(`"${overlap}" cannot be both included and excluded.`);
    }

    return { includeTerms, excludeTerms };
}

function requireText(field: string, value: string, min: number, max: number) {
    const text = value.trim();

    if (text.length < min || text.length > max) {
        throw new OnboardingDraftInvalidError(`${field} must be ${min} to ${max} characters.`);
    }

    return text;
}

function normalizeTerms(field: string, terms: string[]) {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const raw of terms) {
        const term = raw.trim();
        const key = term.toLowerCase();

        if (!term || seen.has(key)) continue;

        if (term.length < TERM_MIN_LENGTH || term.length > TERM_MAX_LENGTH) {
            throw new OnboardingDraftInvalidError(
                `Each ${field} item must be ${TERM_MIN_LENGTH} to ${TERM_MAX_LENGTH} characters.`,
            );
        }

        seen.add(key);
        result.push(term);
    }

    if (result.length > MAX_TERMS) {
        throw new OnboardingDraftInvalidError(`${field} can hold at most ${MAX_TERMS} terms.`);
    }

    return result;
}
```

- [ ] **Step 6: Write the entity** — `src/modules/onboarding/domain/entities/onboarding.entity.ts`

```ts
import { OnboardingStepAheadError } from '../errors/onboarding-step-ahead.error.js';
import { OnboardingVersionConflictError } from '../errors/onboarding-version-conflict.error.js';
import { normalizeIntentStep, normalizePreferencesStep } from './onboarding-draft.js';

export const ONBOARDING_STEPS = ['INTENT', 'PREFERENCES', 'REVIEW'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type EditableOnboardingStep = Exclude<OnboardingStep, 'REVIEW'>;
export type OnboardingStatus = 'IN_PROGRESS' | 'COMPLETED';

export type OnboardingDraft = {
    intent?: string;
    targetAudience?: string;
    includeTerms?: string[];
    excludeTerms?: string[];
};

export type IntentStepData = { intent: string; targetAudience: string };
export type PreferencesStepData = { includeTerms: string[]; excludeTerms?: string[] | null };

export type SaveOnboardingStepInput = { version: number } & (
    | { step: 'INTENT'; data: IntentStepData }
    | { step: 'PREFERENCES'; data: PreferencesStepData }
);

export interface OnboardingProps {
    userId: string;
    currentStep: OnboardingStep;
    status: OnboardingStatus;
    draft: OnboardingDraft;
    version: number;
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

    saveStep(input: SaveOnboardingStepInput) {
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
}
```

- [ ] **Step 7: Write the repository port** — `src/modules/onboarding/domain/ports/onboarding-repository.port.ts`

```ts
import type { OnboardingEntity } from '../entities/onboarding.entity.js';

export abstract class OnboardingRepositoryPort {
    abstract findByUserId(userId: string): Promise<OnboardingEntity | null>;
    abstract save(onboarding: OnboardingEntity, expectedVersion: number): Promise<void>;
}
```

- [ ] **Step 8: Run the specs to see them pass**

Run: `npx vitest run src/modules/onboarding/domain`
Expected: PASS, all tests.

- [ ] **Step 9: Format, verify, commit**

```bash
npm run format
npm run verify
git add src/modules/onboarding/domain
git commit -m "feat(onboarding): add the onboarding entity, draft rules and errors"
```

---

### Task 3: Infrastructure — mapper and repository

**Files:**
- Create: `src/modules/onboarding/infrastructure/mappers/onboarding.mapper.ts`
- Create: `src/modules/onboarding/infrastructure/repositories/onboarding.repository.ts`
- Test: `src/modules/onboarding/infrastructure/repositories/__tests__/onboarding.repository.spec.ts`

**Interfaces:**
- Consumes: `OnboardingEntity`, `OnboardingDraft`, `OnboardingVersionConflictError`, `OnboardingRepositoryPort` (Task 2); `PrismaService` (`src/shared/prisma.service.ts`); `Onboarding`, `Prisma` from `src/generated/prisma/client.js` (Task 1).
- Produces: `OnboardingRepository implements OnboardingRepositoryPort`; `OnboardingMapper.toDomain(raw: Onboarding): OnboardingEntity`.

- [ ] **Step 1: Write the failing repository spec**

```ts
import { Prisma } from '../../../../../generated/prisma/client.js';
import type { PrismaService } from '../../../../../shared/prisma.service.js';
import { OnboardingEntity } from '../../../domain/entities/onboarding.entity.js';
import { OnboardingVersionConflictError } from '../../../domain/errors/onboarding-version-conflict.error.js';
import { OnboardingRepository } from '../onboarding.repository.js';

const row = {
    id: 'onboarding-id',
    userId: 'user-id',
    currentStep: 'PREFERENCES' as const,
    status: 'IN_PROGRESS' as const,
    draft: { intent: 'Find people asking about AI agents', targetAudience: 'Founders' },
    version: 1,
    createdAt: new Date('2026-10-14'),
    updatedAt: new Date('2026-10-14'),
    completedAt: null,
};

const entity = (version: number) =>
    new OnboardingEntity({
        userId: 'user-id',
        currentStep: 'PREFERENCES',
        status: 'IN_PROGRESS',
        draft: row.draft,
        version,
    });

const knownError = (code: string) =>
    new Prisma.PrismaClientKnownRequestError('database error', { code, clientVersion: 'test' });

describe('OnboardingRepository', () => {
    const onboarding = { findUnique: vi.fn(), create: vi.fn(), updateMany: vi.fn() };
    const repository = new OnboardingRepository({ onboarding } as unknown as PrismaService);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('maps the row of the user to an entity', async () => {
        onboarding.findUnique.mockResolvedValue(row);

        const found = await repository.findByUserId('user-id');

        expect(onboarding.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-id' } });
        expect(found).toBeInstanceOf(OnboardingEntity);
        expect(found).toMatchObject({ userId: 'user-id', currentStep: 'PREFERENCES', draft: row.draft, version: 1 });
    });

    it('returns null when the user has no row', async () => {
        onboarding.findUnique.mockResolvedValue(null);

        await expect(repository.findByUserId('user-id')).resolves.toBeNull();
    });

    it('inserts the first save', async () => {
        onboarding.create.mockResolvedValue(row);

        await repository.save(entity(1), 0);

        expect(onboarding.create).toHaveBeenCalledWith({
            data: {
                userId: 'user-id',
                currentStep: 'PREFERENCES',
                status: 'IN_PROGRESS',
                draft: row.draft,
                version: 1,
            },
        });
        expect(onboarding.updateMany).not.toHaveBeenCalled();
    });

    it('reports a lost first-insert race as a version conflict', async () => {
        onboarding.create.mockRejectedValue(knownError('P2002'));

        await expect(repository.save(entity(1), 0)).rejects.toBeInstanceOf(OnboardingVersionConflictError);
    });

    it('lets any other insert error through unchanged', async () => {
        const failure = knownError('P2003');
        onboarding.create.mockRejectedValue(failure);

        await expect(repository.save(entity(1), 0)).rejects.toBe(failure);
    });

    it('updates only the row with the expected version', async () => {
        onboarding.updateMany.mockResolvedValue({ count: 1 });

        await repository.save(entity(3), 2);

        expect(onboarding.updateMany).toHaveBeenCalledWith({
            where: { userId: 'user-id', version: 2 },
            data: { currentStep: 'PREFERENCES', status: 'IN_PROGRESS', draft: row.draft, version: 3 },
        });
        expect(onboarding.create).not.toHaveBeenCalled();
    });

    it('reports a version conflict when no row had the expected version', async () => {
        onboarding.updateMany.mockResolvedValue({ count: 0 });

        await expect(repository.save(entity(3), 2)).rejects.toBeInstanceOf(OnboardingVersionConflictError);
    });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/modules/onboarding/infrastructure`
Expected: FAIL, cannot resolve `../onboarding.repository.js`.

- [ ] **Step 3: Write the mapper** — `src/modules/onboarding/infrastructure/mappers/onboarding.mapper.ts`

```ts
import type { Onboarding } from '../../../../generated/prisma/client.js';
import { OnboardingEntity, type OnboardingDraft } from '../../domain/entities/onboarding.entity.js';

export class OnboardingMapper {
    static toDomain(raw: Onboarding): OnboardingEntity {
        return new OnboardingEntity({
            userId: raw.userId,
            currentStep: raw.currentStep,
            status: raw.status,
            draft: raw.draft as OnboardingDraft,
            version: raw.version,
        });
    }
}
```

- [ ] **Step 4: Write the repository** — `src/modules/onboarding/infrastructure/repositories/onboarding.repository.ts`

```ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../shared/prisma.service.js';
import type { OnboardingEntity } from '../../domain/entities/onboarding.entity.js';
import { OnboardingVersionConflictError } from '../../domain/errors/onboarding-version-conflict.error.js';
import { OnboardingRepositoryPort } from '../../domain/ports/onboarding-repository.port.js';
import { OnboardingMapper } from '../mappers/onboarding.mapper.js';

@Injectable()
export class OnboardingRepository implements OnboardingRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async findByUserId(userId: string) {
        const row = await this.prisma.onboarding.findUnique({ where: { userId } });

        return row && OnboardingMapper.toDomain(row);
    }

    async save(onboarding: OnboardingEntity, expectedVersion: number) {
        const data = {
            currentStep: onboarding.currentStep,
            status: onboarding.status,
            draft: onboarding.draft,
            version: onboarding.version,
        };

        if (expectedVersion === 0) {
            await this.prisma.onboarding
                .create({ data: { userId: onboarding.userId, ...data } })
                .catch((error: unknown) => {
                    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                        throw new OnboardingVersionConflictError();
                    }

                    throw error;
                });

            return;
        }

        const { count } = await this.prisma.onboarding.updateMany({
            where: { userId: onboarding.userId, version: expectedVersion },
            data,
        });

        if (count === 0) throw new OnboardingVersionConflictError();
    }
}
```

If `tsc` rejects `draft: onboarding.draft` as a Prisma JSON input, change only that line to `draft: onboarding.draft as Prisma.InputJsonObject`. If it rejects the mapper cast, use `raw.draft as unknown as OnboardingDraft`.

- [ ] **Step 5: Run it to see it pass**

Run: `npx vitest run src/modules/onboarding/infrastructure`
Expected: PASS.

- [ ] **Step 6: Format, verify, commit**

```bash
npm run format
npm run verify
git add src/modules/onboarding/infrastructure
git commit -m "feat(onboarding): add the repository with a version-checked write" -m "A unique violation on the first insert means a parallel request saved first, so it is reported as the same version conflict as a failed conditional update."
```

---

### Task 4: Application — use cases and facade

**Files:**
- Create: `src/modules/onboarding/application/use-cases/get-onboarding.use-case.ts`
- Create: `src/modules/onboarding/application/use-cases/save-onboarding-step.use-case.ts`
- Create: `src/modules/onboarding/application/onboarding.service.ts`
- Test: `src/modules/onboarding/application/use-cases/__tests__/get-onboarding.use-case.spec.ts`
- Test: `src/modules/onboarding/application/use-cases/__tests__/save-onboarding-step.use-case.spec.ts`
- Test: `src/modules/onboarding/application/__tests__/onboarding.service.spec.ts`

**Interfaces:**
- Consumes: `OnboardingEntity`, `SaveOnboardingStepInput`, `OnboardingRepositoryPort` (Task 2).
- Produces: `GetOnboardingUseCase.execute(userId: string): Promise<OnboardingEntity>`; `SaveOnboardingStepUseCase.execute(userId: string, input: SaveOnboardingStepInput): Promise<OnboardingEntity>`; `OnboardingService.get(userId)`, `OnboardingService.saveStep(userId, input)` with the same return types.

- [ ] **Step 1: Write the failing specs**

`src/modules/onboarding/application/use-cases/__tests__/get-onboarding.use-case.spec.ts`

```ts
import { OnboardingEntity } from '../../../domain/entities/onboarding.entity.js';
import type { OnboardingRepositoryPort } from '../../../domain/ports/onboarding-repository.port.js';
import { GetOnboardingUseCase } from '../get-onboarding.use-case.js';

describe('GetOnboardingUseCase', () => {
    const repository = { findByUserId: vi.fn(), save: vi.fn() };
    const useCase = new GetOnboardingUseCase(repository as unknown as OnboardingRepositoryPort);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns the stored onboarding', async () => {
        const stored = OnboardingEntity.initial('user-id');
        repository.findByUserId.mockResolvedValue(stored);

        await expect(useCase.execute('user-id')).resolves.toBe(stored);
        expect(repository.findByUserId).toHaveBeenCalledWith('user-id');
    });

    it('returns the initial state without saving when the user has no row', async () => {
        repository.findByUserId.mockResolvedValue(null);

        await expect(useCase.execute('user-id')).resolves.toMatchObject({ currentStep: 'INTENT', version: 0 });
        expect(repository.save).not.toHaveBeenCalled();
    });
});
```

`src/modules/onboarding/application/use-cases/__tests__/save-onboarding-step.use-case.spec.ts`

```ts
import { OnboardingEntity } from '../../../domain/entities/onboarding.entity.js';
import { OnboardingStepAheadError } from '../../../domain/errors/onboarding-step-ahead.error.js';
import type { OnboardingRepositoryPort } from '../../../domain/ports/onboarding-repository.port.js';
import { SaveOnboardingStepUseCase } from '../save-onboarding-step.use-case.js';

const intent = { intent: 'Find people asking about AI agents', targetAudience: 'Founders' };

describe('SaveOnboardingStepUseCase', () => {
    const repository = { findByUserId: vi.fn(), save: vi.fn() };
    const useCase = new SaveOnboardingStepUseCase(repository as unknown as OnboardingRepositoryPort);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('saves the first step from the initial state with expected version 0', async () => {
        repository.findByUserId.mockResolvedValue(null);

        const saved = await useCase.execute('user-id', { step: 'INTENT', version: 0, data: intent });

        expect(saved).toMatchObject({ userId: 'user-id', currentStep: 'PREFERENCES', version: 1 });
        expect(repository.save).toHaveBeenCalledWith(saved, 0);
    });

    it('saves with the version it read', async () => {
        const stored = new OnboardingEntity({
            userId: 'user-id',
            currentStep: 'REVIEW',
            status: 'IN_PROGRESS',
            draft: intent,
            version: 3,
        });
        repository.findByUserId.mockResolvedValue(stored);

        const saved = await useCase.execute('user-id', { step: 'INTENT', version: 3, data: intent });

        expect(repository.save).toHaveBeenCalledWith(saved, 3);
        expect(saved.version).toBe(4);
    });

    it('does not save when the entity rejects the step', async () => {
        repository.findByUserId.mockResolvedValue(null);

        await expect(
            useCase.execute('user-id', { step: 'PREFERENCES', version: 0, data: { includeTerms: ['ai'] } }),
        ).rejects.toBeInstanceOf(OnboardingStepAheadError);
        expect(repository.save).not.toHaveBeenCalled();
    });
});
```

`src/modules/onboarding/application/__tests__/onboarding.service.spec.ts`

```ts
import type { GetOnboardingUseCase } from '../use-cases/get-onboarding.use-case.js';
import type { SaveOnboardingStepUseCase } from '../use-cases/save-onboarding-step.use-case.js';
import { OnboardingService } from '../onboarding.service.js';

describe('OnboardingService', () => {
    const getUseCase = { execute: vi.fn() };
    const saveStepUseCase = { execute: vi.fn() };
    const service = new OnboardingService(
        getUseCase as unknown as GetOnboardingUseCase,
        saveStepUseCase as unknown as SaveOnboardingStepUseCase,
    );

    it('delegates get and saveStep to the use cases', async () => {
        const input = { step: 'INTENT' as const, version: 0, data: { intent: 'x', targetAudience: 'y' } };
        getUseCase.execute.mockResolvedValue('state');
        saveStepUseCase.execute.mockResolvedValue('saved');

        await expect(service.get('user-id')).resolves.toBe('state');
        await expect(service.saveStep('user-id', input)).resolves.toBe('saved');
        expect(getUseCase.execute).toHaveBeenCalledWith('user-id');
        expect(saveStepUseCase.execute).toHaveBeenCalledWith('user-id', input);
    });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run src/modules/onboarding/application`
Expected: FAIL, cannot resolve the use case and service files.

- [ ] **Step 3: Write the use cases and the facade**

`src/modules/onboarding/application/use-cases/get-onboarding.use-case.ts`

```ts
import { Injectable } from '@nestjs/common';
import { OnboardingEntity } from '../../domain/entities/onboarding.entity.js';
import { OnboardingRepositoryPort } from '../../domain/ports/onboarding-repository.port.js';

@Injectable()
export class GetOnboardingUseCase {
    constructor(private readonly repository: OnboardingRepositoryPort) {}

    async execute(userId: string) {
        return (await this.repository.findByUserId(userId)) ?? OnboardingEntity.initial(userId);
    }
}
```

`src/modules/onboarding/application/use-cases/save-onboarding-step.use-case.ts`

```ts
import { Injectable } from '@nestjs/common';
import { OnboardingEntity, type SaveOnboardingStepInput } from '../../domain/entities/onboarding.entity.js';
import { OnboardingRepositoryPort } from '../../domain/ports/onboarding-repository.port.js';

@Injectable()
export class SaveOnboardingStepUseCase {
    constructor(private readonly repository: OnboardingRepositoryPort) {}

    async execute(userId: string, input: SaveOnboardingStepInput) {
        const current = (await this.repository.findByUserId(userId)) ?? OnboardingEntity.initial(userId);
        const next = current.saveStep(input);

        await this.repository.save(next, current.version);

        return next;
    }
}
```

`src/modules/onboarding/application/onboarding.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import type { SaveOnboardingStepInput } from '../domain/entities/onboarding.entity.js';
import { GetOnboardingUseCase } from './use-cases/get-onboarding.use-case.js';
import { SaveOnboardingStepUseCase } from './use-cases/save-onboarding-step.use-case.js';

@Injectable()
export class OnboardingService {
    constructor(
        private readonly getUseCase: GetOnboardingUseCase,
        private readonly saveStepUseCase: SaveOnboardingStepUseCase,
    ) {}

    get(userId: string) {
        return this.getUseCase.execute(userId);
    }

    saveStep(userId: string, input: SaveOnboardingStepInput) {
        return this.saveStepUseCase.execute(userId, input);
    }
}
```

The port and the use cases are imported as values (not `import type`) in constructors, so Nest's `emitDecoratorMetadata` sees the class token.

- [ ] **Step 4: Run them to see them pass**

Run: `npx vitest run src/modules/onboarding/application`
Expected: PASS.

- [ ] **Step 5: Confirm the layer rule**

Run: `grep -rn "infrastructure" src/modules/onboarding/application`
Expected: no output.

- [ ] **Step 6: Format, verify, commit**

```bash
npm run format
npm run verify
git add src/modules/onboarding/application
git commit -m "feat(onboarding): add the get and save step use cases"
```

---

### Task 5: Presentation and wiring — DTOs, pipe, controller, module

**Files:**
- Create: `src/modules/onboarding/presentation/dto/save-onboarding-step.dto.ts`
- Create: `src/modules/onboarding/presentation/dto/intent-step.dto.ts`
- Create: `src/modules/onboarding/presentation/dto/preferences-step.dto.ts`
- Create: `src/modules/onboarding/presentation/dto/onboarding-response.dto.ts`
- Create: `src/modules/onboarding/presentation/mappers/onboarding-response.mapper.ts`
- Create: `src/modules/onboarding/presentation/pipes/parse-save-onboarding-step.pipe.ts`
- Create: `src/modules/onboarding/presentation/onboarding.controller.ts`
- Create: `src/modules/onboarding/onboarding.module.ts`
- Modify: `src/app.module.ts`
- Test: `src/modules/onboarding/presentation/pipes/__tests__/parse-save-onboarding-step.pipe.spec.ts`
- Test: `src/modules/onboarding/presentation/__tests__/onboarding.controller.spec.ts`

**Interfaces:**
- Consumes: `OnboardingService` (Task 4); `OnboardingEntity`, `SaveOnboardingStepInput`, `OnboardingStep`, `OnboardingStatus`, `OnboardingDraft`, `EditableOnboardingStep`, `OnboardingRepositoryPort` (Task 2); `OnboardingRepository` (Task 3); `CurrentUser` from `src/modules/auth/presentation/decorators/current-user.decorator.ts`; `JwtPayload` from `src/modules/auth/domain/jwt-payload.ts`.
- Produces: routes `GET /onboarding`, `PATCH /onboarding`; `OnboardingModule` exporting `OnboardingService`; response body `{ currentStep, status, version, draft }`.

Why a pipe: the global `ValidationPipe` in `src/main.ts` uses `whitelist: true` without `forbidNonWhitelisted`, which would silently strip unknown fields. The `@Body()` parameter is typed with the union `SaveOnboardingStepInput`, so its metatype is `Object` and the global pipe skips it (`toValidate` returns false for `Object`). `ParseSaveOnboardingStepPipe` then validates the outer body and the step's `data` with a strict `ValidationPipe`, choosing the DTO by `step`.

- [ ] **Step 1: Write the failing pipe spec** — `src/modules/onboarding/presentation/pipes/__tests__/parse-save-onboarding-step.pipe.spec.ts`

```ts
import { BadRequestException } from '@nestjs/common';
import { ParseSaveOnboardingStepPipe } from '../parse-save-onboarding-step.pipe.js';

const intent = { intent: 'Find people asking about AI agents', targetAudience: 'Founders' };

describe('ParseSaveOnboardingStepPipe', () => {
    const pipe = new ParseSaveOnboardingStepPipe();

    it('accepts an INTENT step', async () => {
        await expect(pipe.transform({ step: 'INTENT', version: 0, data: intent })).resolves.toEqual({
            step: 'INTENT',
            version: 0,
            data: intent,
        });
    });

    it('accepts a PREFERENCES step with or without excludeTerms', async () => {
        await expect(
            pipe.transform({ step: 'PREFERENCES', version: 1, data: { includeTerms: ['ai'], excludeTerms: ['x y'] } }),
        ).resolves.toMatchObject({ data: { includeTerms: ['ai'], excludeTerms: ['x y'] } });
        await expect(
            pipe.transform({ step: 'PREFERENCES', version: 1, data: { includeTerms: ['ai'] } }),
        ).resolves.toMatchObject({ data: { includeTerms: ['ai'] } });
        await expect(
            pipe.transform({ step: 'PREFERENCES', version: 1, data: { includeTerms: ['ai'], excludeTerms: null } }),
        ).resolves.toMatchObject({ data: { includeTerms: ['ai'] } });
    });

    it.each([
        ['an array body', []],
        ['a null body', null],
        ['step REVIEW', { step: 'REVIEW', version: 0, data: {} }],
        ['an unknown step', { step: 'DONE', version: 0, data: intent }],
        ['a missing version', { step: 'INTENT', data: intent }],
        ['a string version', { step: 'INTENT', version: '0', data: intent }],
        ['a negative version', { step: 'INTENT', version: -1, data: intent }],
        ['a fractional version', { step: 'INTENT', version: 1.5, data: intent }],
        ['data as an array', { step: 'INTENT', version: 0, data: [] }],
        ['data as null', { step: 'INTENT', version: 0, data: null }],
        ['an unknown field in the body', { step: 'INTENT', version: 0, data: intent, extra: true }],
        ['an unknown field in data', { step: 'INTENT', version: 0, data: { ...intent, extra: true } }],
        ['a missing targetAudience', { step: 'INTENT', version: 0, data: { intent: intent.intent } }],
        ['a missing includeTerms', { step: 'PREFERENCES', version: 1, data: { excludeTerms: [] } }],
        ['a non-string term', { step: 'PREFERENCES', version: 1, data: { includeTerms: [42] } }],
        ['INTENT fields under PREFERENCES', { step: 'PREFERENCES', version: 1, data: intent }],
    ])('rejects %s with 400', async (_case, body) => {
        await expect(pipe.transform(body)).rejects.toBeInstanceOf(BadRequestException);
    });
});
```

- [ ] **Step 2: Write the failing controller spec** — `src/modules/onboarding/presentation/__tests__/onboarding.controller.spec.ts`

```ts
import type { JwtPayload } from '../../../auth/domain/jwt-payload.js';
import type { OnboardingService } from '../../application/onboarding.service.js';
import { OnboardingEntity } from '../../domain/entities/onboarding.entity.js';
import { OnboardingController } from '../onboarding.controller.js';

describe('OnboardingController', () => {
    const currentUser: JwtPayload = { sub: 'user-id', email: 'u@x.io', tokenVersion: 0 };
    const service = { get: vi.fn(), saveStep: vi.fn() };
    const controller = new OnboardingController(service as unknown as OnboardingService);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('get returns the state of the token user without the user id', async () => {
        service.get.mockResolvedValue(OnboardingEntity.initial('user-id'));

        await expect(controller.get(currentUser)).resolves.toEqual({
            currentStep: 'INTENT',
            status: 'IN_PROGRESS',
            version: 0,
            draft: {},
        });
        expect(service.get).toHaveBeenCalledWith('user-id');
    });

    it('saveStep saves for the token user and returns the new state', async () => {
        const input = {
            step: 'INTENT' as const,
            version: 0,
            data: { intent: 'Find people asking about AI agents', targetAudience: 'Founders' },
        };
        const saved = OnboardingEntity.initial('user-id').saveStep(input);
        service.saveStep.mockResolvedValue(saved);

        await expect(controller.saveStep(currentUser, input)).resolves.toEqual({
            currentStep: 'PREFERENCES',
            status: 'IN_PROGRESS',
            version: 1,
            draft: input.data,
        });
        expect(service.saveStep).toHaveBeenCalledWith('user-id', input);
    });
});
```

- [ ] **Step 3: Run them to see them fail**

Run: `npx vitest run src/modules/onboarding/presentation`
Expected: FAIL, cannot resolve the pipe and controller files.

- [ ] **Step 4: Write the DTOs**

`src/modules/onboarding/presentation/dto/save-onboarding-step.dto.ts`

```ts
import { IsIn, IsInt, IsObject, Min } from 'class-validator';
import type { EditableOnboardingStep } from '../../domain/entities/onboarding.entity.js';

export class SaveOnboardingStepDto {
    @IsIn(['INTENT', 'PREFERENCES'])
    step: EditableOnboardingStep;

    @IsInt()
    @Min(0)
    version: number;

    @IsObject()
    data: Record<string, unknown>;
}
```

`src/modules/onboarding/presentation/dto/intent-step.dto.ts`

```ts
import { IsString } from 'class-validator';

export class IntentStepDto {
    @IsString()
    intent: string;

    @IsString()
    targetAudience: string;
}
```

`src/modules/onboarding/presentation/dto/preferences-step.dto.ts`

```ts
import { IsArray, IsOptional, IsString } from 'class-validator';

export class PreferencesStepDto {
    @IsArray()
    @IsString({ each: true })
    includeTerms: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    excludeTerms?: string[] | null;
}
```

`src/modules/onboarding/presentation/dto/onboarding-response.dto.ts`

```ts
import type {
    OnboardingDraft,
    OnboardingStatus,
    OnboardingStep,
} from '../../domain/entities/onboarding.entity.js';

export class OnboardingResponseDto {
    currentStep: OnboardingStep;
    status: OnboardingStatus;
    version: number;
    draft: OnboardingDraft;
}
```

- [ ] **Step 5: Write the response mapper** — `src/modules/onboarding/presentation/mappers/onboarding-response.mapper.ts`

```ts
import type { OnboardingEntity } from '../../domain/entities/onboarding.entity.js';
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
}
```

- [ ] **Step 6: Write the pipe** — `src/modules/onboarding/presentation/pipes/parse-save-onboarding-step.pipe.ts`

```ts
import { Injectable, ValidationPipe, type PipeTransform } from '@nestjs/common';
import type { SaveOnboardingStepInput } from '../../domain/entities/onboarding.entity.js';
import { IntentStepDto } from '../dto/intent-step.dto.js';
import { PreferencesStepDto } from '../dto/preferences-step.dto.js';
import { SaveOnboardingStepDto } from '../dto/save-onboarding-step.dto.js';

const strict = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
const DATA_DTO = { INTENT: IntentStepDto, PREFERENCES: PreferencesStepDto };

@Injectable()
export class ParseSaveOnboardingStepPipe implements PipeTransform<unknown, Promise<SaveOnboardingStepInput>> {
    async transform(value: unknown) {
        const body: SaveOnboardingStepDto = await strict.transform(value, {
            type: 'body',
            metatype: SaveOnboardingStepDto,
        });
        const data: object = await strict.transform(body.data, { type: 'body', metatype: DATA_DTO[body.step] });

        return { step: body.step, version: body.version, data: { ...data } } as SaveOnboardingStepInput;
    }
}
```

`{ ...data }` turns the DTO instance back into a plain object, so `toEqual` in tests and the JSON draft do not depend on the class.

- [ ] **Step 7: Write the controller** — `src/modules/onboarding/presentation/onboarding.controller.ts`

```ts
import { Body, Controller, Get, Patch } from '@nestjs/common';
import type { JwtPayload } from '../../auth/domain/jwt-payload.js';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator.js';
import { OnboardingService } from '../application/onboarding.service.js';
import type { SaveOnboardingStepInput } from '../domain/entities/onboarding.entity.js';
import { OnboardingResponseMapper } from './mappers/onboarding-response.mapper.js';
import { ParseSaveOnboardingStepPipe } from './pipes/parse-save-onboarding-step.pipe.js';

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
}
```

- [ ] **Step 8: Write the module and register it**

`src/modules/onboarding/onboarding.module.ts`

```ts
import { Module } from '@nestjs/common';
import { OnboardingService } from './application/onboarding.service.js';
import { GetOnboardingUseCase } from './application/use-cases/get-onboarding.use-case.js';
import { SaveOnboardingStepUseCase } from './application/use-cases/save-onboarding-step.use-case.js';
import { OnboardingRepositoryPort } from './domain/ports/onboarding-repository.port.js';
import { OnboardingRepository } from './infrastructure/repositories/onboarding.repository.js';
import { OnboardingController } from './presentation/onboarding.controller.js';

@Module({
    controllers: [OnboardingController],
    providers: [
        { provide: OnboardingRepositoryPort, useClass: OnboardingRepository },
        GetOnboardingUseCase,
        SaveOnboardingStepUseCase,
        OnboardingService,
    ],
    exports: [OnboardingService],
})
export class OnboardingModule {}
```

`src/app.module.ts` — add the import and the module:

```ts
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module.js';
import { HttpModule } from './shared/http/http.module.js';
import { PrismaModule } from './shared/prisma.module.js';
import { OnboardingModule } from './modules/onboarding/onboarding.module.js';
import { SocialAccountsModule } from './modules/social-accounts/social-accounts.module.js';
import { UsersModule } from './modules/users/user.module.js';

@Module({
    imports: [PrismaModule, HttpModule, UsersModule, AuthModule, SocialAccountsModule, OnboardingModule],
})
export class AppModule {}
```

- [ ] **Step 9: Run the specs to see them pass**

Run: `npx vitest run src/modules/onboarding`
Expected: PASS, every onboarding spec.

- [ ] **Step 10: Check the wiring in the built app**

```bash
npm run build
```

Expected: the build succeeds. Then start it against the dev database the user runs (`npm run start:prod`) and check: `curl -i http://localhost:3000/onboarding` answers 401 (route exists, global guard active). Stop the server.

- [ ] **Step 11: Format, verify, commit**

```bash
npm run format
npm run verify
git add src/modules/onboarding/presentation src/modules/onboarding/onboarding.module.ts src/app.module.ts
git commit -m "feat(onboarding): add the onboarding routes" -m "PATCH validates with its own strict pipe because the global ValidationPipe strips unknown fields instead of rejecting them; the body parameter is typed with a union so the global pipe skips it."
```

---

### Task 6: End-to-end checks against `dist`, then close the spec

**Files:**
- Create: `test/onboarding.e2e-spec.ts`
- Modify: `docs/specs/onboarding.md` (tick the tasks)

**Interfaces:**
- Consumes: the built app `dist/main.js` (Task 5), routes `POST /auth/sign-up`, `POST /auth/sign-in` (sets the `access_token` cookie), `GET` and `PATCH /onboarding`.
- Produces: an e2e suite run with `npm run test:e2e`, not part of `npm run verify`.

Prerequisite (the user does this, not the agent): a scratch PostgreSQL database with every migration applied, for example `DATABASE_URL=<scratch url> npx prisma migrate deploy`. Its URL is passed only through the shell as `E2E_DATABASE_URL`; it is not added to `.env`. The other variables (JWT secrets and the social-accounts ones) come from `.env`, which `dist/main.js` loads; `dotenv` does not override `DATABASE_URL` and `PORT` set by the test.

- [ ] **Step 1: Write the e2e suite** — `test/onboarding.e2e-spec.ts`

```ts
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
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

beforeAll(async () => {
    const databaseUrl = process.env.E2E_DATABASE_URL;

    if (!databaseUrl) throw new Error('Set E2E_DATABASE_URL to a scratch database with all migrations applied.');

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
            expect(await res.json()).toEqual({ currentStep: 'INTENT', status: 'IN_PROGRESS', version: 0, draft: {} });
        }

        const firstSave = await onboarding(cookie, 'PATCH', { step: 'INTENT', version: 0, data: INTENT });
        expect(firstSave.status).toBe(200);
    });

    it('walks INTENT -> PREFERENCES -> REVIEW and edits an earlier step without moving back', async () => {
        const cookie = await signedInCookie();

        const intent = await onboarding(cookie, 'PATCH', { step: 'INTENT', version: 0, data: INTENT });
        expect(intent.status).toBe(200);
        expect(await intent.json()).toMatchObject({ currentStep: 'PREFERENCES', version: 1, draft: INTENT });

        const preferences = await onboarding(cookie, 'PATCH', { step: 'PREFERENCES', version: 1, data: PREFERENCES });
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
            { step: 'PREFERENCES', version: 1, data: { includeTerms: Array.from({ length: 11 }, (_, i) => `t${i}x`) } },
            { step: 'PREFERENCES', version: 1, data: { includeTerms: ['a'] } },
            { step: 'PREFERENCES', version: 1, data: { includeTerms: [text(51)] } },
            { step: 'PREFERENCES', version: 1, data: { includeTerms: ['AI agents'], excludeTerms: ['ai agents'] } },
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

        const fresh = await onboarding(cookie, 'PATCH', { step: 'PREFERENCES', version: 1, data: PREFERENCES });
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
        expect((await onboarding(null, 'PATCH', { step: 'INTENT', version: 0, data: INTENT })).status).toBe(401);
    });
});
```

- [ ] **Step 2: Build and run it**

```bash
npm run build
E2E_DATABASE_URL='<scratch database url from the user>' npm run test:e2e
```

Expected: PASS, 7 tests. A 500 in any response, or the parallel test returning `[200, 200]`, is a failure to investigate, not to retry.

- [ ] **Step 3: Format and verify**

```bash
npx prettier --write test/onboarding.e2e-spec.ts
npm run verify
```

Expected: green (the e2e file is type-checked by `tsc` but not run by `vitest run`, whose pattern is `**/*.spec.ts`).

- [ ] **Step 4: Tick the spec tasks** — in `docs/specs/onboarding.md`, change every `- [ ]` under `## Tasks` to `- [x]` except the last one, whose PR part waits for the user.

- [ ] **Step 5: Commit**

```bash
git add test/onboarding.e2e-spec.ts docs/specs/onboarding.md
git commit -m "test(onboarding): add the end-to-end checks against dist"
```
