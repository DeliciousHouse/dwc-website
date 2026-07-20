# Production deployment

This runbook deploys the Delicious Wines web app and PostgreSQL with
`compose.production.yml`. It is intended for the `ubuntu-docker` host. The Compose
project does not publish PostgreSQL, does not bind host ports 80/443, and does not
include development mounts, hot reload, package installation, or pgAdmin.

The owner has already authorized the first production deployment. Deployment and
ingress changes remain separate from building this artifact: deploy only a reviewed
image from `main`.

## Production addresses

- Canonical site: `https://deliciouswines.org`
- Alias: `https://www.deliciouswines.org`
- Public readiness check: `https://deliciouswines.org/api/health`
- LAN upstream for the existing Caddy ingress:
  `http://192.168.1.240:${WEB_PORT}`

The host port is selected by the operator. `WEB_PORT` must be conflict-free and
LAN-reachable; it must not be 80 or 443. The container always listens on 3010.

## Artifact layout

- `Dockerfile.web`: locked multi-stage build. The default `runner` is a non-root
  Next.js standalone image. The `migrator` target contains the pinned Prisma CLI and
  checked-in migrations, but installs nothing at runtime.
- `compose.production.yml`: bounded web, migration, and PostgreSQL services with
  healthchecks, bounded `json-file` logs, and a named database volume.
- `env.production.example`: names-only production environment template.
- `apps/web/prisma/migrations`: reviewed, forward-only database migrations.

## Environment and secret injection

Create the environment file outside the checkout. Do not copy real values into the
repository or pass secrets on a command line.

```bash
sudo install -d -m 700 /etc/dwc
sudo install -m 600 env.production.example /etc/dwc/dwc.env
sudoedit /etc/dwc/dwc.env
export ENV_FILE=/etc/dwc/dwc.env
# Export the same non-secret coordinates used in the env file for host-side checks.
export WEB_PORT=19898
export WEB_IMAGE=dwc-web
export WEB_IMAGE_TAG=reviewed-commit-sha
```

Pass that file to every Compose command with `--env-file "$ENV_FILE"`. Keep it owned
by the deployment account with mode 0600. Docker Compose injects secrets at container
creation time; the Dockerfile never receives database or auth secrets. Avoid printing
resolved Compose configuration because it contains injected environment values;
`config --quiet` validates without rendering them.

Required variables:

| Variable | Secret | Purpose |
| --- | --- | --- |
| `WEB_PORT` | no | Conflict-free LAN host port mapped to container port 3010. |
| `NEXT_PUBLIC_SITE_URL` | no | Set to `https://deliciouswines.org`; baked into the web image and also used by Auth.js. |
| `POSTGRES_DB` | no | PostgreSQL database name. |
| `POSTGRES_USER` | no | PostgreSQL role name. |
| `POSTGRES_PASSWORD` | yes | Strong independent PostgreSQL password. |
| `DATABASE_URL` | yes | Prisma PostgreSQL URL using host `db`; URL-encode special characters in the password. |
| `AUTH_SECRET` | yes | Auth.js secret generated from at least 32 random bytes. |

Deployment coordinates have safe template defaults but should be reviewed:
`COMPOSE_PROJECT_NAME`, `WEB_BIND_ADDRESS`, `WEB_IMAGE`, `WEB_IMAGE_TAG`, and
`POSTGRES_VOLUME_NAME`. Use an immutable commit SHA or release number for
`WEB_IMAGE_TAG`; do not reuse a production tag.

Optional integrations are disabled by leaving their variables empty:
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APPLE_CLIENT_ID`,
`APPLE_CLIENT_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`,
`NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_TOP`,
`NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE`, `NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM`,
`NEXT_PUBLIC_ADSENSE_SLOT_POST`, `NEXT_PUBLIC_ADSENSE_SLOT_HOME`,
`NEXT_PUBLIC_ADSENSE_SLOT_SHOP`, and `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
The `NEXT_PUBLIC_*` values are public and baked into the image, so changing one
requires a rebuild. Payment configuration is intentionally absent from this
production artifact; the existing Stripe path is excluded for this alcohol business
and remains disabled pending the separately authorized processor work.

