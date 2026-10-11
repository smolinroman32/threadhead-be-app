# Conventions

## Features: grill first

Before building a feature (a new module, a change to an endpoint contract, a migration that touches
data), run the `grilling` skill: the agent questions the plan until no open decision is left. Do not
start code while a decision is open. Skip it for fixes, renames and steps already in an agreed plan.

The result is a short spec in `docs/specs/<feature>.md`:

1. Goal in two lines, and what is explicitly out of scope.
2. Contract: endpoints, bodies, statuses, errors.
3. Data: schema changes, and what can fail on existing rows.
4. Acceptance checks. Each becomes a test or a step of an end-to-end run against `dist`.
5. Open questions (empty before coding starts).

Then: tests first from the acceptance checks, `npm run verify`, a run against the built app, and a PR that
links the spec. When the feature is merged, delete the spec or fold what is lasting into
`docs/architecture.md`.

## Language

Code, comments, commit messages and documentation are in English. A comment explains *why*, in one line,
and only when the code cannot show it. Do not narrate what the code does.

## TypeScript and files

- ESM with `nodenext`: relative imports end in `.js` (`import { X } from './x.js'`).
- Files are kebab-case with a role suffix: `sign-in.use-case.ts`, `user.entity.ts`,
  `user-repository.port.ts`, `prisma-user.repository.ts`, `users.controller.ts`, `sign-up.dto.ts`,
  `jwt-payload.ts`.
- Classes are `VerbNounUseCase`, `XxxEntity`, `XxxError`, `XxxPort`, `PrismaXxxRepository`,
  `XxxController`, `XxxService`.
- Types in a file with a class go next to it; a type shared by several files lives in `domain`.

## DTOs and mappers

- Controllers never return a domain entity. Map to a response DTO in `presentation/mappers`.
- `passwordHash` and other internal fields never appear in a response.
- **Every request DTO field needs at least one class-validator decorator.** The global
  `ValidationPipe({ whitelist: true })` silently strips undecorated fields. An optional field needs
  `@IsOptional()` plus a validator.
- Numbers from JSON bodies use `@Type(() => Number)` only when coercion is intended.

## Tests

- Vitest, `*.spec.ts` beside the code under test.
- Write the failing test first, watch it fail for the right reason, then write the minimum code.
- Build the class under test by hand with fakes for its dependencies (`new SignInUseCase(fakeUsers, ...)`).
  esbuild does not emit `emitDecoratorMetadata`, so `Test.createTestingModule` from a spec cannot resolve
  constructor types.
- A green unit suite does not prove DI wiring, routing or cookie headers. For changes there, run the
  built app (`npm run build`, then exercise `dist`) and check the real `Set-Cookie` headers and status
  codes.
- Assert behaviour (status, state change, what was called with), not that a mock exists.

## Environment

Read variables only through `getEnv(name, fallback?)` and `getSecret(name)` (rejects values under 32
characters). Do not read `process.env` elsewhere. A new variable goes into `.env.example` and the README
table; the user adds the real value.

## Migrations

1. Edit `prisma/models/*.prisma`.
2. Generate the SQL: `npx prisma migrate diff --from-schema <previous schema> --to-schema prisma --script`.
3. Save it as `prisma/migrations/<UTCtimestamp>_<name>/migration.sql` and run `npx prisma generate`.
4. Applied migrations are immutable; fix forward with a new one.
5. Say in the commit body anything that can fail on existing data (a new `UNIQUE`, a `NOT NULL`
   without default).

## Commits

Conventional Commits: `type(scope): subject`, imperative, no trailing period. Types in use: `feat`, `fix`,
`refactor`, `docs`, `style`, `chore`, `test`. A breaking change adds `!` and a `BREAKING CHANGE:` footer.
The body explains why, not what. One logical change per commit; formatting and generated output go in
their own commits.

## Formatting

Prettier (`.prettierrc`: 4 spaces, single quotes, trailing commas, `printWidth` 110). `src/generated` is
in `.prettierignore`. `npm run verify` runs `prettier --check`; `npm run format` fixes.
