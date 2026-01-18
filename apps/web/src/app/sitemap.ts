import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

import { posts } from "./blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const now = new Date().toISOString();

  const staticRoutes = [
    "",
    "/shop",
    "/wine-club",
    "/story",
    "/tastings",
    "/contact",
    "/blog",
    "/privacy",
    "/terms",
    "/refunds",
    "/shipping-policy",
    "/cookies",
    "/do-not-sell",
    "/photo-credits",
    "/accessibility",
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
  }));

  const postEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date,
  }));

  return [...staticEntries, ...postEntries];
}
