## Delicious Wines — local development

### One-command run (Docker)

From the repo root:

```bash
cp .env.example .env 2>/dev/null || cp env.example .env && docker compose up
```

Then open `http://localhost:3010`.

### Hot-reload dev (Docker)

Run the dev service with bind mounts + polling file watcher:

```bash
cp .env.example .env 2>/dev/null || cp env.example .env && docker compose up web-dev
```

Stop it:

```bash
docker compose down
```

If dependencies change, rebuild once:

```bash
docker compose build web-dev
```

### Database + Prisma

- **Run migrations**:

```bash
docker compose exec web pnpm db:migrate
```

- **Generate Prisma client** (usually not needed if you ran migrations):

```bash
docker compose exec web pnpm db:generate
```

### Optional pgAdmin

Start pgAdmin (profile `tools`), then open `http://localhost:5050`:

```bash
docker compose --profile tools up
```

Use the DB connection values from your `.env` (host is `db` from inside Docker, or `localhost` from your machine).

### Notes

- **Env template**: This repo includes `env.example` and (when not filtered by tooling) `.env.example`. Either can be copied to `.env`.
- **Ports**: web `3010`, pgAdmin `5050`. (Postgres is not published to the host by default; it’s reachable as `db:5432` inside Docker.)


### Production Deployment

**Important**: When deploying to production, ensure the following environment variable is properly configured:

- `NEXT_PUBLIC_SITE_URL` must use `https://` protocol (e.g., `https://deliciouswines.org`)

Using `http://` in production will cause insecure SSL warnings and affect SEO metadata.
