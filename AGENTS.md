# AGENTS.md

## Cursor Cloud specific instructions

### Architecture

pnpm monorepo with Docker Compose-based development. See `README.md` for standard commands.

| Service | Container | Port |
|---------|-----------|------|
| PostgreSQL 16 | `dwc-db` | 5432 (internal) |
| Next.js 16 web app | `dwc-web` | 3010 |

### Starting the dev environment

```bash
# Ensure .env exists (idempotent)
cp env.example .env 2>/dev/null || true

# Start services (db + web with hot reload)
sudo docker compose up -d db web
```

The `web` container automatically runs `pnpm install`, `prisma generate`, `prisma db push`, and `next dev` on startup. Wait ~30s after `docker compose up` for full readiness. Check with:

```bash
sudo docker compose logs web --tail 5
# Look for "✓ Ready in XXXms"
```

### Running commands inside the container

All dev commands (lint, typecheck, prisma) must run inside the `web` container:

```bash
sudo docker compose exec web pnpm lint
sudo docker compose exec web pnpm typecheck
sudo docker compose exec web pnpm db:generate
sudo docker compose exec web pnpm db:studio
```

### Gotchas

- **No lockfile in repo**: `pnpm-lock.yaml` is not committed. The update script generates it before Docker build. The Dockerfile `COPY` step requires it.
- **Docker-in-Docker**: This cloud environment runs Docker inside a Firecracker VM. Docker is configured with `fuse-overlayfs` storage driver and `iptables-legacy`. The Docker daemon must be started with `sudo dockerd` before using `docker compose`.
- **`cookies()` async error**: The root layout calls `cookies()` synchronously, which returns a Promise in Next.js 16. This causes a 500 on server-side render, but pages still render client-side in dev mode. This is a pre-existing code issue, not an environment problem.
- **Lint/typecheck errors**: The codebase has pre-existing ESLint errors (4) and TypeScript errors (~50). These are code issues, not environment issues.
- **`PRISMA_CLIENT_ENGINE_TYPE=binary`**: Required for Prisma 7 in Docker. Already set in `docker-compose.yml` and `env.example`.
- **Port 3010**: The app runs on port 3010, not the default 3000.
