import "server-only";
import Stripe from "stripe";

// Lazily-constructed server-only Stripe client. Lazy so the empty key at build
// time doesn't throw during page-data collection. Never expose the secret key.
let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
    client = new Stripe(key, { typescript: true });
  }
  return client;
}

export const PRICE_BY_PLAN: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER_MONTHLY,
  growth: process.env.STRIPE_PRICE_GROWTH_MONTHLY,
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY,
};

// Maps a Stripe price id back to our plan key.
export function planForPrice(priceId: string | undefined): string {
  if (!priceId) return "trial";
  for (const [plan, id] of Object.entries(PRICE_BY_PLAN)) {
    if (id && id === priceId) return plan;
  }
  return "trial";
}
