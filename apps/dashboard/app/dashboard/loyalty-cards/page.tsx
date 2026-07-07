import Link from "next/link";
import { CreditCard } from "lucide-react";
import {
  PageHeader,
  Button,
  Badge,
  EmptyState,
  type BadgeProps,
} from "@llw/ui";
import { formatUnits } from "@llw/config";
import { createClient } from "@/lib/supabase/server";
import { WalletCardPreview } from "@/components/wallet-card-preview";

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  active: "success",
  draft: "default",
  paused: "warning",
  archived: "default",
};

export default async function LoyaltyCardsPage() {
  const supabase = await createClient();

  const [{ data: programs }, { data: designs }, { data: business }] =
    await Promise.all([
      supabase
        .from("loyalty_programs")
        .select("id, name, status, stamps_required, reward_title, program_type")
        .order("created_at", { ascending: false }),
      supabase.from("card_designs").select("*"),
      supabase.from("businesses").select("name, logo_url").limit(1).maybeSingle(),
    ]);

  const designByProgram = new Map(
    (designs ?? []).map((d) => [d.program_id, d]),
  );

  const rows = programs ?? [];
  const newButton = (
    <Button asChild>
      <Link href="/dashboard/loyalty-cards/new">New card</Link>
    </Button>
  );

  return (
    <div>
      <PageHeader
        title="Loyalty Cards"
        description="Create and design your stamp cards and rewards."
        action={newButton}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-5 w-5" />}
          title="No loyalty cards yet"
          description="Create a stamp card, then print your QR code and place it at the counter to start enrolling customers."
          action={
            <Button asChild>
              <Link href="/dashboard/loyalty-cards/new">
                Create your first card
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => {
            const d = designByProgram.get(p.id);
            const required = p.stamps_required ?? 10;
            return (
              <Link
                key={p.id}
                href={`/dashboard/loyalty-cards/${p.id}`}
                className="group block rounded-3xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-lg"
              >
                <WalletCardPreview
                  businessName={business?.name ?? ""}
                  programName={p.name}
                  rewardTitle={p.reward_title}
                  stampsRequired={required}
                  currentStamps={Math.min(1, required)}
                  backgroundColor={d?.background_color ?? "#ae3115"}
                  foregroundColor={d?.foreground_color ?? "#ffffff"}
                  stampIcon={d?.stamp_icon ?? "star"}
                  pattern={d?.pattern ?? "none"}
                  cardStyle={d?.card_style ?? "retail"}
                  stampStyle={d?.stamp_style ?? "circles"}
                  programType={p.program_type}
                  logoUrl={business?.logo_url}
                />
                <div className="mt-4 flex items-center justify-between px-1">
                  <div>
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatUnits(p.program_type, required)} → {p.reward_title}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
