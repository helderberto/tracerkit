# Comparison

**No tool at all.** AI coding without specs means vague prompts and lost context between sessions. TracerKit adds structure without ceremony.

**[Spec Kit](https://github.com/github/spec-kit)** (GitHub). Thorough but heavyweight: 5 phases, Python setup, rigid phase gates. TracerKit is 4 phases, zero runtime deps, automated verification.

**[Kiro](https://kiro.dev/)** (AWS). Powerful but locked to a dedicated IDE. TracerKit works inside any AI coding agent with pure Markdown skills.

**[OpenSpec](https://github.com/Fission-AI/OpenSpec)**. Similar philosophy, supports more AI tools. TracerKit offers built-in skill discovery, automated verification, phase-by-phase implementation, and fewer artifacts.

## Full comparison

|                  | Spec Kit         | Kiro                       | OpenSpec         | TracerKit                           |
| ---------------- | ---------------- | -------------------------- | ---------------- | ----------------------------------- |
| **What it is**   | CLI + extensions | Agentic IDE (VS Code fork) | Slash commands   | Markdown skills + lifecycle CLI     |
| **Setup**        | Python + uv      | Dedicated IDE              | npm + init       | `npm install -g tracerkit`          |
| **Phases**       | 5                | 3                          | 3                | 4 (prd, plan, build, check)         |
| **Artifacts**    | 4 files          | 3+ files                   | 4+ files         | 2 files (PRD, plan)                 |
| **Verification** | Manual gates     | Diff approval              | Manual           | Automated (`done` or `in_progress`) |
| **Runtime deps** | Python + uv      | Proprietary IDE            | None             | None (skills are pure Markdown)     |
| **Tool lock-in** | Any AI assistant | Kiro IDE only              | Any AI assistant | Any AI coding agent                 |
