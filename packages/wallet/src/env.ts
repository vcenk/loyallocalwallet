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

// Resolves an env value that may be: raw PEM text, a base64 blob, or a file
// path. We auto-detect so it doesn't matter whether the value was pasted into
// the *_BASE64 or the *_PATH variable (a common Vercel setup mistake that made
// passkit-generator try to open a base64 string as a filename — ENAMETOOLONG).
function resolveCertValue(value: string): Buffer {
  const trimmed = value.trim();

  // Already PEM/plain text? Use as-is.
  if (trimmed.includes("-----BEGIN")) {
    return Buffer.from(trimmed, "utf8");
  }

  // Looks like a base64 blob (long, single-token, base64 alphabet only)?
  const looksBase64 =
    trimmed.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(trimmed);
  if (looksBase64) {
    const decoded = Buffer.from(trimmed, "base64");
    // If it decodes to PEM text, we guessed right.
    if (decoded.includes("-----BEGIN")) return decoded;
    // Otherwise it may still be a DER/base64 cert — return the decoded bytes.
    return decoded;
  }

  // Otherwise treat it as a filesystem path. Lazy require so bundlers don't
  // complain in non-Node contexts.
  return require("node:fs").readFileSync(trimmed);
}

// Loads a PEM/key: prefers a base64 env var, falls back to a file path. Both
// are passed through the same auto-detecting resolver.
export function loadCert(base64Env: string, pathEnv: string): Buffer {
  const value = process.env[base64Env] || process.env[pathEnv];
  if (!value) throw new Error(`Missing ${base64Env} or ${pathEnv}`);
  return resolveCertValue(value);
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
