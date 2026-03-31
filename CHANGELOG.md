# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- CLI `init`, `update`, and `uninstall` commands for project lifecycle management
- `update` command with content-hash diffing — overwrites unchanged, skips modified, adds missing
- `uninstall` command — removes TracerKit skills from `.claude/skills/`, leaves user artifacts
- `/tk:prd` skill — interactive interview to define a feature, writes `prds/<slug>.md`
- `/tk:plan` skill — breaks a PRD into phased tracer-bullet vertical slices, writes `plans/<slug>.md`
- `/tk:verify` skill — read-only review that stamps PASS or NEEDS_WORK, auto-archives on PASS
- Comparison table in README (Spec Kit, Kiro, OpenSpec, TracerKit)
- Collapsible usage examples in README (new feature, PRD iteration, verify loop)
- ESLint, Prettier, Husky, and commitlint configuration
- Test suite for CLI commands, template engine, and diffing

### Changed

- Skills install to `.claude/skills/tk:{prd,plan,verify}/` instead of `.claude-plugin/` + `skills/` — matches Claude Code native discovery
- Removed `.claude-plugin/plugin.json` — not needed for CLI-based installation
- Simplified workflow from 4 steps to 3 (prd → plan → verify)
- Replaced `#src/` import aliases with relative `.ts` imports

### Removed

- `/tk:archive` skill — merged into `/tk:verify` (auto-archives on PASS)
- `.claude-plugin/` plugin manifest — CLI installs directly to `.claude/skills/`
