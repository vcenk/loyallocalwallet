import { randomBytes } from "crypto";

// Opaque, unguessable pass serial. This is the barcode value the staff scanner
// reads — never a raw customer id (see docs/security.md §7).
export function generateSerial() {
  return `llw_${randomBytes(20).toString("base64url")}`;
}
