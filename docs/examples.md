# Examples

## New feature from scratch

```
You: /tk:prd add dark mode support
AI:  Starting PRD interview...
     ? What problem does this solve for users?
     ? Should it detect system preference or manual toggle only?
     ? Which components need theming?
     ...
     ✓ Written .tracerkit/prds/dark-mode-support.md

You: /tk:plan dark-mode-support
AI:  Reading PRD...
     ✓ Phase 1 — CSS variables + ThemeProvider (schema → context → tests)
     ✓ Phase 2 — Toggle component + localStorage (UI → persistence → tests)
     ✓ Phase 3 — System preference detection (media query → sync → tests)
     Written .tracerkit/plans/dark-mode-support.md

You: # implement each phase with Claude...

You: /tk:verify dark-mode-support
AI:  Verifying against plan...
     ✓ All done-when conditions met
     ✓ Tests passing
     ✅ PASS — archived to .tracerkit/archives/dark-mode-support/
```

## Iterating on an accepted PRD

```
You: /tk:prd update dark mode to detect system preference
AI:  Found existing .tracerkit/prds/dark-mode-support.md
     ? Start fresh or revise the existing PRD?
     ...
     ✓ Updated .tracerkit/prds/dark-mode-support.md

You: /tk:plan dark-mode-support
AI:  Reading updated PRD...
     ✓ Regenerated .tracerkit/plans/dark-mode-support.md with new scope
```

## Verify → fix → re-verify loop

```
You: /tk:verify dark-mode-support
AI:  Verifying against plan...
     ✗ Missing toggle persistence in localStorage
     ✗ 2 failing tests in ThemeProvider.test.ts
     🚧 NEEDS_WORK — 2 blockers found

You: # fix the blockers...

You: /tk:verify dark-mode-support
AI:  Verifying against plan...
     ✓ All done-when conditions met
     ✓ Tests passing
     ✅ PASS — archived to .tracerkit/archives/dark-mode-support/
```

## Check workflow status

```
You: /tk:status
AI:  Feature Status Dashboard
     ┌──────────────────────┬─────────────┬─────┐
     │ Feature              │ Status      │ Age │
     ├──────────────────────┼─────────────┼─────┤
     │ dark-mode-support    │ in_progress │ 3d  │
     │ api-rate-limiting    │ created     │ 1d  │
     │ user-avatars         │ done        │ 7d  │
     └──────────────────────┴─────────────┴─────┘
```
