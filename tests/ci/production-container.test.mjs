import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

test("production web image is immutable, locked, standalone, and non-root", async () => {
  const [dockerfile, nextConfig] = await Promise.all([
    text("Dockerfile.web"),
    text("apps/web/next.config.ts"),
  ]);

  assert.match(dockerfile, /FROM node:24-alpine@sha256:[0-9a-f]{64} AS deps/);
  assert.match(dockerfile, /FROM node:24-alpine@sha256:[0-9a-f]{64} AS builder/);
  assert.match(dockerfile, /FROM node:24-alpine@sha256:[0-9a-f]{64} AS runner/);
  assert.match(dockerfile, /pnpm install --frozen-lockfile/);
  assert.match(dockerfile, /pnpm -C apps\/web exec prisma generate/);
  assert.match(dockerfile, /pnpm -C apps\/web exec next build/);
  assert.match(dockerfile, /USER nextjs/);
  assert.match(dockerfile, /CMD \["node", "apps\/web\/server\.js"\]/);

  const runtimeStage = dockerfile.slice(dockerfile.lastIndexOf(" AS runner"));
  assert.doesNotMatch(runtimeStage, /(?:pnpm|npm|yarn) (?:install|add|i)\b/);
  assert.match(nextConfig, /output:\s*"standalone"/);
  assert.match(nextConfig, /outputFileTracingRoot:/);
});

