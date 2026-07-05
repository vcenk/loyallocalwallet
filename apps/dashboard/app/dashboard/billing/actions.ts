"use server";

import { redirect } from "next/navigation";
import { getStripe, PRICE_BY_PLAN } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveMembership } from "@/lib/business";

const CAN_BILL = ["business_owner", "business_admin"];
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function billingError(message: string): never {
  redirect(`/dashboard/billing?error=${encodeURIComponent(message)}`);
}

export async function startCheckout(formData: FormData) {
  const plan = String(formData.get("plan") ?? "");
  const priceId = PRICE_BY_PLAN[plan];
  if (!priceId) {
    billingError(
      "That plan isn't configured yet. Set its Stripe price ID in the environment.",
    );
  }

  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  if (!membership) redirect("/login");
  if (!CAN_BILL.includes(membership.role)) {
    billingError("Only owners and admins can manage billing.");
  }

  const stripe = getStripe();
  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("id, name, email, stripe_customer_id")
    .eq("id", membership.businessId)
    .single();
  if (!business) billingError("Business not found.");

  let customerId = business.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: business.name,
      email: business.email ?? undefined,
      metadata: { business_id: business.id },
    });
    customerId = customer.id;
    await admin
      .from("businesses")
      .update({ stripe_customer_id: customerId })
      .eq("id", business.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/dashboard/billing?success=1`,
    cancel_url: `${APP_URL}/dashboard/billing?canceled=1`,
    allow_promotion_codes: true,
    metadata: { business_id: business.id },
    subscription_data: { metadata: { business_id: business.id } },
  });
  if (!session.url) billingError("Could not start checkout.");

  redirect(session.url);
}

export async function openPortal() {
  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  if (!membership) redirect("/login");
  if (!CAN_BILL.includes(membership.role)) {
    billingError("Only owners and admins can manage billing.");
  }

  const stripe = getStripe();
  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("stripe_customer_id")
    .eq("id", membership.businessId)
    .single();
  if (!business?.stripe_customer_id) {
    billingError("No billing account yet. Choose a plan first.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: business.stripe_customer_id,
    return_url: `${APP_URL}/dashboard/billing`,
  });
  redirect(session.url);
}
