import Link from "next/link";
import { CreditCard, Users, CheckCircle2, PencilLine, QrCode } from "lucide-react";
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

export default async function LoyaltyCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ removed?: string; archived?: string }>;
}) {
  const { removed, archived } = await searchParams;
  const supabase = await createClient();

  const [{ data: programs }, { data: designs }, { data: business }, { data: passes }] =
    await Promise.all([
      supabase
        .from("loyalty_programs")
        .select("id, name, status, stamps_required, reward_title, program_type")
        .neq("status", "archived")
        .order("created_at", { ascending: false }),
      supabase.from("card_designs").select("*"),
      supabase.from("businesses").select("name, logo_url").limit(1).maybeSingle(),
      supabase.from("wallet_passes").select("program_id, status").limit(5000),
    ]);

  const designByProgram = new Map(
    (designs ?? []).map((d) => [d.program_id, d]),
  );

  // Live members per program (excludes voided/removed passes).
  const membersByProgram = new Map<string, number>();
  for (const p of passes ?? []) {
    if (p.status === "voided" || p.status === "deleted") continue;
    membersByProgram.set(
      p.program_id,
      (membersByProgram.get(p.program_id) ?? 0) + 1,
    );
  }

  const rows = programs ?? [];
  const activeCount = rows.filter((p) => p.status === "active").length;
  const totalMembers = [...membersByProgram.values()].reduce((a, b) => a + b, 0);

  const newButton = (
    <Button asChild>
      <Link href="/dashboard/loyalty-cards/new">New card</Link>
    </Button>
  );

  const stats = [
    { label: "Cards", value: rows.length, icon: <CreditCard className="h-4 w-4" /> },
    { label: "Active", value: activeCount, icon: <CheckCircle2 className="h-4 w-4" /> },
    { label: "Members", value: totalMembers, icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <div>
      <PageHeader
        title="Loyalty Cards"
        description="Create and design your stamp cards and rewards."
        action={newButton}
      />

      {removed ? (
        <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Card removed.
        </p>
      ) : archived ? (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Card archived — it had members, so their saved wallet cards keep
          working.
        </p>
      ) : null}

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

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((p) => {
              const d = designByProgram.get(p.id);
              const required = p.stamps_required ?? 10;
              const members = membersByProgram.get(p.id) ?? 0;
              return (
                <div
                  key={p.id}
                  className="group flex flex-col rounded-3xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <Link
                    href={`/dashboard/loyalty-cards/${p.id}`}
                    className="block"
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
                  </Link>

                  <div className="mt-4 flex items-start justify-between px-1">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/loyalty-cards/${p.id}`}
                        className="block truncate font-semibold text-foreground group-hover:text-primary"
                      >
                        {p.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatUnits(p.program_type, required)} → {p.reward_title}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border px-1 pt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {members} {members === 1 ? "member" : "members"}
                    </span>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/loyalty-cards/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/loyalty-cards/${p.id}/poster`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        Poster
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
