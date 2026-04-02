# TracerKit

## Conventions

- Test files live side-by-side with implementation files (`foo.ts` → `foo.test.ts`)
- New files use kebab-case (`my-feature.ts`, not `myFeature.ts`)
- 3+ params: use a single object argument; 1-2 positional args are fine

## Exports

- Always use named exports — never default exports
- `src/commands/index.ts` is the barrel file for commands — update it when adding new commands

## Git

- Always `git pull --rebase` before pushing — semantic-release adds automatic commits on every release.
