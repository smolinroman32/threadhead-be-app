# Spec: social accounts

Status: agreed after grilling. Open questions: none.

## Goal

A signed-in user connects a Threads account through OAuth. The module stores the token encrypted, lists and
disconnects accounts, and gives other modules a valid access token on demand (`getAccessToken`), refreshing
it lazily.

Out of scope: background token refresh, importing posts, publishing, replying, insights, providers other
than Threads (the model and ports allow them later, e.g. X).

## Contract

All routes are under `/social-accounts`. `:provider` is validated against `SocialProvider`; an unknown value
answers 404. The user id always comes from the access token.

| Method and path                               | Auth             | Result                                                       |
| --------------------------------------------- | ---------------- | ------------------------------------------------------------ |
| `POST /social-accounts/:provider/authorize`   | access cookie    | 200 `{ url }`, the provider authorization URL                |
| `GET /social-accounts/:provider/callback`     | public route\*   | always a 302 to the frontend (see below)                     |
| `GET /social-accounts`                        | access cookie    | 200 array of accounts of the current user                    |
| `DELETE /social-accounts/:id`                 | access cookie    | 204; 404 if it does not exist or belongs to someone else     |

\* The callback is `@Public()` because the browser arrives from the provider and a 401 would hide the reason.
The handler reads the `access_token` cookie itself and treats a missing, invalid or mismatching cookie as
`invalid_state`.

Account in the list (never contains a token or its ciphertext):

```json
{ "id": "uuid", "provider": "THREADS", "username": "string", "avatarUrl": "string|null",
  "scopes": ["threads_basic"], "isActive": true, "tokenExpiresAt": "ISO date", "createdAt": "ISO date" }
```

Callback redirect target: `${FRONTEND_URL}${FRONTEND_SOCIAL_RESULT_PATH}` plus

- `?social=connected`
- `?social=error&reason=<denied|invalid_state|already_connected|failed>`

`reason` is a closed set; provider messages and stack traces never go into the URL.

Internal API for other modules (`SocialAccountsService`, the module facade):

- `getAccessToken(accountId): Promise<string>`: decrypts the token; if it expires within 7 days and is older
  than 24 hours, refreshes it under a row lock and stores the new value. Throws `SocialAccountNotFoundError`
  (404) or `SocialAccountReconnectRequiredError` (409, name `reconnect_required`).

Errors:

| Case                                              | Behaviour                                                  |
| ------------------------------------------------- | ---------------------------------------------------------- |
| Token refresh answered 4xx (revoked, expired)     | `isActive = false`, throw `reconnect_required` (409)       |
| Token refresh got 5xx or timed out                | nothing is stored, plain error, safe to retry              |
| Account already connected by another user         | callback redirects with `reason=already_connected`         |
| Same user connects it again                       | tokens, username, avatar and scopes updated, `isActive = true` |

## OAuth state

JWT `{ sub: userId, provider, purpose: 'oauth-state' }` signed with `OAUTH_STATE_SECRET` (at least 32
characters, distinct from the JWT secrets), valid 10 minutes. Verification checks signature, expiry and
`purpose`. The callback also requires the access cookie whose `sub` equals `state.sub`.

## Data

Rename `ThreadsAccount` to `SocialAccount` (table is unused so far):

```prisma
enum SocialProvider { THREADS }

model SocialAccount {
  id                    String         @id @default(uuid()) @db.Uuid
  userId                String         @db.Uuid
  provider              SocialProvider
  providerAccountId     String
  username              String
  avatarUrl             String?
  accessTokenEncrypted  String
  refreshTokenEncrypted String?
  tokenExpiresAt        DateTime
  scopes                String[]
  isActive              Boolean        @default(true)
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
  user                  User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}
```

Migration: `prisma migrate diff` produces a drop and create for a rename. Write `ALTER TABLE ... RENAME` and
`RENAME COLUMN threadsUserId TO providerAccountId` by hand, add `provider` with default `THREADS` for existing
rows, then verify that the migrated database and the schema give an empty `migrate diff`. The new `UNIQUE`
fails if duplicate `threadsUserId` values exist; check first.

Encryption: AES-256-GCM, `node:crypto`. Stored string `v1.<iv>.<tag>.<ciphertext>` (base64 parts). The
key is `ENCRYPTION_KEY`, 64 hex characters (32 bytes), checked at startup. The `v1` prefix selects the
algorithm and key, so a later rotation can write `v2` and still read `v1`.

New environment variables (added to `.env.example` and the README; the user supplies real values):
`NEST_URL`, `THREADS_APP_ID`, `THREADS_APP_SECRET`, `FRONTEND_URL`, `FRONTEND_SOCIAL_RESULT_PATH`,
`ENCRYPTION_KEY`, `OAUTH_STATE_SECRET`.

