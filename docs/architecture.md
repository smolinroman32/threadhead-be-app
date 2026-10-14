# Architecture

## Layers

```
presentation → application → domain ← infrastructure
```

`domain` depends on nothing. `infrastructure` depends on `domain`, never the other way round. `application`
must not import from `infrastructure` (grep `application/` for `infrastructure` should be empty).

## Module template

```
src/modules/<name>/
  <name>.module.ts
  domain/
    entities/        UserEntity — plain classes, no framework imports
    errors/          XxxError extends DomainError
    ports/           XxxPort — abstract class, the contract the application needs
  application/
    use-cases/       one class = one action, method execute()
    <name>.service.ts   facade: the module's public entry point
  infrastructure/
    repositories/    XxxRepository implements XxxPort
    mappers/         Prisma model -> domain entity
  presentation/
    <name>.controller.ts
    dto/             request DTOs, response DTOs
    mappers/         domain entity -> response DTO
```

`src/shared/` holds cross-cutting code: env helpers, `PrismaModule`/`PrismaService`, exception filters,
and `services/` (`CredentialsService` for password hashing, `EncryptionService` for provider tokens).
It must not import from `src/modules/**` except stable domain types.

### Module or plain service?

Before adding a shared class, answer in order:

1. Does it bind a port to an adapter (`{ provide: Port, useClass: Adapter }`)? Then it gets a module
   (`HttpModule`).
2. Must there be exactly one instance, or does it have `onModuleDestroy`/shared state (a connection pool)?
   Then it gets a module (`PrismaModule`).
3. Otherwise count the consumers. One or two: list it in `providers` of the module that uses it
   (`CredentialsService`, `EncryptionService`). Three or more: make it a module and import it.

`@Injectable()` does not make a class a singleton. A provider is one instance per module that registers
it, so listing a class in two modules creates two instances; that only matters when it holds state.
`@Global()` is a separate decision, for modules almost everything imports (`PrismaModule`, `HttpModule`).

Social providers (Threads, X) are not modules: they are adapters in `providers` of `SocialAccountsModule`,
chosen by the `provider` value. Give a provider its own module only when it has its own queue, webhooks or
rate limiting.

## Ports and adapters

A port is an `abstract class` in `domain/ports`, so it exists at runtime and doubles as the Nest DI token.
The adapter `implements` it, and the module binds the two:

```ts
{ provide: UserRepositoryPort, useClass: UserRepository }
```

Use cases inject the port, not the adapter. Replace the adapter in one place (`overrideProvider` in a test,
a different class in the module). Use `extends` only when the port carries shared code.

## Use cases and the facade

- One use case class per action, `execute()` as its only public method.
- The module's `XxxService` facade only delegates to use cases. Other modules and controllers depend on the
  facade, so the module can be handed over as one unit.
- From another module import only: its facade (and the module's `exports`), its `domain` errors and
  types. Never its `infrastructure` or `presentation`.

## Persistence

- Repositories return domain entities through a mapper. Prisma types do not leave the repository.
- A read that finds nothing returns `null` or throws a domain `NotFoundError`; it never leaks a Prisma error.
- One `PrismaService` for the whole app (global `PrismaModule`), disconnected on shutdown
  (`enableShutdownHooks`).
- `updateMany` rather than `update` where "row already gone" must not throw (see `revokeSessions`).

## Auth contract

- Global `JwtAuthGuard` (`APP_GUARD`) protects everything; `@Public()` opts a route out. `AuthController`
  is `@Public()` as a whole.
- `JwtStrategy` reads the `access_token` cookie. `@CurrentUser()` returns the verified payload
  `{ sub, email, tokenVersion }`; it is `undefined` on `@Public()` routes.
- **The user id comes from the token (`currentUser.sub`), never from the URL or body.** Routes that act on
  the current user are `/users/me`.
- Cookies: `access_token` (15 min, `Path=/`) and `refresh_token` (30 days, `Path=/auth`), both
  `HttpOnly`, `SameSite=Lax`, `Secure` when `NODE_ENV=production`. Set and clear them only through
  `auth-cookies.ts` so the options always match.
- `POST /auth/refresh` verifies the refresh cookie, loads the user by id and compares `tokenVersion`.
- `POST /auth/sign-out` bumps `User.tokenVersion`, which invalidates every refresh token of that user. It
  clears the cookies and is idempotent. Access tokens are not checked against the database and live up to
  15 minutes.

## Errors

Domain code throws a `DomainError` subclass with a `kind`; it never mentions HTTP. The global
`DomainExceptionFilter` maps the kind to a status:

| `kind`         | Status |
| -------------- | ------ |
| `validation`   | 400    |
| `unauthorized` | 401    |
| `forbidden`    | 403    |
| `not_found`    | 404    |
| `conflict`     | 409    |

`PrismaClientExceptionFilter` is the safety net for Prisma errors that were not translated (`P2002` -> 409,
`P2025` -> 404, ...). Prefer translating in the repository.

## Data

Prisma schema is split by model in `prisma/models/*.prisma`; `prisma/schema.prisma` holds the generator and
datasource. Current models: `User`, `ThreadsAccount`, `OpportunityFeed`, `SearchQuery`, `Opportunity` and
the `OpportunitySearchQuery` join. Only `User` is used by code so far.
