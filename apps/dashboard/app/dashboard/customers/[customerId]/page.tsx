import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Stamp, Gift } from "lucide-react";
import {
  PageHeader,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardPreview,
} from "@llw/ui";
import { calculateProgress, BONUS_STAMP_REASONS } from "@llw/config";
import { createClient } from "@/lib/supabase/server";
import { addStamp, redeemReward } from "./actions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

const fmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
function formatDateTime(iso: string | null) {
  return iso ? fmt.format(new Date(iso)) : "—";
}

function stampEventLabel(eventType: string, quantity: number, reason: string | null) {
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

  const { data: passes } = await supabase
    .from("wallet_passes")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true });
  const pass = passes?.[0] ?? null;

  let progress: ReturnType<typeof calculateProgress> | null = null;
  let events: {
    id: string;
    created_at: string;
    event_type: string;
    quantity: number;
    reason: string | null;
  }[] = [];
  let redemptions: {
    id: string;
    redeemed_at: string;
    reward_title: string;
  }[] = [];
  let programName = "";
  let rewardTitle = "";
  let stampsRequired = 10;
  let bg = "#ae3115";
  let fg = "#ffffff";

  if (pass) {
    const [{ data: prog }, { data: ev }, { data: red }, { data: design }] =
      await Promise.all([
        supabase
          .from("loyalty_programs")
          .select("*")
          .eq("id", pass.program_id)
          .maybeSingle(),
        supabase
          .from("stamp_events")
          .select("id, created_at, event_type, quantity, reason")
          .eq("wallet_pass_id", pass.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("reward_redemptions")
          .select("id, redeemed_at, reward_title")
          .eq("wallet_pass_id", pass.id)
          .order("redeemed_at", { ascending: false }),
        supabase
          .from("card_designs")
          .select("background_color, foreground_color")
          .eq("program_id", pass.program_id)
          .maybeSingle(),
      ]);

    events = ev ?? [];
    redemptions = red ?? [];
    if (prog) {
      programName = prog.name;
      rewardTitle = prog.reward_title;
      stampsRequired = prog.stamps_required ?? 10;
      progress = calculateProgress({
        programType: prog.program_type,
        stampsRequired,
        events,
      });
    }
    if (design) {
      bg = design.background_color ?? bg;
      fg = design.foreground_color ?? fg;
    }
  }

  const name = `${customer.first_name ?? "Guest"} ${customer.last_name ?? ""}`.trim();
  const contact = customer.email ?? customer.phone ?? "No contact info";

  const timeline = [
    ...events.map((e) => ({
      id: `e-${e.id}`,
      at: e.created_at,
      text: stampEventLabel(e.event_type, e.quantity, e.reason),
    })),
    ...redemptions.map((r) => ({
      id: `r-${r.id}`,
      at: r.redeemed_at,
      text: `Redeemed ${r.reward_title}`,
    })),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));

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

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Stamp added.
        </p>
      ) : null}
      {redeemed ? (
        <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Reward redeemed.
        </p>
      ) : null}

      {!pass || !progress ? (
        <Card>
          <CardContent className="p-6 pt-6 text-sm text-muted-foreground">
            This customer has no loyalty card yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{programName}</CardTitle>
                <CardDescription>
                  {progress.rewardsAvailable > 0
                    ? `${progress.rewardsAvailable} reward${progress.rewardsAvailable > 1 ? "s" : ""} ready to redeem`
                    : `${progress.towardNext} of ${progress.required} stamps toward ${rewardTitle}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {progress.rewardsAvailable > 0 ? (
                    <Badge variant="success">Reward ready</Badge>
                  ) : null}
                  <span className="text-sm text-muted-foreground">
                    {progress.total} total stamps
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <form action={addStamp}>
                    <input type="hidden" name="passId" value={pass.id} />
                    <input type="hidden" name="customerId" value={customer.id} />
                    <input type="hidden" name="eventType" value="earn" />
                    <Button type="submit">
                      <Stamp className="h-4 w-4" />
                      Add stamp
                    </Button>
                  </form>

                  <form
                    action={redeemReward}
                    className={progress.rewardsAvailable > 0 ? "" : "hidden"}
                  >
                    <input type="hidden" name="passId" value={pass.id} />
                    <input type="hidden" name="customerId" value={customer.id} />
                    <Button type="submit" variant="outline">
                      <Gift className="h-4 w-4" />
                      Redeem reward
                    </Button>
                  </form>
                </div>

                <form
                  action={addStamp}
                  className="flex flex-wrap items-end gap-2 border-t border-border pt-4"
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
                    Add bonus
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
                <CardDescription>Stamps and redemptions, newest first.</CardDescription>
              </CardHeader>
              <CardContent>
                {timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {timeline.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between py-3 text-sm"
                      >
                        <span className="text-foreground">{t.text}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(t.at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Wallet card
            </p>
            <CardPreview
              businessName=""
              programName={programName}
              rewardTitle={rewardTitle}
              stampsRequired={stampsRequired}
              currentStamps={progress.total}
              backgroundColor={bg}
              foregroundColor={fg}
            />
          </div>
        </div>
      )}
    </div>
  );
}
