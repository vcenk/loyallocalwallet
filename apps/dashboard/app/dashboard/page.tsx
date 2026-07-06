import Link from "next/link";
import {
  Users,
  TrendingUp,
  PartyPopper,
  Sparkles,
  Send,
  CreditCard,
  QrCode,
  ArrowRight,
  UserPlus,
  Stamp,
  Gift,
  Moon,
  Zap,
  Megaphone,
  Star,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveMembership } from "@/lib/business";
import { getOverviewStats } from "@/lib/analytics";
import { getAutomations } from "@/lib/automations";
import { buildSuggestions, type Suggestion } from "@/lib/suggestions";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const SUGGESTION_ICONS: Record<Suggestion["icon"], LucideIcon> = {
  zap: Zap,
  megaphone: Megaphone,
  gift: Gift,
  star: Star,
  sparkles: Sparkles,
  image: ImageIcon,
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);

  const [{ data: business }, stats, automations] = await Promise.all([
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
  ]);

  const businessName = business?.name ?? "there";
  const hello = greeting(new Date().getHours());

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

  const miniCards = [
    {
      label: "New this week",
      value: stats?.newThisWeek ?? 0,
      icon: <UserPlus className="h-4 w-4" />,
      hint: "Joined in the last 7 days",
    },
    {
      label: "Stamps this week",
      value: stats?.stampsThisWeek ?? 0,
      icon: <Stamp className="h-4 w-4" />,
      hint: "Collected in the last 7 days",
    },
    {
      label: "Rewards redeemed",
      value: stats?.redemptionsThisWeek ?? 0,
      icon: <Gift className="h-4 w-4" />,
      hint: "Redeemed this week",
    },
    {
      label: "Inactive customers",
      value: stats?.inactiveCount ?? 0,
      icon: <Moon className="h-4 w-4" />,
      hint: "No visit in 21+ days",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          {hello}, {businessName}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s how your loyalty program is performing this week.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="fade-up flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm md:col-span-4">
          <div>
            <div className="mb-4 flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-primary">
                <Users className="h-5 w-5" />
              </span>
              <span className="flex items-center gap-1 text-sm font-bold text-[color:var(--success)]">
                <TrendingUp className="h-4 w-4" />
                {stats?.newThisWeek ?? 0} new
              </span>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">
              Active Customers
            </h3>
            <p className="font-display text-4xl font-extrabold text-foreground">
              {stats?.activeCustomers ?? 0}
            </p>
          </div>
          <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
            Total people with your loyalty card
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:col-span-5">
          {miniCards.map((c, i) => (
            <div
              key={c.label}
              className="fade-up flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm"
              style={{ animationDelay: `${80 + i * 60}ms` }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-primary">
                  {c.icon}
                </span>
                <p className="text-xs font-semibold text-muted-foreground">
                  {c.label}
                </p>
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold text-foreground">
                {c.value}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{c.hint}</p>
            </div>
          ))}
        </div>

        <div className="fade-up flex flex-col justify-between rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm md:col-span-3" style={{ animationDelay: "120ms" }}>
          <div>
            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <PartyPopper className="h-5 w-5" />
            </span>
            <h3 className="text-sm font-semibold opacity-90">Close to reward</h3>
            <p className="font-display text-4xl font-extrabold">
              {stats?.closeToReward ?? 0}
            </p>
          </div>
          <p className="mt-4 text-xs opacity-80">Customers within 2 stamps</p>
        </div>

        {/* Suggested actions */}
        <div className="fade-up rounded-3xl border border-border bg-card p-6 shadow-sm md:col-span-8" style={{ animationDelay: "160ms" }}>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display text-lg font-bold text-foreground">
              Suggested for you
            </h3>
          </div>
          {suggestions.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl bg-[#e6f4ec] p-5 text-[color:var(--success)]">
              <PartyPopper className="h-5 w-5" />
              <p className="text-sm font-medium">
                You&apos;re all set — your marketing is running itself. Nice work!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((s) => {
                const Icon = SUGGESTION_ICONS[s.icon];
                return (
                  <Link
                    key={s.key}
                    href={s.href}
                    className="group flex items-center gap-4 rounded-2xl border border-transparent bg-muted p-4 transition-all hover:border-border active:scale-[0.99]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{s.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.description}
                      </p>
                    </div>
                    <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary group-hover:underline sm:inline-flex">
                      {s.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="fade-up rounded-2xl border border-border bg-card p-6 shadow-sm md:col-span-4" style={{ animationDelay: "200ms" }}>
          <h3 className="mb-4 font-display text-lg font-bold text-foreground">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <QuickAction
              href="/dashboard/loyalty-cards/new"
              icon={<CreditCard className="h-5 w-5 text-primary" />}
              title="Create New Card"
              subtitle="Custom stamps & rewards"
            />
            <QuickAction
              href="/dashboard/analytics"
              icon={<Send className="h-5 w-5 text-primary" />}
              title="Win-back inactive customers"
              subtitle="See who's fading away"
            />
            <QuickAction
              href="/dashboard/loyalty-cards"
              icon={<QrCode className="h-5 w-5 text-primary" />}
              title="Enrollment QR"
              subtitle="Print for your counter"
            />
          </div>
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
      className="flex items-center gap-3 rounded-xl border border-transparent bg-muted p-4 text-left transition-all hover:border-border active:scale-[0.98]"
    >
      {icon}
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  );
}
