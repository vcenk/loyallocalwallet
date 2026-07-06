import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@llw/db";
import { calculateProgress, type ProgramType, type Progress } from "@llw/config";
import { syncWalletForPass, notifyPass } from "./wallet";
import { fireAlmostThere } from "./automations";

// Shared stamp-engine core, used by both the dashboard server actions and the
// staff HTTP API. All mutations expect an admin (service-role) client; callers
// are responsible for authorizing the actor against pass.business_id first.

export type DbClient = SupabaseClient<Database>;

export interface StaffContext {
  userId: string;
  staffMemberId: string;
  businessId: string;
}

export interface PassInfo {
  id: string;
  business_id: string;
  customer_id: string;
  program_id: string;
}

export interface ProgramInfo {
  id: string;
  program_type: ProgramType;
  stamps_required: number;
  reward_title: string;
  name: string;
}

export async function findPassById(
  admin: DbClient,
  passId: string,
): Promise<PassInfo | null> {
  const { data } = await admin
    .from("wallet_passes")
    .select("id, business_id, customer_id, program_id")
    .eq("id", passId)
    .maybeSingle();
  return data ?? null;
}

export async function findPassBySerial(
  admin: DbClient,
  serial: string,
): Promise<PassInfo | null> {
  const { data } = await admin
    .from("wallet_passes")
    .select("id, business_id, customer_id, program_id")
    .eq("serial_number", serial)
    .maybeSingle();
  return data ?? null;
}

export async function loadProgram(
  admin: DbClient,
  programId: string,
): Promise<ProgramInfo | null> {
  const { data } = await admin
    .from("loyalty_programs")
    .select("id, program_type, stamps_required, reward_title, name")
    .eq("id", programId)
    .maybeSingle();
  if (!data) return null;
  return { ...data, stamps_required: data.stamps_required ?? 10 };
}

// Active membership of a user in a specific business (authorization check).
export async function getMembership(
  admin: DbClient,
  userId: string,
  businessId: string,
): Promise<{ staffMemberId: string } | null> {
  const { data } = await admin
    .from("staff_members")
    .select("id")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .eq("is_active", true)
    .maybeSingle();
  return data ? { staffMemberId: data.id } : null;
}

export async function computeProgress(
  admin: DbClient,
  passId: string,
  program: ProgramInfo,
): Promise<Progress> {
  const { data: events } = await admin
    .from("stamp_events")
    .select("event_type, quantity")
    .eq("wallet_pass_id", passId);
  return calculateProgress({
    programType: program.program_type,
    stampsRequired: program.stamps_required,
    events: events ?? [],
  });
}

async function syncCache(admin: DbClient, passId: string, progress: Progress) {
  await admin
    .from("wallet_passes")
    .update({
      current_stamps: progress.total,
      rewards_available: progress.rewardsAvailable,
      last_updated_at: new Date().toISOString(),
    })
    .eq("id", passId);
}

async function touchCustomer(admin: DbClient, customerId: string) {
  await admin
    .from("customers")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", customerId);
}

