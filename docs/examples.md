# Examples

## Session briefing

Start each session with `/tk:brief` to see what's active and where to focus.

```
You: /tk:brief
AI:  | Feature           | Status      | Age | Progress | Next                          |
     |-------------------|-------------|-----|----------|-------------------------------|
     | dark-mode-support | in_progress | 3d  | 3/7      | Toggle component renders ...  |
     | api-rate-limiting | created     | 1w  | —        | —                             |

     **Focus → dark-mode-support**

     What would you like to do?
     - Continue dark-mode-support (read its plan)
     - Start a new feature with /tk:prd
     - Check progress with /tk:check <slug>
```

## Full walkthrough

A feature goes through three steps: define it (`/tk:prd`), plan it (`/tk:plan`), verify it (`/tk:check`). Start with `/tk:brief` to orient, then drive each transition.

```
You: /tk:prd add dark mode support
AI:  Deriving slug: dark-mode-support
     Exploring codebase...
     ? What problem does this solve for users?
     ? Should it detect system preference or manual toggle only?
     ? Which components need theming?
     ...
     Gray areas found:
     1. Default theme — assumed "light", confirm?
     ...
     Written .tracerkit/prds/dark-mode-support.md
     Summary: dark mode with system detection and manual toggle.
     Run `/tk:plan dark-mode-support` next?

You: /tk:plan dark-mode-support
AI:  Reading PRD...
     Exploring codebase...

     Phase 1 — Theme visible end-to-end
     Phase 2 — User can toggle and persist preference
     Phase 3 — System preference auto-detected

     Does the granularity feel right? Should any phases merge or split?

You: looks good

AI:  Written .tracerkit/plans/dark-mode-support.md
     Phase 1 — Theme visible end-to-end (CSS vars + ThemeProvider)
     Phase 2 — User can toggle and persist preference (toggle + localStorage)
     Phase 3 — System preference auto-detected (media query + sync)
     Run `/tk:check dark-mode-support` when ready?
```

Now you build. Open the plan, work through each phase: write code, run tests, ask Claude for help. TracerKit doesn't implement for you; it keeps the spec sharp so you (and your AI assistant) stay on track.

```
You: # implement Phase 1, Phase 2, Phase 3...

You: /tk:check dark-mode-support
AI:  Loading plan... Loading PRD... Running tests...
     Checking each "Done when" item against codebase...

     ## Verification: dark-mode-support

     ### Status: done

     ### Progress
     Phase 1 — Theme visible end-to-end: 3/3
     Phase 2 — User can toggle and persist preference: 2/2
     Phase 3 — System preference auto-detected: 2/2
     Total: 7/7

     ### BLOCKERS
     - None

     ### SUGGESTIONS
     - None

     Archived to .tracerkit/archives/dark-mode-support/
```

## Starting without an idea

No argument needed. The skill opens with a question and derives the slug from your answer.

```
You: /tk:prd
AI:  What problem are you trying to solve? Describe the idea.

You: users keep asking for dark mode

AI:  Deriving slug: dark-mode
     Exploring codebase...
     ? Where should this live — settings page or global toggle?
     ...
```

## Slug collisions

When a PRD or plan file already exists, the skill asks before overwriting.

```
You: /tk:prd dark mode support
AI:  Deriving slug: dark-mode-support
     .tracerkit/prds/dark-mode-support.md already exists.
     Overwrite or pick a new name?

You: overwrite
AI:  Starting interview...
     ...
```

Same for plans:

```
You: /tk:plan dark-mode-support
AI:  .tracerkit/plans/dark-mode-support.md already exists.
     Overwrite or pick a new name?

You: overwrite
AI:  Reading updated PRD...
     ...
```

## Check progress mid-implementation

Run `/tk:check` any time. You don't have to finish first. It shows per-phase progress and what to tackle next.

```
You: /tk:check dark-mode-support
AI:  Loading plan... Loading PRD... Running tests...

     ## Verification: dark-mode-support

     ### Status: in_progress

     ### Progress
     Phase 1 — Theme visible end-to-end: 3/3
     Phase 2 — User can toggle and persist preference: 0/2
     Phase 3 — System preference auto-detected: 0/2
     Total: 3/7

     ### BLOCKERS
     - None

     Next unchecked items:
     - Toggle component renders with current theme
     - Theme preference persists in localStorage
```

## Fix and re-check

When `/tk:check` finds blockers, fix them and run it again. The loop continues until all checks pass.

```
You: /tk:check dark-mode-support
AI:  ...
     Total: 5/7

     ### BLOCKERS
     - Missing prefers-color-scheme media query listener
     - 2 failing tests in ThemeProvider.test.ts

     Fix the blockers, then re-run `/tk:check dark-mode-support`.

You: # fix the media query listener, fix the failing tests...

You: /tk:check dark-mode-support
AI:  ...
     ### Status: done
     Total: 7/7
     ### BLOCKERS
     - None

     Archived to .tracerkit/archives/dark-mode-support/
```

## Feature dashboard

Run `/tk:check` with no arguments to see all tracked features, then pick one to verify.

```
You: /tk:check
AI:  | Feature           | Status      | Progress |
     |-------------------|-------------|----------|
     | dark-mode-support | in_progress | 3/7      |
     | api-rate-limiting | created     | -        |

     Which feature to check?

You: dark-mode-support

AI:  Loading plan... Running tests...
     ## Verification: dark-mode-support
     ...
```
