import { PageHeader } from "@llw/ui";
import { MESSAGE_TITLE_MAX, MESSAGE_BODY_MAX } from "@/lib/campaigns";
import { AUTOMATION_DEFS, getAutomations } from "@/lib/automations";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveMembership } from "@/lib/business";
import {
  AutomationsManager,
  type AutomationItem,
} from "./automations-manager";

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

  const automations: AutomationItem[] = AUTOMATION_DEFS.map((def) => {
    const cfg = configs?.[def.key];
    return {
      key: def.key,
      name: def.name,
      description: def.description,
      timing: def.timing,
      hasThreshold: !!def.hasThreshold,
      title: cfg?.title ?? def.defaultTitle,
      body: cfg?.body ?? def.defaultBody,
      thresholdDays: cfg?.thresholdDays ?? 21,
      enabled: cfg?.enabled ?? false,
    };
  });

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

      <AutomationsManager
        automations={automations}
        canEdit={canEdit}
        titleMax={MESSAGE_TITLE_MAX}
        bodyMax={MESSAGE_BODY_MAX}
      />

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
