import Link from "next/link";
import { Users, Search, Stamp, ChevronDown } from "lucide-react";
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

const PAGE_SIZE = 25;

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string | null) {
  return iso ? dateFmt.format(new Date(iso)) : "—";
}

const AVATAR_COLORS = [
  "#ae3115",
  "#3f6212",
  "#0f766e",
  "#1e3a8a",
  "#7c2d12",
  "#0e7490",
  "#be185d",
  "#b45309",
];

function initial(name: string) {
  return (name.trim()[0] ?? "G").toUpperCase();
}

function avatarColor(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
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
  searchParams: Promise<{
    q?: string;
    seeded?: string;
    error?: string;
    consent?: string;
    show?: string;
  }>;
}) {
  const { q, seeded, error, consent, show } = await searchParams;
  const term = (q ?? "").replace(/[,()*%]/g, "").trim().slice(0, 50);
  const consentFilter =
    consent === "in" || consent === "out" ? consent : "all";
  const limit = Math.min(
    500,
    Math.max(PAGE_SIZE, parseInt(show ?? "", 10) || PAGE_SIZE),
  );

  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  const canSeed =
    membership?.role === "business_owner" ||
    membership?.role === "business_admin";

  const orFilter = term
    ? `first_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`
    : null;
  const consentValue =
    consentFilter === "in" ? true : consentFilter === "out" ? false : null;

  let countQuery = supabase
    .from("customers")
    .select("id", { count: "exact", head: true });
  if (orFilter) countQuery = countQuery.or(orFilter);
  if (consentValue !== null)
    countQuery = countQuery.eq("marketing_consent", consentValue);

  let pageQuery = supabase
    .from("customers")
    .select(
      "id, first_name, last_name, email, phone, first_seen_at, last_seen_at, marketing_consent, wallet_passes(current_stamps, rewards_available, status)",
    )
    .order("first_seen_at", { ascending: false })
    .limit(limit);
  if (orFilter) pageQuery = pageQuery.or(orFilter);
  if (consentValue !== null)
    pageQuery = pageQuery.eq("marketing_consent", consentValue);

  const [{ count }, { data: customers }] = await Promise.all([
    countQuery,
    pageQuery,
  ]);
  const rows = customers ?? [];
  const total = count ?? rows.length;
  const hasMore = total > rows.length;

  const consentTabs = [
    { key: "all", label: "All" },
    { key: "in", label: "Opted in" },
    { key: "out", label: "Opted out" },
  ] as const;
  const consentHref = (key: string) => {
    const p = new URLSearchParams();
    if (term) p.set("q", term);
    if (key !== "all") p.set("consent", key);
    const qs = p.toString();
    return qs ? `/dashboard/customers?${qs}` : "/dashboard/customers";
  };
  const showMoreHref = () => {
    const p = new URLSearchParams();
    if (term) p.set("q", term);
    if (consentFilter !== "all") p.set("consent", consentFilter);
    p.set("show", String(limit + PAGE_SIZE));
    return `/dashboard/customers?${p.toString()}`;
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${total} ${total === 1 ? "customer" : "customers"} enrolled in your loyalty programs.`}
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

      {/* Search + consent filter on one row */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <form method="get" className="flex flex-1 items-center gap-3 sm:min-w-[420px]">
          {consentFilter !== "all" && (
            <input type="hidden" name="consent" value={consentFilter} />
          )}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={term}
              placeholder="Search name, email, phone"
              className="h-12 rounded-2xl pl-11 text-base"
            />
          </div>
          <Button type="submit" className="h-12 rounded-2xl px-7 text-base">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          {consentTabs.map((tab) => {
            const active = consentFilter === tab.key;
            return (
              <Link
                key={tab.key}
                href={consentHref(tab.key)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

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
        <>
          <Card className="overflow-hidden rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Stamps</th>
                    <th className="px-6 py-4 font-semibold">Reward</th>
                    <th className="px-6 py-4 font-semibold">Last visit</th>
                    <th className="px-6 py-4 font-semibold">Offers</th>
                    <th className="px-6 py-4 font-semibold">Wallet</th>
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
                      else if (
                        statuses.every((s) => s === "voided" || s === "deleted")
                      )
                        wallet = "removed";
                      else wallet = "pending";
                    }
                    const badge = walletBadge(wallet);
                    const name =
                      `${c.first_name ?? "Guest"} ${c.last_name ?? ""}`.trim();
                    const contact = c.email ?? c.phone ?? "—";

                    return (
                      <tr
                        key={c.id}
                        className="group transition-colors hover:bg-muted/40"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/dashboard/customers/${c.id}`}
                            className="flex items-center gap-4"
                          >
                            <span
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                              style={{ backgroundColor: avatarColor(name) }}
                            >
                              {initial(name)}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-foreground group-hover:text-primary">
                                {name}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {contact}
                              </span>
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                            <Stamp className="h-4 w-4 text-muted-foreground" />
                            {stamps}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {rewards > 0 ? (
                            <Badge variant="success">Reward ready</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatDate(c.last_seen_at ?? c.first_seen_at)}
                        </td>
                        <td className="px-6 py-4">
                          {c.marketing_consent ? (
                            <Badge variant="success">Opted in</Badge>
                          ) : (
                            <Badge variant="warning">Opted out</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {hasMore ? (
            <div className="mt-6 flex justify-center">
              <Link
                href={showMoreHref()}
                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
              >
                Show more customers
                <ChevronDown className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
