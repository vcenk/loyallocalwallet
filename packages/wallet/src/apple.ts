import { appleConfig, loadCert } from "./env";
import type { WalletCardData } from "./types";
import { renderStripImages } from "./strip";

// Fetches the shop logo once (used for the native logo slot + the strip badge).
async function fetchLogo(url: string | null | undefined): Promise<Buffer | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.error("logo fetch failed", err);
    return null;
  }
}

// Adds the shop logo as the pass logo + icon (overrides the model placeholder).
async function embedLogo(
  pass: { addBuffer: (name: string, buf: Buffer) => void },
  src: Buffer,
): Promise<void> {
  try {
    const sharp = (await import("sharp")).default;
    const logo = (h: number) =>
      sharp(src).resize({ height: h, fit: "inside" }).png().toBuffer();
    const icon = (s: number) =>
      sharp(src).resize(s, s, { fit: "cover" }).png().toBuffer();
    pass.addBuffer("logo.png", await logo(40));
    pass.addBuffer("logo@2x.png", await logo(80));
    pass.addBuffer("logo@3x.png", await logo(120));
    pass.addBuffer("icon.png", await icon(29));
    pass.addBuffer("icon@2x.png", await icon(58));
    pass.addBuffer("icon@3x.png", await icon(87));
  } catch (err) {
    console.error("logo embed failed", err);
  }
}

// Generates a signed .pkpass buffer. Requires the Apple certificates and a pass
// "model" (a .pass template folder with icon.png/logo.png and a base pass.json —
// a storeCard). See packages/wallet/README.md. passkit-generator is imported
// dynamically so the (Node-only) dependency isn't evaluated at build time.
export async function generateApplePkpass(
  data: WalletCardData,
  opts: { webServiceURL?: string; authenticationToken?: string } = {},
): Promise<Buffer> {
  const cfg = appleConfig();
  const { PKPass } = await import("passkit-generator");

  const props: Record<string, unknown> = {
    serialNumber: data.serialNumber,
    description: data.programName,
    organizationName: data.businessName,
    passTypeIdentifier: cfg.passTypeIdentifier,
    teamIdentifier: cfg.teamIdentifier,
    foregroundColor: data.foregroundColor,
    backgroundColor: data.backgroundColor,
    logoText: data.businessName,
  };
  // Both are required together to enable pass updates via the web service.
  if (opts.webServiceURL && opts.authenticationToken) {
    props.webServiceURL = opts.webServiceURL;
    props.authenticationToken = opts.authenticationToken;
  }

  const pass = await PKPass.from(
    {
      model: cfg.modelPath,
      certificates: {
        wwdr: loadCert("APPLE_WWDR_CERT_BASE64", "APPLE_WWDR_CERT_PATH"),
        signerCert: loadCert("APPLE_PASS_CERT_BASE64", "APPLE_PASS_CERT_PATH"),
        signerKey: loadCert("APPLE_PASS_KEY_BASE64", "APPLE_PASS_KEY_PATH"),
        signerKeyPassphrase: cfg.keyPassphrase,
      },
    },
    props,
  );

  pass.setBarcodes({
    message: data.serialNumber,
    format: "PKBarcodeFormatQR",
    messageEncoding: "iso-8859-1",
  });

  const total = Math.max(1, Math.round(data.stampsRequired || 1));
  const filled = Math.max(0, Math.min(Math.round(data.currentStamps || 0), total));

  // Compact progress in the header (top-right).
  pass.headerFields.push({ key: "count", label: "", value: `${filled}/${total}` });

  // Real logo + a visual stamp strip. All best-effort — a failure here must not
  // break pass generation, so the text fallback below still shows progress.
  let stripAdded = false;
  try {
    const logoBuf = await fetchLogo(data.logoUrl);
    if (logoBuf) await embedLogo(pass, logoBuf);
    const strips = await renderStripImages(data, logoBuf);
    if (strips) {
      for (const [name, buf] of Object.entries(strips)) pass.addBuffer(name, buf);
      stripAdded = true;
    }
  } catch (err) {
    console.error("pass enhancement failed", err);
  }

  // storeCard fields. When the stamp strip rendered, skip the big numeric primary
  // (the strip is the hero); otherwise show stamps as filled/empty marks.
  if (!stripAdded) {
    pass.primaryFields.push({
      key: "progress",
      label: "STAMPS",
      value:
        total <= 12
          ? "●".repeat(filled) + "○".repeat(total - filled)
          : `${filled} / ${total}`,
    });
  }
  pass.secondaryFields.push({
    key: "reward",
    label: "REWARD",
    value: data.rewardTitle,
  });
  pass.auxiliaryFields.push({
    key: "member",
    label: "MEMBER",
    value: data.customerName || "Member",
  });

  // Latest campaign / review nudge. A changeMessage makes it surface as a
  // lock-screen notification when the value changes and the pass is pushed.
  // URLs in back fields are auto-detected as tappable links (e.g. review link).
  if (data.message) {
    const value = data.messageLink
      ? `${data.message}\n${data.messageLink}`
      : data.message;
    pass.backFields.push({
      key: "message",
      label: "LATEST",
      value,
      changeMessage: "%@",
    });
  }

  return pass.getAsBuffer();
}
