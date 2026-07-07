import type { CSSProperties } from "react";
import { rewardModel, formatProgressText } from "@llw/config";
import {
  Star,
  Coffee,
  Heart,
  Gift,
  Cookie,
  IceCream,
  Scissors,
  PawPrint,
  Crown,
  Stamp,
  Cake,
  Sparkle,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export const STAMP_ICONS: Record<string, LucideIcon> = {
  star: Star,
  coffee: Coffee,
  heart: Heart,
  gift: Gift,
  cookie: Cookie,
  "ice-cream": IceCream,
  scissors: Scissors,
  paw: PawPrint,
  crown: Crown,
  stamp: Stamp,
  cake: Cake,
  sparkle: Sparkle,
  utensils: UtensilsCrossed,
};

export const STAMP_ICON_KEYS = Object.keys(STAMP_ICONS);

export const PATTERN_KEYS = [
  "none",
  "dots",
  "diagonal",
  "grid",
  "crosshatch",
  "vertical",
  "waves",
  "arches",
  "checker",
  "confetti",
  "sunburst",
  "capsule",
];

// Returns a CSS overlay for the chosen pattern, tinted with the text color.
export function patternStyle(
  pattern: string | undefined,
  fg: string,
): CSSProperties | null {
  switch (pattern) {
    case "dots":
      return {
        backgroundImage: `radial-gradient(${fg} 1.5px, transparent 1.6px)`,
        backgroundSize: "16px 16px",
        opacity: 0.16,
      };
    case "diagonal":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${fg} 0 1px, transparent 1px 12px)`,
        opacity: 0.14,
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(${fg} 1px, transparent 1px), linear-gradient(90deg, ${fg} 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
        opacity: 0.12,
      };
    case "crosshatch":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${fg} 0 1px, transparent 1px 10px), repeating-linear-gradient(-45deg, ${fg} 0 1px, transparent 1px 10px)`,
        opacity: 0.12,
      };
    case "vertical":
      return {
        backgroundImage: `repeating-linear-gradient(90deg, ${fg} 0 1px, transparent 1px 10px)`,
        opacity: 0.12,
      };
    case "waves":
      return {
        backgroundImage: `radial-gradient(50% 65% at 50% 100%, transparent 62%, ${fg} 64%, transparent 68%)`,
        backgroundSize: "38px 22px",
        opacity: 0.16,
      };
    case "arches":
      return {
        backgroundImage: `radial-gradient(circle at 50% 100%, transparent 46%, ${fg} 48%, transparent 53%)`,
        backgroundSize: "34px 28px",
        opacity: 0.15,
      };
    case "checker":
      return {
        backgroundImage: `linear-gradient(45deg, ${fg} 25%, transparent 25%, transparent 75%, ${fg} 75%), linear-gradient(45deg, ${fg} 25%, transparent 25%, transparent 75%, ${fg} 75%)`,
        backgroundPosition: "0 0, 10px 10px",
        backgroundSize: "20px 20px",
        opacity: 0.1,
      };
    case "confetti":
      return {
        backgroundImage: `radial-gradient(${fg} 1.4px, transparent 1.6px), radial-gradient(${fg} 1px, transparent 1.2px), linear-gradient(35deg, transparent 46%, ${fg} 47%, ${fg} 53%, transparent 54%)`,
        backgroundPosition: "0 0, 12px 10px, 4px 6px",
        backgroundSize: "28px 28px, 24px 24px, 32px 32px",
        opacity: 0.15,
      };
    case "sunburst":
      return {
        backgroundImage: `conic-gradient(from 0deg at 18% 18%, ${fg} 0deg 8deg, transparent 8deg 22deg, ${fg} 22deg 30deg, transparent 30deg 360deg)`,
        opacity: 0.1,
      };
    case "capsule":
      return {
        backgroundImage: `radial-gradient(14px 8px at 8px 8px, ${fg} 45%, transparent 48%)`,
        backgroundSize: "34px 18px",
        opacity: 0.12,
      };
    default:
      return null;
  }
}

export const CARD_STYLE_KEYS = [
  "classic",
  "modern",
  "playful",
  "minimal",
  "premium",
  "retail",
];
export const STAMP_STYLE_KEYS = ["circles", "pills", "progress"];

export interface WalletCardPreviewProps {
  businessName: string;
  programName: string;
  rewardTitle: string;
  stampsRequired: number;
  currentStamps?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  stampIcon?: string;
  pattern?: string;
  cardStyle?: string;
  stampStyle?: string;
  programType?: string;
  logoUrl?: string | null;
}

