import Link from "next/link";
import { Users, Search } from "lucide-react";
import {
  PageHeader,
  EmptyState,
  Badge,
  Card,
  Input,
  Button,
  type BadgeProps,
} from "@llw/ui";
import { createClient } from "@/lib/supabase/server";
import { getActiveMembership } from "@/lib/business";
import { seedDemoCustomers } from "./actions";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string | null) {
  return iso ? dateFmt.format(new Date(iso)) : "—";
}

type WalletState = "saved" | "pending" | "removed" | "none";

function walletBadge(state: WalletState): {
  label: string;
  variant: BadgeProps["variant"];
} {
  switch (state) {
    case "saved":
      return { label: "Saved", variant: "success" };
    case "removed":
      return { label: "Removed", variant: "destructive" };
    case "pending":
      return { label: "Pending", variant: "warning" };
    default:
      return { label: "No pass", variant: "default" };
  }
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; seeded?: string; error?: string }>;
}) {
  const { q, seeded, error } = await searchParams;
  const term = (q ?? "").replace(/[,()*%]/g, "").trim().slice(0, 50);

  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  const canSeed =
    membership?.role === "business_owner" ||
    membership?.role === "business_admin";
  let query = supabase
    .from("customers")
    .select(
      "id, first_name, last_name, email, phone, first_seen_at, last_seen_at, wallet_passes(current_stamps, rewards_available, status)",
    )
    .order("first_seen_at", { ascending: false })
    .limit(200);

  if (term) {
    query = query.or(
      `first_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`,
    );
  }

  const { data: customers } = await query;
  const rows = customers ?? [];

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${rows.length} ${rows.length === 1 ? "customer" : "customers"} enrolled in your loyalty programs.`}
        action={
          canSeed ? (
            <form action={seedDemoCustomers}>
              <Button type="submit" variant="outline" size="sm">
                Load demo data
              </Button>
            </form>
          ) : undefined
        }
      />

      {seeded ? (
        <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Demo customers added.
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <form
        method="get"
        className="mb-4 flex max-w-sm items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={term}
            placeholder="Search name, email, phone"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Search
        </Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title={term ? "No matching customers" : "No customers yet"}
          description={
            term
              ? "Try a different name, email, or phone number."
              : "Share your enrollment QR code at the counter to start enrolling customers."
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Stamps</th>
                  <th className="px-5 py-3 font-semibold">Reward</th>
                  <th className="px-5 py-3 font-semibold">Last visit</th>
                  <th className="px-5 py-3 font-semibold">Wallet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((c) => {
                  const passes = c.wallet_passes ?? [];
                  const stamps = passes.reduce(
                    (s, p) => s + (p.current_stamps ?? 0),
                    0,
                  );
                  const rewards = passes.reduce(
                    (s, p) => s + (p.rewards_available ?? 0),
                    0,
                  );
                  const statuses = passes.map((p) => p.status);
                  let wallet: WalletState = "none";
                  if (passes.length) {
                    if (statuses.some((s) => s === "active" || s === "installed"))
                      wallet = "saved";
                    else if (statuses.every((s) => s === "voided" || s === "deleted"))
                      wallet = "removed";
                    else wallet = "pending";
                  }
                  const badge = walletBadge(wallet);
                  const name =
                    `${c.first_name ?? "Guest"} ${c.last_name ?? ""}`.trim();
                  const contact = c.email ?? c.phone ?? "—";

                  return (
                    <tr key={c.id} className="hover:bg-muted/50">
                      <td className="px-5 py-3">
                        <Link
                          href={`/dashboard/customers/${c.id}`}
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {contact}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-foreground">{stamps}</td>
                      <td className="px-5 py-3">
                        {rewards > 0 ? (
                          <Badge variant="success">Reward ready</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatDate(c.last_seen_at ?? c.first_seen_at)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
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
