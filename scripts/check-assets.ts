import fs from "node:fs/promises";
import path from "node:path";

type SiteImage = {
  id: string;
  localPath: string;
};

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursive(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listFilesRecursive(p)));
    else out.push(p);
  }
  return out;
}

function rel(root: string, abs: string) {
  return path.relative(root, abs).replaceAll(path.sep, "/");
}

async function main() {
  const root = process.cwd();
  const appSrc = path.join(root, "apps/web/src");
  const publicDir = path.join(root, "apps/web/public");

  // 1) Verify manifest local paths exist
  const manifestPath = path.join(appSrc, "assets/siteImages.ts");
  const manifestText = await fs.readFile(manifestPath, "utf8");

  // Simple extraction: localPath: "..."
  const localPathMatches = [...manifestText.matchAll(/localPath:\s*"([^"]+)"/g)].map((m) => m[1]);
  if (localPathMatches.length === 0) throw new Error("No localPath entries found in siteImages.ts");

  const missing: string[] = [];
  for (const p of localPathMatches) {
    if (!p.startsWith("/")) continue; // ignore non-public
    const onDisk = path.join(publicDir, p.slice(1));
    if (!(await fileExists(onDisk))) missing.push(`${p} (missing ${rel(root, onDisk)})`);
  }

  // 2) Enforce single source of truth: no direct next/image usage except SiteImage component
  const files = (await listFilesRecursive(appSrc)).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
  const violations: string[] = [];

  for (const f of files) {
    const r = rel(root, f);
    const txt = await fs.readFile(f, "utf8");

    // no raw img tags (icons should be SVG components, not <img>)
    if (txt.match(/<img\b/i)) {
      violations.push(`${r}: uses <img> (use next/image via <SiteImage />)`);
    }

    // disallow importing next/image outside the single component
    if (txt.includes('from "next/image"') || txt.includes("from 'next/image'")) {
      if (!r.endsWith("apps/web/src/components/site-image.tsx")) {
        violations.push(`${r}: imports next/image directly (use <SiteImage />)`);
      }
    }
  }

  if (missing.length || violations.length) {
    const lines = [
      "Asset checks failed.",
      missing.length ? "\nMissing files referenced by siteImages.ts:\n- " + missing.join("\n- ") : "",
      violations.length ? "\nCode violations:\n- " + violations.join("\n- ") : "",
      "",
    ].filter(Boolean);
    throw new Error(lines.join("\n"));
  }

  // eslint-disable-next-line no-console
  console.log("assets:check passed");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

