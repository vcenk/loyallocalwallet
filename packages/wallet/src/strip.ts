import type { WalletCardData } from "./types";

// Lucide (outline) paths for the stamp icons the owner can pick, so the wallet
// card shows the same icon they chose in the designer.
const ICON_PATHS: Record<string, string> = {
  star: `<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>`,
  coffee: `<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>`,
  heart: `<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>`,
  gift: `<path d="M12 7v14"/><path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5"/><rect x="3" y="7" width="18" height="4" rx="1"/>`,
  cookie: `<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/>`,
  "ice-cream": `<path d="m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11"/><path d="M17 7A5 5 0 0 0 7 7"/><path d="M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4"/>`,
  scissors: `<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>`,
  paw: `<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>`,
  crown: `<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>`,
  stamp: `<path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13"/><path d="M20 15.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1z"/><path d="M5 22h14"/>`,
  cake: `<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/>`,
  sparkle: `<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>`,
  utensils: `<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/>`,
};

function iconGroup(
  key: string,
  cx: number,
  cy: number,
  size: number,
  color: string,
  opacity: number,
): string {
  const path = ICON_PATHS[key];
  if (!path) return "";
  const scale = size / 24;
  const tx = cx - size / 2;
  const ty = cy - size / 2;
  // Bolder stroke so the icon reads clearly at small sizes.
  return `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="${opacity}">${path}</g>`;
}

function patternDef(key: string, fg: string, s: number): string {
  switch (key) {
    case "dots":
      return `<pattern id="pat" width="${16 * s}" height="${16 * s}" patternUnits="userSpaceOnUse"><circle cx="${8 * s}" cy="${8 * s}" r="${1.8 * s}" fill="${fg}"/></pattern>`;
    case "grid":
      return `<pattern id="pat" width="${22 * s}" height="${22 * s}" patternUnits="userSpaceOnUse"><path d="M ${22 * s} 0 L 0 0 0 ${22 * s}" fill="none" stroke="${fg}" stroke-width="${1.2 * s}"/></pattern>`;
    case "diagonal":
      return `<pattern id="pat" width="${12 * s}" height="${12 * s}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="${12 * s}" stroke="${fg}" stroke-width="${1.2 * s}"/></pattern>`;
    case "crosshatch":
      return `<pattern id="pat" width="${10 * s}" height="${10 * s}" patternUnits="userSpaceOnUse"><path d="M0 0 L${10 * s} ${10 * s} M${10 * s} 0 L0 ${10 * s}" stroke="${fg}" stroke-width="${1.2 * s}"/></pattern>`;
    case "vertical":
      return `<pattern id="pat" width="${10 * s}" height="${10 * s}" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="${10 * s}" stroke="${fg}" stroke-width="${1.2 * s}"/></pattern>`;
    case "waves":
      return `<pattern id="pat" width="${38 * s}" height="${22 * s}" patternUnits="userSpaceOnUse"><path d="M0 ${18 * s} Q${9.5 * s} ${8 * s} ${19 * s} ${18 * s} T${38 * s} ${18 * s}" fill="none" stroke="${fg}" stroke-width="${1.4 * s}"/></pattern>`;
    case "arches":
      return `<pattern id="pat" width="${34 * s}" height="${28 * s}" patternUnits="userSpaceOnUse"><path d="M${4 * s} ${26 * s} A${13 * s} ${13 * s} 0 0 1 ${30 * s} ${26 * s}" fill="none" stroke="${fg}" stroke-width="${1.4 * s}"/></pattern>`;
    case "checker":
      return `<pattern id="pat" width="${20 * s}" height="${20 * s}" patternUnits="userSpaceOnUse"><rect width="${10 * s}" height="${10 * s}" fill="${fg}"/><rect x="${10 * s}" y="${10 * s}" width="${10 * s}" height="${10 * s}" fill="${fg}"/></pattern>`;
    case "confetti":
      return `<pattern id="pat" width="${30 * s}" height="${30 * s}" patternUnits="userSpaceOnUse"><circle cx="${6 * s}" cy="${7 * s}" r="${1.8 * s}" fill="${fg}"/><circle cx="${22 * s}" cy="${18 * s}" r="${1.3 * s}" fill="${fg}"/><path d="M${14 * s} ${24 * s} l${7 * s} ${-5 * s}" stroke="${fg}" stroke-width="${1.4 * s}" stroke-linecap="round"/></pattern>`;
    case "sunburst":
      return `<pattern id="pat" width="${42 * s}" height="${42 * s}" patternUnits="userSpaceOnUse"><path d="M${7 * s} ${7 * s} L${7 * s} 0 M${7 * s} ${7 * s} L${13 * s} ${2 * s} M${7 * s} ${7 * s} L${17 * s} ${7 * s} M${7 * s} ${7 * s} L${13 * s} ${13 * s} M${7 * s} ${7 * s} L${7 * s} ${18 * s}" stroke="${fg}" stroke-width="${1.4 * s}" stroke-linecap="round"/></pattern>`;
    case "capsule":
      return `<pattern id="pat" width="${34 * s}" height="${18 * s}" patternUnits="userSpaceOnUse"><rect x="${3 * s}" y="${4 * s}" width="${18 * s}" height="${8 * s}" rx="${4 * s}" fill="${fg}"/><rect x="${20 * s}" y="${10 * s}" width="${12 * s}" height="${5 * s}" rx="${2.5 * s}" fill="${fg}"/></pattern>`;
    default:
      return "";
  }
}

