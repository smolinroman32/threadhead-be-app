# Spec: refresh token rotation

Status: agreed after grilling. Open questions: none.

Builds on the existing `auth` module (`POST /auth/sign-in`, `/auth/refresh`, `/auth/sign-out`). The frontend half
is in `threadhead-fe/docs/specs/token-rotation.md`.

## Goal

A signed-in user is not thrown out to the sign-in page while they keep using the app, and a stolen refresh token
stops working as soon as the owner or the thief uses it a second time.

Today the refresh token is a stateless JWT checked only against `user.tokenVersion`: it is reusable for 30 days,
cannot be revoked per device, and its cookie (`Path=/auth`) is never sent through the frontend `/api` proxy, so
nobody can refresh and every session ends after the 15 minutes of the access token.

Out of scope: "sign out everywhere", a list of devices, cleanup of expired rows (no measured problem yet),
rate limiting of `/auth/refresh`.

## Decisions

| Topic                | Decision                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Refresh token format | opaque random string, 32 bytes, base64url; only its SHA-256 hash is stored; no signature to check |
| Access token         | unchanged: JWT, 15 minutes, `access_token` cookie, `Path=/`                                       |
| Rotation             | every successful refresh makes the presented token single-use and issues a successor              |
| Family               | all tokens descended from one sign-in share a `familyId`                                           |
| Reuse                | see the table in "Refresh"                                                                         |
| Lifetime             | each token 30 days (sliding), the family 90 days from sign-in at most                              |
| Sign-out             | revokes the family of the presented token only; `user.tokenVersion` is not touched                |
| Cookie path          | `refresh_token` uses `Path=/` so the frontend `proxy.ts` can refresh before rendering a page       |

## Data

```prisma
model RefreshSession {
  id              String    @id @default(uuid()) @db.Uuid
  userId          String    @db.Uuid
  familyId        String    @db.Uuid
  tokenHash       String    @unique
  expiresAt       DateTime
  familyExpiresAt DateTime
  rotatedAt       DateTime?
  revokedAt       DateTime?
  createdAt       DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([familyId])
}
```

`User` gets the back relation `refreshSessions RefreshSession[]`. The migration SQL comes from
`prisma migrate diff --from-schema <old> --to-schema prisma --script` (`migrate dev` is blocked here), never
written by hand. `tokenVersion` stays on `User` and in the access payload; the refresh
flow no longer reads it. A later "sign out everywhere" bumps it and revokes every family of the user.

## Contract

| Method and path       | Result                                                                              |
| --------------------- | ----------------------------------------------------------------------------------- |
| `POST /auth/sign-in`  | 200 user; sets `access_token` and `refresh_token`; starts a new family              |
| `POST /auth/refresh`  | 204; sets a new `access_token` and a new `refresh_token`; 401 `InvalidRefreshTokenError` |
| `POST /auth/sign-out` | 204; revokes the family of the presented token; clears both cookies; never fails    |

Cookies: both `httpOnly`, `SameSite=Lax`, `Secure` in production, both `Path=/`. `access_token` max age 15
minutes, `refresh_token` 30 days. `clearAuthCookies` clears both with the same attributes.

### Refresh

`POST /auth/refresh` reads the `refresh_token` cookie and looks the session up by `sha256(token)`.

| State of the presented token                                                    | Result                                                    |
| ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| cookie missing or no session with this hash                                     | 401                                                       |
| `revokedAt` set, or `expiresAt` or `familyExpiresAt` in the past                | 401                                                       |
| `rotatedAt` set and less than 10 seconds ago (concurrent refresh, see below)    | 401, family untouched                                     |
| `rotatedAt` set and 10 seconds or more ago (replay of an old token: theft)      | every session of the family gets `revokedAt = now`; 401   |
| otherwise                                                                       | rotate, 204                                               |

