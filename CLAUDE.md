# TracerKit

## Conventions

- Test files live side-by-side with implementation files (`foo.ts` → `foo.test.ts`)
- New files use kebab-case (`my-feature.ts`, not `myFeature.ts`)
- 3+ params: use a single object argument; 1-2 positional args are fine

## Git

- Always `git pull --rebase` before pushing — semantic-release adds automatic commits on every release.
