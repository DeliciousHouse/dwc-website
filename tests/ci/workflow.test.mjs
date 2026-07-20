import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowUrl = new URL("../../.github/workflows/ci.yml", import.meta.url);
const packageUrl = new URL("../../package.json", import.meta.url);
const webPackageUrl = new URL("../../apps/web/package.json", import.meta.url);
const composeUrl = new URL("../../compose.production.yml", import.meta.url);
const composeFixtureUrl = new URL("../fixtures/compose-production.env", import.meta.url);
const versionUrl = new URL("../../VERSION", import.meta.url);
const changelogUrl = new URL("../../CHANGELOG.md", import.meta.url);

async function workflowText() {
  return (await readFile(workflowUrl, "utf8")).split(String.fromCharCode(13)).join("");
}

test("CI runs for pull requests and pushes to main without path filters", async () => {
  const workflow = await workflowText();

  assert.match(workflow, /on:\s*\n\s+pull_request:\s*\n\s+branches: \[main\]\s*\n\s+push:\s*\n\s+branches: \[main\]/);
  assert.doesNotMatch(workflow, /^\s+paths(?:-ignore)?:/m);
});

test("CI uses least privilege and cancels superseded runs", async () => {
  const workflow = await workflowText();

  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.match(workflow, /concurrency:\s*\r?\n\s+group: .+\r?\n\s+cancel-in-progress: true/);
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
    "pnpm test",
    "docker compose --env-file tests/fixtures/compose-production.env -f compose.production.yml config --quiet",
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

test("CI validates production Compose with a complete placeholder fixture", async () => {
  const [workflow, compose, fixture] = await Promise.all([
    workflowText(),
    readFile(composeUrl, "utf8"),
    readFile(composeFixtureUrl, "utf8"),
  ]);
  const command =
    "docker compose --env-file tests/fixtures/compose-production.env -f compose.production.yml config --quiet";
  const fixtureVariables = new Map(
    fixture
      .split(String.fromCharCode(13))
      .join("")
      .split(String.fromCharCode(10))
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        assert.ok(separator > 0, `invalid fixture line: ${line}`);
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
  const requiredVariables = new Set(
    [...compose.matchAll(/\$\{([A-Z0-9_]+):\?[^}]+\}/g)].map((match) => match[1]),
  );

  assert.match(workflow, /^\s+runs-on: ubuntu-latest\s*$/m);
  assert.match(workflow, new RegExp(`^\\s+run: ${command.replaceAll(".", "\\.")}$`, "m"));
  for (const variable of requiredVariables) {
    assert.ok(fixtureVariables.has(variable), `${variable} must be present in the Compose CI fixture`);
    assert.notEqual(fixtureVariables.get(variable), "", `${variable} must have a placeholder value`);
  }
  for (const [variable, value] of fixtureVariables) {
    assert.ok(
      value.includes("placeholder") || (variable === "WEB_PORT" && value === "3010"),
      `${variable} must use an obvious non-production placeholder`,
    );
  }
});

test("root release metadata records the 0.1.0.0 production capability release", async () => {
  const [version, packageJsonText, changelog] = await Promise.all([
    readFile(versionUrl, "utf8"),
    readFile(packageUrl, "utf8"),
    readFile(changelogUrl, "utf8"),
  ]);
  const packageJson = JSON.parse(packageJsonText);

  assert.equal(version.trim(), "0.1.0.0");
  assert.equal(packageJson.version, "0.1.0.0");
  assert.match(changelog, /^## \[0\.1\.0\.0\] - 2026-07-20$/m);
});

test("package scripts expose workspace-aware deterministic CI entry points", async () => {
  const packageJson = JSON.parse(await readFile(packageUrl, "utf8"));

  assert.equal(packageJson.scripts.test, "pnpm test:ci && pnpm -C apps/web test");
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

test("local build entry points use the locked workspace without installing packages", async () => {
  const packageJson = JSON.parse(await readFile(packageUrl, "utf8"));
  const webPackageJson = JSON.parse(await readFile(webPackageUrl, "utf8"));

  assert.equal(packageJson.scripts.build, "pnpm assets:check && pnpm build:ci");
  assert.equal(webPackageJson.scripts.pretest, "prisma generate");
  assert.equal(
    webPackageJson.scripts.build,
    "pnpm -C ../.. assets:check && prisma generate && next build",
  );
  assert.doesNotMatch(packageJson.scripts.build, /npm (?:i|install)/);
  assert.doesNotMatch(webPackageJson.scripts.build, /npm (?:i|install)/);
});
