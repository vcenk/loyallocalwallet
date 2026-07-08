"use client";

import { useState } from "react";
import { Label } from "@llw/ui";

// Brand color picker with a live hex readout and a large swatch.
export function BrandColorField({
  defaultValue,
  disabled,
}: {
  defaultValue: string;
  disabled?: boolean;
}) {
  const [color, setColor] = useState(defaultValue || "#ae3115");

  return (
    <div className="space-y-1.5">
      <Label htmlFor="brandColor">Brand color</Label>
      <div className="flex items-center gap-3">
        <span
          className="h-11 w-11 shrink-0 rounded-xl border border-border shadow-sm"
          style={{ backgroundColor: color }}
        />
        <input
          id="brandColor"
          name="brandColor"
          type="color"
          value={color}
          disabled={disabled}
          onChange={(e) => setColor(e.target.value)}
          className="h-11 w-16 cursor-pointer rounded-xl border border-input bg-card disabled:opacity-50"
        />
        <span className="rounded-lg bg-muted px-3 py-1.5 font-mono text-sm uppercase text-foreground">
          {color}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Used across your dashboard accents and card suggestions.
      </p>
    </div>
  );
}
