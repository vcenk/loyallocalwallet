"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

// Public, no-auth: a customer manages their own marketing preference from the
// link on their wallet pass. The serial is opaque + unguessable, so it doubles
// as the auth token for this specific customer.
export async function setConsentPublic(formData: FormData) {
  const serial = String(formData.get("serial") ?? "");
  const optIn = formData.get("optIn") === "true";
  if (!serial) redirect("/");

  const admin = createAdminClient();
  const { data: pass } = await admin
    .from("wallet_passes")
    .select("customer_id, business_id")
    .eq("serial_number", serial)
    .maybeSingle();
  if (!pass) redirect(`/unsubscribe/${serial}?error=1`);

  await admin
    .from("customers")
    .update({ marketing_consent: optIn })
    .eq("id", pass.customer_id);

  await admin.from("audit_logs").insert({
    business_id: pass.business_id,
    action: optIn ? "consent_opted_in" : "consent_opted_out",
    entity_type: "customer",
    entity_id: pass.customer_id,
    metadata: { source: "wallet_link" },
  });

  redirect(`/unsubscribe/${serial}?done=${optIn ? "in" : "out"}`);
}
