## Delicious Wines — local development

### One-command run (Docker)

From the repo root:

```bash
cp .env.example .env 2>/dev/null || cp env.example .env && docker compose up
```

Then open `http://localhost:3000`.

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
- **Ports**: web `3000`, postgres `5432`, pgAdmin `5050`.

