export const CONSENT_COOKIE = "dw_cookie_consent";

export type CookieConsent = {
  analytics: boolean;
  ads: boolean;
};

export function parseConsent(value?: string | null): CookieConsent | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as CookieConsent;
    if (typeof parsed.analytics !== "boolean" || typeof parsed.ads !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}
