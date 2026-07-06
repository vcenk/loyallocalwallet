import { appleConfig, loadCert } from "./env";
import type { WalletCardData } from "./types";

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

  // storeCard fields (the model should declare a storeCard structure).
  pass.primaryFields.push({
    key: "progress",
    label: "STAMPS",
    value: `${data.currentStamps} / ${data.stampsRequired}`,
  });
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
