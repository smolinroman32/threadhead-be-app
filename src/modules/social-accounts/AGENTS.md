# social-accounts

Lets a signed-in user connect an external social account (Threads today) through OAuth, keeps the
provider token encrypted, and gives other modules a usable token on demand. Spec:
[docs/specs/social-accounts.md](../../../docs/specs/social-accounts.md). Project rules:
[AGENTS.md](../../../AGENTS.md), [architecture](../../../docs/architecture.md),
[conventions](../../../docs/conventions.md).

## What happens

Connect (browser, three hops):

1. `POST /social-accounts/:provider/authorize` (access cookie) signs an OAuth `state` for the user and
   returns `{ url }`, the provider authorization URL. The frontend sends the browser there.
2. The provider redirects the browser to `GET /social-accounts/:provider/callback?code&state`
   (`${NEST_URL}/social-accounts/<provider>/callback`).
3. The callback verifies `state`, requires the access cookie user to equal the `state` user, exchanges
   the `code` for a long-lived token, reads the profile, refuses an account owned by another user,
   stores the token encrypted and redirects to `${FRONTEND_URL}${FRONTEND_SOCIAL_RESULT_PATH}` with
   `?social=connected` or `?social=error&reason=denied|invalid_state|already_connected|failed`.

Use a token (other modules): call `SocialAccountsService.getAccessToken(accountId)`. It decrypts the
token and, when it expires within 7 days, refreshes it inside one transaction under
`SELECT ... FOR UPDATE`, so concurrent callers refresh once. A provider rejection (4xx) sets
`isActive = false` and throws `SocialAccountReconnectRequiredError`; a 5xx or a transport error changes
nothing and propagates.

Other routes: `GET /social-accounts` (the user's connected accounts, never a token) and
`DELETE /social-accounts/:id` (204; 404 for a missing, foreign or already disconnected account).

Disconnect is soft: it sets `disconnectedAt`, `isActive = false` and erases every token, but keeps the
row, so feeds bound to it keep their history. Connecting the same provider account again updates that row
in place and clears `disconnectedAt`, so the id never changes. `isActive = false` without
`disconnectedAt` means the refresh was rejected and the user must reconnect. `getAccessToken` throws
`SocialAccountReconnectRequiredError` for both, and for any account without a stored token.

Search (other modules): `searchPosts(accountId, { query, since?, limit })` runs a `RECENT` keyword search
with the account token. A missing permission (403, Meta code 10 or 200-299) throws
`SocialProviderPermissionDeniedError`; a 5xx or a rate limit (429, codes 4, 17, 32, 613) throws
`SocialProviderUnavailableError`; any other 4xx throws `SocialProviderRejectedError`.

Search access: `checkSearchAccess(accountId, userId?)` runs the control search (`today`, limit 25) and stores
`searchAccess`: `OK` when another author shows up, `NARROWED` for only own posts or a missing permission,
`UNKNOWN` for an empty result or a provider failure. It runs after every connect without blocking the
redirect, and on `POST /social-accounts/:id/search-access-check` (200 `{ searchAccess, checkedAt }`, lower
case), which ignores any TTL.

## Layout

```
domain/
  entities/social-account.entity.ts      SocialAccountEntity, SOCIAL_PROVIDERS, SocialProvider
  errors/                                not found, already connected, reconnect required,
                                         invalid OAuth state, provider rejected / unavailable
  ports/                                 SocialAccountRepositoryPort, SocialAccountOauthPort,
                                         SocialAccountApiPort, OAuthStatePort, SocialProviderRegistryPort
application/
  social-accounts.service.ts             facade, the module's public entry point
  use-cases/                             authorize, connect, list, disconnect, get-access-token
infrastructure/
  repositories/social-account.repository.ts   Prisma, incl. mutateLocked (row lock)
  mappers/                               Prisma row -> entity
  oauth-state/oauth-state.service.ts     JWT state, own secret, purpose "oauth-state", 10 minutes
  providers/                             SocialProviderRegistry, readProviderBody (HTTP status -> error)
  threads/                               ThreadsAccountOAuth, ThreadsAccountApi
presentation/
  social-accounts.controller.ts          routes, callback redirects
  pipes/parse-social-provider.pipe.ts    "threads" -> THREADS, else 404
  dto/, mappers/                         response shape without any token field
```

## Rules

- A token leaves the module only as plaintext from `getAccessToken`. Entities, the repository and API
  responses carry `accessTokenEncrypted` / `refreshTokenEncrypted` only. Encrypt and decrypt in use cases
  through `EncryptionService`, never in the repository or the adapters.
- The user id comes from the access token (`@CurrentUser()`) or the verified `state`, never from the URL
  or body. Disconnects are scoped by owner (`where { id, userId }`).
- The callback is `@Public()` because the browser arrives from the provider; it always answers with a
  redirect, never JSON, and reads the cookie itself. Map a new failure to one of the closed `reason`
  values, never put a provider message in the URL.
- `OAUTH_STATE_SECRET` is distinct from the JWT secrets, so a `state` can never pass as an access token.
- Provider adapters speak only through `HttpClientPort`. A 4xx becomes `SocialProviderRejectedError`
  (the token or code is final-bad), a 5xx `SocialProviderUnavailableError`, a transport error passes
  through. Only a rejection deactivates an account.
- `(provider, providerAccountId)` is unique: one external account belongs to one user.
  `getAccessToken` does not check ownership; callers must take `accountId` from a user-scoped query.
- The application layer imports ports only, never `infrastructure`.

## Add a provider

1. Add the value to `enum SocialProvider` in `prisma/models/social-account.prisma` (new migration) and
   to `SOCIAL_PROVIDERS` in the entity file.
2. Write `XAccountOAuth implements SocialAccountOauthPort` and `XAccountApi implements
SocialAccountApiPort` in `infrastructure/x/`, over `HttpClientPort`, using `readProviderBody`.
3. Add both to `SocialProviderRegistry` (its `Record<SocialProvider, ...>` fails to compile until you do)
   and to `providers` of `SocialAccountsModule`.
4. Add its variables to `.env.example` and the README table, and register
   `${NEST_URL}/social-accounts/<provider>/callback` in the provider's app.

## Environment

`NEST_URL`, `FRONTEND_URL`, `FRONTEND_SOCIAL_RESULT_PATH`, `THREADS_APP_ID`, `THREADS_APP_SECRET`,
`ENCRYPTION_KEY` (64 hex characters), `OAUTH_STATE_SECRET` (at least 32 characters). The app does not
start without them.

## Tests and limits

- Unit specs sit in a `__tests__/` folder next to the code. The row lock and the callback flow are not provable with fakes: check
  them against the built app on a scratch database with a fake provider server.
- Not done: background token refresh, post import, publishing. A token is refreshed only when
  `getAccessToken` is called.
- The Threads endpoint URLs come from the previous implementation and were not checked against the live
  API.
