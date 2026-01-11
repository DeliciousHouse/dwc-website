function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

/**
 * Base URL for generating absolute URLs (metadata, sitemap, robots).
 *
 * Prefer setting `NEXT_PUBLIC_SITE_URL` in production (e.g. `https://deliciouswines.com`).
 */
export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return stripTrailingSlash(fromEnv);
  return "http://localhost:3000";
}

