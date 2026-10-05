import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { MobileNavigation } from "./mobile-navigation";

it("keeps shared theme tokens and the mobile panel opaque in both schemes", () => {
  const directory = mkdtempSync(path.join(process.env.TMPDIR || tmpdir(), "dwc-theme-"));
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  const markup = renderToStaticMarkup(createElement(MobileNavigation));
  // Only the theme declarations are needed; Tailwind's bg-background maps to this token.
  const tokens = css.match(/(?:\:root|\.dark)\s*\{[^}]*\}/g)?.join("\n");
  expect(tokens).toBeTruthy();
  const file = path.join(directory, "theme.html");
  writeFileSync(file, `<style>${tokens}
    nav { background: var(--background); color: var(--muted-foreground); }
    </style>${markup}<pre id="result"></pre><script>
    const panel = document.querySelector('nav');
    const canvas = document.createElement('canvas').getContext('2d');
    const results = ['light', 'dark'].map(scheme => {
      document.documentElement.className = scheme;
      const root = getComputedStyle(document.documentElement);
      const style = getComputedStyle(panel);
      canvas.clearRect(0, 0, 1, 1);
      canvas.fillStyle = style.backgroundColor;
      canvas.fillRect(0, 0, 1, 1);
      return { scheme, alpha: canvas.getImageData(0, 0, 1, 1).data[3],
        background: root.getPropertyValue('--background').trim(),
        foreground: root.getPropertyValue('--foreground').trim(),
        panel: style.backgroundColor, color: style.color };
    });
    document.querySelector('#result').textContent = JSON.stringify(results);
    </script>`);
  try {
    const chrome = process.env.CHROME_BIN || (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : "google-chrome");
    const result = spawnSync(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu",
      "--disable-background-networking", "--disable-extensions", "--no-first-run",
      `--user-data-dir=${path.join(directory, "profile")}`, "--dump-dom", pathToFileURL(file).href],
    { encoding: "utf8", timeout: 60_000, maxBuffer: 2 * 1024 * 1024 });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    const match = result.stdout.match(/<pre id="result">([^<]+)<\/pre>/);
    expect(match, result.stdout).not.toBeNull();
    const results = JSON.parse(match![1]);
    for (const theme of results) {
      expect(theme.background, theme.scheme).not.toBe("");
      expect(theme.foreground, theme.scheme).not.toBe("");
      expect(theme.panel, theme.scheme).not.toBe("rgba(0, 0, 0, 0)");
      expect(theme.alpha, theme.scheme).toBe(255);
      expect(theme.panel, theme.scheme).toBe(results[0].panel);
      expect(theme.color, theme.scheme).toBe(results[0].color);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 75_000);