function xmlText(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function trimText(value: string | null | undefined, max = 28): string {
  const s = String(value ?? "").trim();
  return s.length > max ? `${s.slice(0, max - 1)}...` : s;
}

// The Apple pass "strip" banner reflecting the owner's design: brand colors,
// their pattern watermark, and their stamp icon + style. `hasLogo` reserves
// room on the left for a logo badge composited in renderStripImages.
function stripSvg(data: WalletCardData, scale: number, hasLogo: boolean): string {
  const W = 375 * scale;
  const H = 123 * scale;
  const bg = data.backgroundColor || "#ae3115";
  const fg = data.foregroundColor || "#ffffff";
  const icon = data.stampIcon || "star";
  const style = data.stampStyle || "circles";
  const patternKey = data.pattern || "none";
  const total = Math.max(1, Math.round(data.stampsRequired || 1));
  const filled = Math.max(0, Math.min(Math.round(data.currentStamps || 0), total));
  const businessName = xmlText(trimText(data.businessName || "Loyalty", 24));
  const programName = xmlText(trimText(data.programName || "Rewards", 30));
  const rewardTitle = xmlText(trimText(data.rewardTitle || "Reward", 28));

  const pdef = patternKey !== "none" ? patternDef(patternKey, fg, scale) : "";
  const defs = pdef ? `<defs>${pdef}</defs>` : "";
  const patternRect = pdef
    ? `<rect width="${W}" height="${H}" fill="url(#pat)" opacity="0.18"/>`
    : "";

  const left = hasLogo ? 104 * scale : 22 * scale;
  const right = 24 * scale;
  const areaX = left;
  const areaW = W - left - right;
  const contentTop = 52 * scale;
  const contentH = H - contentTop - 14 * scale;

  let marks = "";
  const useBar = style === "progress" || total > 12;
  if (useBar) {
    const barH = 13 * scale;
    const y = contentTop + contentH - barH - 2 * scale;
    const frac = Math.min(1, filled / total);
    marks =
      `<rect x="${areaX}" y="${y}" width="${areaW}" height="${barH}" rx="${barH / 2}" fill="${fg}" fill-opacity="0.22"/>` +
      `<rect x="${areaX}" y="${y}" width="${(areaW * frac).toFixed(1)}" height="${barH}" rx="${barH / 2}" fill="${fg}"/>`;
  } else {
    const rows = total > 6 ? 2 : 1;
    const cols = Math.ceil(total / rows);
    const cellW = areaW / cols;
    const cellH = contentH / rows;
    const r = Math.min(cellW, cellH) * 0.34;
    const pill = style === "pills";
    const sw = (2.4 * scale).toFixed(1);
    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const cx = areaX + cellW * (col + 0.5);
      const cy = contentTop + cellH * (row + 0.5);
      const on = i < filled;
      if (pill) {
        const pw = Math.min(cellW * 0.82, r * 2.6);
        const ph = r * 2;
        marks += `<rect x="${(cx - pw / 2).toFixed(1)}" y="${(cy - ph / 2).toFixed(1)}" width="${pw.toFixed(1)}" height="${ph.toFixed(1)}" rx="${(ph / 2).toFixed(1)}" fill="${on ? fg : "none"}" stroke="${fg}" stroke-width="${sw}" stroke-opacity="${on ? 1 : 0.55}"/>`;
      } else {
        marks += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${on ? fg : "none"}" stroke="${fg}" stroke-width="${sw}" stroke-opacity="${on ? 1 : 0.55}"/>`;
      }
      marks += iconGroup(icon, cx, cy, r * 1.45, on ? bg : fg, on ? 1 : 0.7);
    }
  }

  const headerX = left;
  const badgeW = 62 * scale;
  const badgeH = 27 * scale;
  const badgeX = W - right - badgeW;
  const badgeY = 14 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}<rect width="${W}" height="${H}" fill="${bg}"/><rect width="${W}" height="${46 * scale}" fill="#000" fill-opacity="0.13"/>${patternRect}<text x="${headerX}" y="${22 * scale}" fill="${fg}" font-family="Arial, Helvetica, sans-serif" font-size="${11 * scale}" font-weight="700" letter-spacing="${1.4 * scale}" opacity="0.78">${businessName}</text><text x="${headerX}" y="${42 * scale}" fill="${fg}" font-family="Arial, Helvetica, sans-serif" font-size="${20 * scale}" font-weight="700">${programName}</text><rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="${13.5 * scale}" fill="${fg}" fill-opacity="0.17"/><text x="${badgeX + badgeW / 2}" y="${badgeY + 18.5 * scale}" text-anchor="middle" fill="${fg}" font-family="Arial, Helvetica, sans-serif" font-size="${13 * scale}" font-weight="700">${filled}/${total}</text><text x="${areaX}" y="${H - 7 * scale}" fill="${fg}" font-family="Arial, Helvetica, sans-serif" font-size="${9 * scale}" font-weight="700" letter-spacing="${1 * scale}" opacity="0.82">REWARD: ${rewardTitle}</text>${marks}</svg>`;
}

// Renders strip.png at 1x/2x/3x, compositing the shop logo (circular badge) on
// the left when available. Returns null on failure (caller falls back).
export async function renderStripImages(
  data: WalletCardData,
  logoBuf: Buffer | null,
): Promise<Record<string, Buffer> | null> {
  try {
    const sharp = (await import("sharp")).default;
    const make = async (s: number) => {
      let base = await sharp(Buffer.from(stripSvg(data, s, !!logoBuf)))
        .png()
        .toBuffer();
      if (logoBuf) {
        try {
          const d = Math.round(74 * s);
          const mask = Buffer.from(
            `<svg width="${d}" height="${d}"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2}" fill="#fff"/></svg>`,
          );
          const logoImg = await sharp(logoBuf)
            .resize(d, d, { fit: "cover" })
            .composite([{ input: mask, blend: "dest-in" }])
            .png()
            .toBuffer();
          base = await sharp(base)
            .composite([
              {
                input: logoImg,
                top: Math.round(24 * s),
                left: Math.round(16 * s),
              },
            ])
            .png()
            .toBuffer();
        } catch (err) {
          console.error("logo composite failed", err);
        }
      }
      return base;
    };
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
