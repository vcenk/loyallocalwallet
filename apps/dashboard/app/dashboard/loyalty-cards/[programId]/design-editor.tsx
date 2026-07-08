"use client";

import { useState } from "react";
import { Button } from "@llw/ui";
import {
  WalletCardPreview,
  STAMP_ICONS,
  STAMP_ICON_KEYS,
  PATTERN_KEYS,
  CARD_STYLE_KEYS,
  STAMP_STYLE_KEYS,
  patternStyle,
} from "@/components/wallet-card-preview";
import { updateDesign } from "../actions";

const PALETTES = [
  { key: "Espresso", bg: "#4b2e2b", fg: "#ffffff" },
  { key: "Rust", bg: "#ae3115", fg: "#ffffff" },
  { key: "Matcha", bg: "#3f6212", fg: "#ffffff" },
  { key: "Berry", bg: "#be185d", fg: "#ffffff" },
  { key: "Midnight", bg: "#1e293b", fg: "#ffffff" },
  { key: "Cream", bg: "#f3e9df", fg: "#4b2e2b" },
  { key: "Ocean", bg: "#0e7490", fg: "#ffffff" },
  { key: "Royal", bg: "#1d4ed8", fg: "#ffffff" },
];

const STAMP_STYLE_LABEL: Record<string, string> = {
  circles: "Circles",
  pills: "Pills",
  progress: "Progress bar",
};

const SELECT_CLASS =
  "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function DesignEditor({
  programId,
  canEdit,
  businessName,
  programName,
  rewardTitle,
  stampsRequired,
  programType,
  logoUrl,
  initial,
}: {
  programId: string;
  canEdit: boolean;
  businessName: string;
  programName: string;
  rewardTitle: string;
  stampsRequired: number;
  programType: string;
  logoUrl?: string | null;
  initial: {
    bg: string;
    fg: string;
    stampIcon: string;
    pattern: string;
    cardStyle: string;
    stampStyle: string;
  };
}) {
  const [bg, setBg] = useState(initial.bg);
  const [fg, setFg] = useState(initial.fg);
  const [icon, setIcon] = useState(initial.stampIcon);
  const [pattern, setPattern] = useState(initial.pattern);
  const [cardStyle, setCardStyle] = useState(initial.cardStyle);
  const [stampStyle, setStampStyle] = useState(initial.stampStyle);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-5 lg:col-span-3">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Preset palettes
          </p>
          <div className="flex flex-wrap gap-2">
            {PALETTES.map((p) => (
              <button
                key={p.key}
                type="button"
                disabled={!canEdit}
                onClick={() => {
                  setBg(p.bg);
                  setFg(p.fg);
                }}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 ${
                  bg === p.bg
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: p.bg }}
                />
                {p.key}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <label className="space-y-1.5">
            <span className="block text-xs font-medium text-muted-foreground">
              Background
            </span>
            <input
              type="color"
              value={bg}
              disabled={!canEdit}
              onChange={(e) => setBg(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-lg border border-input bg-card"
            />
          </label>
          <label className="space-y-1.5">
            <span className="block text-xs font-medium text-muted-foreground">
              Text
            </span>
            <input
              type="color"
              value={fg}
              disabled={!canEdit}
              onChange={(e) => setFg(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-lg border border-input bg-card"
            />
          </label>
          <label className="min-w-[140px] flex-1 space-y-1.5">
            <span className="block text-xs font-medium text-muted-foreground">
              Card style
            </span>
            <select
              value={cardStyle}
              disabled={!canEdit}
              onChange={(e) => setCardStyle(e.target.value)}
              className={SELECT_CLASS}
            >
              {CARD_STYLE_KEYS.map((s) => (
                <option key={s} value={s}>
                  {cap(s)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Stamp style
          </p>
          <div className="flex flex-wrap gap-2">
            {STAMP_STYLE_KEYS.map((s) => {
              const active = s === stampStyle;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => setStampStyle(s)}
                  className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 ${
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {STAMP_STYLE_LABEL[s] ?? cap(s)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Pattern for preview and wallet strip
          </p>
          <div className="flex flex-wrap gap-2">
            {PATTERN_KEYS.map((p) => {
              const active = p === pattern;
              const st = patternStyle(p, fg);
              return (
                <button
                  key={p}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => setPattern(p)}
                  title={p}
                  className={`relative h-10 w-14 overflow-hidden rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 ${
                    active ? "border-primary ring-2 ring-primary/30" : "border-border"
                  }`}
                  style={{ backgroundColor: bg }}
                >
                  {st ? (
                    <span aria-hidden className="absolute inset-0" style={st} />
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Apple Wallet keeps the main pass layout simple, so patterns appear
            most clearly in the branded strip.
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Stamp icon
          </p>
          <div className="flex flex-wrap gap-2">
            {STAMP_ICON_KEYS.map((key) => {
              const IconC = STAMP_ICONS[key];
              const active = key === icon;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => setIcon(key)}
                  aria-label={`Use ${key} stamp icon`}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <IconC className="h-4 w-4" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>

        {canEdit ? (
          <form action={updateDesign}>
            <input type="hidden" name="programId" value={programId} />
            <input type="hidden" name="backgroundColor" value={bg} />
            <input type="hidden" name="foregroundColor" value={fg} />
            <input type="hidden" name="stampIcon" value={icon} />
            <input type="hidden" name="pattern" value={pattern} />
            <input type="hidden" name="cardStyle" value={cardStyle} />
            <input type="hidden" name="stampStyle" value={stampStyle} />
            <Button type="submit">Save design</Button>
          </form>
        ) : null}
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-24 space-y-3">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Live Wallet Preview
          </p>
          <WalletCardPreview
            businessName={businessName}
            programName={programName}
            rewardTitle={rewardTitle}
            stampsRequired={stampsRequired}
            currentStamps={Math.min(1, stampsRequired)}
            backgroundColor={bg}
            foregroundColor={fg}
            stampIcon={icon}
            pattern={pattern}
            cardStyle={cardStyle}
            stampStyle={stampStyle}
            programType={programType}
            logoUrl={logoUrl}
          />
        </div>
      </div>
    </div>
  );
}
