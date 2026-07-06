"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Json } from "@llw/db";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveMembership } from "@/lib/business";
import { getBusinessPlan, countStaff } from "@/lib/plan";
import { inviteStaffSchema, staffRoleSchema } from "@/lib/validation";

const CAN_EDIT = ["business_owner", "business_admin"];

function staffError(message: string): never {
  redirect(`/dashboard/staff?error=${encodeURIComponent(message)}`);
}

async function requireEditor() {
  const supabase = await createClient();
  const m = await getActiveMembership(supabase);
  if (!m) redirect("/login");
  if (!CAN_EDIT.includes(m.role)) {
    staffError("Only owners and admins can manage staff.");
  }
  return { supabase, m };
}

async function audit(businessId: string, userId: string, action: string, entityId: string, metadata: Json) {
  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    business_id: businessId,
    actor_user_id: userId,
    action,
    entity_type: "staff_member",
    entity_id: entityId,
    metadata,
  });
}

// Finds an existing auth user by email, or invites a new one. Returns the id.
async function resolveOrInviteUser(email: string): Promise<string> {
  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/callback`,
  });
  if (data?.user) return data.user.id;

  // Already registered — look the user up and link them instead.
  if (error && /already|registered|exists/i.test(error.message)) {
    const { data: list } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const found = list?.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (found) return found.id;
  }
  staffError(error?.message ?? "Could not invite that email.");
}

export async function inviteStaff(formData: FormData) {
  const parsed = inviteStaffSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    locationId: formData.get("locationId") || "",
  });
  if (!parsed.success) staffError(parsed.error.issues[0].message);

  const { supabase, m } = await requireEditor();

  const [{ planKey, limits }, existing] = await Promise.all([
    getBusinessPlan(supabase, m.businessId),
    countStaff(supabase, m.businessId),
  ]);
  if (existing >= limits.staff) {
    staffError(
      `Your ${planKey} plan allows ${limits.staff} team member${limits.staff > 1 ? "s" : ""}. Upgrade in Billing to add more.`,
    );
  }

  const email = parsed.data.email.toLowerCase();
  const userId = await resolveOrInviteUser(email);

  const admin = createAdminClient();
  const { error } = await admin.from("staff_members").upsert(
    {
      business_id: m.businessId,
      user_id: userId,
      role: parsed.data.role,
      location_id: parsed.data.locationId || null,
      is_active: true,
      invited_by: m.userId,
    },
    { onConflict: "business_id,user_id" },
  );
  if (error) staffError(error.message);

  await audit(m.businessId, m.userId, "staff_invited", userId, {
    email,
    role: parsed.data.role,
  });
  revalidatePath("/dashboard/staff");
  redirect("/dashboard/staff?invited=1");
}

export async function updateStaffRole(formData: FormData) {
  const parsed = staffRoleSchema.safeParse({
    staffMemberId: formData.get("staffMemberId"),
    role: formData.get("role"),
  });
  if (!parsed.success) staffError(parsed.error.issues[0].message);

  const { supabase, m } = await requireEditor();

  // Never let an owner row be re-roled through this UI.
  const { data: target } = await supabase
    .from("staff_members")
    .select("role, user_id")
    .eq("id", parsed.data.staffMemberId)
    .eq("business_id", m.businessId)
    .maybeSingle();
  if (!target) staffError("Team member not found.");
  if (target.role === "business_owner") staffError("You can't change the owner's role.");

  const { error } = await supabase
    .from("staff_members")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.staffMemberId)
    .eq("business_id", m.businessId);
  if (error) staffError(error.message);

  await audit(m.businessId, m.userId, "staff_role_changed", parsed.data.staffMemberId, {
    role: parsed.data.role,
  });
  revalidatePath("/dashboard/staff");
  redirect("/dashboard/staff?saved=1");
}

export async function setStaffActive(formData: FormData) {
  const staffMemberId = String(formData.get("staffMemberId") ?? "");
  const active = formData.get("active") === "true";
  if (!staffMemberId) staffError("Missing team member.");

  const { supabase, m } = await requireEditor();

  const { data: target } = await supabase
    .from("staff_members")
    .select("role, user_id")
    .eq("id", staffMemberId)
    .eq("business_id", m.businessId)
    .maybeSingle();
  if (!target) staffError("Team member not found.");
  if (target.role === "business_owner") staffError("You can't deactivate the owner.");
  if (target.user_id === m.userId) staffError("You can't deactivate yourself.");

  const { error } = await supabase
    .from("staff_members")
    .update({ is_active: active })
    .eq("id", staffMemberId)
    .eq("business_id", m.businessId);
  if (error) staffError(error.message);

  await audit(
    m.businessId,
    m.userId,
    active ? "staff_activated" : "staff_deactivated",
    staffMemberId,
    {},
  );
  revalidatePath("/dashboard/staff");
  redirect("/dashboard/staff?saved=1");
}
