import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@llw/db";

const DAY = 86_400_000;
const WEEK_MS = 7 * DAY;

type DbClient = SupabaseClient<Database>;

export interface CustomerActivity {
  id: string;
  name: string;
  contact: string;
  firstSeen: string;
  lastActivity: string;
  daysInactive: number;
  total: number;
  rewardsAvailable: number;
  closeToReward: boolean;
  lost: boolean;
  primaryPassId: string | null;
}

// Loads every customer with derived retention fields. Excludes nothing here;
// callers filter out `lost` (all passes voided/deleted) as needed.
export async function getCustomerActivity(
  supabase: DbClient,
  businessId: string,
): Promise<CustomerActivity[]> {
  const { data: programs } = await supabase
    .from("loyalty_programs")
    .select("id, stamps_required")
    .eq("business_id", businessId);
  const required = new Map(
    (programs ?? []).map((p) => [p.id, p.stamps_required ?? 10]),
  );

  const { data: customers } = await supabase
    .from("customers")
    .select(
      "id, first_name, last_name, email, phone, first_seen_at, last_seen_at, wallet_passes(id, current_stamps, rewards_available, status, program_id)",
    )
    .eq("business_id", businessId)
    .limit(2000);

  const now = Date.now();
  return (customers ?? []).map((c) => {
    const passes = c.wallet_passes ?? [];
    const lost =
      passes.length > 0 &&
      passes.every((p) => p.status === "voided" || p.status === "deleted");

    const rewardsAvailable = passes.reduce(
      (s, p) => s + (p.rewards_available ?? 0),
      0,
    );
    const total = passes.reduce((s, p) => s + (p.current_stamps ?? 0), 0);
    const closeToReward = passes.some((p) => {
      const req = required.get(p.program_id) ?? 10;
      const towardNext = (p.current_stamps ?? 0) % req;
      return (p.rewards_available ?? 0) === 0 && towardNext > 0 && req - towardNext <= 2;
    });

    const lastActivity = c.last_seen_at ?? c.first_seen_at;
    const daysInactive = Math.floor(
      (now - new Date(lastActivity).getTime()) / DAY,
    );
    const primary =
      passes.find((p) => p.status !== "voided" && p.status !== "deleted") ??
      passes[0];

    return {
      id: c.id,
      name: `${c.first_name ?? "Guest"} ${c.last_name ?? ""}`.trim(),
      contact: c.email ?? c.phone ?? "—",
      firstSeen: c.first_seen_at,
      lastActivity,
      daysInactive,
      total,
      rewardsAvailable,
      closeToReward,
      lost,
      primaryPassId: primary?.id ?? null,
    };
  });
}

export interface OverviewStats {
  activeCustomers: number;
  newThisWeek: number;
  stampsThisWeek: number;
  redemptionsThisWeek: number;
  inactiveCount: number;
  closeToReward: number;
}

export async function getOverviewStats(
  supabase: DbClient,
  businessId: string,
): Promise<OverviewStats> {
  const weekAgo = new Date(Date.now() - WEEK_MS).toISOString();

  const [activity, { count: stampsThisWeek }, { count: redemptionsThisWeek }] =
    await Promise.all([
      getCustomerActivity(supabase, businessId),
      supabase
        .from("stamp_events")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .in("event_type", ["earn", "bonus"])
        .gte("created_at", weekAgo),
      supabase
        .from("reward_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .gte("redeemed_at", weekAgo),
    ]);

  const live = activity.filter((a) => !a.lost);
  const now = Date.now();

  return {
    activeCustomers: live.length,
    newThisWeek: live.filter((a) => now - new Date(a.firstSeen).getTime() <= WEEK_MS)
      .length,
    stampsThisWeek: stampsThisWeek ?? 0,
    redemptionsThisWeek: redemptionsThisWeek ?? 0,
    inactiveCount: live.filter((a) => a.daysInactive >= 21).length,
    closeToReward: live.filter((a) => a.closeToReward).length,
  };
}

export interface InactiveReport {
  buckets: { label: string; min: number; count: number }[];
  customers: CustomerActivity[];
  winBack: {
    audienceSize: number;
    messageTitle: string;
    messageBody: string;
    reason: string;
  } | null;
}

export async function getInactiveReport(
  supabase: DbClient,
  businessId: string,
): Promise<InactiveReport> {
  const activity = await getCustomerActivity(supabase, businessId);
  const live = activity.filter((a) => !a.lost);

  const inactive = live
    .filter((a) => a.daysInactive >= 14)
    .sort((a, b) => b.daysInactive - a.daysInactive);

  const bucketDefs = [
    { label: "60+ days", min: 60 },
    { label: "30–59 days", min: 30 },
    { label: "21–29 days", min: 21 },
    { label: "14–20 days", min: 14 },
  ];
  const buckets = bucketDefs.map((b, i) => {
    const max = i === 0 ? Infinity : bucketDefs[i - 1].min - 1;
    return {
      label: b.label,
      min: b.min,
      count: inactive.filter((a) => a.daysInactive >= b.min && a.daysInactive <= max)
        .length,
    };
  });

  const audience = live.filter((a) => a.daysInactive >= 21);
  const winBack =
    audience.length > 0
      ? {
          audienceSize: audience.length,
          messageTitle: "We miss you",
          messageBody: "Come back this week for a bonus stamp on us.",
          reason: `${audience.length} customer${audience.length > 1 ? "s have" : " has"} not visited in 21+ days.`,
        }
      : null;

  return { buckets, customers: inactive, winBack };
}
