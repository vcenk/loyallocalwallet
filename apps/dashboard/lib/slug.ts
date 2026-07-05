// Turns a business name into a URL-safe base slug.
// NFKD decomposes accented letters (e.g. "café" -> "cafe" + combining mark); the
// non-alphanumeric replace below then drops the mark, so we get "cafe".
export function slugifyBase(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// Short random suffix to avoid slug collisions across tenants.
export function randomSuffix(length = 6): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}
