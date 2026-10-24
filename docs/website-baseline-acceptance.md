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

## Continued technical verification (24 October 2026)

The same draft now requires `GA_CONFIGURATION_APPROVED=true` in addition to the
existing consent/ID/production checks. It is deliberately unset by default. The
operator must complete O36 and the GA stream's privacy/event review before enabling
it. Initial URLs with queries/fragments, personal/account/checkout/form routes and
unrecognized paths do not initialize the loader. Initial page context uses a fixed
site title and empty referrer. This conservative route coverage needs owner review.

This is not a complete SPA privacy guarantee. Google documents that enhanced
measurement can collect history pageviews independently of `send_page_view`; its
history/form/search/link settings and data redaction need approved property-level
configuration and network verification before the flag is set. See
https://developers.google.com/analytics/devguides/collection/ga4/views and
https://support.google.com/analytics/answer/13544947 . No property was accessed or
changed and no tag was delivered during this task.

An external-to-source test fixture used the locked PGlite dependency in memory,
both checked-in migrations, the generated Prisma client and real PrismaPg adapter
with a test-only pg pool shim. The cart upsell selection and transaction read passed.
No listener, credentials or external DB service were created. Windows path warnings
were emitted, despite successful queries and exit 0. This is adapter integration
evidence, not full-app or production proof.

The actual CookieConsentBanner, preferences button, Next Link and shared Button
were bundled into an offline browser fixture. All requests were fulfilled locally
or blocked. Ten checks passed: initial choices off, reject persistence, keyboard
reopening/focus, granular save, saved choice restoration, accept, withdrawal,
malformed-cookie recovery and 390px reflow. Full root-layout/Prisma/browser
integration, server-rendered consent behavior and external receipt remain open.
