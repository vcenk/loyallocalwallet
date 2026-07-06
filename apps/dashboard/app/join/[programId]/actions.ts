"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrollSchema } from "@/lib/validation";
import { generateSerial, generateReferralCode } from "@/lib/token";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { fireWelcome } from "@/lib/automations";
import { processReferral } from "@/lib/referrals";

export async function enroll(formData: FormData) {
  const programId = String(formData.get("programId") ?? "");

  const ip = clientIpFromHeaders(await headers());
  if (!rateLimit(`enroll:${programId}:${ip}`, 8, 5 * 60_000).ok) {
    redirect(
      `/join/${programId}?error=${encodeURIComponent("Too many attempts. Please try again in a few minutes.")}`,
    );
  }

  const parsed = enrollSchema.safeParse({
    firstName: formData.get("firstName"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || undefined,
    platform: formData.get("platform"),
    birthMonth: formData.get("birthMonth") || undefined,
    birthDay: formData.get("birthDay") || undefined,
  });
  if (!parsed.success) {
    redirect(
      `/join/${programId}?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  const consent = formData.get("marketingConsent") === "on";
  const supabase = createAdminClient();

  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("id, business_id, status")
    .eq("id", programId)
    .maybeSingle();
  if (!program || program.status !== "active") {
    redirect(
      `/join/${programId}?error=${encodeURIComponent("This program is not available.")}`,
    );
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      business_id: program.business_id,
      first_name: parsed.data.firstName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      marketing_consent: consent,
      birth_month: parsed.data.birthMonth ?? null,
      birth_day: parsed.data.birthDay ?? null,
      referral_code: generateReferralCode(),
    })
    .select("id")
    .single();
  if (customerError || !customer) {
    redirect(
      `/join/${programId}?error=${encodeURIComponent(customerError?.message ?? "Could not enroll.")}`,
    );
  }

  const serial = generateSerial();
  const { data: pass, error: passError } = await supabase
    .from("wallet_passes")
    .insert({
      business_id: program.business_id,
      customer_id: customer.id,
      program_id: program.id,
      platform: parsed.data.platform,
      serial_number: serial,
      authentication_token: generateSerial(),
      status: "created",
    })
    .select("id")
    .single();
  if (passError || !pass) {
    redirect(
      `/join/${programId}?error=${encodeURIComponent(passError?.message ?? "Could not create pass.")}`,
    );
  }

  // Instant welcome (stored on the pass; shows when they add it to a wallet).
  await fireWelcome(supabase, program.business_id, customer.id, pass.id);

  // Refer-a-friend: if they came via a ?ref= link, credit both sides.
  const referrerCode = String(formData.get("ref") ?? "").trim();
  if (referrerCode) {
    await processReferral(supabase, {
      businessId: program.business_id,
      programId: program.id,
      referrerCode,
      referredCustomerId: customer.id,
      referredPassId: pass.id,
    });
  }

  redirect(`/join/${programId}/success?p=${serial}`);
}
