import { expect, it } from "vitest";

it.each([
  ["/", () => import("./page")],
  ["/shop", () => import("./shop/page")],
  ["/story", () => import("./story/page")],
  ["/wine-club", () => import("./wine-club/page")],
  ["/tastings", () => import("./tastings/page")],
  ["/blog", () => import("./blog/page")],
  ["/contact", () => import("./contact/layout")],
  ["/terms", () => import("./terms/page")],
  ["/privacy", () => import("./privacy/page")],
] as const)("declares the canonical path for %s", async (path, loadRoute) => {
  expect(await loadRoute()).toMatchObject({ metadata: { alternates: { canonical: path } } });
});
