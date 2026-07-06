import path from "node:path";

// Config detection — wallet features stay dark until credentials are present.
// Certs can come from base64 env vars (Vercel/serverless) OR file paths (local).

function has(name: string): boolean {
  return !!process.env[name];
}

function certAvailable(base64Env: string, pathEnv: string): boolean {
  return has(base64Env) || has(pathEnv);
}

export function isGoogleWalletConfigured(): boolean {
  return !!(
    process.env.GOOGLE_WALLET_ISSUER_ID &&
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_WALLET_PRIVATE_KEY
  );
}

export function isApnsConfigured(): boolean {
  return !!(
    process.env.APPLE_APNS_KEY_ID &&
    process.env.APPLE_APNS_TEAM_ID &&
    certAvailable("APPLE_APNS_PRIVATE_KEY_BASE64", "APPLE_APNS_PRIVATE_KEY_PATH")
  );
}

export function isAppleWalletConfigured(): boolean {
  return !!(
    process.env.APPLE_PASS_TYPE_IDENTIFIER &&
    process.env.APPLE_TEAM_ID &&
    certAvailable("APPLE_PASS_CERT_BASE64", "APPLE_PASS_CERT_PATH") &&
    certAvailable("APPLE_PASS_KEY_BASE64", "APPLE_PASS_KEY_PATH") &&
    certAvailable("APPLE_WWDR_CERT_BASE64", "APPLE_WWDR_CERT_PATH")
  );
}

// Loads a PEM/key: prefers a base64 env var, falls back to a file path.
export function loadCert(base64Env: string, pathEnv: string): Buffer {
  const b64 = process.env[base64Env];
  if (b64) return Buffer.from(b64, "base64");
  const filePath = process.env[pathEnv];
  if (filePath) {
    // Lazy require so bundlers don't complain in non-Node contexts.
    return require("node:fs").readFileSync(filePath);
  }
  throw new Error(`Missing ${base64Env} or ${pathEnv}`);
}

export function googleConfig() {
  return {
    issuerId: process.env.GOOGLE_WALLET_ISSUER_ID ?? "",
    serviceAccountEmail: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL ?? "",
    privateKey: (process.env.GOOGLE_WALLET_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    origins: (process.env.GOOGLE_WALLET_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

// Default to the model folder bundled with the app when no path is set (Vercel).
function defaultModelPath(): string {
  return path.join(process.cwd(), "wallet-models", "loyallocal.pass");
}

export function appleConfig() {
  return {
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER ?? "",
    teamIdentifier: process.env.APPLE_TEAM_ID ?? "",
    keyPassphrase: process.env.APPLE_PASS_CERT_PASSWORD || undefined,
    modelPath: process.env.APPLE_PASS_MODEL_PATH || defaultModelPath(),
  };
}
