# Compared to

**vs. [Spec Kit](https://github.com/github/spec-kit)** (GitHub). Thorough but heavyweight: 5 phases, Python setup, rigid phase gates. TracerKit is 3 phases, zero deps, automated verification.

**vs. [Kiro](https://kiro.dev/)** (AWS). Powerful but locked to a dedicated IDE. TracerKit works inside Claude Code with pure Markdown skills.

**vs. [OpenSpec](https://github.com/Fission-AI/OpenSpec)**. Similar philosophy, broader tool support. TracerKit trades breadth (Claude Code only) for depth: native skill discovery, subagents for verification, and fewer artifacts.

**vs. nothing.** AI coding without specs means vague prompts and lost context between sessions. TracerKit adds structure without ceremony.

## Full comparison

|                  | Spec Kit         | Kiro                       | OpenSpec                | TracerKit                          |
| ---------------- | ---------------- | -------------------------- | ----------------------- | ---------------------------------- |
| **What it is**   | CLI + extensions | Agentic IDE (VS Code fork) | Slash-command framework | Claude Code skills (pure Markdown) |
| **Setup**        | Python + uv      | Dedicated IDE              | npm + init              | `npx tracerkit init`               |
| **Phases**       | 5                | 3                          | 3                       | 3 (prd, plan, verify)              |
| **Artifacts**    | 4 files          | 3+ files                   | 4+ files                | 2 files (PRD, plan)                |
| **Verification** | Manual gates     | Diff approval              | Manual                  | Automated ✅ PASS / 🚧 NEEDS_WORK  |
| **Tool lock-in** | Any AI assistant | Kiro IDE only              | Any AI assistant        | Claude Code only                   |
| **Runtime deps** | Python + uv      | Proprietary IDE            | None                    | None                               |
