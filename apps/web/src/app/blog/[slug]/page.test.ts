import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

import { posts } from "../posts";
import BlogPostPage, { generateMetadata } from "./page";

it.each(posts)("renders the Journal post and metadata for $slug", async ({ slug, title }) => {
  const props = { params: Promise.resolve({ slug }) };

  const page = await BlogPostPage(props);
  expect(renderToStaticMarkup(page)).toContain(`>${title}</h1>`);
  expect(await generateMetadata(props)).toMatchObject({
    title,
    alternates: { canonical: `/blog/${slug}` },
  });
});

it("returns not found for an unknown Journal slug", async () => {
  await expect(
    Promise.resolve().then(() => BlogPostPage({ params: Promise.resolve({ slug: "not-a-journal-post" }) })),
  ).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
});
