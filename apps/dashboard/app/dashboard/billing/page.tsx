import { Check } from "lucide-react";
import { PageHeader, Card, CardContent, Badge, Button } from "@llw/ui";
import { PLAN_LIMITS } from "@llw/config";
import { createClient } from "@/lib/supabase/server";
import { getActiveMembership } from "@/lib/business";
import { startCheckout, openPortal } from "./actions";

const PLANS: {
  key: keyof typeof PLAN_LIMITS;
  name: string;
  price: string;
  blurb: string;
  featured?: boolean;
}[] = [
  { key: "starter", name: "Starter", price: "$19", blurb: "Solo local shop" },
  {
    key: "growth",
    name: "Growth",
    price: "$39",
    blurb: "Best for most shops",
    featured: true,
  },
  { key: "pro", name: "Pro", price: "$79", blurb: "Multi-location or busy shop" },
];

function planFeatures(key: keyof typeof PLAN_LIMITS) {
  const l = PLAN_LIMITS[key];
  return [
    `${l.locations} location${l.locations > 1 ? "s" : ""}`,
    `${l.programs} loyalty card${l.programs > 1 ? "s" : ""}`,
    `${l.staff} staff users`,
    l.campaigns ? "Win-back campaigns" : "No campaigns",
    l.export ? "Data export" : "No export",
  ];
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; error?: string }>;
}) {
  const { success, canceled, error } = await searchParams;

  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  const { data: business } = await supabase
    .from("businesses")
    .select("plan_key, trial_ends_at, stripe_subscription_id")
    .limit(1)
    .maybeSingle();

  const planKey = business?.plan_key ?? "trial";
  const hasSubscription = !!business?.stripe_subscription_id;
  const canBill =
    membership?.role === "business_owner" ||
    membership?.role === "business_admin";

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Your plan and subscription."
        action={
          hasSubscription && canBill ? (
            <form action={openPortal}>
              <Button type="submit" variant="outline">
                Manage billing
              </Button>
            </form>
          ) : undefined
        }
      />

      {success ? (
        <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Subscription started. It may take a moment to reflect here.
        </p>
      ) : null}
      {canceled ? (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Checkout canceled.
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Card className="mb-6">
        <CardContent className="flex items-center justify-between p-6 pt-6">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-lg font-bold capitalize text-foreground">
              {planKey}
            </p>
          </div>
          <Badge variant={hasSubscription ? "success" : "default"}>
            {hasSubscription ? "Active" : "No subscription"}
          </Badge>
        </CardContent>
      </Card>

      {!canBill ? (
        <p className="text-sm text-muted-foreground">
          Only owners and admins can change the plan.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const current = planKey === plan.key;
            return (
              <Card
                key={plan.key}
                className={plan.featured ? "border-primary" : ""}
              >
                <CardContent className="flex h-full flex-col p-6 pt-6">
                  {plan.featured ? (
                    <Badge variant="primary" className="mb-2 self-start">
                      {plan.blurb}
                    </Badge>
                  ) : (
                    <p className="mb-2 text-xs text-muted-foreground">
                      {plan.blurb}
                    </p>
                  )}
                  <p className="text-lg font-bold text-foreground">
                    {plan.name}
                  </p>
                  <p className="mb-4 text-2xl font-bold text-foreground">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      CAD/mo
                    </span>
                  </p>
                  <ul className="mb-6 flex-1 space-y-2 text-sm text-muted-foreground">
                    {planFeatures(plan.key).map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[color:var(--success)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <form action={startCheckout}>
                    <input type="hidden" name="plan" value={plan.key} />
                    <Button
                      type="submit"
                      variant={plan.featured ? "default" : "outline"}
                      className="w-full"
                      disabled={current}
                    >
                      {current ? "Current plan" : `Choose ${plan.name}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
