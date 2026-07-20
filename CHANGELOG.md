# Changelog

All notable changes to this project are documented in this file.

## [0.0.1.0] - 2026-07-19

### Added
- Pull requests and pushes to `main` now run deterministic install, CI contract, asset, lint, typecheck, and production-build checks.
- Documentation-only changes can skip lint only when changed-file detection proves the diff is safe; uncertain comparisons run the full lint gate.

### Fixed
- Existing application lint, type, and Next.js build errors no longer prevent the new CI baseline from passing.
