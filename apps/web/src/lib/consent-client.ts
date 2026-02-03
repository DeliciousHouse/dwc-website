import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";

export function getClientConsent() {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((p) => p.trim());
  const match = parts.find((p) => p.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  return parseConsent(decodeURIComponent(match.slice(CONSENT_COOKIE.length + 1)));
}
