@AGENTS.md

# Claude Code — session protocol

- Chat replies are short and to the point: the result first, then only what the user must decide or
  know. No recap of the diff, no restating the question, no option lists unless asked.
- Use the `ponytail` skill for code work: the smallest complete change, a test where the logic needs
  one, and one line on what was skipped or risky.
- Before a feature (new module, contract change, data migration), run the `grilling` skill and agree a spec
  per [docs/conventions.md](docs/conventions.md#features-grill-first). Do not start code with an open decision.
- Adding a shared class: answer "module or plain service?" first, per
  [docs/architecture.md](docs/architecture.md#module-or-plain-service).
- Run `npm run verify` before you call a change done, and say which checks you ran.
- Do not read or edit `.env`. Do not apply migrations, push or open a PR unless asked.
- For anything that touches DI, routing or cookies, check against the built app, not only unit tests.
- Commit messages follow [docs/conventions.md](docs/conventions.md#commits).
