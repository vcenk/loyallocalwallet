"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveMembership } from "@/lib/business";
import {
  findPassById,
  loadProgram,
  addStamp as addStampCore,
  redeem as redeemCore,
} from "@/lib/stamps";

function back(customerId: string, query: string): never {
  redirect(`/dashboard/customers/${customerId}?${query}`);
}

async function context(passId: string, customerId: string) {
  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  if (!membership) redirect("/login");

  const admin = createAdminClient();
  const pass = await findPassById(admin, passId);
  if (!pass || pass.business_id !== membership.businessId) {
    back(customerId, `error=${encodeURIComponent("Card not found.")}`);
  }
  const program = await loadProgram(admin, pass.program_id);
  if (!program) {
    back(customerId, `error=${encodeURIComponent("Program not found.")}`);
  }

  return {
    admin,
    pass,
    program,
    ctx: {
      userId: membership.userId,
      staffMemberId: membership.staffMemberId,
      businessId: membership.businessId,
    },
  };
}

export async function addStamp(formData: FormData) {
  const passId = String(formData.get("passId") ?? "");
  const customerId = String(formData.get("customerId") ?? "");
  const isBonus = formData.get("eventType") === "bonus";
  const reason = String(formData.get("reason") ?? "");
  // Points/spend programs send an amount; stamps/visits omit it (defaults to 1).
  const amountRaw = Number(formData.get("amount"));
  const quantity =
    Number.isFinite(amountRaw) && amountRaw > 0 ? Math.floor(amountRaw) : 1;

  const { admin, ctx, pass, program } = await context(passId, customerId);
  await addStampCore(admin, ctx, pass, program, { isBonus, reason, quantity });

  revalidatePath(`/dashboard/customers/${customerId}`);
  back(customerId, "saved=1");
}

const CAN_MANAGE_CONSENT = ["business_owner", "business_admin"];

export async function setMarketingConsent(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "");
  const optIn = formData.get("optIn") === "true";
  if (!customerId) back(customerId, `error=${encodeURIComponent("Missing customer.")}`);

  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  if (!membership) redirect("/login");
  if (!CAN_MANAGE_CONSENT.includes(membership.role)) {
    back(customerId, `error=${encodeURIComponent("Only owners and admins can change consent.")}`);
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("customers")
    .update({ marketing_consent: optIn })
    .eq("id", customerId)
    .eq("business_id", membership.businessId);
  if (error) back(customerId, `error=${encodeURIComponent(error.message)}`);

  await admin.from("audit_logs").insert({
    business_id: membership.businessId,
    actor_user_id: membership.userId,
    actor_staff_member_id: membership.staffMemberId,
    action: optIn ? "consent_opted_in" : "consent_opted_out",
    entity_type: "customer",
    entity_id: customerId,
    metadata: {},
  });

  revalidatePath(`/dashboard/customers/${customerId}`);
  back(customerId, "consent=1");
}

export async function redeemReward(formData: FormData) {
  const passId = String(formData.get("passId") ?? "");
  const customerId = String(formData.get("customerId") ?? "");

  const { admin, ctx, pass, program } = await context(passId, customerId);
  const result = await redeemCore(admin, ctx, pass, program);
  if (!result.ok) {
    back(customerId, `error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath(`/dashboard/customers/${customerId}`);
  back(customerId, "redeemed=1");
}
