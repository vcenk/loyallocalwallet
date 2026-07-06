import Link from "next/link";
import { Megaphone, Users } from "lucide-react";
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

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      "id, name, audience_key, status, created_at, campaign_recipients(count)",
    )
    .order("created_at", { ascending: false });

  const rows = campaigns ?? [];

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
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Campaign</th>
                  <th className="px-5 py-3 font-semibold">Audience</th>
                  <th className="px-5 py-3 font-semibold">Recipients</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((c) => {
                  const count = c.campaign_recipients?.[0]?.count ?? 0;
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Megaphone className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {c.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Wallet card update
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {audienceLabel(c.audience_key)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {count}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={STATUS_VARIANT[c.status]}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {dateFmt.format(new Date(c.created_at))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