Generate values with an approved secret manager or a secure host command. Never paste
those values into logs, PRs, issues, or card comments.

## Validate and build

Run from a clean checkout of the reviewed commit on an Ubuntu Docker host:

```bash
export ENV_FILE=/etc/dwc/dwc.env
docker compose --env-file "$ENV_FILE" -f compose.production.yml config --quiet
docker compose --env-file "$ENV_FILE" -f compose.production.yml build --pull migrate web
docker image inspect "${WEB_IMAGE}:${WEB_IMAGE_TAG}" >/dev/null
docker image inspect "${WEB_IMAGE}-migrate:${WEB_IMAGE_TAG}" >/dev/null
```

If `WEB_IMAGE` differs from `dwc-web`, use that name in the image inspection commands.
The build uses `pnpm install --frozen-lockfile` in an image layer and produces the
standalone runtime. No source bind mount or runtime dependency install is used.

## Backup before every deployment

Create a logical backup before changing an existing stack:

```bash
sudo install -d -m 700 /var/backups/dwc
BACKUP="/var/backups/dwc/dwc-$(date -u +%Y%m%dT%H%M%SZ).dump"
docker compose --env-file "$ENV_FILE" -f compose.production.yml exec -T db \
  sh -ceu 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-acl' \
  >"$BACKUP"
test -s "$BACKUP"
sha256sum "$BACKUP"
```

The dump remains on the host with restricted permissions. Record its path and checksum
in the private deployment log, not its contents. List the persistent volume without
disclosing secrets:

```bash
docker compose --env-file "$ENV_FILE" -f compose.production.yml config --volumes
docker volume inspect dwc_postgres_data
```

Use the configured `POSTGRES_VOLUME_NAME` instead of `dwc_postgres_data` when it was
overridden. A Docker volume snapshot can supplement `pg_dump`, but is not a substitute
for a verified logical backup.

## Initialize or migrate safely

On a fresh database, `docker compose up` runs the one-shot `migrate` service first.
It executes only:

```text
prisma migrate deploy
```

The checked-in baseline migration creates the schema and records it in
`_prisma_migrations`. The web service starts only after the migration exits zero.
Production startup never runs `prisma db push`, `prisma migrate dev`, or a retry loop.

For a non-empty database without Prisma migration history, `migrate deploy` fails
closed (normally Prisma P3005). It does not erase existing data. Do not run reset, do
not drop the schema, and do not mark the baseline applied merely to make startup pass.
First take and verify a backup, compare the live schema to the checked-in baseline,
and obtain the database review required by the deployment card. Only when the live
schema is confirmed equivalent may an operator baseline it explicitly:

```bash
docker compose --env-file "$ENV_FILE" -f compose.production.yml run --rm migrate \
  node node_modules/prisma/build/index.js \
  migrate resolve --applied 20260720000000_init
```

After baselining, rerun the normal migration service and retain the backup. Schema
mismatches require a new reviewed forward migration; they must not be repaired with
`db push`.

## Deploy and verify

```bash
docker compose --env-file "$ENV_FILE" -f compose.production.yml up -d --no-build
docker compose --env-file "$ENV_FILE" -f compose.production.yml ps --all
docker compose --env-file "$ENV_FILE" -f compose.production.yml logs --tail=100 migrate
curl --fail --silent --show-error "http://127.0.0.1:${WEB_PORT}/api/health"
```

Expected state: `db` and `web` are healthy, `migrate` exited with code 0, and the
health response is `{"status":"ok","checks":{"database":"ok"}}`. The endpoint
returns 503 when PostgreSQL cannot answer `SELECT 1`; it never returns credentials or
database error details.

