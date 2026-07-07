"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveMembership } from "@/lib/business";
import { getBusinessPlan, countPrograms } from "@/lib/plan";
import { PROGRAM_TYPES, type ProgramType } from "@llw/config";
import {
  programDetailsSchema,
  programStatusSchema,
  designSchema,
} from "@/lib/validation";

function parseProgramType(value: FormDataEntryValue | null): ProgramType {
  const v = String(value ?? "stamps");
  return (PROGRAM_TYPES as readonly string[]).includes(v)
    ? (v as ProgramType)
    : "stamps";
}

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
      program_type: parseProgramType(formData.get("rewardModel")),
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

  // Save the chosen design (from template / pickers), with safe defaults.
  const hex = /^#[0-9a-fA-F]{6}$/;
  const bg = String(formData.get("backgroundColor") ?? "");
  const fg = String(formData.get("foregroundColor") ?? "");
  const icon = String(formData.get("stampIcon") ?? "").slice(0, 24);
  const pattern = String(formData.get("pattern") ?? "none").slice(0, 24);
  const cardStyle = String(formData.get("cardStyle") ?? "retail").slice(0, 24);
  const stampStyle = String(formData.get("stampStyle") ?? "circles").slice(0, 24);
  await supabase.from("card_designs").insert({
    business_id: m.businessId,
    program_id: program.id,
    background_color: hex.test(bg) ? bg : "#ae3115",
    foreground_color: hex.test(fg) ? fg : "#ffffff",
    stamp_icon: icon || "star",
    pattern: pattern || "none",
    card_style: cardStyle || "retail",
    stamp_style: stampStyle || "circles",
  });

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
      program_type: parseProgramType(formData.get("rewardModel")),
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
    stampIcon: formData.get("stampIcon") || undefined,
    pattern: formData.get("pattern") || undefined,
      cardStyle: formData.get("cardStyle") || undefined,
    stampStyle: formData.get("stampStyle") || undefined,
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
      stamp_icon: parsed.data.stampIcon ?? "star",
      pattern: parsed.data.pattern ?? "none",
      card_style: parsed.data.cardStyle ?? "retail",
      stamp_style: parsed.data.stampStyle ?? "circles",
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
