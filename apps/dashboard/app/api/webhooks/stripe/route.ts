import type Stripe from "stripe";
import type { Json } from "@llw/db";
import { getStripe, planForPrice } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/webhooks/stripe — verifies the signature and syncs plan state.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return new Response("Missing signature.", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotency: unique stripe_event_id. If already recorded, ack and skip.
  const { error: insertError } = await admin.from("subscription_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Json,
  });
  if (insertError) {
    if (insertError.code === "23505") return new Response("ok", { status: 200 });
    return new Response("Storage error.", { status: 500 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const businessId = sub.metadata?.business_id;
      const priceId = sub.items.data[0]?.price?.id;
      const planKey =
        event.type === "customer.subscription.deleted"
          ? "canceled"
          : planForPrice(priceId);

      const update = {
        plan_key: planKey,
        stripe_subscription_id: sub.id,
        trial_ends_at: sub.trial_end
          ? new Date(sub.trial_end * 1000).toISOString()
          : null,
      };

      const query = admin.from("businesses").update(update);
      if (businessId) {
        await query.eq("id", businessId);
      } else {
        await query.eq("stripe_customer_id", sub.customer as string);
      }
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const businessId = session.metadata?.business_id;
      if (businessId && session.customer) {
        await admin
          .from("businesses")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: (session.subscription as string) ?? null,
          })
          .eq("id", businessId);
      }
      break;
    }

    default:
      break;
  }

  return new Response("ok", { status: 200 });
}
