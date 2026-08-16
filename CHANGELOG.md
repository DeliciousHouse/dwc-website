# Changelog

All notable changes to this project are documented in this file.

## [0.1.1.0] - 2026-07-20

### Fixed
- Production Compose now injects exactly the three server-only Square settings at runtime while blank credentials continue to fail soft.
- Checkout and return redirects now use the canonical site URL instead of reflecting untrusted request hosts.
- Late Square completions after inventory release now persist an explicit reconciliation state, remain monotonic, and surface actionable customer and admin notices instead of appearing paid.

### Changed
- Expired checkout reconciliation now revisits released Square orders and verifies settlement again after local cancellation to close the expiry race.

## [0.1.0.0] - 2026-07-20

### Added
- Square-hosted checkout now runs through a processor-neutral payment adapter with server-only environment configuration and a verified redirect-return flow.
- Checkout now atomically claims inventory, expires abandoned payment links, reconciles delayed Square results, and releases reservations exactly once.
- Adapter, checkout-route, payment-return, inventory-race, and zero-credential fail-soft paths are covered by Vitest and the root CI test command.
- Production delivery now includes an immutable multi-stage web image, a reboot-resilient bounded Compose stack, database-aware application health checks, and a checked-in non-destructive Prisma migration baseline.
- The production deployment runbook documents environment setup, startup, persistence, backup, rollback, and migration-baseline procedures.

### Changed
- Stripe-specific checkout code and dependencies were replaced by the official Square Node SDK and provider-neutral Prisma payment fields.
- Local build entry points now use locked workspace dependencies instead of installing latest Prisma packages during the build.
- CI now validates the production Compose schema and required interpolation using a committed non-secret placeholder fixture.
- Compose contract tests enforce restart, health, CPU, memory, and bounded-logging requirements independently for both long-running services.

## [0.0.1.0] - 2026-07-19

### Added
- Pull requests and pushes to `main` now run deterministic install, CI contract, asset, lint, and workspace-aware typecheck and production-build checks for both the web app and shared package.
- Documentation-only changes can skip lint only when changed-file detection proves the diff is safe; uncertain comparisons run the full lint gate.

### Fixed
- Existing application lint, type, and Next.js build errors no longer prevent the new CI baseline from passing.
