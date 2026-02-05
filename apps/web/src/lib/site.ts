function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

/**
 * Base URL for generating absolute URLs (metadata, sitemap, robots).
 *
 * IMPORTANT: In production, MUST set `NEXT_PUBLIC_SITE_URL` with https:// protocol
 * for secure SSL (e.g. `https://deliciouswines.org`).
 * Using http:// in production will cause insecure SSL warnings.
 */
export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return stripTrailingSlash(fromEnv);
  return "http://localhost:3010";
}

