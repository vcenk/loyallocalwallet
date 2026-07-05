// Config detection — wallet features stay dark until credentials are present.

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
    process.env.APPLE_APNS_PRIVATE_KEY_PATH
  );
}

export function isAppleWalletConfigured(): boolean {
  return !!(
    process.env.APPLE_PASS_TYPE_IDENTIFIER &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_PASS_CERT_PATH &&
    process.env.APPLE_PASS_KEY_PATH &&
    process.env.APPLE_WWDR_CERT_PATH &&
    process.env.APPLE_PASS_MODEL_PATH
  );
}

export function googleConfig() {
  return {
    issuerId: process.env.GOOGLE_WALLET_ISSUER_ID ?? "",
    serviceAccountEmail: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL ?? "",
    // Private keys are often stored with escaped newlines in env.
    privateKey: (process.env.GOOGLE_WALLET_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    origins: (process.env.GOOGLE_WALLET_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export function appleConfig() {
  return {
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER ?? "",
    teamIdentifier: process.env.APPLE_TEAM_ID ?? "",
    certPath: process.env.APPLE_PASS_CERT_PATH ?? "",
    keyPath: process.env.APPLE_PASS_KEY_PATH ?? "",
    wwdrPath: process.env.APPLE_WWDR_CERT_PATH ?? "",
    keyPassphrase: process.env.APPLE_PASS_CERT_PASSWORD || undefined,
    modelPath: process.env.APPLE_PASS_MODEL_PATH ?? "",
  };
}
