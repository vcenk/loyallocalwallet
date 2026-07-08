import Link from "next/link";
import { Megaphone, Users, Send, CheckCircle2 } from "lucide-react";
import {
  PageHeader,
  Button,
  Badge,
  Card,
  EmptyState,
  type BadgeProps,
} from "@llw/ui";
import { createClient } from "@/lib/supabase/server";
import { AUDIENCES } from "@/lib/campaigns";
import { sendCampaign } from "./actions";

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  draft: "default",
  scheduled: "warning",
  sent: "success",
  cancelled: "default",
  failed: "destructive",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function audienceLabel(key: string | null) {
  return AUDIENCES.find((a) => a.key === key)?.label ?? key ?? "—";
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; sent?: string; error?: string }>;
}) {
  const { created, sent, error } = await searchParams;
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      "id, name, audience_key, status, created_at, campaign_recipients(count)",
    )
    .order("created_at", { ascending: false });

  const rows = campaigns ?? [];
  const recipientCount = (c: (typeof rows)[number]) =>
    c.campaign_recipients?.[0]?.count ?? 0;
  const sentRows = rows.filter((c) => c.status === "sent");
  const reached = sentRows.reduce((sum, c) => sum + recipientCount(c), 0);

  const stats = [
    { label: "Campaigns", value: rows.length, icon: <Megaphone className="h-4 w-4" /> },
    { label: "Sent", value: sentRows.length, icon: <CheckCircle2 className="h-4 w-4" /> },
    { label: "Reached", value: reached, icon: <Send className="h-4 w-4" /> },
  ];

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Send wallet card updates to bring customers back."
        action={
          <Button asChild>
            <Link href="/dashboard/campaigns/new">New campaign</Link>
          </Button>
        }
      />

      {created ? (
        <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Campaign created. Press Send when you&apos;re ready.
        </p>
      ) : sent !== undefined ? (
        <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Sent to {sent} wallet{sent === "1" ? "" : "s"}.
        </p>
      ) : error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-5 w-5" />}
          title="No campaigns yet"
          description="Send your first message to customers who haven't visited recently."
          action={
            <Button asChild>
              <Link href="/dashboard/campaigns/new">Create a campaign</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  {s.icon}
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {s.label}
                  </span>
                </div>
                <p className="font-display text-3xl font-extrabold text-foreground">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <Card className="overflow-hidden rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Campaign</th>
                    <th className="px-6 py-4 font-semibold">Audience</th>
                    <th className="px-6 py-4 font-semibold">Recipients</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Created</th>
                    <th className="px-6 py-4 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((c) => {
                    const count = recipientCount(c);
                    return (
                      <tr key={c.id} className="transition-colors hover:bg-muted/40">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-primary">
                              <Megaphone className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">
                                {c.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Wallet card update
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {audienceLabel(c.audience_key)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {count}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={STATUS_VARIANT[c.status]}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {dateFmt.format(new Date(c.created_at))}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {c.status === "draft" ? (
                            <form action={sendCampaign}>
                              <input type="hidden" name="campaignId" value={c.id} />
                              <Button type="submit" size="sm">
                                Send now
                              </Button>
                            </form>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