After the separate Caddy route is validated and reloaded, verify both production URLs
from outside the target LAN:

```bash
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  https://deliciouswines.org
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  https://www.deliciouswines.org
```

Both must return 200 with valid TLS before the deployment is considered complete.

## Restart, recreate, and reboot resilience

The database and web services use `restart: unless-stopped`; the Docker daemon must be
enabled at boot.

```bash
sudo systemctl enable --now docker
docker compose --env-file "$ENV_FILE" -f compose.production.yml restart db web
docker compose --env-file "$ENV_FILE" -f compose.production.yml up -d --no-build
docker compose --env-file "$ENV_FILE" -f compose.production.yml ps --all
curl --fail --silent --show-error "http://127.0.0.1:${WEB_PORT}/api/health"
```

To exercise a web recreate without touching the database volume:

```bash
docker compose --env-file "$ENV_FILE" -f compose.production.yml up -d \
  --no-deps --no-build --force-recreate web
curl --fail --silent --show-error "http://127.0.0.1:${WEB_PORT}/api/health"
```

For the authorized reboot check, reboot the host, reconnect, then run the `ps` and
`curl` checks above. Do not run `down` before reboot; the restart policies restore the
services automatically.

In an isolated acceptance stack, persistence can be proved by inserting a temporary
`ShippingRule`, recreating/restarting the services, selecting the same row, and then
deleting that test row. On production, use existing row counts and the
`_prisma_migrations` history as non-mutating persistence evidence.

## Routine operations

```bash
# Status and bounded recent logs
docker compose --env-file "$ENV_FILE" -f compose.production.yml ps --all
docker compose --env-file "$ENV_FILE" -f compose.production.yml logs --tail=200 web db

# Re-run forward migrations, then converge the stack
docker compose --env-file "$ENV_FILE" -f compose.production.yml run --rm migrate
docker compose --env-file "$ENV_FILE" -f compose.production.yml up -d --no-build

# Stop only this Compose project while preserving the named database volume
docker compose --env-file "$ENV_FILE" -f compose.production.yml down
```

Never add the volume-removal flag to the stop command. Volume deletion, schema reset,
and destructive restore are separate destructive operations and require explicit
authorization.

## Rollback

Application rollback preserves the PostgreSQL volume and does not reverse database
migrations automatically.

1. Confirm the prior immutable images still exist:

   ```bash
   PREVIOUS_TAG=reviewed-previous-tag
   docker image inspect "${WEB_IMAGE}:${PREVIOUS_TAG}" >/dev/null
   docker image inspect "${WEB_IMAGE}-migrate:${PREVIOUS_TAG}" >/dev/null
   ```

2. Back up the current database using the backup procedure above.
3. Back up `/etc/dwc/dwc.env`, set `WEB_IMAGE_TAG` to `PREVIOUS_TAG`, and validate:

   ```bash
   sudo cp -a "$ENV_FILE" "${ENV_FILE}.before-rollback.$(date -u +%Y%m%dT%H%M%SZ)"
   sudoedit "$ENV_FILE"
   docker compose --env-file "$ENV_FILE" -f compose.production.yml config --quiet
   ```

4. Recreate only the web service from the prior image and verify health:

   ```bash
   docker compose --env-file "$ENV_FILE" -f compose.production.yml up -d \
     --no-deps --no-build --force-recreate web
   curl --fail --silent --show-error "http://127.0.0.1:${WEB_PORT}/api/health"
   ```

5. If the prior app is incompatible with a forward migration, stop. Preserve the
   current volume and backup. Restore into a new database/volume only through a
   separately reviewed and authorized data-recovery procedure; never overwrite the
   only production volume in place.

To roll back the entire DWC deployment while preserving data, remove only the two DWC
Caddy hosts through the ingress procedure, validate/reload Caddy, then run the
volume-preserving Compose `down` command above. Do not touch unrelated routes or
containers.
