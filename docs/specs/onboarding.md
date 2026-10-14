# Spec: onboarding

Status: agreed after grilling. Open questions: none.

## Goal

A signed-in user moves through the onboarding steps and the module keeps their progress and draft. The draft
holds what `opportunity-feeds` will later need to create the first feed.

Out of scope: completing onboarding (`status = COMPLETED`, `completedAt`), creating `OpportunityFeed` and
`SearchQuery` from the draft, connecting Threads, any guard that requires finished onboarding on other routes.
These come with the `opportunity-feeds` spec, through a port that onboarding declares then.

## Steps

| `currentStep` | Saved by          | Draft fields                     |
| ------------- | ----------------- | -------------------------------- |
| `INTENT`      | `PATCH` `INTENT`  | `intent`, `targetAudience`       |
| `PREFERENCES` | `PATCH` `PREFERENCES` | `includeTerms`, `excludeTerms` |
| `REVIEW`      | reached after `PREFERENCES` is saved; no data | none                 |

`languages: ["en"]` and `freshnessHours: 24` are not asked and not stored in the draft. They are system
defaults that `opportunity-feeds` applies when it creates the feed.

## Contract

Both routes need the access cookie. The user id comes from the token (`currentUser.sub`).

| Method and path    | Result                                                      |
| ------------------ | ----------------------------------------------------------- |
| `GET /onboarding`  | 200 onboarding state; never writes                          |
| `PATCH /onboarding`| 200 onboarding state after saving one step                  |

State (same shape for both routes):

```json
{ "currentStep": "INTENT", "status": "IN_PROGRESS", "version": 0,
  "draft": { "intent": "string", "targetAudience": "string", "includeTerms": ["string"], "excludeTerms": ["string"] } }
```

`draft` holds only the fields saved so far. `version` is the number of successful saves. If the user has no
row, `GET` returns `{ "currentStep": "INTENT", "status": "IN_PROGRESS", "version": 0, "draft": {} }` without
inserting one.

`PATCH` body. `version` is the value the client got from the last `GET` or `PATCH`:

```json
{ "step": "INTENT", "version": 0, "data": { "intent": "string", "targetAudience": "string" } }
{ "step": "PREFERENCES", "version": 1, "data": { "includeTerms": ["string"], "excludeTerms": ["string"] } }
```

Rules:

- `step` is `INTENT` or `PREFERENCES`. Anything else, including `REVIEW`, is 400.
- `data` is validated against the DTO of its step. Unknown fields in the body or in `data` are 400.
- `version` is required, an integer of 0 or more. Missing or malformed is 400.
- The first `PATCH` (with `version: 0`) creates the row.
- A `version` that differs from the stored one (a stale tab, a double click) is 409 `conflict`, nothing is
  saved. The client reads `GET` again and decides what to send.
- Saving a step ahead of `currentStep` is 409 `conflict` (`PREFERENCES` while `currentStep = INTENT`).
- Saving the current step moves `currentStep` to the next one (`INTENT` to `PREFERENCES`, `PREFERENCES` to
  `REVIEW`). Saving an earlier step overwrites its fields and leaves `currentStep` where it is.
- A step writes all of its own fields: an omitted `excludeTerms` is stored as `[]`. Fields of other steps in
  the draft are kept.
- Each successful save increments `version` by 1 and returns the new value.

Validation (400 `validation`):

| Field            | Rule                                                        |
| ---------------- | ----------------------------------------------------------- |
| `intent`         | required, trimmed, 10 to 500 characters                     |
| `targetAudience` | required, trimmed, 3 to 200 characters                      |
| `includeTerms`   | required array, 1 to 10 items, each trimmed, 2 to 50 characters |
| `excludeTerms`   | optional array, 0 to 10 items, each trimmed, 2 to 50 characters |

Terms are normalized before the limits are checked: trim, drop empty strings, collapse duplicates ignoring
case (the first spelling wins). So `["  ", ""]` as `includeTerms` is empty and is 400. The same term in
`includeTerms` and `excludeTerms`, ignoring case, is 400.

`includeTerms` is required because search needs it. `excludeTerms` may stay empty: many niches have nothing
to exclude, and a forced placeholder term would drop relevant posts.

Errors:

| Case                                  | Status |
| ------------------------------------- | ------ |
| no or invalid access cookie           | 401    |
| unknown `step`, missing `version`, invalid `data`, unknown fields, term in both lists | 400 |
| `version` differs from the stored one, including a lost race on the first insert | 409 |
| step ahead of `currentStep`           | 409    |

The two 409 cases are separate domain errors (`OnboardingVersionConflictError`, `OnboardingStepAheadError`)
so the client can tell "reload and retry" from "you skipped a step".

## Data

