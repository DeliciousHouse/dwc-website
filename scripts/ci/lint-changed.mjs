import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ZERO_SHA = /^0+$/;
const FULL_SHA = /^[0-9a-f]{40}$/i;
const DOCUMENT_EXTENSIONS = [".md", ".markdown", ".rst"];
const DOCUMENT_BASENAMES = new Set([
  "authors",
  "changelog",
  "contributing",
  "license",
  "notice",
  "readme",
]);

class LintScopeFallback extends Error {}

function isUsableSha(value) {
  return typeof value === "string" && FULL_SHA.test(value) && !ZERO_SHA.test(value);
}

function isUnambiguouslyDocumentation(file) {
  if (typeof file !== "string" || file.length === 0) return false;

  const normalized = file.replaceAll("\\", "/").toLowerCase();
  if (DOCUMENT_EXTENSIONS.some((extension) => normalized.endsWith(extension))) {
    return true;
  }

  return DOCUMENT_BASENAMES.has(path.posix.basename(normalized));
}

export function classifyChangedFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return {
      mode: "full",
      reason: "changed-file detection returned an empty diff",
    };
  }

  for (const file of files) {
    if (!isUnambiguouslyDocumentation(file)) {
      return {
        mode: "full",
        reason: `non-documentation path changed: ${String(file)}`,
      };
    }
  }

  return {
    mode: "skip",
    reason: "all changed files are unambiguously documentation",
  };
}

function comparisonRange(env) {
  if (env.GITHUB_ACTIONS !== "true") {
    return "origin/main...HEAD";
  }

  if (env.GITHUB_EVENT_NAME === "pull_request") {
    if (!isUsableSha(env.GITHUB_BASE_SHA) || !isUsableSha(env.GITHUB_HEAD_SHA)) {
      throw new LintScopeFallback("pull_request base/head SHA is unavailable");
    }
    return `${env.GITHUB_BASE_SHA}...${env.GITHUB_HEAD_SHA}`;
  }

  if (env.GITHUB_EVENT_NAME === "push") {
    if (!isUsableSha(env.GITHUB_BEFORE_SHA) || !isUsableSha(env.GITHUB_HEAD_SHA)) {
      throw new LintScopeFallback("push before/head SHA is unavailable or unusable");
    }
    return `${env.GITHUB_BEFORE_SHA}..${env.GITHUB_HEAD_SHA}`;
  }

  throw new LintScopeFallback(`unsupported GitHub event: ${env.GITHUB_EVENT_NAME || "unknown"}`);
}

function defaultGit(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    windowsHide: true,
  });
}

export function detectLintScope({
  cwd = process.cwd(),
  env = process.env,
  git = (args) => defaultGit(args, cwd),
} = {}) {
  try {
    const range = comparisonRange(env);
    const output = git([
      "diff",
      "--name-only",
      "--no-renames",
      "-z",
      range,
      "--",
    ]);
    const files = output.split("\0").filter(Boolean);
    return classifyChangedFiles(files);
  } catch (error) {
    return {
      mode: "full",
      reason: error instanceof LintScopeFallback
        ? error.message
        : error instanceof Error
          ? `changed-file detection failed: ${error.message}`
        : "changed-file detection failed with an unknown error",
    };
  }
}

function runFullLint(cwd) {
  const windows = process.platform === "win32";
  const command = windows ? process.env.ComSpec || "cmd.exe" : "pnpm";
  const args = windows ? ["/d", "/s", "/c", "pnpm lint"] : ["lint"];
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    windowsHide: true,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`full lint gate failed with exit code ${String(result.status)}`);
  }
}

export function runLintGate({
  cwd = process.cwd(),
  detect = () => detectLintScope({ cwd }),
  lint = () => runFullLint(cwd),
  logger = console,
} = {}) {
  let decision;
  try {
    decision = detect();
  } catch (error) {
    decision = {
      mode: "full",
      reason: error instanceof Error
        ? `changed-file detector crashed: ${error.message}`
        : "changed-file detector crashed with an unknown error",
    };
  }

  if (decision?.mode === "skip") {
    logger.log(`Skipping lint: ${decision.reason}.`);
    return decision;
  }

  if (decision?.mode !== "full") {
    decision = {
      mode: "full",
      reason: "changed-file detector returned an uncertain classification",
    };
  }

  logger.log(`Running full lint: ${decision.reason}.`);
  lint();
  return decision;
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  try {
    runLintGate();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
