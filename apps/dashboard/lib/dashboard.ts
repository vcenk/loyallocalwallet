import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@llw/db";

type DbClient = SupabaseClient<Database>;

const DAY = 86_400_000;

export interface CloseToRewardRow {
  id: string;
  name: string;
  current: number;
  required: number;
}

export interface FeedItem {
  id: string;
  type: "join" | "stamp" | "redeem" | "automation";
  title: string;
  detail: string;
  at: string;
}

export interface DashboardCampaign {
  id: string;
  name: string;
  status: Database["public"]["Enums"]["campaign_status"];
  messageTitle: string;
  audienceKey: string | null;
  sentAt: string | null;
}

export interface DashboardFeed {
  closeToReward: CloseToRewardRow[];
  feed: FeedItem[];
  campaigns: DashboardCampaign[];
  weeklyEnrollments: number[];
  avgStampsPerVisitor: number;
}

function fullName(
  c: { first_name: string | null; last_name: string | null } | null,
): string {
  if (!c) return "A customer";
  return `${c.first_name ?? "Guest"} ${c.last_name ?? ""}`.trim() || "Guest";
}

const AUTOMATION_LABELS: Record<string, string> = {
  welcome: "Welcome message sent",
  almost_there: "Almost-there nudge sent",
  win_back: "Win-back message sent",
  birthday: "Birthday reward sent",
};

// Everything the redesigned overview needs beyond the headline stats: who's
// close to a reward, a live activity feed, active campaigns, and a 5-week
// enrollment sparkline. One place so the page stays a thin view.
export async function getDashboardFeed(
  supabase: DbClient,
  businessId: string,
): Promise<DashboardFeed> {
  const [
    { data: programs },
    { data: customers },
    { data: stampEvents },
    { data: redemptions },
    { data: automationSends },
    { data: campaigns },
  ] = await Promise.all([
    supabase
      .from("loyalty_programs")
      .select("id, stamps_required")
      .eq("business_id", businessId),
    supabase
      .from("customers")
      .select(
        "id, first_name, last_name, first_seen_at, wallet_passes(current_stamps, rewards_available, status, program_id)",
      )
      .eq("business_id", businessId)
      .limit(2000),
    supabase
      .from("stamp_events")
      .select(
        "id, quantity, reason, created_at, event_type, customers(first_name, last_name)",
      )
      .eq("business_id", businessId)
      .in("event_type", ["earn", "bonus"])
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("reward_redemptions")
      .select("id, reward_title, redeemed_at, customers(first_name, last_name)")
      .eq("business_id", businessId)
      .order("redeemed_at", { ascending: false })
      .limit(4),
    supabase
      .from("automation_sends")
      .select("id, automation_key, sent_at, customer_id")
      .eq("business_id", businessId)
      .order("sent_at", { ascending: false })
      .limit(4),
    supabase
      .from("campaigns")
      .select("id, name, status, message_title, audience_key, sent_at, created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const required = new Map(
    (programs ?? []).map((p) => [p.id, p.stamps_required ?? 10]),
  );
  const nameById = new Map(
    (customers ?? []).map((c) => [c.id, fullName(c)]),
  );

  // Close to reward — customers within 2 stamps of their next reward.
  const closeToReward: CloseToRewardRow[] = [];
  for (const c of customers ?? []) {
    const passes = c.wallet_passes ?? [];
    const live = passes.filter(
      (p) => p.status !== "voided" && p.status !== "deleted",
    );
    for (const p of live) {
      const req = required.get(p.program_id) ?? 10;
      const towardNext = (p.current_stamps ?? 0) % req;
      const remaining = req - towardNext;
      if ((p.rewards_available ?? 0) === 0 && towardNext > 0 && remaining <= 2) {
        closeToReward.push({
          id: `${c.id}-${p.program_id}`,
          name: fullName(c),
          current: towardNext,
          required: req,
        });
        break;
      }
    }
  }
  closeToReward.sort((a, b) => b.current / b.required - a.current / a.required);

  // 5-week enrollment sparkline (oldest → newest).
  const now = Date.now();
  const weeklyEnrollments = [0, 0, 0, 0, 0];
  for (const c of customers ?? []) {
    if (!c.first_seen_at) continue;
    const weeksAgo = Math.floor(
      (now - new Date(c.first_seen_at).getTime()) / (7 * DAY),
    );
    if (weeksAgo >= 0 && weeksAgo < 5) weeklyEnrollments[4 - weeksAgo] += 1;
  }

  // Live feed — merge joins, stamps, redemptions, automations by recency.
  const feed: FeedItem[] = [];
  for (const c of (customers ?? [])
    .filter((c) => c.first_seen_at)
    .sort(
      (a, b) =>
        new Date(b.first_seen_at!).getTime() -
        new Date(a.first_seen_at!).getTime(),
    )
    .slice(0, 4)) {
    feed.push({
      id: `join-${c.id}`,
      type: "join",
      title: "New member joined",
      detail: `${fullName(c)} enrolled via QR code.`,
      at: c.first_seen_at!,
    });
  }
  for (const e of stampEvents ?? []) {
    const qty = e.quantity ?? 1;
    feed.push({
      id: `stamp-${e.id}`,
      type: "stamp",
      title: e.event_type === "bonus" ? "Bonus stamp added" : "Stamp added",
      detail: `${fullName(e.customers)} earned ${qty} stamp${qty === 1 ? "" : "s"}.`,
      at: e.created_at,
    });
  }
  for (const r of redemptions ?? []) {
    feed.push({
      id: `redeem-${r.id}`,
      type: "redeem",
      title: "Reward redeemed",
      detail: `${fullName(r.customers)} redeemed ${r.reward_title}.`,
      at: r.redeemed_at,
    });
  }
  for (const a of automationSends ?? []) {
    feed.push({
      id: `auto-${a.id}`,
      type: "automation",
      title: "Automation triggered",
      detail: `${AUTOMATION_LABELS[a.automation_key] ?? "Automation ran"} for ${nameById.get(a.customer_id) ?? "a customer"}.`,
      at: a.sent_at,
    });
  }
  feed.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  // Avg stamps per visitor this week (nice-to-have stat on the Stamps card).
  const totalStampsThisWeek = (stampEvents ?? []).reduce(
    (s, e) => s + (e.quantity ?? 1),
    0,
  );
  const visitors = new Set(
    (stampEvents ?? []).map((e) => fullName(e.customers)),
  ).size;
  const avgStampsPerVisitor = visitors ? totalStampsThisWeek / visitors : 0;

  return {
    closeToReward: closeToReward.slice(0, 4),
    feed: feed.slice(0, 5),
    campaigns: (campaigns ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      messageTitle: c.message_title,
      audienceKey: c.audience_key,
      sentAt: c.sent_at,
    })),
    weeklyEnrollments,
    avgStampsPerVisitor,
  };
}
