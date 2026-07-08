import Link from "next/link";
import {
  Users,
  TrendingUp,
  UserPlus,
  Stamp,
  Gift,
  Moon,
  Sparkles,
  Zap,
  Megaphone,
  Star,
  CreditCard,
  Send,
  QrCode,
  ArrowRight,
  Plus,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveMembership } from "@/lib/business";
import { getOverviewStats } from "@/lib/analytics";
import { getAutomations } from "@/lib/automations";
import { getDashboardFeed, type FeedItem } from "@/lib/dashboard";
import { buildSuggestions, type Suggestion } from "@/lib/suggestions";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase() || "G";
}

const SUGGESTION_ICONS: Record<Suggestion["icon"], LucideIcon> = {
  zap: Zap,
  megaphone: Megaphone,
  gift: Gift,
  star: Star,
  sparkles: Sparkles,
  image: ImageIcon,
};

const FEED_STYLES: Record<FeedItem["type"], string> = {
  join: "bg-primary",
  stamp: "bg-amber-500",
  redeem: "bg-[color:var(--success)]",
  automation: "bg-sky-500",
};

const CAMPAIGN_STATUS: Record<string, { label: string; cls: string }> = {
  sent: { label: "Sent", cls: "bg-[#e6f4ec] text-[color:var(--success)]" },
  scheduled: { label: "Scheduled", cls: "bg-amber-50 text-amber-700" },
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground" },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);

  const [{ data: business }, stats, automations, feed] = await Promise.all([
    membership
      ? supabase
          .from("businesses")
          .select("name, logo_url, google_review_url, welcome_bonus_stamps")
          .eq("id", membership.businessId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    membership
      ? getOverviewStats(supabase, membership.businessId)
      : Promise.resolve(null),
    membership
      ? getAutomations(supabase, membership.businessId)
      : Promise.resolve(null),
    membership
      ? getDashboardFeed(supabase, membership.businessId)
      : Promise.resolve(null),
  ]);

  const businessName = business?.name ?? "there";
  const hello = greeting(new Date().getHours());

  const active = stats?.activeCustomers ?? 0;
  const newThisWeek = stats?.newThisWeek ?? 0;
  const growthPct = active > 0 ? Math.round((newThisWeek / active) * 100) : 0;

  const suggestions = buildSuggestions({
    inactiveCount: stats?.inactiveCount ?? 0,
    closeToReward: stats?.closeToReward ?? 0,
    hasLogo: !!business?.logo_url,
    hasReviewUrl: !!business?.google_review_url,
    welcomeBonus: business?.welcome_bonus_stamps ?? 0,
    anyAutomationEnabled: automations
      ? Object.values(automations).some((a) => a.enabled)
      : false,
    winBackEnabled: automations?.win_back.enabled ?? false,
  });
  const topSuggestion = suggestions[0];
  const TopIcon = topSuggestion ? SUGGESTION_ICONS[topSuggestion.icon] : Sparkles;

  const maxBar = Math.max(1, ...(feed?.weeklyEnrollments ?? [0]));
  const avg = feed?.avgStampsPerVisitor ?? 0;

  const stampCards = [
    {
      label: "New this week",
      value: newThisWeek,
      icon: <UserPlus className="h-4 w-4" />,
      hint: growthPct >= 100 ? "100% of total growth" : `${growthPct}% of total growth`,
      accent: <TrendingUp className="h-4 w-4 text-[color:var(--success)]" />,
    },
    {
      label: "Stamps this week",
      value: stats?.stampsThisWeek ?? 0,
      icon: <Stamp className="h-4 w-4" />,
      hint: avg > 0 ? `Avg. ${avg.toFixed(1)} per visitor` : "Collected this week",
    },
    {
      label: "Rewards redeemed",
      value: stats?.redemptionsThisWeek ?? 0,
      icon: <Gift className="h-4 w-4" />,
      hint:
        (stats?.redemptionsThisWeek ?? 0) === 0
          ? "No redemptions yet"
          : "Redeemed this week",
    },
    {
      label: "Inactive customers",
      value: stats?.inactiveCount ?? 0,
      icon: <Moon className="h-4 w-4" />,
      hint:
        (stats?.inactiveCount ?? 0) === 0
          ? "Excellent retention rate"
          : "No visit in 21+ days",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
          {hello}, {businessName}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          {newThisWeek > 0
            ? `Your community loyalty has grown by ${growthPct}% this week. Keep up the great work!`
            : "Here's how your loyalty program is performing this week."}
        </p>
      </div>

      {/* Stat row */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="fade-up flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Active Customers
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-display text-4xl font-extrabold text-foreground">
                {active}
              </span>
              {newThisWeek > 0 && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-primary">
                  +{newThisWeek} new
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-end gap-1.5" aria-hidden>
            {(feed?.weeklyEnrollments ?? [0, 0, 0, 0, 0]).map((v, i, arr) => (
              <span
                key={i}
                className={`flex-1 rounded-t-sm ${i === arr.length - 1 ? "bg-primary" : "bg-accent/25"}`}
                style={{ height: `${8 + (v / maxBar) * 32}px` }}
              />
            ))}
          </div>
        </div>

        {stampCards.map((c, i) => (
          <div
            key={c.label}
            className="fade-up flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm"
            style={{ animationDelay: `${60 + i * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {c.label}
              </p>
              <span className="text-muted-foreground">{c.icon}</span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 font-display text-4xl font-extrabold text-foreground">
              {c.value}
              {c.accent}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{c.hint}</p>
          </div>
        ))}
      </section>

      {/* Suggested + Quick actions */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="fade-up overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:col-span-2" style={{ animationDelay: "120ms" }}>
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1 p-7">
              <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                Suggested for you
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                {topSuggestion?.title ?? "You're all set"}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {topSuggestion?.description ??
                  "Your marketing is running itself. Nice work — check back for new suggestions."}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Link
                  href={topSuggestion?.href ?? "/dashboard/automations"}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  {topSuggestion?.cta ?? "View automations"}
                </Link>
                <Link
                  href="/dashboard/automations"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Learn more
                </Link>
              </div>
            </div>
            <div className="relative flex w-full items-center justify-center bg-accent/10 p-8 sm:w-64">
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-[#7c2d12] text-primary-foreground shadow-lg">
                <TopIcon className="h-14 w-14" />
              </div>
            </div>
          </div>
        </div>

        <div className="fade-up rounded-3xl border border-border bg-card p-6 shadow-sm" style={{ animationDelay: "160ms" }}>
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">
              Quick Actions
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            <QuickAction
              href="/dashboard/loyalty-cards/new"
              icon={<CreditCard className="h-5 w-5 text-primary" />}
              title="Create New Card"
              subtitle="Design a stamp card"
            />
            <QuickAction
              href="/dashboard/analytics"
              icon={<Send className="h-5 w-5 text-primary" />}
              title="Win-back inactive"
              subtitle={`Reach ${stats?.inactiveCount ?? 0} past visitors`}
            />
            <QuickAction
              href="/dashboard/loyalty-cards"
              icon={<QrCode className="h-5 w-5 text-primary" />}
              title="Enrollment QR"
              subtitle="Print store signage"
            />
          </div>
        </div>
      </section>

      {/* Close to reward + Live feed */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="fade-up rounded-3xl bg-[#2b1a14] p-6 text-white shadow-sm lg:col-span-2" style={{ animationDelay: "200ms" }}>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <Star className="h-4 w-4" />
            </span>
            <h3 className="font-display text-lg font-bold">Close to reward</h3>
          </div>
          {feed && feed.closeToReward.length > 0 ? (
            <div className="space-y-3">
              {feed.closeToReward.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 rounded-2xl bg-white/5 p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                    {initials(c.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.name}</p>
                    <p className="text-xs text-white/60">
                      {c.current}/{c.required} stamps collected
                    </p>
                  </div>
                  <div className="hidden h-2 w-40 overflow-hidden rounded-full bg-white/10 sm:block">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${(c.current / c.required) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-white/5 p-5 text-sm text-white/70">
              No one&apos;s within reach of a reward yet. As customers collect
              stamps, they&apos;ll show up here.
            </p>
          )}
        </div>

        <div className="fade-up rounded-3xl border border-border bg-card p-6 shadow-sm" style={{ animationDelay: "240ms" }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-foreground">
              Live Feed
            </h3>
            <span className="flex h-2.5 w-2.5 rounded-full bg-[color:var(--success)]" />
          </div>
          {feed && feed.feed.length > 0 ? (
            <ol className="space-y-4">
              {feed.feed.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${FEED_STYLES[item.type]}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground/70">
                      {timeAgo(item.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">
              Activity from enrollments, stamps, and rewards will appear here.
            </p>
          )}
        </div>
      </section>

      {/* Active campaigns */}
      <section className="fade-up" style={{ animationDelay: "280ms" }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">
            Active Campaigns
          </h2>
          <Link
            href="/dashboard/campaigns"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all campaigns
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(feed?.campaigns ?? []).slice(0, 2).map((c) => {
            const status = CAMPAIGN_STATUS[c.status] ?? CAMPAIGN_STATUS.draft;
            return (
              <Link
                key={c.id}
                href="/dashboard/campaigns"
                className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}
                  >
                    {status.label}
                  </span>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground group-hover:text-primary">
                  {c.name}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {c.messageTitle}
                </p>
              </Link>
            );
          })}
          <Link
            href="/dashboard/campaigns/new"
            className="flex min-h-[140px] items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-primary">
              <Plus className="h-6 w-6" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-muted active:scale-[0.98]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  );
}
