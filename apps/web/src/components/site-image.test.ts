import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { SiteImage } from "./site-image";

it("renders accurate alternative text for the contact hero photograph", () => {
  const markup = renderToStaticMarkup(
    createElement(SiteImage, {
      id: "contactVineyard",
      fill: true,
      sizes: "(min-width: 1024px) 50vw, 100vw",
    }),
  );

  expect(markup).toContain('alt="Wine glasses, a bottle and a meal on a restaurant table"');
});
