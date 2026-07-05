import Link from "next/link";
import { CreditCard } from "lucide-react";
import {
  PageHeader,
  Button,
  Badge,
  EmptyState,
  Card,
  CardContent,
  type BadgeProps,
} from "@llw/ui";
import { createClient } from "@/lib/supabase/server";

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  active: "success",
  draft: "default",
  paused: "warning",
  archived: "default",
};

export default async function LoyaltyCardsPage() {
  const supabase = await createClient();
  const { data: programs } = await supabase
    .from("loyalty_programs")
    .select("id, name, status, stamps_required, reward_title")
    .order("created_at", { ascending: false });

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

      {!programs || programs.length === 0 ? (
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
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((p) => (
            <Link key={p.id} href={`/dashboard/loyalty-cards/${p.id}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardContent className="p-5 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Collect {p.stamps_required} stamps → {p.reward_title}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
