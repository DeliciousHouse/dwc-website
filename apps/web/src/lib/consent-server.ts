import { cookies } from "next/headers";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";

export function getServerConsent() {
  const store = cookies();
  const value = store.get(CONSENT_COOKIE)?.value ?? null;
  return parseConsent(value);
}
