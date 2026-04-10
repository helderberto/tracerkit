# Examples

## Full walkthrough

A feature goes through four steps: define it (`/tk:prd`), plan it (`/tk:plan`), build it (`/tk:build`), verify it (`/tk:check`). Optionally, start with `/tk:brief` to orient.

```
You: /tk:prd add dark mode support
AI:  Deriving slug: dark-mode-support
     Exploring codebase...
     ┌ Detection strategy?
     │ ● System preference + manual toggle (Recommended)
     │ ○ Manual toggle only
     │ ○ Other
     └
     ┌ Default theme — assumed "light". Correct?
     │ ● Yes, default to light (Recommended)
     │ ○ Default to system preference
     │ ○ Other
     └
     ...
     Written .tracerkit/prds/dark-mode-support.md
     Summary: dark mode with system detection and manual toggle.
     ┌ What's next?
     │ ● Run `/tk:plan dark-mode-support` (Recommended)
     │ ○ Done for now
     └

You: /tk:plan dark-mode-support
AI:  Reading PRD...
     Exploring codebase...

     Phase 1 — Theme visible end-to-end
     Phase 2 — User can toggle and persist preference
     Phase 3 — System preference auto-detected

     ┌ How's the granularity?
     │ ● Looks good, proceed (Recommended)
     │ ○ Merge some phases
     │ ○ Split a phase
     └

You: [selects "Looks good, proceed"]

AI:  Written .tracerkit/plans/dark-mode-support.md
     Phase 1 — Theme visible end-to-end (CSS vars + ThemeProvider)
     Phase 2 — User can toggle and persist preference (toggle + localStorage)
     Phase 3 — System preference auto-detected (media query + sync)
     ┌ What's next?
     │ ● Start implementing (Recommended)
     │ ○ Run `/tk:check dark-mode-support`
     │ ○ Done for now
     └
```

Now build phase by phase. `/tk:build` picks the next incomplete phase, implements it, runs feedback loops, and offers to commit — one phase per invocation.

```
You: /tk:build dark-mode-support
AI:  Phase 1 — Theme visible end-to-end (3 remaining)
     Implementing... running feedback loops... all checks pass.
     ┌ Phase 1 complete. Commit?
     │ ● Yes, commit
     │ ○ No, I'll review first
     └

You: /tk:build dark-mode-support
AI:  Phase 2 — User can toggle and persist preference (2 remaining)
     Implementing... all checks pass.
     Committed. Run `/tk:build dark-mode-support` for Phase 3.

You: /tk:build dark-mode-support
AI:  Phase 3 — System preference auto-detected (2 remaining)
     Implementing... all checks pass.
     Committed. All phases complete — run `/tk:check dark-mode-support` to verify.

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

     Marked complete — PRD and plan updated to status: done
     with completed: 2025-06-20T09:00:00Z timestamp.
```

Completed features stay in `.tracerkit/prds/` and `.tracerkit/plans/` with `status: done`. They are excluded from `/tk:brief` and future checks.

## Session briefing

Use `/tk:brief` at the start of a session to see what's active and where to focus. It's optional. Skip it if you already know what to work on.

```
You: /tk:brief
AI:  | Feature           | Status      | Age | Progress | Next                          |
     |-------------------|-------------|-----|----------|-------------------------------|
     | dark-mode-support | in_progress | 3d  | 3/7      | Toggle component renders ...  |
     | api-rate-limiting | created     | 1w  | —        | —                             |

     **Focus → dark-mode-support**
```

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

     Marked complete — PRD and plan updated to status: done.
     with completed: 2025-06-20T09:00:00Z timestamp.
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

     ┌ Which feature to check?
     │ ○ dark-mode-support
     │ ○ api-rate-limiting
     └

You: [selects "dark-mode-support"]

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
     ┌ Where should this live?
     │ ● Global toggle (Recommended)
     │ ○ Settings page
     │ ○ Both
     └
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
     ┌ PRD already exists
     │ ○ Overwrite existing
     │ ○ Pick a new name
     └

You: [selects "Overwrite existing"]
AI:  Starting interview...
     ...
```

Same for plans:

```
You: /tk:plan dark-mode-support
AI:  .tracerkit/plans/dark-mode-support.md already exists.
     ┌ Plan already exists
     │ ○ Overwrite existing
     │ ○ Pick a new name
     └

You: [selects "Overwrite existing"]
AI:  Reading updated PRD...
     ...
```

</details>
