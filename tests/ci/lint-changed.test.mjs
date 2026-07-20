import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyChangedFiles,
  detectLintScope,
  runLintGate,
} from "../../scripts/ci/lint-changed.mjs";

test("classifyChangedFiles skips an unambiguously docs-only change", () => {
  assert.deepEqual(
    classifyChangedFiles(["README.md", "docs/contributing.rst"]),
    { mode: "skip", reason: "all changed files are unambiguously documentation" },
  );
});

test("classifyChangedFiles runs the full gate for source changes", () => {
  assert.deepEqual(classifyChangedFiles(["apps/web/src/app/page.tsx"]), {
    mode: "full",
    reason: "non-documentation path changed: apps/web/src/app/page.tsx",
  });
});

test("classifyChangedFiles treats uncertain extensions as relevant", () => {
  assert.deepEqual(classifyChangedFiles(["docs/build.py"]), {
    mode: "full",
    reason: "non-documentation path changed: docs/build.py",
  });
});

test("classifyChangedFiles fails closed for an empty diff", () => {
  assert.deepEqual(classifyChangedFiles([]), {
    mode: "full",
    reason: "changed-file detection returned an empty diff",
  });
});

test("detectLintScope fails closed when the pull request base is unknown", () => {
  assert.deepEqual(
    detectLintScope({
      env: { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "pull_request" },
      git: () => assert.fail("git must not run without a comparison base"),
    }),
    { mode: "full", reason: "pull_request base/head SHA is unavailable" },
  );
});

test("detectLintScope fails closed when git diff fails", () => {
  const decision = detectLintScope({
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_NAME: "pull_request",
      GITHUB_BASE_SHA: "1111111111111111111111111111111111111111",
      GITHUB_HEAD_SHA: "2222222222222222222222222222222222222222",
    },
    git: () => {
      throw new Error("broken diff");
    },
  });

  assert.equal(decision.mode, "full");
  assert.match(decision.reason, /changed-file detection failed: broken diff/);
});

test("detectLintScope uses the exact push before and after SHAs", () => {
  const calls = [];
  const decision = detectLintScope({
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_NAME: "push",
      GITHUB_BEFORE_SHA: "1111111111111111111111111111111111111111",
      GITHUB_HEAD_SHA: "2222222222222222222222222222222222222222",
    },
    git: (args) => {
      calls.push(args);
      return "README.md\0";
    },
  });

  assert.equal(decision.mode, "skip");
  assert.deepEqual(calls, [[
    "diff",
    "--name-only",
    "--no-renames",
    "-z",
    "1111111111111111111111111111111111111111..2222222222222222222222222222222222222222",
    "--",
  ]]);
});

test("detectLintScope fails closed for an initial push with a zero before SHA", () => {
  const decision = detectLintScope({
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_NAME: "push",
      GITHUB_BEFORE_SHA: "0000000000000000000000000000000000000000",
      GITHUB_HEAD_SHA: "2222222222222222222222222222222222222222",
    },
    git: () => assert.fail("git must not diff against the zero SHA"),
  });

  assert.deepEqual(decision, {
    mode: "full",
    reason: "push before/head SHA is unavailable or unusable",
  });
});

test("runLintGate runs the full lint command when detection fails", () => {
  let lintRuns = 0;
  const decision = runLintGate({
    detect: () => {
      throw new Error("detector crashed");
    },
    lint: () => {
      lintRuns += 1;
    },
  });

  assert.equal(decision.mode, "full");
  assert.match(decision.reason, /detector crashed/);
  assert.equal(lintRuns, 1);
});

test("runLintGate never converts a lint failure into success", () => {
  assert.throws(
    () => runLintGate({
      detect: () => ({ mode: "full", reason: "source changed" }),
      lint: () => {
        throw new Error("lint failed");
      },
    }),
    /lint failed/,
  );
});

test("runLintGate does not lint an unambiguous docs-only change", () => {
  let lintRuns = 0;
  const decision = runLintGate({
    detect: () => ({ mode: "skip", reason: "docs only" }),
    lint: () => {
      lintRuns += 1;
    },
  });

  assert.equal(decision.mode, "skip");
  assert.equal(lintRuns, 0);
});