Rotation, inside one transaction: a conditional `updateMany` sets `rotatedAt = now` where the id matches and
`rotatedAt IS NULL AND revokedAt IS NULL`; if it changed no row, another request won the race and this one takes
the 10-second branch above. Then the successor row is inserted with a fresh token, the same `familyId` and
`familyExpiresAt`, and `expiresAt = min(now + 30 days, familyExpiresAt)`. The user is loaded for the access
payload; a missing user is 401.

Why the 10-second window: two requests (two tabs, or the page and its prefetches) can carry the same token. The
first rotates it; the second must not look like theft. The browser already holds the winner's cookies, so the
client just repeats its original request. A replay later than 10 seconds revokes the whole family.

The 401 body is the usual `{ error: "InvalidRefreshTokenError", message }`. The two 401 branches above are not
distinguished for the client.

### Sign-in and sign-out

`sign-in` creates the first session of a new family: `familyExpiresAt = now + 90 days`, `expiresAt = now + 30
days`. `sign-out` hashes the presented token, revokes every non-revoked session of its family (whatever the token's
own state) and answers 204 with cleared cookies; an unknown or missing token is also 204.

## Module

All inside `src/modules/auth`, same layering as today:

- domain: `RefreshSessionEntity` (rotation and reuse rules as pure functions of the entity and `now`),
  `RefreshSessionRepositoryPort` (`create`, `findByHash`, `rotate`, `revokeFamily`), constants
  `REFRESH_TOKEN_TTL_MS`, `REFRESH_FAMILY_TTL_MS`, `REFRESH_REUSE_GRACE_MS`;
- infrastructure: Prisma repository and mapper; token generator and hasher (`node:crypto`);
  `JwtTokenService` keeps only the access token, `JWT_REFRESH_SECRET` is removed from the code and from
  `.env.example`;
- application: `SignInUseCase` result feeds session creation through `AuthService.issueSession`,
  `RefreshUseCase` and `SignOutUseCase` rewritten as above, `AuthService` facade keeps its signatures;
- presentation: `auth-cookies.ts` (path, max ages), `REFRESH_TOKEN_PATH` constant removed.

## Acceptance checks

Unit:

1. Entity: fresh token rotates; revoked, expired, family-expired are rejected; the grace boundary (9.9 s vs 10 s)
   picks the right branch; successor `expiresAt` is capped by `familyExpiresAt`.
2. Hasher is deterministic and generated tokens are 43 base64url characters and differ on every call.

End to end (real database, as in the onboarding suites):

3. `sign-in` sets both cookies with `Path=/`, creates one session row holding a hash (never the raw token).
4. `refresh` returns 204 with new cookies; the old row has `rotatedAt`, the new row shares the `familyId`.
5. Replaying the old token within 10 seconds is 401 and the family is not revoked: the new token still refreshes.
6. Replaying the old token after 10 seconds (clock moved in the test) is 401 and the new token is dead too.
7. Two concurrent refreshes with the same token: exactly one 204, the other 401, exactly one successor row.
8. An expired token, a revoked token and a token past `familyExpiresAt` are 401.
9. A refresh near the family end gets `expiresAt` equal to `familyExpiresAt`.
10. `sign-out` revokes the family; its refresh tokens answer 401; a second device's family still refreshes;
    `user.tokenVersion` is unchanged; unknown token is 204.
11. `refresh` without a cookie is 401; the cookies are never cleared by a failed `refresh`.

## Rollout

Existing refresh tokens are JWTs with no session row, so everyone signs in once more after the deploy. Run
`prisma migrate deploy` before the new code starts.

## Tasks

- [ ] Schema: `RefreshSession` and the `User` relation, migration SQL from `migrate diff`
- [ ] Domain: entity, port, constants; unit checks 1 and 2
- [ ] Infrastructure: repository, mapper, token generator and hasher; `JwtTokenService` access only
- [ ] Use cases: sign-in session creation, refresh with rotation and reuse rules, sign-out by family
- [ ] Controller and cookies: `Path=/`, cookie specs updated
- [ ] End-to-end checks 3 to 11
- [ ] `npm run verify`, `JWT_REFRESH_SECRET` removed, PR linking this spec
