import type { WalletCardData } from "./types";

// Builds the Apple pass "strip" image (the banner behind the primary area) as an
// SVG, so the pass shows the stamps visually instead of just "1 / 10" text.
function stripSvg(data: WalletCardData, scale: number): string {
  const W = 375 * scale;
  const H = 123 * scale;
  const bg = data.backgroundColor || "#ae3115";
  const fg = data.foregroundColor || "#ffffff";
  const total = Math.max(1, Math.round(data.stampsRequired || 1));
  const filled = Math.max(0, Math.min(Math.round(data.currentStamps || 0), total));

  let marks = "";
  if (total <= 12) {
    const padX = 26 * scale;
    const usable = W - padX * 2;
    const step = usable / total;
    const r = Math.min(step * 0.3, 15 * scale);
    const cy = H * 0.5;
    for (let i = 0; i < total; i++) {
      const cx = padX + step * (i + 0.5);
      const on = i < filled;
      marks += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${on ? fg : "none"}" stroke="${fg}" stroke-width="${(2 * scale).toFixed(1)}" stroke-opacity="${on ? 1 : 0.5}" />`;
    }
  } else {
    // Large targets (points / spend): a progress bar reads better than dots.
    const padX = 28 * scale;
    const barH = 16 * scale;
    const y = (H - barH) / 2;
    const w = W - padX * 2;
    const frac = Math.min(1, filled / total);
    marks =
      `<rect x="${padX}" y="${y}" width="${w}" height="${barH}" rx="${barH / 2}" fill="${fg}" fill-opacity="0.22" />` +
      `<rect x="${padX}" y="${y}" width="${(w * frac).toFixed(1)}" height="${barH}" rx="${barH / 2}" fill="${fg}" />`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${bg}" />${marks}</svg>`;
}

// Renders strip.png at 1x/2x/3x. Returns null on failure (caller falls back).
export async function renderStripImages(
  data: WalletCardData,
): Promise<Record<string, Buffer> | null> {
  try {
    const sharp = (await import("sharp")).default;
    const make = (s: number) =>
      sharp(Buffer.from(stripSvg(data, s))).png().toBuffer();
    return {
      "strip.png": await make(1),
      "strip@2x.png": await make(2),
      "strip@3x.png": await make(3),
    };
  } catch (err) {
    console.error("strip render failed", err);
    return null;
  }
}