```prisma
enum OnboardingStatus { IN_PROGRESS COMPLETED }
enum OnboardingStep   { INTENT PREFERENCES REVIEW }

model Onboarding {
  id          String           @id @default(uuid()) @db.Uuid
  userId      String           @unique @db.Uuid
  currentStep OnboardingStep
  status      OnboardingStatus
  draft       Json
  version     Int              @default(1)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  completedAt DateTime?
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

One new migration changes `currentStep` and `status` from `text` to the enums, generated with
`prisma migrate diff`. If the diff drops and recreates the columns, existing values are lost; no code writes
to the table yet, so check that it is empty before applying. The migration is created, not applied.

Each new step added later by `opportunity-feeds` is a new enum value and a migration.

Concurrency is an optimistic lock on `version`, no transaction and no row lock. `SaveOnboardingStep`:

1. Reads the row by `userId`. No row means the initial state with `version = 0`.
2. Throws `OnboardingVersionConflictError` if the request `version` differs from the stored one, then
   `OnboardingStepAheadError` if the step is ahead of `currentStep`.
3. Computes the new state in the entity.
4. Writes conditionally. With a row: `UPDATE ... WHERE "userId" = ? AND version = <expected>` setting
   `version = version + 1`; zero rows updated means another request won, so it throws
   `OnboardingVersionConflictError`. Without a row: `INSERT` with `version = 1`; the unique violation on
   `userId` (Prisma `P2002`) is translated in the repository to `OnboardingVersionConflictError`, so a lost
   first-insert race is 409, never 500.

Step 2 gives a clean 409 for a stale client; step 4 closes the window between the read and the write.
`version` equals the number of successful saves. The column default stays 1, the repository always writes
it explicitly.

The repository maps the row to a domain entity and parses `draft`; Prisma types do not leave it.

## Module

`src/modules/onboarding` per `docs/architecture.md`:

- `domain`: `OnboardingEntity` (version check, step order, draft merge), `onboarding-draft.ts` (trimming,
  term normalization and limits), `OnboardingStepAheadError` and `OnboardingVersionConflictError` (both
  `conflict`), `OnboardingDraftInvalidError` (`validation`), `OnboardingRepositoryPort` (`findByUserId`,
  `save(onboarding, expectedVersion)`).
- `application`: `GetOnboardingUseCase`, `SaveOnboardingStepUseCase`, `OnboardingService` facade.
- `infrastructure`: `OnboardingRepository`, mapper.
- `presentation`: `OnboardingController` on `/onboarding`, `ParseSaveOnboardingStepPipe` with
  `SaveOnboardingStepDto`, `IntentStepDto` and `PreferencesStepDto` (shape only), response mapper.

## Architecture check

Matches `docs/architecture.md`: ports as abstract classes, one use case per action, facade, user id from the
token, `DomainError` kinds for HTTP, Prisma types stay in the repository.

Deviation: the global `ValidationPipe` in `src/main.ts` uses `whitelist: true` without
`forbidNonWhitelisted`, so the rest of the API strips unknown fields silently. Onboarding answers 400 for
unknown fields with a pipe on its own route, so the contract of other endpoints does not change. `data` is
validated with the DTO chosen by `step`, since `class-validator` has no discriminated nested type.

## Acceptance checks

Unit (fake repository):

1. Step order: `PREFERENCES` while on `INTENT` throws `conflict`; saving the current step advances it;
   saving an earlier step keeps `currentStep`. A request `version` that differs from the stored one throws
   `OnboardingVersionConflictError` before the step order is checked.
2. Draft merge: a step overwrites only its own fields; omitted `excludeTerms` becomes `[]`.
3. Term normalization: trim, empty dropped, duplicates collapsed ignoring case with the first spelling kept;
   `includeTerms` empty after normalization is rejected; a term in both lists is rejected.

End to end on `dist` with the real database:

4. `GET` with no row returns the initial state with `version = 0` and leaves the table empty.
5. `PATCH INTENT` with `version: 0` creates the row and returns `currentStep = PREFERENCES`, `version = 1`.
6. `PATCH PREFERENCES` with `version: 1` returns `currentStep = REVIEW`, `version = 2`; `PATCH PREFERENCES`
   for a user still on `INTENT` is 409.
7. `PATCH INTENT` from `REVIEW` with the current `version` overwrites `intent` and `targetAudience` and
   returns `currentStep = REVIEW`.
8. Each validation limit, missing `version`, missing or empty `includeTerms`, an unknown field in the body
   or in `data`, `step = REVIEW` and a term in both lists are 400.
9. Two parallel first `PATCH INTENT` with `version: 0` and payloads A and B: exactly one 200 and one 409,
   one row, `draft` equals the payload of the 200 response, `version = 1`. Never a 500.
10. Stale write: after `INTENT`, `GET` returns `version = 1`; `PATCH PREFERENCES` (P) with `version: 1` is
    200; `PATCH INTENT` (A2) with the same `version: 1` is 409 and `GET` shows `draft` with P's terms and
    the original `intent`, `version = 2`.
11. Both routes without the cookie are 401.

## Tasks

- [ ] Enums in `prisma/models/onboarding.prisma` and the migration, checked with `migrate diff`
- [ ] Domain: entity with step order and merge rules, error, repository port; unit tests 1 to 3
- [ ] `OnboardingRepository` with the conditional update and `P2002` translation, mapper
- [ ] Use cases, facade, controller, DTOs with term normalization, route pipe, module wiring
- [ ] `npm run verify`, end-to-end run (checks 4 to 11), PR linking this spec
