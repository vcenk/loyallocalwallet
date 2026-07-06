import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@llw/db";
import { notifyPass } from "./wallet";
import { getCustomerActivity } from "./analytics";

type DbClient = SupabaseClient<Database>;

const DAY = 86_400_000;

export type AutomationKey =
  | "welcome"
  | "almost_there"
  | "win_back"
  | "birthday";

export interface AutomationDef {
  key: AutomationKey;
  name: string;
  description: string;
  timing: "Instant" | "Daily";
  defaultTitle: string;
  defaultBody: string;
  hasThreshold?: boolean;
}

export const AUTOMATION_DEFS: AutomationDef[] = [
  {
    key: "welcome",
    name: "Welcome message",
    description: "Sent the moment a customer saves their card.",
    timing: "Instant",
    defaultTitle: "Welcome!",
    defaultBody: "Thanks for joining — see you soon for your first stamp!",
  },
  {
    key: "almost_there",
    name: "Almost there",
    description: "Sent when a customer is one stamp away from a reward.",
    timing: "Instant",
    defaultTitle: "You're almost there",
    defaultBody: "One more visit and your reward is ready!",
  },
  {
    key: "win_back",
    name: "Win back",
    description: "Sent when a customer hasn't visited in a while.",
    timing: "Daily",
    defaultTitle: "We miss you",
    defaultBody: "Come back this week for a little something on us.",
    hasThreshold: true,
  },
  {
    key: "birthday",
    name: "Birthday treat",
    description: "Sent on a customer's birthday (if they shared it at sign-up).",
    timing: "Daily",
    defaultTitle: "Happy birthday! 🎂",
    defaultBody: "Enjoy a birthday treat on us this week — just show your card.",
  },
];

export interface AutomationConfig {
  key: AutomationKey;
  enabled: boolean;
  title: string;
  body: string;
  thresholdDays: number;
}

export async function getAutomations(
  admin: DbClient,
  businessId: string,
): Promise<Record<AutomationKey, AutomationConfig>> {
  const { data } = await admin
    .from("automations")
    .select("key, enabled, title, body, threshold_days")
    .eq("business_id", businessId);
  const rows = new Map((data ?? []).map((r) => [r.key, r]));

  const out = {} as Record<AutomationKey, AutomationConfig>;
  for (const def of AUTOMATION_DEFS) {
    const row = rows.get(def.key);
    out[def.key] = {
      key: def.key,
      enabled: row?.enabled ?? false,
      title: row?.title || def.defaultTitle,
      body: row?.body || def.defaultBody,
      thresholdDays: row?.threshold_days ?? 21,
    };
  }
  return out;
}

async function consented(admin: DbClient, customerId: string): Promise<boolean> {
  const { data } = await admin
    .from("customers")
    .select("marketing_consent")
    .eq("id", customerId)
    .maybeSingle();
  return data?.marketing_consent ?? false;
}

async function sentWithin(
  admin: DbClient,
  businessId: string,
  customerId: string,
  key: AutomationKey,
  cooldownDays: number,
): Promise<boolean> {
  const since = new Date(Date.now() - cooldownDays * DAY).toISOString();
  const { count } = await admin
    .from("automation_sends")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .eq("automation_key", key)
    .gte("sent_at", since);
  return (count ?? 0) > 0;
}

async function record(
  admin: DbClient,
  businessId: string,
  customerId: string,
  key: AutomationKey,
) {
  await admin.from("automation_sends").insert({
    business_id: businessId,
    customer_id: customerId,
    automation_key: key,
  });
}

// Instant trigger: fired the moment a customer saves their card. Never throws.
export async function fireWelcome(
  admin: DbClient,
  businessId: string,
  customerId: string,
  passId: string | null,
) {
  try {
    if (!passId) return;
    const cfg = (await getAutomations(admin, businessId)).welcome;
    if (!cfg.enabled) return;
    if (!(await consented(admin, customerId))) return;
    if (await sentWithin(admin, businessId, customerId, "welcome", 3650)) return;
    await notifyPass(admin, passId, { title: cfg.title, body: cfg.body });
    await record(admin, businessId, customerId, "welcome");
  } catch (err) {
    console.error("fireWelcome failed", err);
  }
}

// Instant trigger: fired from addStamp when the customer becomes 1 stamp away.
export async function fireAlmostThere(
  admin: DbClient,
  businessId: string,
  customerId: string,
  passId: string,
) {
  try {
    const cfg = (await getAutomations(admin, businessId)).almost_there;
    if (!cfg.enabled) return;
    if (!(await consented(admin, customerId))) return;
    if (await sentWithin(admin, businessId, customerId, "almost_there", 7)) return;
    await notifyPass(admin, passId, { title: cfg.title, body: cfg.body });
    await record(admin, businessId, customerId, "almost_there");
  } catch (err) {
    console.error("fireAlmostThere failed", err);
  }
}

// Daily cron: win-back for customers inactive past each business's threshold.
export async function runDailyAutomations(
  admin: DbClient,
): Promise<{ businesses: number; delivered: number }> {
  const { data: rows } = await admin
    .from("automations")
    .select("business_id, title, body, threshold_days")
    .eq("key", "win_back")
    .eq("enabled", true);

  let delivered = 0;
  for (const row of rows ?? []) {
    const activity = await getCustomerActivity(admin, row.business_id);
    const targets = activity.filter(
      (a) =>
        !a.lost &&
        a.marketingConsent &&
        a.primaryPassId &&
        a.daysInactive >= (row.threshold_days ?? 21),
    );
    for (const t of targets) {
      if (await sentWithin(admin, row.business_id, t.id, "win_back", 30)) continue;
      const ok = await notifyPass(admin, t.primaryPassId as string, {
        title: row.title || "We miss you",
        body: row.body || "Come back soon!",
      });
      if (ok) {
        await record(admin, row.business_id, t.id, "win_back");
        delivered += 1;
      }
    }
  }

  delivered += await runBirthdays(admin);
  return { businesses: (rows ?? []).length, delivered };
}

// Daily cron: birthday treat for customers whose birthday is today.
async function runBirthdays(admin: DbClient): Promise<number> {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();

  const { data: rows } = await admin
    .from("automations")
    .select("business_id, title, body")
    .eq("key", "birthday")
    .eq("enabled", true);

  let delivered = 0;
  for (const row of rows ?? []) {
    const { data: customers } = await admin
      .from("customers")
      .select("id")
      .eq("business_id", row.business_id)
      .eq("birth_month", month)
      .eq("birth_day", day)
      .eq("marketing_consent", true);

    for (const c of customers ?? []) {
      if (await sentWithin(admin, row.business_id, c.id, "birthday", 300)) continue;
      const { data: passes } = await admin
        .from("wallet_passes")
        .select("id, status")
        .eq("customer_id", c.id);
      const primary = (passes ?? []).find(
        (p) => p.status !== "voided" && p.status !== "deleted",
      );
      if (!primary) continue;
      const ok = await notifyPass(admin, primary.id, {
        title: row.title || "Happy birthday! 🎂",
        body: row.body || "Enjoy a treat on us this week!",
      });
      if (ok) {
        await record(admin, row.business_id, c.id, "birthday");
        delivered += 1;
      }
    }
  }
  return delivered;
}
