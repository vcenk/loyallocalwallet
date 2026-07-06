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
