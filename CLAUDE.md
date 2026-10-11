@AGENTS.md

# Claude Code — session protocol

- Run `npm run verify` before you call a change done, and say which checks you ran.
- Do not read or edit `.env`. Do not apply migrations, push or open a PR unless asked.
- For anything that touches DI, routing or cookies, check against the built app, not only unit tests.
- Commit messages follow [docs/conventions.md](docs/conventions.md#commits).
