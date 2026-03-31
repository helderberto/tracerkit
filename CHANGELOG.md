## [1.3.10](https://github.com/helderberto/tracerkit/compare/v1.3.9...v1.3.10) (2026-03-31)

## [1.3.9](https://github.com/helderberto/tracerkit/compare/v1.3.8...v1.3.9) (2026-03-31)

## [1.3.8](https://github.com/helderberto/tracerkit/compare/v1.3.7...v1.3.8) (2026-03-31)

### Bug Fixes

- chmod +x dist/bin.js after build ([56fee81](https://github.com/helderberto/tracerkit/commit/56fee8186f51f1f3e5210d026bff08eddea8415e))

## [1.3.7](https://github.com/helderberto/tracerkit/compare/v1.3.6...v1.3.7) (2026-03-31)

## [1.3.6](https://github.com/helderberto/tracerkit/compare/v1.3.5...v1.3.6) (2026-03-31)

## [1.3.5](https://github.com/helderberto/tracerkit/compare/v1.3.4...v1.3.5) (2026-03-31)

### Bug Fixes

- remove --global flag, add --help, add logo to README ([40c698c](https://github.com/helderberto/tracerkit/commit/40c698c0b39e36598c1eb2a00df3554743befb80))

## [1.3.4](https://github.com/helderberto/tracerkit/compare/v1.3.3...v1.3.4) (2026-03-31)

### Bug Fixes

- default to home directory, remove --overwrite alias ([923a88f](https://github.com/helderberto/tracerkit/commit/923a88f5bb439ebeb2aeab604d932c9a0be8c148))

## [1.3.3](https://github.com/helderberto/tracerkit/compare/v1.3.2...v1.3.3) (2026-03-31)

### Bug Fixes

- add --overwrite alias to avoid npx --force flag conflict ([35ee50f](https://github.com/helderberto/tracerkit/commit/35ee50f33fecb6f45b3a636f9ddd5bd8d6e6c345))

## [1.3.2](https://github.com/helderberto/tracerkit/compare/v1.3.1...v1.3.2) (2026-03-31)

## [1.3.1](https://github.com/helderberto/tracerkit/compare/v1.3.0...v1.3.1) (2026-03-31)

# [1.3.0](https://github.com/helderberto/tracerkit/compare/v1.2.1...v1.3.0) (2026-03-31)

### Features

- add --force flag to update, hint when files skipped ([b12a0e5](https://github.com/helderberto/tracerkit/commit/b12a0e55c768bec5952304a4597bf79b0cdcc639))

## [1.2.1](https://github.com/helderberto/tracerkit/compare/v1.2.0...v1.2.1) (2026-03-31)

# [1.2.0](https://github.com/helderberto/tracerkit/compare/v1.1.0...v1.2.0) (2026-03-31)

### Features

- default to cwd, add --global flag and --version ([55678fb](https://github.com/helderberto/tracerkit/commit/55678fb746a0f798bc869ace1c7efc8e4495c604))

# [1.1.0](https://github.com/helderberto/tracerkit/compare/v1.0.1...v1.1.0) (2026-03-31)

### Features

- add tk:status skill, PRD frontmatter lifecycle ([a8bc5e9](https://github.com/helderberto/tracerkit/commit/a8bc5e928464ecbf01cdffa2b436a942857163fb))

## [1.0.1](https://github.com/helderberto/tracerkit/compare/v1.0.0...v1.0.1) (2026-03-31)

# 1.0.0 (2026-03-31)

### Bug Fixes

- handle missing argument in prd skill, fix stale /tk:propose ref ([41aa31d](https://github.com/helderberto/tracerkit/commit/41aa31d42b4c857bb4faae1c9422843cffae8fc3))
- pin lodash-es to 4.17.21, workaround broken 4.18.0 ([a62fefd](https://github.com/helderberto/tracerkit/commit/a62fefd0ffd56a7e147a1ccec2d18054610642b1))
- remove stale archive skill reference from template test ([df5812e](https://github.com/helderberto/tracerkit/commit/df5812ef60fa2856c00025d70ac761bb31aef238))
- upgrade semantic-release to v25, center README header ([be5b736](https://github.com/helderberto/tracerkit/commit/be5b736ee0e3bb5b14dae592145d1363d9fc41b3))

### Features

- add --global flag to init, restructure README installation section ([b57baeb](https://github.com/helderberto/tracerkit/commit/b57baebacfb27e4cb3db3ca8ba958ff45515c2c5))
- add CLI init command with template engine ([49a52c8](https://github.com/helderberto/tracerkit/commit/49a52c8b9160ef78fb3cdbc3b32e733c261a0a39))
- add CLI source stubs ([149aba7](https://github.com/helderberto/tracerkit/commit/149aba7dc70d029163393b4b7ada906664407576))
- add tk-propose and tk-plan skills ([7ddc228](https://github.com/helderberto/tracerkit/commit/7ddc228e77f5742318d04f98b26240936d51f159))
- add tk-verify and tk-archive skills ([8cad8b6](https://github.com/helderberto/tracerkit/commit/8cad8b61d0a6840a6c87d214386753926ce968d9))
- add uninstall command ([851c52d](https://github.com/helderberto/tracerkit/commit/851c52d1fe3e62a4b7656eaa2e32dd1d81aea90b))
- add update command with smart diffing ([5ae4453](https://github.com/helderberto/tracerkit/commit/5ae4453e5f9800e92eefe47e1fac3b799058d50d))
- add vite build, lower engine to node 18+ ([0b28e79](https://github.com/helderberto/tracerkit/commit/0b28e7953f227af8c6e02937ec26f950530c29dc))
- default init to global install, accept optional path for per-project ([5c2a810](https://github.com/helderberto/tracerkit/commit/5c2a810c719f6d21992feed673872d52d829c098))

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
