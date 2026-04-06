# TracerKit

## Conventions

- Test files live side-by-side with implementation files (`foo.ts` → `foo.test.ts`)
- New files use kebab-case (`my-feature.ts`, not `myFeature.ts`)
- 3+ params: use a single object argument; 1-2 positional args are fine
- No unnecessary comments — code should be explicit and self-explanatory
- Prefer immutable data — avoid mutation; use `const`, spread, and `map`/`filter` over in-place changes
- Every exported function must have related unit tests

## Exports

- Always use named exports — never default exports
- Directories with many modules get a barrel file (`index.ts`) — watch for circular dependencies

## Git

- Always `git pull --rebase` before pushing — semantic-release adds automatic commits on every release.
- `.tracerkit/` files (PRDs, plans) are safe to commit in this repo — it dogfoods its own workflow.
