"use client";

export const COOKIE_PREFERENCES_EVENT = "dw:cookie-preferences";

export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      className="w-fit rounded underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4"
      onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))}
    >
      Cookie preferences
    </button>
  );
}
