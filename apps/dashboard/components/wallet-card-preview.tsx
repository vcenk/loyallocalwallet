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

// Per-style visual treatment for the card shell.
const CARD_STYLES: Record<
  string,
  { radius: string; shadow: string; sheen: boolean; ring: string }
> = {
  classic: { radius: "1.25rem", shadow: "0 12px 30px rgba(38,24,21,0.25)", sheen: true, ring: "none" },
  modern: { radius: "1.75rem", shadow: "0 22px 48px rgba(38,24,21,0.35)", sheen: true, ring: "none" },
  playful: { radius: "2.4rem", shadow: "0 18px 40px rgba(38,24,21,0.30)", sheen: true, ring: "none" },
  minimal: { radius: "0.9rem", shadow: "0 6px 16px rgba(38,24,21,0.14)", sheen: false, ring: "none" },
  premium: { radius: "1.5rem", shadow: "0 26px 60px rgba(38,24,21,0.45)", sheen: true, ring: "inset 0 0 0 1.5px rgba(255,255,255,0.28)" },
  retail: { radius: "1.05rem", shadow: "0 20px 46px rgba(38,24,21,0.34)", sheen: false, ring: "inset 0 0 0 1px rgba(255,255,255,0.22)" },
};

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

// A premium wallet-card mockup used across the card builder and editor.
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
  const shell = CARD_STYLES[cardStyle] ?? CARD_STYLES.modern;

  const progressLabel = formatProgressText(
    programType,
    Math.min(filledRaw, requiredRaw),
    requiredRaw,
  );

  return (
    <div
      className="relative w-full max-w-sm overflow-hidden"
      style={{
        backgroundColor,
        color: foregroundColor,
        borderRadius: shell.radius,
        boxShadow: shell.ring === "none" ? shell.shadow : `${shell.shadow}, ${shell.ring}`,
      }}
    >
      {overlay ? (
        <div aria-hidden className="pointer-events-none absolute inset-0" style={overlay} />
      ) : null}
      {shell.sheen ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.16), transparent 45%)",
          }}
        />
      ) : null}

      <div className="relative z-10">
        <div
          className="flex min-h-24 items-center gap-4 px-5 py-4"
          style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-14 w-14 flex-none rounded-xl bg-white object-cover p-1 shadow-sm"
            />
          ) : (
            <span
              className="flex h-14 w-14 flex-none items-center justify-center rounded-xl text-xl font-bold shadow-sm"
              style={{ backgroundColor: foregroundColor, color: backgroundColor }}
            >
              {(businessName || "B").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold opacity-80">
              {businessName || "Your business"}
            </p>
            <p className="truncate font-display text-2xl font-bold leading-tight">
              {programName || "Loyalty card"}
            </p>
          </div>
          <span
            className="flex-none rounded-full px-3 py-1 text-sm font-bold"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            {Math.min(filledRaw, requiredRaw)}/{requiredRaw}
          </span>
        </div>

        <div className="space-y-6 px-6 pb-6 pt-5">
          {useBar ? (
            <div>
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
            <div>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(total, 6)}, minmax(0, 1fr))` }}>
                {Array.from({ length: total }).map((_, i) => {
                  const on = i < filled;
                  const pill = stampStyle === "pills";
                  return (
                    <span
                      key={i}
                      className={`flex aspect-square items-center justify-center border transition-colors ${
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-bold opacity-70">REWARD</p>
              <p className="mt-1 line-clamp-2 text-xl leading-tight">
                {rewardTitle || "Your reward"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold opacity-70">MEMBER</p>
              <p className="mt-1 text-xl leading-tight">Member</p>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <div className="rounded-xl bg-white p-3 shadow-[0_8px_22px_rgba(0,0,0,0.18)]">
              <div
                aria-hidden
                className="h-28 w-28"
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
