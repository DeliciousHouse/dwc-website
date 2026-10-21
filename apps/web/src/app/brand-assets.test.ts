import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import manifest from "./manifest";

const web = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));

it("header uses the dark emblem on the light header, not the near-white one", () => {
  const layout = readFileSync(web("src/app/layout.tsx"), "utf8");
  expect(layout).toContain('<SiteImage id="logo"');
  expect(layout).not.toContain('id="logoInverted"');
});

it("manifest icons exist in public/", () => {
  const icons = manifest().icons ?? [];
  expect(icons.map((i) => i.sizes)).toEqual(["192x192", "512x512"]);
  for (const icon of icons) expect(existsSync(web(`public${icon.src}`))).toBe(true);
});

it("share and app icons exist for the app-router file conventions", () => {
  for (const f of ["apple-icon.png", "opengraph-image.png", "twitter-image.png"]) {
    expect(existsSync(web(`src/app/${f}`))).toBe(true);
  }
});
