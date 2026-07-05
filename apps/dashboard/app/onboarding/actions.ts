"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createBusinessSchema } from "@/lib/validation";
import { slugifyBase, randomSuffix } from "@/lib/slug";

export async function createBusiness(formData: FormData) {
  const parsed = createBusinessSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry") || undefined,
  });
  if (!parsed.success) {
    redirect(
      `/onboarding?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const base = slugifyBase(parsed.data.name) || "shop";

  // Insert the business; the handle_new_business trigger makes the current user
  // its business_owner. Retry on the rare slug collision.
  let lastError = "Could not create business.";
  for (let attempt = 0; attempt < 4; attempt++) {
    const { error } = await supabase.from("businesses").insert({
      name: parsed.data.name,
      slug: `${base}-${randomSuffix()}`,
      industry: parsed.data.industry ?? null,
    });

    if (!error) {
      redirect("/dashboard");
    }
    lastError = error.message;
    if (error.code !== "23505") break; // not a unique-violation -> stop retrying
  }

  redirect(`/onboarding?error=${encodeURIComponent(lastError)}`);
}
