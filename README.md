# threadhead-be

Backend API for ThreadHead. NestJS 12 (ESM), Prisma 7 on PostgreSQL, cookie-based JWT auth.

Currently implemented: users and auth. The Prisma schema already holds the models for Threads accounts,
opportunity feeds, search queries and opportunities; no code uses them yet.

## Setup

Developed on Node 25.

```bash
npm install
cp .env.example .env   # or create .env by hand, see the table below
npx prisma migrate deploy
npx prisma generate
npm run start:dev
```

The server listens on `PORT` (default 3000). `.env` is loaded on startup.

## Environment

| Variable             | Required | Notes                                                    |
| -------------------- | -------- | -------------------------------------------------------- |
| `DATABASE_URL`       | yes      | PostgreSQL connection string                             |
| `JWT_ACCESS_SECRET`  | yes      | at least 32 characters                                   |
| `JWT_REFRESH_SECRET` | yes      | at least 32 characters, different from the access secret |
| `PORT`               | no       | default `3000`                                           |
| `NODE_ENV`           | no       | `production` makes the auth cookies `Secure`             |
| `NEST_URL`           | yes      | public base URL of this backend, no trailing slash; the OAuth `redirect_uri` is derived from it |
| `FRONTEND_URL`       | yes      | base URL the OAuth callback redirects to                 |
| `FRONTEND_SOCIAL_RESULT_PATH` | yes | frontend path that receives `?social=connected` or `?social=error&reason=...` |
| `THREADS_APP_ID`     | yes      | Threads app id                                           |
| `THREADS_APP_SECRET` | yes      | Threads app secret                                       |
| `ENCRYPTION_KEY`     | yes      | 64 hex characters (32 bytes), encrypts stored provider tokens |
| `OAUTH_STATE_SECRET` | yes      | at least 32 characters, signs the OAuth `state`, distinct from the JWT secrets |
| `REDIS_URL`          | for discovery | Redis connection URL for the BullMQ queues, e.g. `redis://localhost:6379` |
| `OPENAI_API_KEY`     | for discovery | OpenAI key for `LlmModule`; read on each call, so the app boots without it |

## Scripts

| Command                           | What it does                           |
| --------------------------------- | -------------------------------------- |
| `npm run start:dev`               | dev server with watch                  |
| `npm run build` / `start:prod`    | compile to `dist/` and run it          |
| `npm test`                        | unit tests (Vitest)                    |
| `npm run lint`                    | oxlint                                 |
| `npx prisma migrate deploy`       | apply migrations                       |

## API

Auth uses `HttpOnly` cookies: `access_token` (15 minutes, path `/`) and `refresh_token` (30 days, path
`/auth`). Everything except `/auth/*` and the OAuth callback requires a valid access token.

| Method | Path             | Notes                                                              |
| ------ | ---------------- | ------------------------------------------------------------------ |
| POST   | `/auth/sign-up`  | create an account                                                  |
| POST   | `/auth/sign-in`  | sets both cookies                                                  |
| POST   | `/auth/refresh`  | new token pair from the refresh cookie, 204                        |
| POST   | `/auth/sign-out` | revokes all refresh tokens of the user and clears the cookies, 204 |
| POST   | `/social-accounts/:provider/authorize` | `{ url }` to send the browser to the provider            |
| GET    | `/social-accounts/:provider/callback`  | public; connects the account, redirects to the frontend |
| GET    | `/social-accounts` | accounts of the current user, never any token                    |
| DELETE | `/social-accounts/:id` | disconnect an account, 204                                    |
| POST   | `/social-accounts/:id/search-access-check` | rerun the search access check, `{ searchAccess, checkedAt }` |
| GET    | `/users/me`      | current user                                                       |
| PATCH  | `/users/me`      | update name, age or email                                          |
| DELETE | `/users/me`      | delete the account and clear the cookies                           |

Access tokens are not checked against the database, so they stay valid for up to 15 minutes after
sign-out.

## Layout

```
src/modules/<name>/
  domain/          entities, errors, ports (abstract classes used as DI tokens)
  application/     use cases and the module's service facade
  infrastructure/  adapters: repositories, JWT
  presentation/    controllers, DTOs, mappers
src/shared/        env helpers, Prisma service, exception filters, password hashing
```

Dependencies point inward: `presentation → application → domain ← infrastructure`.
The user id always comes from the access token (`@CurrentUser()`), never from the URL or body.
