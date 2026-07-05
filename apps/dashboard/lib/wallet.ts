import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@llw/db";
import {
  isGoogleWalletConfigured,
  isAppleWalletConfigured,
  isApnsConfigured,
  createGoogleSaveUrl,
  patchGoogleObject,
  sendPassUpdatePush,
  type WalletCardData,
} from "@llw/wallet";

type DbClient = SupabaseClient<Database>;

export { isGoogleWalletConfigured, isAppleWalletConfigured };

interface PassRow {
  serial_number: string;
  business_id: string;
  customer_id: string;
  program_id: string;
  current_stamps: number;
  rewards_available: number;
}

async function buildFromPass(
  admin: DbClient,
  pass: PassRow,
): Promise<WalletCardData | null> {
  const [{ data: program }, { data: business }, { data: customer }, { data: design }] =
    await Promise.all([
      admin
        .from("loyalty_programs")
        .select("name, reward_title, stamps_required")
        .eq("id", pass.program_id)
        .maybeSingle(),
      admin
        .from("businesses")
        .select("name, logo_url")
        .eq("id", pass.business_id)
        .maybeSingle(),
      admin
        .from("customers")
        .select("first_name, last_name")
        .eq("id", pass.customer_id)
        .maybeSingle(),
      admin
        .from("card_designs")
        .select("background_color, foreground_color")
        .eq("program_id", pass.program_id)
        .maybeSingle(),
    ]);
  if (!program) return null;

  return {
    serialNumber: pass.serial_number,
    businessId: pass.business_id,
    programId: pass.program_id,
    businessName: business?.name ?? "",
    programName: program.name,
    rewardTitle: program.reward_title,
    stampsRequired: program.stamps_required ?? 10,
    currentStamps: pass.current_stamps,
    rewardsAvailable: pass.rewards_available,
    customerName: `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim(),
    backgroundColor: design?.background_color ?? "#ae3115",
    foregroundColor: design?.foreground_color ?? "#ffffff",
    logoUrl: business?.logo_url ?? null,
  };
}

const PASS_COLUMNS =
  "serial_number, business_id, customer_id, program_id, current_stamps, rewards_available";

export async function cardDataBySerial(admin: DbClient, serial: string) {
  const { data } = await admin
    .from("wallet_passes")
    .select(PASS_COLUMNS)
    .eq("serial_number", serial)
    .maybeSingle();
  return data ? buildFromPass(admin, data) : null;
}

export async function cardDataByPassId(admin: DbClient, passId: string) {
  const { data } = await admin
    .from("wallet_passes")
    .select(PASS_COLUMNS)
    .eq("id", passId)
    .maybeSingle();
  return data ? buildFromPass(admin, data) : null;
}

// "Save to Google Wallet" URL for a pass, or null if Google isn't configured.
export async function googleSaveUrlForSerial(
  admin: DbClient,
  serial: string,
): Promise<string | null> {
  if (!isGoogleWalletConfigured()) return null;
  const data = await cardDataBySerial(admin, serial);
  return data ? createGoogleSaveUrl(data) : null;
}

// Best-effort pass update after a stamp/redeem. Never throws — wallet sync must
// not block the stamp engine.
export async function syncWalletForPass(admin: DbClient, passId: string) {
  try {
    if (isGoogleWalletConfigured()) {
      const data = await cardDataByPassId(admin, passId);
      if (data) await patchGoogleObject(data);
    }
    if (isAppleWalletConfigured() && isApnsConfigured()) {
      const { data: regs } = await admin
        .from("pass_registrations")
        .select("push_token")
        .eq("wallet_pass_id", passId);
      for (const r of regs ?? []) {
        try {
          await sendPassUpdatePush(r.push_token);
        } catch (err) {
          console.error("apns push failed", err);
        }
      }
    }
  } catch (err) {
    console.error("wallet sync failed", err);
  }
}

// Base URL Apple devices call for pass updates.
export function appleWebServiceURL(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/api/wallet/apple`;
}

export async function passAuthTokenBySerial(
  admin: DbClient,
  serial: string,
): Promise<string | null> {
  const { data } = await admin
    .from("wallet_passes")
    .select("authentication_token")
    .eq("serial_number", serial)
    .maybeSingle();
  return data?.authentication_token ?? null;
}

// Web-service auth: returns the pass id if the `Authorization: ApplePass <token>`
// header matches the pass's stored token.
export async function authorizePass(
  admin: DbClient,
  serial: string,
  authHeader: string | null,
): Promise<{ id: string } | null> {
  const token = (authHeader ?? "").replace(/^ApplePass\s+/i, "").trim();
  if (!token) return null;
  const { data } = await admin
    .from("wallet_passes")
    .select("id, authentication_token")
    .eq("serial_number", serial)
    .maybeSingle();
  if (!data?.authentication_token || data.authentication_token !== token) {
    return null;
  }
  return { id: data.id };
}
