"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { getClientConsent } from "@/lib/consent-client";

type AdSlotProps = {
  slot?: string;
  className?: string;
  minHeightClassName?: string;
  label?: string;
};

declare global {
  interface Window {
    adsbygoogle?: { push: (args: unknown) => void }[];
  }
}

export function AdSlot({
  slot,
  className,
  minHeightClassName = "min-h-[120px]",
  label = "Advertisement",
}: AdSlotProps) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
  const didPush = useRef(false);
  const consent = getClientConsent();

  useEffect(() => {
    if (!adClient || !slot || didPush.current) return;
    if (!consent?.ads) return;
    didPush.current = true;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ignore ad script failures to avoid breaking page render.
    }
  }, [adClient, slot]);

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-sm text-muted-foreground",
        className,
      )}
    >
      {adClient && slot && consent?.ads ? (
        <ins
          className={cn("adsbygoogle block w-full", minHeightClassName)}
          data-ad-client={adClient}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
          aria-label={label}
        />
      ) : (
        <div>
          Advertisement disabled until consent is provided.
        </div>
      )}
    </div>
  );
}
