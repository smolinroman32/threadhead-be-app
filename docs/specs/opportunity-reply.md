# Spec: reply to an opportunity

Status: agreed after grilling. Open questions: none.

Builds on [discovery.md](discovery.md) (`Opportunity`, statuses, counts), [social-accounts.md](social-accounts.md)
(`scopes`, `canReply`, `getGrantedScopes`) and the Feed design in pen.dev (frame "Feed — Light", "Opportunity
Panel"). The frontend lives in this spec too.

## Goal

The user writes a reply to a found post and publishes it to Threads from ThreadHead, after an explicit click
(PRD FR-11). A replied opportunity moves to a new "Replied" tab and never changes status again.

## Decisions

| Topic            | Decision                                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Draft            | written by the user; no LLM in this iteration                                                                                                            |
| Replies per post | one; success sets `REPLIED`, which is final (already enforced by `nextOpportunityStatus`)                                                                |
| Publishing       | synchronous HTTP call; one call with `auto_publish_text=true` and `reply_to_id` (confirmed live in task 1)                                               |
| Double submit    | claim by status: conditional `updateMany` from the current status to `REPLIED`, release on failure; no transaction or row lock held during the HTTP call |
| Permission error | re-read granted scopes (`getGrantedScopes`) and save them, so `canReply` turns false and the Feed alert appears; then 403                                |
| Text             | trimmed, 1 to 500 code points (`Array.from(text).length`); Meta's emoji-as-bytes rule is not replicated                                                  |
| Stored data      | status only; no reply text, reply id or timestamp, no migration                                                                                          |
| Replying account | the feed's `socialAccountId`                                                                                                                             |
| UI               | side panel from the design, reduced (see Frontend); open state in local page state, not the URL                                                          |
| Replied tab      | fourth tab, `status=replied`, no status actions and no Reply button                                                                                      |

## Contract

`POST /opportunities/:id/reply`, body `{ "text": "string" }`, cookie auth.

| Case                                                      | Status                                        | `code` (error class name)                  |
| --------------------------------------------------------- | --------------------------------------------- | ------------------------------------------ |
| Published                                                 | 200                                           | body: the opportunity, `status: "replied"` |
| Text empty after trim or longer than 500 code points      | 400                                           | `OpportunityReplyTextInvalidError`         |
| Opportunity missing or owned by another user              | 404                                           | `OpportunityNotFoundError`                 |
| Already `REPLIED`, or a parallel request claimed it first | 409                                           | `OpportunityRepliedError`                  |
| Feed has no account                                       | 409                                           | `OpportunityFeedAccountRequiredError`      |
| Account token missing or refresh rejected                 | 409                                           | `SocialAccountReconnectRequiredError`      |
| Threads refused for permissions (403, code 10, 200-299)   | 403                                           | `OpportunityReplyPermissionDeniedError`    |
| Transport error or timeout: outcome unknown               | 409                                           | `OpportunityReplyOutcomeUnknownError`      |
| Threads 5xx or rate limit                                 | as today for `SocialProviderUnavailableError` |                                            |

On every failure after the claim the status goes back to what it was. Deliberate deviation from the grilling
notes: error codes follow the existing rule (class name), not `reply_permissions_missing`.

`GET /opportunity-feeds/:id/opportunity-counts` gains `replied` (no read filter, like `saved` and `dismissed`):
`{ new, saved, dismissed, replied }`.

`GET /opportunity-feeds/:id/opportunities?status=replied` already works (`LIST_STATUSES`).

Threads call (confirmed in task 1):
`POST https://graph.threads.net/v1.0/me/threads` with `media_type=TEXT`, `text`, `reply_to_id=<externalPostId>`,
`auto_publish_text=true`, `access_token`; response `{ id }`, the id of the published reply. No second call and no
pause. The two-step fallback is not implemented.

## Data

No schema change. Existing rows are untouched.

## Changes by layer

Backend, `social-accounts`:

- `SocialAccountApiPort.publishReply(accessToken, { replyToId, text }): Promise<{ id: string }>`;
  `ThreadsAccountApi` implements it and maps errors with the same rules as `readSearchBody` (extract one shared
  reader).
- `SocialAccountsService.publishReply(accountId, input)`: token through `GetAccessTokenUseCase`, then the port.
- `RefreshGrantedScopesUseCase` and `SocialAccountsService.refreshGrantedScopes(accountId)`: token,
  `oauth.getGrantedScopes`, `repository.update(id, { scopes })`.

Backend, `opportunity-feeds`:

- Domain: `replyTextLength`-style check that throws `OpportunityReplyTextInvalidError` (`validation`); errors
  `OpportunityReplyPermissionDeniedError` (`forbidden`) and `OpportunityReplyOutcomeUnknownError` (`conflict`).
- `OpportunityRepositoryPort.claimForReply(id, from): Promise<boolean>` and `releaseReply(id, to)`, both
  `updateMany` with the status in the `where`.
- `ReplyToOpportunityUseCase(userId, id, text)`: validate text, load, reject `REPLIED`, resolve the feed account,
  claim, publish, on failure release and translate the error (permission: refresh scopes best effort, then 403).
- `CountOpportunitiesUseCase` adds `replied`.
- `ReplyToOpportunityDto { text: string }` (`IsString`), `POST opportunities/:id/reply` in `DiscoveryController`
  next to the `PATCH`.

Frontend:

- `entities/opportunity`: `opportunityApiService.reply(id, payload)`, `ReplyToOpportunityPayload`,
  `IOpportunityCountsDto.replied`, hook `useReplyToOpportunity(id)` in `model` returning `{ reply, isReplying }`
  with `onSuccess` and `onError`, no toasts (house rule: one hook per mutation in the entity).
- `features/opportunities/reply-to-opportunity`: `OpportunityReplyPanel` and a thin flow hook that adds toasts per error code, closes the
  panel and calls `router.refresh()`. Text constants in `const`.
- Panel content: header (title, open in Threads by `permalink`, close); post (author, text, published time);
  `relevanceScore` badge and `reason`; composer (textarea, `n / 500`, "Reply on Threads" button, disabled while
  empty, over the limit or sending).
- `views/feed-page`: holds `selectedOpportunityId`; renders the list and the panel side by side; the card gets a
  Reply button on the `new` and `saved` tabs that opens the panel.
- `widgets/opportunity-list`: tab `replied` with its count; tab status type widens from `ReviewStatus` to
  `OpportunityStatus`; no status actions on that tab; empty state text for it.

Checked against `docs/architecture.md`: domain errors carry `kind` only, the cross-module call goes through
`SocialAccountsService`, ports stay abstract classes. No other deviation.

## Acceptance checks

1. `ThreadsAccountApi.publishReply` sends the documented request and returns the id; 403/code 10 maps to
   `SocialProviderPermissionDeniedError`, 5xx and rate limits to unavailable, other 4xx to rejected.
2. `RefreshGrantedScopesUseCase` saves the scopes from `getGrantedScopes`.
3. Text of 0 (after trim) or 501 code points is rejected before any database or Threads call; 500 emoji pass.
4. A `REPLIED` opportunity is rejected with 409 and Threads is not called.
5. Claim lost (0 rows) gives 409 and Threads is not called.
6. Success: status `REPLIED`, Threads called once with `externalPostId` and the trimmed text.
7. Threads failure: status released to the previous value; permission failure refreshes scopes and returns 403
   even if the refresh itself fails; transport failure returns `OpportunityReplyOutcomeUnknownError`.
8. Counts return `replied`.
9. End to end against `dist`: `POST /opportunities/:id/reply` on a real account publishes, the post shows the
   reply in Threads, the opportunity is in the Replied tab.
10. Frontend: Reply opens the panel; counter and disabled states follow the text; success closes the panel and the
    item moves to Replied; each error code shows its toast and keeps the text.

## Out of scope

Deferred by choice, possible with what we have today:

- reply draft generation with an LLM, "Suggest an angle" (FR-10);
- previous/next navigation and "1 of 24" in the panel;
- storing the reply text, reply id or time; reply history independent of the feed (needed if a feed is
  deleted, see [opportunity-feeds.md](opportunity-feeds.md));
- a conversation view inside ThreadHead with an open/closed status;
- image, emoji picker and mentions in the composer;
- the open panel in the URL.

Blocked for now, to research before planning:

- **Top replies with likes.** `GET /{id}/replies` works for other users' posts but returns no like counts and
  no total, so "top" cannot be ranked. Research: a metrics source for other users' posts (FR-12, FR-13).
- **Replies block without likes.** Possible in principle; research: whether `/{id}/replies` returns `text` for
  other users' posts (the 2026-10-26 check listed only `id`, `timestamp`, `username`).
- **Author followers, display name, verified badge, likes, reposts, views** from the design. The API answers
  `nonexisting field` or 403 for other users' posts. Research: any official source.
- **Signals "Velocity", "Room to stand out", "Author responsiveness" and the "best window" hint.** Need counters
  over time that we cannot read. Research: same metrics source.
- **Follow button.** No follow endpoint known in the Threads API. Research: confirm in the docs.

Resolved on 2026-10-29: our own replies can be found later. `GET /me/replies` with
`fields=id,text,timestamp,root_post,replied_to,is_reply` lists them with `root_post.id`, which matches
`Opportunity.externalPostId`, so not storing the reply id now loses nothing.

## Tasks

- [x] 1. Live check, 2026-10-29, account `romn.dev`, reply to its own post: `auto_publish_text=true` with
      `reply_to_id` answered 200 `{ id }` and the reply was live at once (`is_reply: true`, `root_post` and
      `replied_to` equal to the target). Synchronous publishing stands. Not yet checked: a reply to another
      user's post, which Threads allows through `threads_keyword_search`; the end-to-end run (check 9) covers it.
- [x] 2. BE `social-accounts`: `publishReply` in the port and `ThreadsAccountApi`, shared error reader; tests
      (check 1).
- [x] 3. BE `social-accounts`: `RefreshGrantedScopesUseCase`, service methods `publishReply` and
      `refreshGrantedScopes`; tests (check 2).
- [x] 4. BE `opportunity-feeds` domain: text check and the two new errors; tests (check 3).
- [x] 5. BE repository: `claimForReply`, `releaseReply`; tests.
- [x] 6. BE `ReplyToOpportunityUseCase`; tests (checks 4 to 7).
- [x] 7. BE controller route, DTO, service wiring; counts `replied`; controller tests (check 8); update
      [discovery.md](discovery.md) contract.
- [ ] 8. `npm run verify`; end-to-end run against `dist` (check 9).
- [x] 9. FE entity: API method, types, `useReplyToOpportunity`.
- [x] 10. FE Replied tab: tab, count, status type, no actions, empty state.
- [x] 11. FE `features/opportunities/reply-to-opportunity`: panel, flow hook, texts; Reply button in the card; panel layout in
      `views/feed-page`.
- [ ] 12. FE typecheck, lint, format; manual run in the browser (check 10).
- [ ] 13. Review with `feature-reviewer-be` per [conventions.md](conventions.md#review-before-done).
