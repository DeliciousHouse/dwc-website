import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowUrl = new URL("../../.github/workflows/ci.yml", import.meta.url);
const packageUrl = new URL("../../package.json", import.meta.url);

async function workflowText() {
  return readFile(workflowUrl, "utf8");
}

test("CI runs for pull requests and pushes to main without path filters", async () => {
  const workflow = await workflowText();

  assert.match(workflow, /on:\s*\n\s+pull_request:\s*\n\s+branches: \[main\]\s*\n\s+push:\s*\n\s+branches: \[main\]/);
  assert.doesNotMatch(workflow, /^\s+paths(?:-ignore)?:/m);
});

test("CI uses least privilege and cancels superseded runs", async () => {
  const workflow = await workflowText();

  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.match(workflow, /concurrency:\s*\n\s+group: .+\n\s+cancel-in-progress: true/);
  assert.doesNotMatch(workflow, /secrets\./);
});

test("CI installs pnpm dependencies from the lockfile with a safe cache", async () => {
  const workflow = await workflowText();

  assert.match(workflow, /uses: pnpm\/action-setup@v4/);
  assert.match(workflow, /version: 9\.15\.4/);
  assert.match(workflow, /uses: actions\/setup-node@v4/);
  assert.match(workflow, /cache: pnpm/);
  assert.match(workflow, /cache-dependency-path: pnpm-lock\.yaml/);
  assert.match(workflow, /run: pnpm install --frozen-lockfile/);
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /persist-credentials: false/);
});

test("CI exercises the contract tests, assets, lint, typecheck, and build", async () => {
  const workflow = await workflowText();
  const commands = [
    "pnpm test:ci",
    "pnpm assets:check",
    "pnpm -C apps/web exec prisma generate",
    "pnpm lint:changed",
    "pnpm typecheck",
    "pnpm build:ci",
  ];

  let previousIndex = -1;
  for (const command of commands) {
    const index = workflow.indexOf(`run: ${command}`);
    assert.ok(index > previousIndex, `${command} must exist after the preceding gate`);
    previousIndex = index;
  }
});

test("package scripts expose workspace-aware deterministic CI entry points", async () => {
  const packageJson = JSON.parse(await readFile(packageUrl, "utf8"));

  assert.equal(packageJson.scripts["test:ci"], "node --test tests/ci/*.test.mjs");
  assert.equal(packageJson.scripts["lint:changed"], "node scripts/ci/lint-changed.mjs");
  assert.equal(
    packageJson.scripts.typecheck,
    "pnpm -C packages/shared typecheck && pnpm -C apps/web typecheck",
  );
  assert.equal(
    packageJson.scripts["build:ci"],
    "pnpm -C packages/shared build && pnpm -C apps/web exec prisma generate && pnpm -C apps/web exec next build",
  );
  assert.doesNotMatch(packageJson.scripts["build:ci"], /npm (?:i|install)/);
});
