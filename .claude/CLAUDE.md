# TracerKit

## Conventions

- Test files live side-by-side with implementation files (`foo.ts` → `foo.test.ts`)
- New files use kebab-case (`my-feature.ts`, not `myFeature.ts`)
- 3+ params: use a single object argument; 1-2 positional args are fine
- No unnecessary comments — code should be explicit and self-explanatory
- Prefer immutable data — avoid mutation; use `const`, spread, and `map`/`filter` over in-place changes
- No inline-ifs or ternary — prefer explicit `if`/`else` blocks
- Every exported function must have related unit tests

## Exports

- Always use named exports — never default exports
- Directories with many modules get a barrel file (`index.ts`) — watch for circular dependencies

## Documentation

- When implementation changes affect user-facing behavior, update the relevant docs (`README.md`, `docs/`, skill `SKILL.md` files)
- Keep README quick start, skills table, and docs table in sync with actual capabilities

## Git

- Always `git pull --rebase` before pushing — semantic-release adds automatic commits on every release.
- `.tracerkit/` files (PRDs, plans) are safe to commit in this repo — it dogfoods its own workflow.
- Before pushing or creating PRs, run the full feedback loop: `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`. Fix all failures before proceeding.
