import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@llw/db";
import { getCustomerActivity } from "./analytics";

type DbClient = SupabaseClient<Database>;

// Wallet-message limits (docs — render as a pass field).
export const MESSAGE_TITLE_MAX = 40;
export const MESSAGE_BODY_MAX = 140;

export const AUDIENCES = [
  { key: "inactive_21_days", label: "Inactive 21+ days" },
  { key: "close_to_reward", label: "Close to a reward" },
  { key: "all_active", label: "All active customers" },
] as const;

export type AudienceKey = (typeof AUDIENCES)[number]["key"];

export function isAudienceKey(value: string): value is AudienceKey {
  return AUDIENCES.some((a) => a.key === value);
}

export interface Recipient {
  customerId: string;
  walletPassId: string | null;
}

// Resolves the recipient list for an audience. Excludes "lost" customers (all
// passes voided/deleted) so campaign counts match analytics.
export async function resolveAudience(
  supabase: DbClient,
  businessId: string,
  key: AudienceKey,
): Promise<Recipient[]> {
  const activity = await getCustomerActivity(supabase, businessId);
  const live = activity.filter((a) => !a.lost);

  let selected = live;
  if (key === "inactive_21_days") {
    selected = live.filter((a) => a.daysInactive >= 21);
  } else if (key === "close_to_reward") {
    selected = live.filter((a) => a.closeToReward);
  }

  return selected.map((a) => ({
    customerId: a.id,
    walletPassId: a.primaryPassId,
  }));
}
