import Link from "next/link";
import {
  PageHeader,
  Button,
  Input,
  Label,
  Card,
  CardContent,
} from "@llw/ui";
import {
  AUDIENCES,
  MESSAGE_TITLE_MAX,
  MESSAGE_BODY_MAX,
  isAudienceKey,
} from "@/lib/campaigns";
import { createCampaign } from "../actions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

const DEFAULTS: Record<string, { title: string; body: string; name: string }> = {
  inactive_21_days: {
    name: "21-day win-back",
    title: "We miss you",
    body: "Come back this week for a bonus stamp on us.",
  },
  close_to_reward: {
    name: "Almost-there reminder",
    title: "You're almost there",
    body: "One more visit and your reward is ready!",
  },
  all_active: { name: "", title: "", body: "" },
};

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string; error?: string }>;
}) {
  const { audience, error } = await searchParams;
  const audienceKey =
    audience && isAudienceKey(audience) ? audience : "inactive_21_days";
  const preset = DEFAULTS[audienceKey] ?? DEFAULTS.all_active;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="New campaign"
        description="A campaign is a wallet card update — a short title and message."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/campaigns">Cancel</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 pt-6">
          {error ? (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <form action={createCampaign} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Campaign name</Label>
              <Input id="name" name="name" defaultValue={preset.name} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="audienceKey">Audience</Label>
              <select
                id="audienceKey"
                name="audienceKey"
                defaultValue={audienceKey}
                className={SELECT_CLASS}
              >
                {AUDIENCES.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="messageTitle">
                Title{" "}
                <span className="text-muted-foreground">
                  (max {MESSAGE_TITLE_MAX})
                </span>
              </Label>
              <Input
                id="messageTitle"
                name="messageTitle"
                defaultValue={preset.title}
                maxLength={MESSAGE_TITLE_MAX}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="messageBody">
                Message{" "}
                <span className="text-muted-foreground">
                  (max {MESSAGE_BODY_MAX})
                </span>
              </Label>
              <textarea
                id="messageBody"
                name="messageBody"
                defaultValue={preset.body}
                maxLength={MESSAGE_BODY_MAX}
                rows={3}
                required
                className="flex w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>

            <div className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
              This saves the campaign and its audience. Delivery (a wallet card
              update + push) is enabled with wallet integration.
            </div>

            <Button type="submit" className="w-full">
              Create campaign
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
