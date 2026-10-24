# Website baseline acceptance

Source review against Websites Build and Launch v1.1, 24 October 2026.
This is a development change, not a production release or business approval.

## Implemented in this change

- B30: optional preferences start unchecked; Reject all is available; footer Cookie
  preferences reopens the panel with saved choices and keyboard focus. Saving or
  rejecting reloads the document so previously loaded optional scripts stop.
- B30: malformed browser consent cookies fail closed and reopen the choice.
- B38: the existing GA loader requires server consent, a valid configured GA4 ID,
  a production build and the HTTPS production hostname (apex or www, default port).
  A document-level guard prevents this loader from installing twice. No property
  ID has been supplied or activated by this change.
- B09/B17: exact HIDconsult footer credit and a named footer navigation landmark.

## Acceptance still required

- O14/B09: business approval of the footer credit before release.
- O36/B38: owner-approved property/web stream and access owner, approved events,
  production tag observation, received pageview/key-event evidence and proof that
  neither another tag/container nor enhanced measurement creates duplicate events.
  The loader guard alone does not certify the external GA property configuration.
- B27–B32/B38: site-specific policy review, before-choice/accept/reject/withdraw
  network checks, GA enhanced-measurement and URL/form-data review. No new custom
  events are introduced. Existing cookie deletion/retention and already-received
  events remain outside this change; rejecting stops subsequent loading, not
  deletion of historical data.
- O36/B39: approved feedback purpose, destination, queue/recipient, response owner,
  fields, retention and synthetic delivery test method. The existing Contact route
  is not assumed to be an approved feedback destination. No placeholder recipient,
  delivery claim or feedback submission is introduced.
- B14/B16–B20/L01: record exact-commit CI, browser/mobile/keyboard results and the
  agreed manual accessibility checks. Source assertions alone are insufficient.
- L02–L06: named release authorization, recovery evidence, production checks and
  operating/handover acceptance. Keep the PR draft pending those gates.

## Local validation (24 October 2026)

Locked pnpm install, `pnpm test` (28 CI contract tests and 76 application tests),
`pnpm lint`, `pnpm typecheck` and `pnpm build` passed. The application tests include
19 new malformed-consent, production-host, invalid-ID and duplicate-loader cases;
the GA fixture is evaluated in a VM and sends no requests.

Browser verification is incomplete: a clean loopback development preview returned
HTTP 500 on `/cookies` because the existing root cart drawer queries Prisma without
a configured database. No production credentials were loaded. Provide a synthetic
database for full browser consent/withdrawal checks. This limitation is separate
from the passing production compilation. The root `pnpm db:generate` wrapper also
failed on Windows; Prisma generation through pretest and build succeeded.