`NEST_URL` is the public base URL of this backend (for example `https://api.example.com`, no trailing
slash; one is trimmed if present). The OAuth `redirect_uri` is derived from it as
`${NEST_URL}/social-accounts/<provider>/callback`, so there is no separate redirect variable. That exact
URL must be registered as a redirect URI in the Threads app, and changing `NEST_URL` means updating it
there.

## Ports

- `HttpClientPort` (`src/shared/http`): `get`, `post`, `patch`, `delete`, each `(url, options?)` returning
  `{ status, body }`. Options: `query`, `headers`, `timeoutMs` (default 10 000), and `json` or `form` for
  `post` and `patch`. 4xx and 5xx are returned, not thrown; a timeout or network error throws
  `HttpTransportError` (always transient). `FetchHttpClient` implements it with `fetch`.
- `SocialAccountOauthPort`: authorization URL from `state`, exchange `code` for a long-lived token, refresh
  a token, list scopes.
- `SocialAccountApiPort`: `getProfile(accessToken)` returning `{ id, username, avatarUrl }`.
- Adapters `ThreadsAccountOAuth` and `ThreadsAccountApi`, chosen by `provider` through a small registry.
  `ThreadsAccountOAuth` builds `redirect_uri` from `NEST_URL` for both the authorization URL and the code
  exchange (Threads requires the two to match).
- Scopes requested: `threads_basic`, `threads_keyword_search`, `threads_read_replies`.

Threads endpoints (from the previous implementation; verify against the Threads docs when building):
authorize `https://threads.net/oauth/authorize`; code exchange `POST https://graph.threads.net/oauth/access_token`
(form); long-lived `GET https://graph.threads.net/access_token?grant_type=th_exchange_token`; refresh
`GET https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token`; profile
`GET https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url`.

## Acceptance checks

Unit (fakes for `HttpClientPort` and repositories):

1. `FetchHttpClient`: sends query, form and JSON bodies; returns 4xx and 5xx without throwing; a timeout
   throws `HttpTransportError`.
2. `EncryptionService`: round trip; two encryptions of one value differ; tampered ciphertext fails; unknown
   version prefix fails; a key that is not 32 bytes fails at startup.
3. State: valid state verifies; expired, wrong secret, wrong `purpose` and an access token are rejected.
4. Threads adapters build the right URL, scopes and requests, and map responses. The authorization URL and
   the code exchange carry the same `redirect_uri`, `${NEST_URL}/social-accounts/threads/callback`.
5. `getAccessToken`: not near expiry returns the stored token without a request; within 7 days refreshes and
   saves; 4xx deactivates and throws `reconnect_required`; 5xx or timeout changes nothing; two concurrent
   calls refresh once.
6. Connect: new account is stored encrypted; same user again updates; another user gives
   `already_connected`.
7. List never contains token fields; `DELETE` of another user's account is 404.

End to end on `dist` with a fake Threads server and the real database:

8. authorize returns a URL carrying a valid `state`; callback with a valid `code` stores the account and
   redirects with `social=connected`; the database holds ciphertext, not the plain token.
9. callback with `error=access_denied`, a tampered `state`, no cookie and a cookie of another user each
   redirect with the matching `reason`.
10. disconnect removes the row; a second user connecting the same provider account is rejected.
11. a revoked token (fake server answers 400) makes the list show `isActive: false` and
    `getAccessToken` throw `reconnect_required`.

## Architecture check

Matches `docs/architecture.md`: ports are abstract classes in `domain/ports`, adapters implement them, use
cases and a `SocialAccountsService` facade, user id from the token, `DomainError` kinds for HTTP.
Deviations to note: the callback is `@Public()` and checks the cookie itself (needs
`AuthService.verifyAccessToken`, a small addition to the auth facade); `HttpClientPort` and
`EncryptionService` live in `src/shared` because later modules will reuse them.

## Tasks

- [x] Restore the scaffold (`git revert 53d76a9`), merge `main`, delete `src/modules/social-account/`
- [x] `HttpClientPort` and `FetchHttpClient` with tests
- [x] `EncryptionService`, `ENCRYPTION_KEY` check, tests
- [ ] Schema rename and hand-written migration, checked with `migrate diff`
- [ ] Domain: `SocialAccountEntity`, errors, repository port; `PrismaSocialAccountRepository`, mapper
- [ ] OAuth state service and `AuthService.verifyAccessToken`
- [ ] Threads adapters and provider registry with tests
- [ ] Use cases: authorize, handle callback, list, disconnect, get access token (lazy refresh, row lock)
- [ ] Controller, module wiring, env variables in `.env.example` and README
- [ ] `npm run verify`, end-to-end run (checks 8 to 11), PR linking this spec
