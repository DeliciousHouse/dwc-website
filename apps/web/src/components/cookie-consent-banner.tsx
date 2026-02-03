"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/ui/button";
import { CONSENT_COOKIE } from "@/lib/consent";

type ConsentChoice = {
  analytics: boolean;
  ads: boolean;
};

const CONSENT_DAYS = 180;

function setConsentCookie(choice: ConsentChoice) {
  const value = encodeURIComponent(JSON.stringify(choice));
  const maxAge = CONSENT_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function getExistingConsent() {
  const parts = document.cookie.split(";").map((p) => p.trim());
  const match = parts.find((p) => p.startsWith(`${CONSENT_COOKIE}=`));
  return Boolean(match);
}

export function CookieConsentBanner() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [ads, setAds] = useState(true);

  useEffect(() => {
    setOpen(!getExistingConsent());
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur">
      <div className="dw-container flex flex-col gap-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground">
          We use cookies to keep the site running and, with your consent, to enable analytics and ads.{" "}
          <Link className="underline underline-offset-4 hover:text-foreground" href="/cookies">
            Learn more
          </Link>
          .
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              Analytics cookies
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ads} onChange={(e) => setAds(e.target.checked)} />
              Advertising cookies
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConsentCookie({ analytics, ads });
                setOpen(false);
                window.location.reload();
              }}
            >
              Save preferences
            </Button>
            <Button
              onClick={() => {
                setConsentCookie({ analytics: true, ads: true });
                setOpen(false);
                window.location.reload();
              }}
            >
              Accept all
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
