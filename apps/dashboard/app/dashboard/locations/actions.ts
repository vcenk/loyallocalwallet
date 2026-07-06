"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Json } from "@llw/db";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveMembership } from "@/lib/business";
import { getBusinessPlan, countLocations } from "@/lib/plan";
import { locationSchema } from "@/lib/validation";

const CAN_EDIT = ["business_owner", "business_admin"];

function locError(message: string): never {
  redirect(`/dashboard/locations?error=${encodeURIComponent(message)}`);
}

async function requireEditor() {
  const supabase = await createClient();
  const m = await getActiveMembership(supabase);
  if (!m) redirect("/login");
  if (!CAN_EDIT.includes(m.role)) {
    locError("Only owners and admins can manage locations.");
  }
  return { supabase, m };
}

async function audit(businessId: string, userId: string, action: string, entityId: string, metadata: Json) {
  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    business_id: businessId,
    actor_user_id: userId,
    action,
    entity_type: "location",
    entity_id: entityId,
    metadata,
  });
}

export async function createLocation(formData: FormData) {
  const parsed = locationSchema.safeParse({
    name: formData.get("name"),
    addressLine1: formData.get("addressLine1") || undefined,
    city: formData.get("city") || undefined,
    province: formData.get("province") || undefined,
    postalCode: formData.get("postalCode") || undefined,
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) locError(parsed.error.issues[0].message);

  const { supabase, m } = await requireEditor();

  const [{ planKey, limits }, existing] = await Promise.all([
    getBusinessPlan(supabase, m.businessId),
    countLocations(supabase, m.businessId),
  ]);
  if (existing >= limits.locations) {
    locError(
      `Your ${planKey} plan allows ${limits.locations} location${limits.locations > 1 ? "s" : ""}. Upgrade in Billing to add more.`,
    );
  }

  const { data, error } = await supabase
    .from("locations")
    .insert({
      business_id: m.businessId,
      name: parsed.data.name,
      address_line1: parsed.data.addressLine1 ?? null,
      city: parsed.data.city ?? null,
      province: parsed.data.province ?? null,
      postal_code: parsed.data.postalCode ?? null,
      phone: parsed.data.phone ?? null,
    })
    .select("id")
    .single();
  if (error) locError(error.message);

  await audit(m.businessId, m.userId, "location_created", data.id, {
    name: parsed.data.name,
  });
  revalidatePath("/dashboard/locations");
  redirect("/dashboard/locations?saved=1");
}

export async function setLocationActive(formData: FormData) {
  const locationId = String(formData.get("locationId") ?? "");
  const active = formData.get("active") === "true";
  if (!locationId) locError("Missing location.");

  const { supabase, m } = await requireEditor();

  const { error } = await supabase
    .from("locations")
    .update({ is_active: active })
    .eq("id", locationId)
    .eq("business_id", m.businessId);
  if (error) locError(error.message);

  await audit(
    m.businessId,
    m.userId,
    active ? "location_activated" : "location_deactivated",
    locationId,
    {},
  );
  revalidatePath("/dashboard/locations");
  redirect("/dashboard/locations?saved=1");
}
