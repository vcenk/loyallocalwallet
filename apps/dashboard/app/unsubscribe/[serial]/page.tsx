import { notFound } from "next/navigation";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { setConsentPublic } from "./actions";

export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ serial: string }>;
  searchParams: Promise<{ done?: string; error?: string }>;
}) {
  const { serial } = await params;
  const { done } = await searchParams;

  const admin = createAdminClient();
  const { data: pass } = await admin
    .from("wallet_passes")
    .select("customer_id, business_id")
    .eq("serial_number", serial)
    .maybeSingle();
  if (!pass) notFound();

  const [{ data: customer }, { data: business }] = await Promise.all([
    admin
      .from("customers")
      .select("first_name, marketing_consent")
      .eq("id", pass.customer_id)
      .maybeSingle(),
    admin
      .from("businesses")
      .select("name")
      .eq("id", pass.business_id)
      .maybeSingle(),
  ]);

  const optedIn = customer?.marketing_consent ?? false;
  const businessName = business?.name ?? "this shop";
  const firstName = customer?.first_name?.trim();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-10 text-center">
      <div>
        {done === "out" ? (
          <BellOff className="mx-auto h-12 w-12 text-muted-foreground" />
        ) : done === "in" ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-[color:var(--success)]" />
        ) : (
          <Bell className="mx-auto h-12 w-12 text-primary" />
        )}
        <h1 className="mt-3 font-display text-2xl font-bold text-foreground">
          {done === "out"
            ? "You're unsubscribed"
            : done === "in"
              ? "You're subscribed"
              : "Offer preferences"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {firstName ? `${firstName}, ` : ""}
          {done === "out"
            ? `you won't get offers from ${businessName} anymore. You'll still keep your loyalty card.`
            : done === "in"
              ? `you'll get occasional offers and reward reminders from ${businessName}.`
              : optedIn
                ? `You're currently getting occasional offers and reward reminders from ${businessName}.`
                : `You're not getting offers from ${businessName} right now.`}
        </p>
      </div>

      <form action={setConsentPublic}>
        <input type="hidden" name="serial" value={serial} />
        <input type="hidden" name="optIn" value={optedIn ? "false" : "true"} />
        <button
          type="submit"
          className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
            optedIn
              ? "border border-input bg-card text-foreground hover:bg-muted"
              : "bg-primary text-primary-foreground hover:brightness-110"
          }`}
        >
          {optedIn ? "Unsubscribe from offers" : "Subscribe to offers"}
        </button>
      </form>

      <p className="text-xs text-muted-foreground">
        This only changes marketing offers. Your loyalty card and stamps stay put.
      </p>
    </main>
  );
}
