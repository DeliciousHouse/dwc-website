"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Button } from "@/ui/button";

const AGE_COOKIE = "dw_age_verified";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const parts = document.cookie.split(";").map((p) => p.trim());
  const match = parts.find((p) => p.startsWith(`${name}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.slice(name.length + 1));
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
}

export function AgeGate() {
  const [open, setOpen] = useState(() => getCookie(AGE_COOKIE) !== "1");

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[420px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Are you 21 or older?</DialogTitle>
          <DialogDescription>
            You must be at least 21 years old to browse and purchase alcohol.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => {
              setCookie(AGE_COOKIE, "1", 365);
              setOpen(false);
            }}
          >
            Yes, I’m 21+
          </Button>
          <Button variant="secondary" onClick={() => (window.location.href = "https://www.responsibility.org/")}>
            No, take me back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

