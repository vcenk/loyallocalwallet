import * as React from "react";

export interface CardPreviewProps {
  businessName: string;
  programName: string;
  rewardTitle: string;
  stampsRequired: number;
  currentStamps?: number;
  backgroundColor?: string;
  foregroundColor?: string;
}

// A wallet-style loyalty card mock for the card designer preview.
export function CardPreview({
  businessName,
  programName,
  rewardTitle,
  stampsRequired,
  currentStamps = 0,
  backgroundColor = "#2563EB",
  foregroundColor = "#FFFFFF",
}: CardPreviewProps) {
  const total = Math.max(1, Math.min(stampsRequired || 1, 30));
  const filled = Math.max(0, Math.min(currentStamps, total));

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-5 shadow-md"
      style={{ backgroundColor, color: foregroundColor }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide opacity-80">
          {businessName || "Your business"}
        </span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: foregroundColor, color: backgroundColor }}
        >
          {(businessName || "B").charAt(0).toUpperCase()}
        </span>
      </div>

      <p className="mt-3 text-lg font-semibold">
        {programName || "Loyalty card"}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="h-5 w-5 rounded-full border"
            style={{
              borderColor: foregroundColor,
              backgroundColor: i < filled ? foregroundColor : "transparent",
              opacity: i < filled ? 1 : 0.5,
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="opacity-80">
          {filled} of {total} stamps
        </span>
        <span className="font-medium">
          {rewardTitle || "Your reward"}
        </span>
      </div>
    </div>
  );
}
