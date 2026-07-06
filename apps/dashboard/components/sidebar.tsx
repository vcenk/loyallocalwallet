"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Megaphone,
  Zap,
  UserCog,
  MapPin,
  BarChart3,
  Settings,
  Receipt,
  HelpCircle,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@llw/ui";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/loyalty-cards", label: "Loyalty Cards", icon: CreditCard },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/automations", label: "Automations", icon: Zap },
  { href: "/dashboard/staff", label: "Staff", icon: UserCog },
  { href: "/dashboard/locations", label: "Locations", icon: MapPin },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: Receipt },
];

export function Sidebar({
  businessName = "Your business",
  planLabel = "Trial plan",
}: {
  businessName?: string;
  planLabel?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background px-4 py-6 md:flex print:hidden">
      <div className="mb-6 px-2">
        <h1 className="text-xl font-extrabold tracking-tight text-primary">
          LoyalLocal
        </h1>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-card p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            {businessName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {businessName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{planLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors active:scale-[0.98]",
                active
                  ? "bg-accent/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-border pt-4">
        <Link
          href="/dashboard/campaigns/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Link>
        <Link
          href="/dashboard/loyalty-cards/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <CreditCard className="h-4 w-4" />
          New Card
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
          Help Center
        </Link>
      </div>
    </aside>
  );
}
