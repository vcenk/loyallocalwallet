"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

// Shown on the enrollment success page: the customer's personal invite link.
export function ReferralShare({
  url,
  businessName,
}: {
  url: string;
  businessName: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the field is selectable as a fallback */
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${businessName} rewards`,
          text: `Join ${businessName}'s rewards with me — we both get a bonus stamp!`,
          url,
        });
      } catch {
        /* user dismissed */
      }
    } else {
      copy();
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="flex h-11 flex-1 rounded-xl border border-input bg-card px-3 text-sm text-foreground"
        />
        <button
          type="button"
          onClick={copy}
          className="flex h-11 items-center gap-1.5 rounded-xl border border-input bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[color:var(--success)]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <button
        type="button"
        onClick={share}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
      >
        <Share2 className="h-4 w-4" />
        Share invite
      </button>
    </div>
  );
}
