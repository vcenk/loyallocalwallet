"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveMembership } from "@/lib/business";
import { MESSAGE_TITLE_MAX, MESSAGE_BODY_MAX } from "@/lib/campaigns";

const CAN_EDIT = ["business_owner", "business_admin"];

const schema = z.object({
  key: z.enum(["welcome", "almost_there", "win_back", "birthday"]),
  enabled: z.boolean(),
  title: z.string().trim().min(1, "Add a title.").max(MESSAGE_TITLE_MAX),
  body: z.string().trim().min(1, "Add a message.").max(MESSAGE_BODY_MAX),
  thresholdDays: z.coerce.number().int().min(1).max(365),
});

function autoError(message: string): never {
  redirect(`/dashboard/automations?error=${encodeURIComponent(message)}`);
}

export async function saveAutomation(formData: FormData) {
  const parsed = schema.safeParse({
    key: formData.get("key"),
    enabled: formData.get("enabled") === "on",
    title: formData.get("title"),
    body: formData.get("body"),
    thresholdDays: formData.get("thresholdDays") || 21,
  });
  if (!parsed.success) autoError(parsed.error.issues[0].message);

  const supabase = await createClient();
  const m = await getActiveMembership(supabase);
  if (!m) redirect("/login");
  if (!CAN_EDIT.includes(m.role)) {
    autoError("Only owners and admins can manage automations.");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("automations").upsert(
    {
      business_id: m.businessId,
      key: parsed.data.key,
      enabled: parsed.data.enabled,
      title: parsed.data.title,
      body: parsed.data.body,
      threshold_days: parsed.data.thresholdDays,
    },
    { onConflict: "business_id,key" },
  );
  if (error) autoError(error.message);

  await admin.from("audit_logs").insert({
    business_id: m.businessId,
    actor_user_id: m.userId,
    actor_staff_member_id: m.staffMemberId,
    action: parsed.data.enabled ? "automation_enabled" : "automation_disabled",
    entity_type: "automation",
    metadata: { key: parsed.data.key },
  });

  revalidatePath("/dashboard/automations");
  redirect("/dashboard/automations?saved=1");
}
