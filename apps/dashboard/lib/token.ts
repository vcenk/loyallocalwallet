import { randomBytes } from "crypto";

// Opaque, unguessable pass serial. This is the barcode value the staff scanner
// reads — never a raw customer id (see docs/security.md §7).
export function generateSerial() {
  return `llw_${randomBytes(20).toString("base64url")}`;
}

// Short, opaque, shareable referral code (used in ?ref= enrollment links).
export function generateReferralCode() {
  return randomBytes(6).toString("base64url");
}
