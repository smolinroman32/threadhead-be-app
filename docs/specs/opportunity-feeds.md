# Spec: opportunity feeds

Status: agreed after grilling. Open questions: none.

Builds on `docs/specs/onboarding.md` (branch `feat/onboarding`, PR #6). Terms: a feed is an
`OpportunityFeed`, the description of the conversations one user wants to find.

## Goal

A signed-in user creates, lists, edits, pauses and deletes feeds, and finishing onboarding turns the
onboarding draft into the user's first feed.

Out of scope, each its own later spec: `SearchQuery` generation and refresh, Threads search, the cheap
filter, LLM scoring, `Opportunity` records and their API, Threads API quota (discovery owns the request
budget; the feed cap below only limits how many feeds exist).

## Contract: feeds

All routes need the access cookie. The user id comes from the token (`currentUser.sub`), never from the URL
or body. A feed of another user, or a missing one, answers 404 `OpportunityFeedNotFoundError`.

| Method and path                | Result                                                              |
| ------------------------------ | ------------------------------------------------------------------- |
| `POST /opportunity-feeds`      | 201 feed                                                            |
| `GET /opportunity-feeds`       | 200 array of the user's feeds, newest first, no pagination          |
| `GET /opportunity-feeds/:id`   | 200 feed                                                            |
| `PATCH /opportunity-feeds/:id` | 200 feed after a partial update                                     |
| `DELETE /opportunity-feeds/:id`| 204, hard delete; cascades to the feed's queries and opportunities  |

Feed in a response (never contains `userId` or `onboardingId`):

```json
{ "id": "uuid", "name": "string", "description": "string", "color": "#5F947B", "intent": "string", "targetAudience": "string",
  "includeTerms": ["string"], "excludeTerms": ["string"], "languages": ["en"],
  "freshnessHours": 24, "minScore": 60, "isActive": true,
  "createdAt": "ISO date", "updatedAt": "ISO date" }
```

`POST` body: `name`, `intent`, `targetAudience`, `includeTerms` are required; `description` (default `""`), `color` (default `#5F947B`), `excludeTerms` (default `[]`),
`freshnessHours` (default 24), `minScore` (default 60) and `isActive` (default `true`) are optional.
`languages` is not accepted and is always `["en"]` (MVP is English-first).

`PATCH` body: any subset of `name`, `description`, `color`, `intent`, `targetAudience`, `includeTerms`, `excludeTerms`,
`freshnessHours`, `minScore`, `isActive`. `languages`, `userId` and `onboardingId` are not editable. An empty
body is 200 and changes nothing. There is no `version` and no optimistic lock: the last write wins.

Unknown fields in the body are 400 (strict pipe on these routes, as in onboarding).

Validation (400 `validation`), applied to the final state, which for `PATCH` is the stored feed merged with
the sent fields:

| Field            | Rule                                                              |
| ---------------- | ----------------------------------------------------------------- |
| `name`           | required, trimmed, 1 to 30 characters                             |
| `description`    | optional, trimmed, 0 to 500 characters                            |
| `color`          | optional, `#RRGGBB` hex, stored uppercase                         |
| `intent`         | required, trimmed, 10 to 500 characters                           |
| `targetAudience` | required, trimmed, 3 to 200 characters                            |
| `includeTerms`   | 1 to 10 items, each trimmed, 2 to 50 characters                   |
| `excludeTerms`   | 0 to 10 items, each trimmed, 2 to 50 characters                   |
| `freshnessHours` | integer, 1 to 168                                                 |
| `minScore`       | integer, 0 to 100                                                 |
| `isActive`       | boolean                                                           |

Terms are normalized before the limits are checked: trim, drop empty strings, collapse duplicates ignoring
case (first spelling wins). The same term in `includeTerms` and `excludeTerms`, ignoring case, is 400. A
`PATCH` that sends only `excludeTerms` is checked against the stored `includeTerms` and the other way round.

Score scale: integers `0..100` everywhere (`minScore`, and `Opportunity.score` when discovery writes it; the
LLM's `0..1` is converted by discovery).

### Feed cap

`MAX_FEEDS_PER_USER = 10`, a constant in the domain. Active and paused feeds both count, so pausing does not
free a slot. Creating an eleventh feed, by `POST` or by completing onboarding, is 409
`OpportunityFeedLimitReachedError`. Changing the constant needs no migration.

Atomicity: every way of creating a feed goes through one repository method that runs in one
`prisma.$transaction`:

1. `SELECT pg_advisory_xact_lock(hashtextextended(<userId>, 0))` through `$executeRaw` (the function returns
   `void`, which `$queryRaw` cannot read), held to the end of the transaction.
2. If an `onboardingId` is given: return the existing feed with that `onboardingId` (no limit check).
3. Count the user's feeds; at `>= MAX_FEEDS_PER_USER` throw `OpportunityFeedLimitReachedError`.
4. Insert and return the feed.

Parallel creates of one user are serialized by the lock, so the cap cannot be exceeded. Creates of different
users do not wait on each other.

`PATCH` runs in a transaction that locks the feed row (`SELECT ... FOR UPDATE`, as `mutateLocked` does in
social-accounts) and validates the merged state after the lock, so two parallel updates cannot leave a term in
both lists. It is not a version lock: the last write still wins.

Known limit: deleting a feed deletes its `Opportunity` rows, including those marked `replied`, so the system
may suggest replying to the same post again. History of published replies should be stored independently of
the feed later.

## Contract: completing onboarding

Changes to the onboarding module (`docs/specs/onboarding.md` stays as the base).

New status value: `OnboardingStatus` gains `COMPLETING`. `GET /onboarding` and `PATCH /onboarding` return it
in `status`.

`PATCH /onboarding` answers 409 `OnboardingNotEditableError` whenever `status` is not `IN_PROGRESS`.

`POST /onboarding/complete`, access cookie, body `{ "version": 0 }` (`version` required, integer 0 or more,
no unknown fields):

| State of the onboarding                 | Behaviour                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------- |
| `IN_PROGRESS`, `currentStep < REVIEW`   | 409 `OnboardingStepAheadError`                                             |
| `IN_PROGRESS`, `REVIEW`, `version` differs | 409 `OnboardingVersionConflictError`                                    |
| `IN_PROGRESS`, `REVIEW`, `version` equal   | `COMPLETING`, then the feed, then `COMPLETED`                           |
| `COMPLETING`                            | `version` is not checked; continues from creating the feed                 |
| `COMPLETED`                             | 200 with the stored state; nothing changes                                 |

Response: `{ currentStep, status, version, draft, feedId }` where `feedId` is `string | null`. It is always
set right after completing. It is `null` only on a repeated call after the user deleted the feed; the feed is
not recreated and the onboarding stays `COMPLETED`. `feedId` is not part of the `GET /onboarding` body.

Flow:

1. Conditional `UPDATE ... WHERE userId AND version = <sent> AND status = 'IN_PROGRESS'` sets `COMPLETING`
   and increments `version`. From here the draft is frozen. A request that loses this update is 409.
2. Feed through the feed port with the frozen draft; idempotent by `onboardingId`.
3. Conditional `UPDATE ... WHERE userId AND status = 'COMPLETING'` sets `COMPLETED`, `completedAt = now()`,
   increments `version`. If it updates no row, the request re-reads: `COMPLETED` is answered as 200.

Feed created from the draft: `name` is `intent` cut to 30 characters at a word boundary (a hard cut at 30
when the first 30 characters hold no space), `description` is the whole `intent`, `intent`, `targetAudience`, `includeTerms`, `excludeTerms` from
the draft, `languages = ["en"]`, `freshnessHours = 24`, `minScore = 60`, `isActive = true`, `onboardingId`.
The user renames it later through `PATCH`.

Recovery: any failure after step 1 (cap reached, database error, a process crash) leaves `COMPLETING`.
`GET /onboarding` shows it and the user repeats `complete`. At the cap the user deletes a feed first; the
feeds routes do not depend on the onboarding state.

## Data

```prisma
model OpportunityFeed {
  // existing fields unchanged
  onboardingId String? @unique @db.Uuid
}

enum OnboardingStatus { IN_PROGRESS COMPLETING COMPLETED }
```

`onboardingId` is a plain nullable unique column with no relation to `Onboarding`: uniqueness is what makes
creation idempotent, only `createFromOnboarding` writes it, and the feeds module does not depend on the
onboarding schema. `NULL` values do not conflict, so existing rows are safe.

Two migrations, each generated with `prisma migrate diff` and created, not applied. Before applying the
branch to a database: `OpportunityFeed.targetAudience` (migration
`20261013184229_add_target_audience_to_opportunity_feed`) is `NOT NULL` without a default and fails on a
non-empty table, so check that `"OpportunityFeed"` is empty.

The `Onboarding` entity gains `id` (needed as `onboardingId`); the mapper fills it.

## Module

`src/modules/opportunity-feeds` per `docs/architecture.md`:

- `domain`: `OpportunityFeedEntity` (final-state validation, term conflict, defaults),
  `OpportunityFeedNotFoundError` (`not_found`), `OpportunityFeedLimitReachedError` (`conflict`),
  `OpportunityFeedInvalidError` (`validation`), `MAX_FEEDS_PER_USER`, `OpportunityFeedRepositoryPort`
  (`listByUser`, `findByIdForUser`, `findByOnboardingId`, `createWithinLimit`, `update`,
  `deleteByIdForUser`).
- `application`: `CreateOpportunityFeedUseCase`, `ListOpportunityFeedsUseCase`,
  `GetOpportunityFeedUseCase`, `UpdateOpportunityFeedUseCase`, `DeleteOpportunityFeedUseCase`,
  `CreateFeedFromOnboardingUseCase`, and the `OpportunityFeedsService` facade
  (`createFromOnboarding(input)`, `findByOnboardingId(userId, onboardingId)` for the onboarding adapter).
- `infrastructure`: `OpportunityFeedRepository`, mapper.
- `presentation`: `OpportunityFeedsController`, request DTOs, response mapper, strict body pipe.

Onboarding side:

- `domain/ports/onboarding-feed.port.ts`: `OnboardingFeedPort`
  (`createFromOnboarding({ userId, onboardingId, draft }): Promise<{ feedId: string }>`,
  `findFeedId(userId, onboardingId): Promise<string | null>`).
- `infrastructure/feeds/onboarding-feed.adapter.ts` implements it by calling `OpportunityFeedsService`.
  `OnboardingModule` imports `OpportunityFeedsModule`; the feeds module does not know onboarding.
- `CompleteOnboardingUseCase` and the entity transitions `startCompleting` and `markCompleted`; the
  repository gains the two conditional updates above.

Shared: term normalization (trim, drop empty, collapse duplicates ignoring case) moves to
`src/shared/terms/normalize-terms.ts`. Onboarding and feeds both use it and apply their own errors for the
count and length limits, so no module imports another module's domain code.

## Architecture check

Matches `docs/architecture.md`: ports as abstract classes, one use case per action, facade, user id from the
token, `DomainError` kinds for HTTP, Prisma types stay in the repository, other modules are reached through
the facade only.

Deliberate deviations:

- Raw SQL (`pg_advisory_xact_lock` through `$executeRaw`, and `FOR UPDATE` on update) in the feeds
  repository. Prisma has no API for advisory locks or row locks; the precedent is the `FOR UPDATE` in
  `SocialAccountRepository.mutateLocked`.
- A route-level strict `ValidationPipe` on the feeds routes (unknown fields are 400), the same reason as in
  onboarding: the global pipe strips unknown fields silently and changing it would change every endpoint.
- `OnboardingModule` depends on `OpportunityFeedsModule` through a port and an adapter in onboarding's
  infrastructure, never the other way round.

## Acceptance checks

Unit (fakes for repositories and the feed port):

1. Entity: each limit and each default; a term in both lists is rejected on the merged state of a `PATCH`;
   `PATCH` with only `excludeTerms` clashing with the stored `includeTerms` is rejected; an empty `PATCH` is
   a no-op.
2. Feed name from the draft: an `intent` of 30 characters or less is used whole; a longer one is cut at a
   word boundary; a long one without spaces is cut at 30.
3. `createWithinLimit` use case: at 10 feeds throws `OpportunityFeedLimitReachedError`; with an existing
   feed for the `onboardingId` returns it at the cap without throwing.
4. Onboarding entity: `startCompleting` needs `REVIEW` and a matching `version`; `markCompleted` sets
   `completedAt`; saving a step in `COMPLETING` or `COMPLETED` throws `OnboardingNotEditableError`.
5. `CompleteOnboardingUseCase`: the order is claim, feed, complete; a feed failure leaves `COMPLETING`
   untouched; `COMPLETING` skips the version check; `COMPLETED` returns state and `feedId` (`null` when the
   feed is gone) and calls no port method that writes.
6. Repository: the claim and the completion are conditional updates; a count of 0 maps as described.

End to end on `dist` with the real database (scratch database, all migrations applied):

7. `POST` with defaults returns 201 and `languages: ["en"]`, `freshnessHours: 24`, `minScore: 60`,
   `isActive: true`; the response has no `userId` and no `onboardingId`.
8. `GET` lists only the caller's feeds, newest first; `GET /:id`, `PATCH` and `DELETE` of another user's feed
   are 404; `DELETE` is 204 and the feed is gone.
9. `PATCH` changes only the sent fields and `isActive: false` pauses; unknown fields, `languages`, and every
   validation limit are 400.
10. Cap: with 9 feeds, two parallel `POST` give exactly one 201 and one 409, and the user ends with 10.
    Pausing a feed does not make room.
11. Onboarding at `REVIEW`: `complete` returns 200, status `COMPLETED`, a `feedId`, and exactly one feed
    exists with the expected fields; a repeated `complete` returns the same `feedId` and creates nothing.
12. Two parallel `complete` calls: both 200 with the same `feedId`, one feed (or one 200 and one 409 on the
    claim, never two feeds).
13. `complete` before `REVIEW` is 409; `PATCH /onboarding` in `COMPLETING` and in `COMPLETED` is 409.
14. Recovery: an onboarding forced to `COMPLETING` in the database (no feed) is finished by `complete`;
    with the user at 10 feeds `complete` is 409 and stays `COMPLETING`, and after one `DELETE` the retry is
    200.
15. After `COMPLETED`, deleting the feed and calling `complete` again returns 200 with `feedId: null` and
    creates no feed.
16. All new routes without the cookie are 401.

## Tasks

- [x] Schema: `OpportunityFeed.onboardingId` and `COMPLETING`, two migrations checked with `migrate diff`
- [x] Shared `normalize-terms`; onboarding switched to it with its specs unchanged
- [x] Feeds domain: entity, errors, cap, repository port; unit checks 1 to 3
- [x] `OpportunityFeedRepository` with the advisory-lock transaction, mapper
- [x] Feeds use cases, facade, controller, DTOs, strict pipe, module wiring; end-to-end checks 7 to 10
- [x] Onboarding: `id` on the entity, `COMPLETING` transitions, `OnboardingNotEditableError`, unit checks 4 to 6
- [x] Onboarding: `OnboardingFeedPort`, adapter, `CompleteOnboardingUseCase`, `POST /onboarding/complete`,
      module imports; end-to-end checks 11 to 16
- [x] `npm run verify`, end-to-end run
- [ ] PR linking this spec