test("production Compose isolates and bounds the healthy web and database services", async () => {
  const compose = await text("compose.production.yml");

  assert.match(compose, /^\s{2}db:\s*$/m);
  assert.match(compose, /^\s{2}migrate:\s*$/m);
  assert.match(compose, /^\s{2}web:\s*$/m);
  assert.match(compose, /restart: unless-stopped/g);
  assert.match(compose, /\$\{WEB_IMAGE_TAG:\?Set immutable WEB_IMAGE_TAG/);
  assert.match(compose, /postgres_data:\/var\/lib\/postgresql\/data/);
  assert.match(compose, /image: postgres:16-alpine@sha256:[0-9a-f]{64}/);
  assert.match(compose, /^volumes:\s*\n\s{2}postgres_data:/m);
  assert.match(compose, /\$\{WEB_BIND_ADDRESS:-0\.0\.0\.0\}:\$\{WEB_PORT:\?.+\}:3010/);
  assert.match(compose, /condition: service_healthy/);
  assert.match(compose, /condition: service_completed_successfully/);
  assert.match(compose, /\/api\/health/);
  assert.match(compose, /cpus:/g);
  assert.match(compose, /mem_limit:/g);
  assert.match(compose, /max-size: "10m"/);
  assert.match(compose, /max-file: "3"/);
  assert.match(compose, /read_only: true/);
  assert.doesNotMatch(compose, /pgadmin|prisma db push|pnpm install|npm install|:\/app\b/i);

  const dbService = compose.slice(compose.indexOf("  db:"), compose.indexOf("  migrate:"));
  assert.doesNotMatch(dbService, /^\s{4}ports:/m);
});

test("production startup deploys a checked-in, non-destructive Prisma baseline", async () => {
  const [dockerfile, compose, migration, migrationLock] = await Promise.all([
    text("Dockerfile.web"),
    text("compose.production.yml"),
    text("apps/web/prisma/migrations/20260720000000_init/migration.sql"),
    text("apps/web/prisma/migrations/migration_lock.toml"),
  ]);

  assert.match(dockerfile, /FROM deps AS migrator/);
  assert.match(dockerfile, /COPY .*apps\/web\/prisma apps\/web\/prisma/);
  assert.match(
    compose,
    /working_dir: \/app\/apps\/web[\s\S]*command: \["node", "node_modules\/prisma\/build\/index\.js", "migrate", "deploy"\]/,
  );
  assert.doesNotMatch(`${dockerfile}\n${compose}`, /prisma db push/);
  assert.match(migrationLock, /provider = "postgresql"/);
  assert.match(migration, /CREATE TABLE "User"/);
  assert.match(migration, /CREATE TABLE "Product"/);
  assert.doesNotMatch(migration, /DROP (?:DATABASE|SCHEMA|TABLE)|TRUNCATE/i);
  assert.doesNotMatch(migration, /Update available|[┌│└]/);
});

test("health evaluation reports ready only when the database probe succeeds", async () => {
  const { evaluateHealth } = await import("../../apps/web/src/lib/health.ts");
  let probes = 0;

  const ready = await evaluateHealth(async () => {
    probes += 1;
  });
  const unavailable = await evaluateHealth(async () => {
    probes += 1;
    throw new Error("sensitive database detail");
  });

  assert.equal(probes, 2);
  assert.deepEqual(ready, {
    status: 200,
    body: { status: "ok", checks: { database: "ok" } },
  });
  assert.deepEqual(unavailable, {
    status: 503,
    body: { status: "unavailable", checks: { database: "unavailable" } },
  });
  assert.doesNotMatch(JSON.stringify(unavailable), /sensitive database detail/);
});

test("health endpoint probes PostgreSQL and is never cached", async () => {
  const route = await text("apps/web/src/app/api/health/route.ts");

  assert.match(route, /export const dynamic = "force-dynamic"/);
  assert.match(route, /evaluateHealth/);
  assert.match(route, /\$queryRaw`SELECT 1`/);
  assert.match(route, /status: result\.status/);
  assert.match(route, /"Cache-Control": "no-store"/);
});

test("production auth only trusts forwarded hosts when explicitly enabled", async () => {
  const auth = await text("apps/web/src/auth.ts");

  assert.match(
    auth,
    /trustHost: process\.env\.NODE_ENV !== "production" \|\| process\.env\.AUTH_TRUST_HOST === "true"/,
  );
});

test("production artifacts do not enable the excluded Stripe integration", async () => {
  const artifacts = await Promise.all([
    text("Dockerfile.web"),
    text("compose.production.yml"),
    text("env.production.example"),
  ]);

  assert.doesNotMatch(artifacts.join("\n"), /STRIPE_/);
});

test("production Square configuration is runtime-only and fails soft when blank", async () => {
  const [dockerfile, compose, envTemplate, runbook] = await Promise.all([
    text("Dockerfile.web"),
    text("compose.production.yml"),
    text("env.production.example"),
    text("docs/production-deployment.md"),
  ]);
  const webService = compose.slice(compose.indexOf("  web:"));
  const buildBlock = webService.slice(
    webService.indexOf("    build:"),
    webService.indexOf("    restart:"),
  );
  const environmentBlock = webService.slice(
    webService.indexOf("    environment:"),
    webService.indexOf("    ports:"),
  );
  const squareVariables = [
    "SQUARE_ACCESS_TOKEN",
    "SQUARE_ENVIRONMENT",
    "SQUARE_LOCATION_ID",
  ];
  const templateSquareVariables = [...envTemplate.matchAll(/^(SQUARE_[A-Z_]+)=/gm)]
    .map((match) => match[1]);
  const runtimeSquareVariables = [...environmentBlock.matchAll(/^\s{6}(SQUARE_[A-Z_]+):/gm)]
    .map((match) => match[1]);

  assert.deepEqual(templateSquareVariables, squareVariables);
  assert.deepEqual(runtimeSquareVariables, squareVariables);

  for (const variable of squareVariables) {
    assert.match(envTemplate, new RegExp(`^${variable}=$`, "m"));
    assert.match(
      environmentBlock,
      new RegExp(`^\\s{6}${variable}: \\$\\{` + `${variable}:-\\}$`, "m"),
    );
    assert.match(runbook, new RegExp(`\\b${variable}\\b`));
    assert.doesNotMatch(`${dockerfile}\n${buildBlock}`, new RegExp(variable));
    assert.doesNotMatch(
      `${dockerfile}\n${compose}\n${envTemplate}`,
      new RegExp(`NEXT_PUBLIC_(?:${variable}|SQUARE_)`),
    );
  }

  assert.match(runbook, /leave (?:all three|the three) .*Square.* blank/i);
});

test("production runbook covers secrets, lifecycle, persistence, backup, and rollback", async () => {
  const runbook = await text("docs/production-deployment.md");
  const requiredVariables = [
    "WEB_PORT",
    "NEXT_PUBLIC_SITE_URL",
    "POSTGRES_DB",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "DATABASE_URL",
    "AUTH_SECRET",
  ];

  for (const variable of requiredVariables) {
    assert.match(runbook, new RegExp(`\\b${variable}\\b`));
  }

  assert.match(runbook, /https:\/\/deliciouswines\.org/);
  assert.match(runbook, /https:\/\/www\.deliciouswines\.org/);
  assert.match(runbook, /--env-file "\$ENV_FILE" -f compose\.production\.yml config/);
  assert.match(runbook, /build --pull/);
  assert.match(runbook, /up -d --no-build/);
  assert.match(runbook, /restart/);
  assert.match(runbook, /pg_dump/);
  assert.match(runbook, /migrate resolve --applied 20260720000000_init/);
  assert.match(runbook, /rollback/i);
  assert.match(runbook, /preserve/i);
  assert.doesNotMatch(runbook, /docker compose[^\n]*down -v/);
});
