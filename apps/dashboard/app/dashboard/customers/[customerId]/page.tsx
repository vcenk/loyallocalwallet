import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Stamp,
  Gift,
  Sparkles,
  RotateCcw,
  Calendar,
} from "lucide-react";
import { PageHeader, Button, Badge, Card, CardContent } from "@llw/ui";
import {
  calculateProgress,
  BONUS_STAMP_REASONS,
  rewardModel,
  formatUnits,
} from "@llw/config";
import { createClient } from "@/lib/supabase/server";
import { WalletCardPreview } from "@/components/wallet-card-preview";
import { addStamp, redeemReward } from "./actions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

const dtFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

type TimelineItem = {
  id: string;
  at: string;
  text: string;
  kind: "earn" | "bonus" | "redeem" | "reset" | "other";
};

function eventKind(eventType: string, quantity: number): TimelineItem["kind"] {
  if (eventType === "earn") return "earn";
  if (eventType === "bonus") return "bonus";
  if (eventType === "adjustment") return quantity < 0 ? "reset" : "other";
  return "other";
}

function eventLabel(eventType: string, quantity: number, reason: string | null) {
  switch (eventType) {
    case "earn":
      return "Earned a stamp";
    case "bonus":
      return `Bonus stamp${reason ? ` — ${reason}` : ""}`;
    case "adjustment":
      return quantity < 0 ? "Reward redeemed (reset)" : "Adjustment";
    case "remove":
      return "Stamp removed";
    default:
      return "Activity";
  }
}

