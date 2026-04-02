# Examples

## New feature from scratch

```
You: /tk:prd add dark mode support
AI:  Starting PRD interview...
     ? What problem does this solve for users?
     ? Should it detect system preference or manual toggle only?
     ? Which components need theming?
     ...
     Written .tracerkit/prds/dark-mode-support.md

You: /tk:plan dark-mode-support
AI:  Reading PRD...
     Phase 1 — CSS variables + ThemeProvider (schema -> context -> tests)
     Phase 2 — Toggle component + localStorage (UI -> persistence -> tests)
     Phase 3 — System preference detection (media query -> sync -> tests)
     Written .tracerkit/plans/dark-mode-support.md

You: # implement each phase with Claude...

You: /tk:check dark-mode-support
AI:  Checking against plan...
     Status: done | Checks: 7/7

     BLOCKERS: None
     SUGGESTIONS: None

     Archived to .tracerkit/archives/dark-mode-support/
```

## Iterating on an accepted PRD

```
You: /tk:prd update dark mode to detect system preference
AI:  Found existing .tracerkit/prds/dark-mode-support.md
     ? Start fresh or revise the existing PRD?
     ...
     Updated .tracerkit/prds/dark-mode-support.md

You: /tk:plan dark-mode-support
AI:  Reading updated PRD...
     Regenerated .tracerkit/plans/dark-mode-support.md with new scope
```

## Check -> fix -> re-check loop

```
You: /tk:check dark-mode-support
AI:  Checking against plan...
     Status: in_progress | Checks: 5/7

     BLOCKERS:
     - Missing toggle persistence in localStorage
     - 2 failing tests in ThemeProvider.test.ts

     Fix the blockers, then re-run /tk:check dark-mode-support.

You: # fix the blockers...

You: /tk:check dark-mode-support
AI:  Checking against plan...
     Status: done | Checks: 7/7

     BLOCKERS: None
     SUGGESTIONS: None

     Archived to .tracerkit/archives/dark-mode-support/
```

## Check progress mid-implementation

```
You: /tk:check dark-mode-support
AI:  Checking against plan...
     Status: in_progress | Checks: 3/7

     Phase 1: 3/3 checks | Phase 2: 0/2 checks | Phase 3: 0/2 checks

     BLOCKERS: None

     Next unchecked items:
     - Toggle component renders with current theme
     - Theme preference persists in localStorage
```

## Feature dashboard

```
You: /tk:check
AI:  | Feature           | Status      | Progress |
     |-------------------|-------------|----------|
     | dark-mode-support | in_progress | 3/7      |
     | api-rate-limiting | created     | -        |

     Which feature to check?
```
