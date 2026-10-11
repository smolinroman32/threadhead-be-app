# threadhead-be — Agent Guide

NestJS 12 (ESM) + Prisma 7 on PostgreSQL. Cookie-based JWT auth. The only consumer is the new Next.js
frontend, so a Response DTO field or an HTTP status is a contract: renaming or removing one is a breaking
change.

Read when the task touches it:

- [docs/architecture.md](docs/architecture.md): layers, module template, ports, auth and error contracts.
- [docs/conventions.md](docs/conventions.md): the grill-then-spec workflow for features, naming, DTOs, tests,
  commits, migrations, formatting.

## Commands

| Task                         | Command                                                          |
| ---------------------------- | ---------------------------------------------------------------- |
| Verify everything            | `npm run verify` (tsc + oxlint + vitest + prettier --check)      |
| Dev server                   | `npm run start:dev` (port `PORT`, default 3000)                  |
| Unit tests                   | `npm test`                                                       |
| Build / run build            | `npm run build` / `npm run start:prod`                           |
| Format                       | `npm run format`                                                 |
| Regenerate Prisma client     | `npx prisma generate` (after every schema edit)                  |
| Apply migrations             | `npx prisma migrate deploy` (only when the user asks)            |

`npm run verify` must be green before you say a change is done.

## Never edit by hand

- `.env` — the user edits it. Need a new variable? Ask, then add it to `.env.example` and the README table.
  Read variables only through `getEnv` / `getSecret` in `src/shared/env`.
- `src/generated/prisma/**` — generated client (gitignored). Regenerate it.
- `prisma/migrations/**` — applied migrations are immutable. Fix forward with a new one.
- `dist/`, `node_modules/`.

## Boundaries

- Do not apply migrations, push or open a PR unless the user asks.
- Do not run `prisma migrate reset`, `db push` or `migrate dev` (blocked in `.claude/settings.json`).

## Traps we already hit

- `npm install <pkg> --save` does not move a package from `devDependencies` to `dependencies`; use
  `--save-prod`. A runtime import that sits in dev fails only in a production install
  (`npm ci --omit=dev`).
- Run `npx prisma` from this folder. Elsewhere `npx` offers to download a different Prisma version.
- Write migration SQL from `npx prisma migrate diff --from-schema <old> --to-schema prisma --script`,
  not by hand, then check it against the schema.
- Unit tests build controllers and use cases by hand, so they do not prove that Nest DI, cookies or
  routing work. Check those against `dist` or an end-to-end run.
- Nothing loads `.env` except `import 'dotenv/config'` at the top of `src/main.ts`.