// Mirrors the customer-facing Apple Wallet store-card shape used by the pass
// generator: logo/header, strip-style progress, reward/member fields, barcode.
export function WalletCardPreview({
  businessName,
  programName,
  rewardTitle,
  stampsRequired,
  currentStamps = 0,
  backgroundColor = "#ae3115",
  foregroundColor = "#ffffff",
  stampIcon = "star",
  pattern = "none",
  cardStyle = "retail",
  stampStyle = "circles",
  programType = "stamps",
  logoUrl,
}: WalletCardPreviewProps) {
  const Icon = STAMP_ICONS[stampIcon] ?? Star;
  const model = rewardModel(programType);
  // Points/spend counts can be large → always a progress bar. Stamps/visits
  // render individual marks (capped at 12) unless "progress" style is chosen.
  const useBar = model.fixedQuantity === null || stampStyle === "progress";
  const requiredRaw = Math.max(1, stampsRequired || 1);
  const filledRaw = Math.max(0, currentStamps);
  const total = Math.min(requiredRaw, 12);
  const filled = Math.min(filledRaw, total);
  const frac = Math.min(1, filledRaw / requiredRaw);
  const overlay = patternStyle(pattern, foregroundColor);
  const marksPerRow = total > 6 ? 6 : total;
  const displayName = businessName || "Your business";
  const displayProgram = programName || "Loyalty card";
  const displayReward = rewardTitle || "Your reward";

  const progressLabel = formatProgressText(
    programType,
    Math.min(filledRaw, requiredRaw),
    requiredRaw,
  );

  return (
    <div
      data-card-style={cardStyle}
      className="relative w-full max-w-sm overflow-hidden rounded-[1.35rem]"
      style={{
        backgroundColor,
        color: foregroundColor,
        boxShadow:
          "0 22px 50px rgba(38,24,21,0.28), inset 0 0 0 1px rgba(255,255,255,0.22)",
      }}
    >
      <div className="relative">
        <div className="relative overflow-hidden px-5 pb-4 pt-4">
          {overlay ? (
            <div aria-hidden className="pointer-events-none absolute inset-0" style={overlay} />
          ) : null}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-14"
            style={{ backgroundColor: "rgba(0,0,0,0.13)" }}
          />

          <div className="relative flex min-h-12 items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-12 w-20 flex-none rounded-sm bg-white object-contain p-1 shadow-sm"
            />
          ) : (
            <span
              className="flex h-12 w-20 flex-none items-center justify-center rounded-sm text-xl font-bold shadow-sm"
              style={{ backgroundColor: foregroundColor, color: backgroundColor }}
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-none opacity-85">
              {displayName}
            </p>
            <p className="mt-1 truncate font-display text-2xl font-bold leading-tight">
              {displayProgram}
            </p>
          </div>
          <span className="flex-none text-xl font-semibold">
            {Math.min(filledRaw, requiredRaw)}/{requiredRaw}
          </span>
        </div>

          {useBar ? (
            <div className="relative mt-5">
              <div
                className="h-4 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: `${foregroundColor}2e` }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${frac * 100}%`, backgroundColor: foregroundColor }}
                />
              </div>
              <p className="mt-2 text-sm font-medium opacity-85">{progressLabel}</p>
            </div>
          ) : (
            <div className="relative mt-5">
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${marksPerRow}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: total }).map((_, i) => {
                  const on = i < filled;
                  const pill = stampStyle === "pills";
                  return (
                    <span
                      key={i}
                      className={`flex aspect-square items-center justify-center border-2 transition-colors ${
                        pill ? "rounded-xl" : "rounded-full"
                      }`}
                      style={{
                        borderColor: foregroundColor,
                        backgroundColor: on ? foregroundColor : "transparent",
                        opacity: on ? 1 : 0.62,
                      }}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: on ? backgroundColor : foregroundColor }}
                      />
                    </span>
                  );
                })}
              </div>
              <p className="mt-3 text-sm font-medium opacity-85">{progressLabel}</p>
            </div>
          )}
        </div>

        <div className="space-y-7 px-6 pb-6 pt-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-bold opacity-70">REWARD</p>
              <p className="mt-1 line-clamp-2 text-xl leading-tight">
                {displayReward}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold opacity-70">MEMBER</p>
              <p className="mt-1 text-xl leading-tight">Member</p>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <div className="rounded-lg bg-white p-3 shadow-[0_8px_22px_rgba(0,0,0,0.18)]">
              <div
                aria-hidden
                className="h-32 w-32"
                style={{
                  background:
                    "linear-gradient(90deg,#000 10px,transparent 10px 18px,#000 18px 24px,transparent 24px 32px,#000 32px 38px,transparent 38px),linear-gradient(#000 8px,transparent 8px 16px,#000 16px 22px,transparent 22px 30px,#000 30px 36px,transparent 36px)",
                  backgroundSize: "38px 38px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
