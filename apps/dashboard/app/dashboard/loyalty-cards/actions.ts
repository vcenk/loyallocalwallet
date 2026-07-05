"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveMembership } from "@/lib/business";
import { getBusinessPlan, countPrograms } from "@/lib/plan";
import {
  programDetailsSchema,
  programStatusSchema,
  designSchema,
} from "@/lib/validation";

function parseDetails(formData: FormData) {
  return programDetailsSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    stampsRequired: formData.get("stampsRequired"),
    rewardTitle: formData.get("rewardTitle"),
    rewardDescription: formData.get("rewardDescription") || undefined,
  });
}

export async function createProgram(formData: FormData) {
  const parsed = parseDetails(formData);
  if (!parsed.success) {
    redirect(
      `/dashboard/loyalty-cards/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  const supabase = await createClient();
  const m = await getActiveMembership(supabase);
  if (!m) redirect("/login");

  // Enforce the plan's card limit.
  const [{ planKey, limits }, existing] = await Promise.all([
    getBusinessPlan(supabase, m.businessId),
    countPrograms(supabase, m.businessId),
  ]);
  if (existing >= limits.programs) {
    redirect(
      `/dashboard/loyalty-cards/new?error=${encodeURIComponent(
        `Your ${planKey} plan allows ${limits.programs} loyalty card${limits.programs > 1 ? "s" : ""}. Upgrade in Billing to add more.`,
      )}`,
    );
  }

  const { data: program, error } = await supabase
    .from("loyalty_programs")
    .insert({
      business_id: m.businessId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      program_type: "stamps",
      status: "draft",
      stamps_required: parsed.data.stampsRequired,
      reward_title: parsed.data.rewardTitle,
      reward_description: parsed.data.rewardDescription ?? null,
    })
    .select("id")
    .single();

  if (error || !program) {
    redirect(
      `/dashboard/loyalty-cards/new?error=${encodeURIComponent(error?.message ?? "Could not create card.")}`,
    );
  }

  // Create the default card design (one per program).
  await supabase
    .from("card_designs")
    .insert({ business_id: m.businessId, program_id: program.id });

  redirect(`/dashboard/loyalty-cards/${program.id}?created=1`);
}

export async function updateProgram(formData: FormData) {
  const programId = String(formData.get("programId") ?? "");
  const parsed = parseDetails(formData);
  const status = programStatusSchema.safeParse(formData.get("status"));

  if (!parsed.success || !status.success) {
    const msg = !parsed.success
      ? parsed.error.issues[0].message
      : "Invalid status.";
    redirect(
      `/dashboard/loyalty-cards/${programId}?error=${encodeURIComponent(msg)}`,
    );
  }

  const supabase = await createClient();
  const m = await getActiveMembership(supabase);
  if (!m) redirect("/login");

  const { error } = await supabase
    .from("loyalty_programs")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      stamps_required: parsed.data.stampsRequired,
      reward_title: parsed.data.rewardTitle,
      reward_description: parsed.data.rewardDescription ?? null,
      status: status.data,
    })
    .eq("id", programId)
    .eq("business_id", m.businessId);

  if (error) {
    redirect(
      `/dashboard/loyalty-cards/${programId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/dashboard/loyalty-cards/${programId}`);
  redirect(`/dashboard/loyalty-cards/${programId}?saved=1`);
}

export async function updateDesign(formData: FormData) {
  const programId = String(formData.get("programId") ?? "");
  const parsed = designSchema.safeParse({
    backgroundColor: formData.get("backgroundColor"),
    foregroundColor: formData.get("foregroundColor"),
  });

  if (!parsed.success) {
    redirect(
      `/dashboard/loyalty-cards/${programId}?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  const supabase = await createClient();
  const m = await getActiveMembership(supabase);
  if (!m) redirect("/login");

  const { error } = await supabase
    .from("card_designs")
    .update({
      background_color: parsed.data.backgroundColor,
      foreground_color: parsed.data.foregroundColor,
    })
    .eq("program_id", programId)
    .eq("business_id", m.businessId);

  if (error) {
    redirect(
      `/dashboard/loyalty-cards/${programId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/dashboard/loyalty-cards/${programId}`);
  redirect(`/dashboard/loyalty-cards/${programId}?saved=1`);
}
