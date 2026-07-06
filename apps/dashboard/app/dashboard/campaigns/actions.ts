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
import { notifyPass } from "@/lib/wallet";

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

  // "Send wallet campaign" — deliver immediately instead of saving a draft.
  if (formData.get("sendNow") === "1") {
    let delivered = 0;
    for (const r of recipients) {
      if (!r.walletPassId) continue;
      const ok = await notifyPass(admin, r.walletPassId, {
        title: parsed.data.messageTitle,
        body: parsed.data.messageBody,
      });
      if (ok) delivered += 1;
    }
    await admin
      .from("campaigns")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", campaign.id);
    await admin.from("audit_logs").insert({
      business_id: membership.businessId,
      actor_user_id: membership.userId,
      actor_staff_member_id: membership.staffMemberId,
      action: "campaign_sent",
      entity_type: "campaign",
      entity_id: campaign.id,
      metadata: { recipients: recipients.length, delivered },
    });
    redirect(`/dashboard/campaigns?sent=${delivered}`);
  }

  redirect("/dashboard/campaigns?created=1");
}

export async function sendCampaign(formData: FormData) {
  const campaignId = String(formData.get("campaignId") ?? "");
  if (!campaignId) {
    redirect(`/dashboard/campaigns?error=${encodeURIComponent("Missing campaign.")}`);
  }

  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  if (!membership) redirect("/login");
  if (!CAN_MANAGE.includes(membership.role)) {
    redirect(
      `/dashboard/campaigns?error=${encodeURIComponent("You don't have permission to send campaigns.")}`,
    );
  }

  const admin = createAdminClient();
  const { data: campaign } = await admin
    .from("campaigns")
    .select("id, business_id, audience_key, status, message_title, message_body")
    .eq("id", campaignId)
    .eq("business_id", membership.businessId)
    .maybeSingle();

  if (!campaign) {
    redirect(`/dashboard/campaigns?error=${encodeURIComponent("Campaign not found.")}`);
  }
  if (campaign.status === "sent") {
    redirect(`/dashboard/campaigns?error=${encodeURIComponent("This campaign was already sent.")}`);
  }
  if (!campaign.audience_key || !isAudienceKey(campaign.audience_key)) {
    redirect(`/dashboard/campaigns?error=${encodeURIComponent("Invalid audience.")}`);
  }

  // Re-resolve the audience now (consent may have changed since it was drafted).
  const recipients = await resolveAudience(
    admin,
    membership.businessId,
    campaign.audience_key,
  );

  let delivered = 0;
  for (const r of recipients) {
    if (!r.walletPassId) continue;
    const ok = await notifyPass(admin, r.walletPassId, {
      title: campaign.message_title ?? "",
      body: campaign.message_body ?? "",
    });
    if (ok) delivered += 1;
  }

  await admin
    .from("campaigns")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", campaign.id);

  await admin.from("audit_logs").insert({
    business_id: membership.businessId,
    actor_user_id: membership.userId,
    actor_staff_member_id: membership.staffMemberId,
    action: "campaign_sent",
    entity_type: "campaign",
    entity_id: campaign.id,
    metadata: { recipients: recipients.length, delivered },
  });

  redirect(`/dashboard/campaigns?sent=${delivered}`);
}
