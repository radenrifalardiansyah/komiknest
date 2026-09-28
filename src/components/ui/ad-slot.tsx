"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Google AdSense slot. Renders nothing until NEXT_PUBLIC_ADSENSE_CLIENT and a
 * slot id are configured, so development and pre-approval builds stay clean.
 */
export function AdSlot({ slot, label, className }: { slot?: string; label: string; className?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || !slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle ??= []).push({});
    } catch {
      // ad blockers throw here; ignore
    }
  }, [client, slot]);

  if (!client || !slot) return null;

  return (
    <aside aria-label={label} className={cn("mx-auto w-full max-w-3xl", className)}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-muted">{label}</p>
      <ins
        className="adsbygoogle block min-h-[100px] rounded-xl bg-surface-2/50"
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
