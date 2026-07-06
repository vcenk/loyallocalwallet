import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@llw/db";
import { getCustomerActivity } from "./analytics";

type DbClient = SupabaseClient<Database>;

// Wallet-message limits (docs — render as a pass field).
export const MESSAGE_TITLE_MAX = 40;
export const MESSAGE_BODY_MAX = 140;

export const AUDIENCES = [
  { key: "all_active", label: "All opted-in customers" },
  { key: "inactive_21_days", label: "Inactive 21+ days" },
  { key: "close_to_reward", label: "Close to a reward" },
] as const;

export type AudienceKey = (typeof AUDIENCES)[number]["key"];

export function isAudienceKey(value: string): value is AudienceKey {
  return AUDIENCES.some((a) => a.key === value);
}

export interface Recipient {
  customerId: string;
  walletPassId: string | null;
}

// Narrows customer activity to an audience segment. Excludes "lost" customers
// (all passes voided/deleted) AND anyone who did not opt in to marketing — a
// shop can never message a customer against their stated preference.
function filterAudience<
  T extends {
    lost: boolean;
    marketingConsent: boolean;
    daysInactive: number;
    closeToReward: boolean;
  },
>(activity: T[], key: AudienceKey): T[] {
  const eligible = activity.filter((a) => !a.lost && a.marketingConsent);
  if (key === "inactive_21_days") {
    return eligible.filter((a) => a.daysInactive >= 21);
  }
  if (key === "close_to_reward") {
    return eligible.filter((a) => a.closeToReward);
  }
  return eligible;
}

// Resolves the recipient list for an audience (opted-in only).
export async function resolveAudience(
  supabase: DbClient,
  businessId: string,
  key: AudienceKey,
): Promise<Recipient[]> {
  const activity = await getCustomerActivity(supabase, businessId);
  return filterAudience(activity, key).map((a) => ({
    customerId: a.id,
    walletPassId: a.primaryPassId,
  }));
}

// How many opted-in customers each audience would reach — for the composer.
export async function audienceCounts(
  supabase: DbClient,
  businessId: string,
): Promise<Record<AudienceKey, number>> {
  const activity = await getCustomerActivity(supabase, businessId);
  return {
    all_active: filterAudience(activity, "all_active").length,
    inactive_21_days: filterAudience(activity, "inactive_21_days").length,
    close_to_reward: filterAudience(activity, "close_to_reward").length,
  };
}

// Ready-to-use message templates. title/body respect the wallet field limits.
export interface CampaignTemplate {
  key: string;
  category: "Promotions" | "Retention";
  icon: string;
  name: string;
  title: string;
  body: string;
  audienceKey: AudienceKey;
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    key: "new_menu",
    category: "Promotions",
    icon: "utensils",
    name: "New menu launch",
    title: "New on the menu 🍽️",
    body: "We just added something new — come try it this week!",
    audienceKey: "all_active",
  },
  {
    key: "daily_discount",
    category: "Promotions",
    icon: "percent",
    name: "Daily discount",
    title: "Today only 🎉",
    body: "Show your card at the counter for 15% off today.",
    audienceKey: "all_active",
  },
  {
    key: "weekend_special",
    category: "Promotions",
    icon: "calendar",
    name: "Weekend special",
    title: "Weekend treat",
    body: "Stop by this weekend for a little something extra on us.",
    audienceKey: "all_active",
  },
  {
    key: "flash_sale",
    category: "Promotions",
    icon: "zap",
    name: "Flash sale",
    title: "Flash sale ⚡",
    body: "Next 3 hours only: buy one, get one. Just show your card.",
    audienceKey: "all_active",
  },
  {
    key: "win_back",
    category: "Retention",
    icon: "heart",
    name: "We miss you",
    title: "We miss you",
    body: "Come back this week for a bonus stamp on us.",
    audienceKey: "inactive_21_days",
  },
  {
    key: "reward_reminder",
    category: "Retention",
    icon: "gift",
    name: "Reward reminder",
    title: "You're almost there",
    body: "One more visit and your reward is ready!",
    audienceKey: "close_to_reward",
  },
];
