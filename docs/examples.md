# Examples

## Full walkthrough

A feature goes through three steps: define it (`/tk:prd`), plan it (`/tk:plan`), verify it (`/tk:check`). Optionally, start with `/tk:brief` to orient.

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

## Session briefing

Use `/tk:brief` at the start of a session to see what's active and where to focus. It's optional — skip it if you already know what to work on.

```
You: /tk:brief
AI:  | Feature           | Status      | Age | Progress | Next                          |
     |-------------------|-------------|-----|----------|-------------------------------|
     | dark-mode-support | in_progress | 3d  | 3/7      | Toggle component renders ...  |
     | api-rate-limiting | created     | 1w  | —        | —                             |

     **Focus → dark-mode-support**
```

## GitHub Issues walkthrough

Same workflow, but PRDs and plans are stored as GitHub Issues instead of local files. Set up once:

```bash
$ tracerkit config storage github
✓ Set storage = github
✓ Skills re-rendered
```

Then use the same skills:

```
You: /tk:prd add dark mode support
AI:  Deriving slug: dark-mode-support
     Exploring codebase...
     ? What problem does this solve for users?
     ...
     Created issue #42: [tk:prd] dark-mode-support: Add Dark Mode Support
     Summary: dark mode with system detection and manual toggle.
     Run `/tk:plan dark-mode-support` next?

You: /tk:plan dark-mode-support
AI:  Reading PRD from issue #42...
     Exploring codebase...

     Phase 1 — Theme visible end-to-end
     Phase 2 — User can toggle and persist preference
     Phase 3 — System preference auto-detected

     Does the granularity feel right?

You: looks good

AI:  Created issue #43: [tk:plan] dark-mode-support: Plan: Add Dark Mode Support
     Run `/tk:check dark-mode-support` when ready?
```

After implementation:

```
You: /tk:check dark-mode-support
AI:  Loading plan from issue #43... Loading PRD from issue #42...
     Running tests...

     ## Verification: dark-mode-support

     ### Status: done
     Total: 7/7
     ### BLOCKERS
     - None

     Closed #42 (PRD) and #43 (plan).
```

Issues are closed with `completed` reason instead of archiving local files.

---

<details>
<summary>Check progress mid-implementation</summary>

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

</details>

<details>
<summary>Fix and re-check</summary>

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

</details>

<details>
<summary>Feature dashboard</summary>

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

</details>

<details>
<summary>Starting with just an idea</summary>

No slug needed. The skill opens with a question and derives the slug from your answer.

```
You: /tk:prd
AI:  What problem are you trying to solve? Describe the idea.

You: users keep asking for dark mode

AI:  Deriving slug: dark-mode
     Exploring codebase...
     ? Where should this live — settings page or global toggle?
     ...
```

</details>

<details>
<summary>Slug collisions</summary>

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

</details>
