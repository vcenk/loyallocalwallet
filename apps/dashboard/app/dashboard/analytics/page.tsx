import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  EmptyState,
} from "@llw/ui";
import { createClient } from "@/lib/supabase/server";
import { getActiveMembership } from "@/lib/business";
import { getInactiveReport } from "@/lib/analytics";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  const report = membership
    ? await getInactiveReport(supabase, membership.businessId)
    : null;

  const buckets = report?.buckets ?? [];
  const customers = report?.customers ?? [];
  const winBack = report?.winBack ?? null;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Who's fading away, and what to send them."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {buckets.map((b) => (
          <div
            key={b.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <p className="text-2xl font-bold text-foreground">{b.count}</p>
            <p className="text-xs text-muted-foreground">inactive {b.label}</p>
          </div>
        ))}
      </div>

      {winBack ? (
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#fce3dd] to-[#f6ddd8] p-8 shadow-sm">
          <div className="relative z-10 max-w-lg">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Suggested win-back campaign
            </span>
            <p className="text-sm text-muted-foreground">{winBack.reason}</p>
            <div className="mt-4 rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">
                {winBack.messageTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {winBack.messageBody}
              </p>
            </div>
            <Link
              href="/dashboard/campaigns/new?audience=inactive_21_days"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
            >
              Create this campaign
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">
              Sends as a wallet card update (title ≤ 40, body ≤ 140 chars).
              Campaign sending arrives with wallet integration.
            </p>
          </div>
        </div>
      ) : null}

      <Card className="mt-6 overflow-hidden">
        <CardHeader>
          <CardTitle>Inactive customers</CardTitle>
          <CardDescription>
            Not seen in 14+ days, most inactive first.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No inactive customers"
                description="Everyone's been in recently — nice work."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Customer</th>
                    <th className="px-6 py-3 font-semibold">Last visit</th>
                    <th className="px-6 py-3 font-semibold">Inactive</th>
                    <th className="px-6 py-3 font-semibold">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/50">
                      <td className="px-6 py-3">
                        <Link
                          href={`/dashboard/customers/${c.id}`}
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {c.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {c.contact}
                        </p>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {dateFmt.format(new Date(c.lastActivity))}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={c.daysInactive >= 30 ? "destructive" : "warning"}
                        >
                          {c.daysInactive} days
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {c.rewardsAvailable > 0
                          ? "Reward ready"
                          : `${c.total} stamps`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
