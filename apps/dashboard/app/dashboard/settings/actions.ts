"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveMembership } from "@/lib/business";
import { businessProfileSchema } from "@/lib/validation";

const CAN_EDIT = ["business_owner", "business_admin"];

function settingsError(message: string): never {
  redirect(`/dashboard/settings?error=${encodeURIComponent(message)}`);
}

export async function updateBusinessProfile(formData: FormData) {
  const parsed = businessProfileSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry") || undefined,
    phone: formData.get("phone") || undefined,
    website: formData.get("website") || undefined,
    email: formData.get("email") || "",
    brandColor: formData.get("brandColor") || undefined,
    googleReviewUrl: formData.get("googleReviewUrl") || "",
    welcomeBonusStamps: formData.get("welcomeBonusStamps") || 0,
  });
  if (!parsed.success) settingsError(parsed.error.issues[0].message);

  const supabase = await createClient();
  const m = await getActiveMembership(supabase);
  if (!m) redirect("/login");
  if (!CAN_EDIT.includes(m.role)) {
    settingsError("Only owners and admins can edit the business.");
  }

  const { error } = await supabase
    .from("businesses")
    .update({
      name: parsed.data.name,
      industry: parsed.data.industry ?? null,
      phone: parsed.data.phone ?? null,
      website: parsed.data.website ?? null,
      email: parsed.data.email || null,
      brand_color: parsed.data.brandColor ?? undefined,
      google_review_url: parsed.data.googleReviewUrl || null,
      welcome_bonus_stamps: parsed.data.welcomeBonusStamps ?? 0,
    })
    .eq("id", m.businessId);
  if (error) settingsError(error.message);

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?saved=1");
}

export async function uploadLogo(formData: FormData) {
  const file = formData.get("logo") as File | null;

  const supabase = await createClient();
  const m = await getActiveMembership(supabase);
  if (!m) redirect("/login");
  if (!CAN_EDIT.includes(m.role)) {
    settingsError("Only owners and admins can change the logo.");
  }

  if (!file || file.size === 0) settingsError("Choose an image first.");
  if (!file.type.startsWith("image/")) settingsError("File must be an image.");
  if (file.size > 2 * 1024 * 1024) settingsError("Image must be under 2MB.");

  const admin = createAdminClient();

  // Ensure the public "logos" bucket exists (created on first upload so no
  // manual Supabase setup is required). Ignore "already exists" errors.
  const { error: bucketError } = await admin.storage.createBucket("logos", {
    public: true,
    fileSizeLimit: "2MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
  });
  if (bucketError && !/exist/i.test(bucketError.message)) {
    settingsError(bucketError.message);
  }

  const ext = (file.name.split(".").pop() || "png")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const path = `${m.businessId}/logo.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from("logos")
    .upload(path, buffer, { contentType: file.type, upsert: true });
  if (uploadError) settingsError(uploadError.message);

  const { data: pub } = admin.storage.from("logos").getPublicUrl(path);
  // cache-bust so the new image shows immediately
  const url = `${pub.publicUrl}?v=${Date.now()}`;
  await admin.from("businesses").update({ logo_url: url }).eq("id", m.businessId);

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?logo=1");
}
