import type { CSSProperties } from "react";
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
    default:
      return null;
  }
}

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
  logoUrl,
}: WalletCardPreviewProps) {
  const Icon = STAMP_ICONS[stampIcon] ?? Star;
  const total = Math.max(1, Math.min(stampsRequired || 1, 12));
  const filled = Math.max(0, Math.min(currentStamps, total));
  const overlay = patternStyle(pattern, foregroundColor);

  return (
    <div
      className="relative w-full max-w-sm overflow-hidden rounded-[1.75rem] p-6 shadow-2xl"
      style={{ backgroundColor, color: foregroundColor }}
    >
      {overlay ? (
        <div aria-hidden className="pointer-events-none absolute inset-0" style={overlay} />
      ) : null}
      {/* sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.16), transparent 45%)",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-85">
            {businessName || "Your business"}
          </span>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white/40"
            />
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: foregroundColor, color: backgroundColor }}
            >
              {(businessName || "B").charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <p className="mt-5 font-display text-2xl font-bold leading-tight">
          {programName || "Loyalty card"}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {Array.from({ length: total }).map((_, i) => {
            const on = i < filled;
            return (
              <span
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full border transition-colors"
                style={{
                  borderColor: foregroundColor,
                  backgroundColor: on ? foregroundColor : "transparent",
                  opacity: on ? 1 : 0.55,
                }}
              >
                <Icon
                  className="h-3.5 w-3.5"
                  style={{ color: on ? backgroundColor : foregroundColor }}
                />
              </span>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="opacity-85">
            {filled} of {total} stamps
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: "rgba(255,255,255,0.16)" }}
          >
            {rewardTitle || "Your reward"}
          </span>
        </div>

        {/* faux barcode strip */}
        <div
          className="mt-5 h-9 w-full rounded-lg"
          style={{
            background: `repeating-linear-gradient(90deg, ${foregroundColor} 0 2px, transparent 2px 5px)`,
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  );
}
