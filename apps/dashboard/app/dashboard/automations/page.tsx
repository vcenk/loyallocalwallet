import { Zap, Sparkles, HeartHandshake, Clock } from "lucide-react";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Badge,
} from "@llw/ui";
import {
  MESSAGE_TITLE_MAX,
  MESSAGE_BODY_MAX,
} from "@/lib/campaigns";
import {
  AUTOMATION_DEFS,
  getAutomations,
  type AutomationKey,
} from "@/lib/automations";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveMembership } from "@/lib/business";
import { saveAutomation } from "./actions";

const ICONS: Record<AutomationKey, React.ReactNode> = {
  welcome: <Sparkles className="h-5 w-5" />,
  almost_there: <Zap className="h-5 w-5" />,
  win_back: <HeartHandshake className="h-5 w-5" />,
};

const BODY_CLASS =
  "flex w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

export default async function AutomationsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;

  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  const canEdit =
    membership?.role === "business_owner" ||
    membership?.role === "business_admin";

  const configs = membership
    ? await getAutomations(createAdminClient(), membership.businessId)
    : null;

  return (
    <div>
      <PageHeader
        title="Automations"
        description="Set these once — they run themselves and bring customers back for you."
      />

      {saved ? (
        <Banner tone="green">Automation saved.</Banner>
      ) : error ? (
        <Banner tone="red">{error}</Banner>
      ) : null}

      <div className="space-y-5">
        {AUTOMATION_DEFS.map((def) => {
          const cfg = configs?.[def.key];
          const enabled = cfg?.enabled ?? false;
          return (
            <Card key={def.key}>
              <CardContent className="p-6 pt-6">
                <form action={saveAutomation} className="space-y-4">
                  <input type="hidden" name="key" value={def.key} />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {ICONS[def.key]}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {def.name}
                          </p>
                          <Badge variant="default">
                            <Clock className="mr-1 h-3 w-3" />
                            {def.timing}
                          </Badge>
                          {enabled ? (
                            <Badge variant="success">On</Badge>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {def.description}
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="enabled"
                        defaultChecked={enabled}
                        disabled={!canEdit}
                        className="h-5 w-5 rounded border-input"
                      />
                      <span className="text-muted-foreground">Enabled</span>
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`${def.key}-title`}>
                        Title{" "}
                        <span className="text-muted-foreground">
                          (max {MESSAGE_TITLE_MAX})
                        </span>
                      </Label>
                      <Input
                        id={`${def.key}-title`}
                        name="title"
                        defaultValue={cfg?.title ?? def.defaultTitle}
                        maxLength={MESSAGE_TITLE_MAX}
                        disabled={!canEdit}
                        required
                      />
                    </div>
                    {def.hasThreshold ? (
                      <div className="space-y-1.5">
                        <Label htmlFor={`${def.key}-threshold`}>
                          Days inactive before sending
                        </Label>
                        <Input
                          id={`${def.key}-threshold`}
                          name="thresholdDays"
                          type="number"
                          min={1}
                          max={365}
                          defaultValue={cfg?.thresholdDays ?? 21}
                          disabled={!canEdit}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`${def.key}-body`}>
                      Message{" "}
                      <span className="text-muted-foreground">
                        (max {MESSAGE_BODY_MAX})
                      </span>
                    </Label>
                    <textarea
                      id={`${def.key}-body`}
                      name="body"
                      defaultValue={cfg?.body ?? def.defaultBody}
                      maxLength={MESSAGE_BODY_MAX}
                      rows={2}
                      disabled={!canEdit}
                      required
                      className={BODY_CLASS}
                    />
                  </div>

                  {canEdit ? (
                    <Button type="submit" variant="outline">
                      Save
                    </Button>
                  ) : null}
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Automations only reach customers who opted in to offers, and never send
        the same nudge twice in a row. Delivery is a free wallet update.
      </p>
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
