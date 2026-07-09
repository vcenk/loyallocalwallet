// One-off: set a password on a Supabase user (for accounts created via Google
// that have no password yet). Usage:
//   node scripts/set-password.mjs <email> <password>
// Reads SUPABASE_URL + SERVICE_ROLE_KEY from apps/dashboard/.env.local.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envCandidates = ["apps/dashboard/.env.local", ".env.local"];
const envPath = envCandidates.find((p) => {
  try {
    readFileSync(p);
    return true;
  } catch {
    return false;
  }
});
if (!envPath) throw new Error("Could not find .env.local");
const envText = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const [, , email, password] = process.argv;

if (!url || !serviceKey) throw new Error("Missing Supabase URL / service key.");
if (!email || !password) throw new Error("Usage: set-password.mjs <email> <password>");

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Find the user by email (paginate a bit in case there are many users).
let user = null;
for (let page = 1; page <= 10 && !user; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
  if (error) throw error;
  user = (data.users ?? []).find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  if ((data.users ?? []).length < 200) break;
}

if (!user) throw new Error(`No user found for ${email}`);

const { error } = await admin.auth.admin.updateUserById(user.id, { password });
if (error) throw error;

console.log(`OK: password set for ${email} (user ${user.id})`);