async function audit(
  admin: DbClient,
  ctx: StaffContext,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Json,
) {
  await admin.from("audit_logs").insert({
    business_id: ctx.businessId,
    actor_user_id: ctx.userId,
    actor_staff_member_id: ctx.staffMemberId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
}

export async function addStamp(
  admin: DbClient,
  ctx: StaffContext,
  pass: PassInfo,
  program: ProgramInfo,
  opts: {
    isBonus?: boolean;
    reason?: string;
    locationId?: string | null;
    quantity?: number;
  } = {},
): Promise<Progress> {
  const isBonus = opts.isBonus ?? false;
  const reason = (
    opts.reason?.trim() || (isBonus ? "Bonus" : "Purchase")
  ).slice(0, 120);
  // Points/spend programs pass a variable amount; stamps/visits default to 1.
  const quantity = Math.max(1, Math.floor(opts.quantity ?? 1));

  await admin.from("stamp_events").insert({
    business_id: pass.business_id,
    location_id: opts.locationId ?? null,
    customer_id: pass.customer_id,
    program_id: pass.program_id,
    wallet_pass_id: pass.id,
    staff_member_id: ctx.staffMemberId,
    event_type: isBonus ? "bonus" : "earn",
    quantity,
    reason,
  });

  const progress = await computeProgress(admin, pass.id, program);
  await syncCache(admin, pass.id, progress);
  await touchCustomer(admin, pass.customer_id);
  await audit(
    admin,
    ctx,
    isBonus ? "bonus_stamp_added" : "stamp_added",
    "wallet_pass",
    pass.id,
    { quantity: 1, reason, total: progress.total },
  );
  await syncWalletForPass(admin, pass.id);

  // Instant "almost there" nudge when this stamp leaves them one short.
  if (
    progress.rewardsAvailable === 0 &&
    progress.required - progress.towardNext === 1
  ) {
    await fireAlmostThere(admin, pass.business_id, pass.customer_id, pass.id);
  }

  return progress;
}

// System-granted bonus stamp(s) (referral reward, welcome bonus) — no staff actor.
export async function giveSystemBonus(
  admin: DbClient,
  pass: PassInfo,
  program: ProgramInfo,
  reason: string,
  quantity = 1,
): Promise<Progress> {
  await admin.from("stamp_events").insert({
    business_id: pass.business_id,
    customer_id: pass.customer_id,
    program_id: pass.program_id,
    wallet_pass_id: pass.id,
    staff_member_id: null,
    event_type: "bonus",
    quantity,
    reason: reason.slice(0, 120),
  });

  const progress = await computeProgress(admin, pass.id, program);
  await syncCache(admin, pass.id, progress);
  await touchCustomer(admin, pass.customer_id);
  await admin.from("audit_logs").insert({
    business_id: pass.business_id,
    actor_user_id: null,
    actor_staff_member_id: null,
    action: "referral_bonus",
    entity_type: "wallet_pass",
    entity_id: pass.id,
    metadata: { reason },
  });
  await syncWalletForPass(admin, pass.id);
  return progress;
}

export async function redeem(
  admin: DbClient,
  ctx: StaffContext,
  pass: PassInfo,
  program: ProgramInfo,
  opts: { locationId?: string | null } = {},
): Promise<
  { ok: true; progress: Progress; redemptionId: string } | { ok: false; error: string }
> {
  const before = await computeProgress(admin, pass.id, program);
  if (before.rewardsAvailable < 1) {
    return { ok: false, error: "No reward available yet." };
  }

  const { data: redemption, error } = await admin
    .from("reward_redemptions")
    .insert({
      business_id: pass.business_id,
      location_id: opts.locationId ?? null,
      customer_id: pass.customer_id,
      program_id: pass.program_id,
      wallet_pass_id: pass.id,
      staff_member_id: ctx.staffMemberId,
      reward_title: program.reward_title,
      status: "redeemed",
    })
    .select("id")
    .single();
  if (error || !redemption) {
    return { ok: false, error: error?.message ?? "Could not redeem." };
  }

  // Reset one reward's worth on the ledger; remainder carries over.
  await admin.from("stamp_events").insert({
    business_id: pass.business_id,
    location_id: opts.locationId ?? null,
    customer_id: pass.customer_id,
    program_id: pass.program_id,
    wallet_pass_id: pass.id,
    staff_member_id: ctx.staffMemberId,
    event_type: "adjustment",
    quantity: -program.stamps_required,
    reason: "reward_redeem",
  });

  const progress = await computeProgress(admin, pass.id, program);
  await syncCache(admin, pass.id, progress);
  await touchCustomer(admin, pass.customer_id);
  await audit(admin, ctx, "reward_redeemed", "reward_redemption", redemption.id, {
    reward_title: program.reward_title,
    total_after: progress.total,
  });
  await syncWalletForPass(admin, pass.id);

  // Non-incentivized review request after a redemption (a genuine happy moment).
  // The stamp/reward is never contingent on leaving a review — compliance rule.
  const { data: biz } = await admin
    .from("businesses")
    .select("name, google_review_url")
    .eq("id", pass.business_id)
    .maybeSingle();
  if (biz?.google_review_url) {
    await notifyPass(admin, pass.id, {
      title: biz.name || "Thanks for visiting",
      body: "Hope you enjoyed your reward! If you have a moment, we'd love a review 🙏",
      link: biz.google_review_url,
    });
  }

  return { ok: true, progress, redemptionId: redemption.id };
}