const KIND_STYLE: Record<TimelineItem["kind"], { icon: React.ReactNode; cls: string }> = {
  earn: { icon: <Stamp className="h-4 w-4" />, cls: "bg-primary/10 text-primary" },
  bonus: { icon: <Sparkles className="h-4 w-4" />, cls: "bg-amber-100 text-amber-700" },
  redeem: { icon: <Gift className="h-4 w-4" />, cls: "bg-green-100 text-green-700" },
  reset: { icon: <RotateCcw className="h-4 w-4" />, cls: "bg-green-100 text-green-700" },
  other: { icon: <Stamp className="h-4 w-4" />, cls: "bg-muted text-muted-foreground" },
};

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ customerId: string }>;
  searchParams: Promise<{ error?: string; saved?: string; redeemed?: string }>;
}) {
  const { customerId } = await params;
  const { error, saved, redeemed } = await searchParams;

  const supabase = await createClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .maybeSingle();
  if (!customer) notFound();

  const { data: business } = await supabase
    .from("businesses")
    .select("name, logo_url")
    .eq("id", customer.business_id)
    .maybeSingle();

  const { data: passes } = await supabase
    .from("wallet_passes")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true });
  const pass = passes?.[0] ?? null;

  let progress: ReturnType<typeof calculateProgress> | null = null;
  let events: { id: string; created_at: string; event_type: string; quantity: number; reason: string | null }[] = [];
  let redemptions: { id: string; redeemed_at: string; reward_title: string }[] = [];
  let programName = "";
  let rewardTitle = "";
  let stampsRequired = 10;
  let bg = "#ae3115";
  let fg = "#ffffff";
  let stampIcon = "star";
  let pattern = "none";
  let programType = "stamps";

  if (pass) {
    const [{ data: prog }, { data: ev }, { data: red }, { data: design }] =
      await Promise.all([
        supabase.from("loyalty_programs").select("*").eq("id", pass.program_id).maybeSingle(),
        supabase.from("stamp_events").select("id, created_at, event_type, quantity, reason").eq("wallet_pass_id", pass.id).order("created_at", { ascending: false }),
        supabase.from("reward_redemptions").select("id, redeemed_at, reward_title").eq("wallet_pass_id", pass.id).order("redeemed_at", { ascending: false }),
        supabase.from("card_designs").select("*").eq("program_id", pass.program_id).maybeSingle(),
      ]);

    events = ev ?? [];
    redemptions = red ?? [];
    if (prog) {
      programName = prog.name;
      rewardTitle = prog.reward_title;
      stampsRequired = prog.stamps_required ?? 10;
      programType = prog.program_type;
      progress = calculateProgress({ programType: prog.program_type, stampsRequired, events });
    }
    if (design) {
      bg = design.background_color ?? bg;
      fg = design.foreground_color ?? fg;
      stampIcon = design.stamp_icon ?? stampIcon;
      pattern = design.pattern ?? pattern;
    }
  }

  const name = `${customer.first_name ?? "Guest"} ${customer.last_name ?? ""}`.trim();
  const contact = customer.email ?? customer.phone ?? "No contact info";

  const timeline: TimelineItem[] = [
    ...events.map((e) => ({
      id: `e-${e.id}`,
      at: e.created_at,
      text: eventLabel(e.event_type, e.quantity, e.reason),
      kind: eventKind(e.event_type, e.quantity),
    })),
    ...redemptions.map((r) => ({
      id: `r-${r.id}`,
      at: r.redeemed_at,
      text: `Redeemed ${r.reward_title}`,
      kind: "redeem" as const,
    })),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));

  const rewardReady = (progress?.rewardsAvailable ?? 0) > 0;
  const model = rewardModel(programType);
  const money = model.currency;

  return (
    <div>
      <PageHeader
        title={name}
        description={contact}
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/customers">
              <ArrowLeft className="h-4 w-4" />
              Customers
            </Link>
          </Button>
        }
      />

      <p className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        Joined {dateFmt.format(new Date(customer.first_seen_at))}
        {customer.marketing_consent ? " · opted in to offers" : ""}
      </p>

      {error ? <Banner tone="red">{error}</Banner> : null}
      {saved ? <Banner tone="green">Stamp added.</Banner> : null}
      {redeemed ? <Banner tone="green">Reward redeemed.</Banner> : null}

      {!pass || !progress ? (
        <Card>
          <CardContent className="p-6 pt-6 text-sm text-muted-foreground">
            This customer has no loyalty card yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Actions */}
            <Card>
              <CardContent className="p-6 pt-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {programName}
                    </p>
                    {rewardReady ? (
                      <p className="mt-1 font-display text-3xl font-bold text-[color:var(--success)]">
                        Reward ready 🎉
                      </p>
                    ) : (
                      <p className="mt-1 font-display text-3xl font-bold text-foreground">
                        {money ? `$${progress.towardNext}` : progress.towardNext}
                        <span className="text-xl text-muted-foreground">
                          {" "}
                          / {money ? `$${progress.required}` : progress.required}
                        </span>
                      </p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {rewardReady
                        ? rewardTitle
                        : `toward ${rewardTitle} · ${formatUnits(programType, progress.total)} lifetime`}
                    </p>
                  </div>
                  {rewardReady ? (
                    <Badge variant="success">Ready</Badge>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <form action={addStamp} className="flex items-end gap-2">
                    <input type="hidden" name="passId" value={pass.id} />
                    <input type="hidden" name="customerId" value={customer.id} />
                    <input type="hidden" name="eventType" value="earn" />
                    {model.fixedQuantity === null ? (
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                          {money ? "Amount ($)" : "Amount"}
                        </label>
                        <input
                          name="amount"
                          type="number"
                          min={1}
                          defaultValue={money ? 5 : 10}
                          className={SELECT_CLASS}
                          style={{ width: 96 }}
                        />
                      </div>
                    ) : null}
                    <Button type="submit" size="lg">
                      <Stamp className="h-4 w-4" />
                      {model.actionVerb}
                    </Button>
                  </form>

                  {rewardReady ? (
                    <form action={redeemReward}>
                      <input type="hidden" name="passId" value={pass.id} />
                      <input type="hidden" name="customerId" value={customer.id} />
                      <Button
                        type="submit"
                        size="lg"
                        className="bg-[color:var(--success)] text-white hover:brightness-110"
                      >
                        <Gift className="h-4 w-4" />
                        Redeem reward
                      </Button>
                    </form>
                  ) : null}
                </div>

                <form
                  action={addStamp}
                  className="mt-6 flex flex-wrap items-end gap-3 border-t border-border pt-6"
                >
                  <input type="hidden" name="passId" value={pass.id} />
                  <input type="hidden" name="customerId" value={customer.id} />
                  <input type="hidden" name="eventType" value="bonus" />
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Bonus stamp reason
                    </label>
                    <select name="reason" className={SELECT_CLASS}>
                      {BONUS_STAMP_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" variant="outline">
                    <Sparkles className="h-4 w-4" />
                    Add bonus
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card>
              <CardContent className="p-6 pt-6">
                <p className="font-semibold text-foreground">Activity</p>
                {timeline.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No activity yet.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {timeline.map((t) => {
                      const s = KIND_STYLE[t.kind];
                      return (
                        <li key={t.id} className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.cls}`}
                          >
                            {s.icon}
                          </span>
                          <span className="flex-1 text-sm text-foreground">
                            {t.text}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {dtFmt.format(new Date(t.at))}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Wallet card */}
          <div className="lg:col-span-1">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Wallet card
            </p>
            <WalletCardPreview
              businessName={business?.name ?? ""}
              programName={programName}
              rewardTitle={rewardTitle}
              stampsRequired={stampsRequired}
              currentStamps={progress.total}
              backgroundColor={bg}
              foregroundColor={fg}
              stampIcon={stampIcon}
              pattern={pattern}
              programType={programType}
              logoUrl={business?.logo_url}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "green" | "red";
  children: React.ReactNode;
}) {
  const cls =
    tone === "green" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700";
  return <p className={`mb-4 rounded-xl px-4 py-3 text-sm ${cls}`}>{children}</p>;
}
