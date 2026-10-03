import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { MobileNavigation } from "./mobile-navigation";

it("offers every header destination in a native mobile disclosure", () => {
  const markup = renderToStaticMarkup(createElement(MobileNavigation));

  expect(markup).toMatch(/<details[^>]*class="[^"]*sm:hidden/);
  expect(markup).toMatch(/<summary[^>]*>Menu<\/summary>/);
  expect(markup).toContain('aria-label="Mobile navigation"');
  for (const href of ["/story", "/shop", "/wine-club", "/tastings", "/contact", "/account"]) {
    expect(markup).toContain(`href="${href}"`);
  }
});
