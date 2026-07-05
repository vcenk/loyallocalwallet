"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveMembership } from "@/lib/business";
import {
  resolveAudience,
  isAudienceKey,
  MESSAGE_TITLE_MAX,
  MESSAGE_BODY_MAX,
} from "@/lib/campaigns";

const schema = z.object({
  name: z.string().trim().min(2, "Campaign name is required.").max(80),
  audienceKey: z.string().refine(isAudienceKey, "Choose an audience."),
  messageTitle: z
    .string()
    .trim()
    .min(1, "Add a title.")
    .max(MESSAGE_TITLE_MAX, `Title must be ${MESSAGE_TITLE_MAX} characters or fewer.`),
  messageBody: z
    .string()
    .trim()
    .min(1, "Add a message.")
    .max(MESSAGE_BODY_MAX, `Message must be ${MESSAGE_BODY_MAX} characters or fewer.`),
});

const CAN_MANAGE = ["business_owner", "business_admin", "manager"];

export async function createCampaign(formData: FormData) {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    audienceKey: formData.get("audienceKey"),
    messageTitle: formData.get("messageTitle"),
    messageBody: formData.get("messageBody"),
  });
  if (!parsed.success) {
    redirect(
      `/dashboard/campaigns/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }
  if (!isAudienceKey(parsed.data.audienceKey)) {
    redirect(`/dashboard/campaigns/new?error=${encodeURIComponent("Choose an audience.")}`);
  }

  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  if (!membership) redirect("/login");
  if (!CAN_MANAGE.includes(membership.role)) {
    redirect(
      `/dashboard/campaigns/new?error=${encodeURIComponent("You don't have permission to send campaigns.")}`,
    );
  }

  const admin = createAdminClient();
  const recipients = await resolveAudience(
    admin,
    membership.businessId,
    parsed.data.audienceKey,
  );

  const { data: campaign, error } = await admin
    .from("campaigns")
    .insert({
      business_id: membership.businessId,
      created_by: membership.userId,
      name: parsed.data.name,
      audience_key: parsed.data.audienceKey,
      message_title: parsed.data.messageTitle,
      message_body: parsed.data.messageBody,
      status: "draft",
    })
    .select("id")
    .single();
  if (error || !campaign) {
    redirect(
      `/dashboard/campaigns/new?error=${encodeURIComponent(error?.message ?? "Could not create campaign.")}`,
    );
  }

  if (recipients.length > 0) {
    await admin.from("campaign_recipients").insert(
      recipients.map((r) => ({
        campaign_id: campaign.id,
        business_id: membership.businessId,
        customer_id: r.customerId,
        wallet_pass_id: r.walletPassId,
        status: "pending",
      })),
    );
  }

  await admin.from("audit_logs").insert({
    business_id: membership.businessId,
    actor_user_id: membership.userId,
    actor_staff_member_id: membership.staffMemberId,
    action: "campaign_created",
    entity_type: "campaign",
    entity_id: campaign.id,
    metadata: { audience: parsed.data.audienceKey, recipients: recipients.length },
  });

  redirect("/dashboard/campaigns?created=1");
}
