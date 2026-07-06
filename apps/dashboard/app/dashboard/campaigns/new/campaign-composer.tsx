"use client";

import { useState } from "react";
import {
  Utensils,
  Percent,
  Calendar,
  Zap,
  Heart,
  Gift,
  Bell,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button, Input, Label } from "@llw/ui";
import {
  AUDIENCES,
  CAMPAIGN_TEMPLATES,
  MESSAGE_TITLE_MAX,
  MESSAGE_BODY_MAX,
  type AudienceKey,
  type CampaignTemplate,
} from "@/lib/campaigns";
import { createCampaign } from "../actions";

const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  percent: Percent,
  calendar: Calendar,
  zap: Zap,
  heart: Heart,
  gift: Gift,
};

const SELECT_CLASS =
  "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

const AUDIENCE_LABEL: Record<AudienceKey, string> = {
  all_active: "All opted-in customers",
  inactive_21_days: "Inactive 21+ days",
  close_to_reward: "Close to a reward",
};

export function CampaignComposer({
  businessName,
  counts,
}: {
  businessName: string;
  counts: Record<AudienceKey, number>;
}) {
  const [name, setName] = useState("New menu launch");
  const [audienceKey, setAudienceKey] = useState<AudienceKey>("all_active");
  const [title, setTitle] = useState("New on the menu 🍽️");
  const [body, setBody] = useState(
    "We just added something new — come try it this week!",
  );

  function applyTemplate(t: CampaignTemplate) {
    setName(t.name);
    setTitle(t.title);
    setBody(t.body);
    setAudienceKey(t.audienceKey);
  }

  const reach = counts[audienceKey] ?? 0;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Composer */}
      <div className="space-y-6 lg:col-span-3">
        {/* Templates */}
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">
            Start from a template
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CAMPAIGN_TEMPLATES.map((t) => {
              const Icon = ICONS[t.icon] ?? Bell;
              const active = t.name === name;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className={`flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-all hover:border-primary hover:shadow-md ${
                    active ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {t.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {t.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form action={createCampaign} className="space-y-4">
          <input type="hidden" name="messageTitle" value={title} />
          <input type="hidden" name="messageBody" value={body} />
          <input type="hidden" name="audienceKey" value={audienceKey} />

          <div className="space-y-1.5">
            <Label htmlFor="name">Campaign name</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="audience">Audience</Label>
            <select
              id="audience"
              value={audienceKey}
              onChange={(e) => setAudienceKey(e.target.value as AudienceKey)}
              className={SELECT_CLASS}
            >
              {AUDIENCES.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label} ({counts[a.key] ?? 0})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Title</Label>
              <span className="text-xs text-muted-foreground">
                {title.length}/{MESSAGE_TITLE_MAX}
              </span>
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={MESSAGE_TITLE_MAX}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Message</Label>
              <span className="text-xs text-muted-foreground">
                {body.length}/{MESSAGE_BODY_MAX}
              </span>
            </div>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={MESSAGE_BODY_MAX}
              rows={3}
              required
              className="flex w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>

          <Button type="submit" className="w-full" disabled={reach === 0}>
            {reach === 0
              ? "No opted-in customers in this audience"
              : `Create campaign for ${reach} customer${reach === 1 ? "" : "s"}`}
          </Button>
        </form>
      </div>

      {/* Preview + reach */}
      <div className="lg:col-span-2">
        <div className="sticky top-24 space-y-4">
          <p className="text-sm font-semibold text-foreground">
            Lock-screen preview
          </p>
          {/* faux lock screen */}
          <div className="rounded-3xl bg-gradient-to-br from-[#3c2320] to-[#1c110e] p-5">
            <div className="rounded-2xl bg-white/95 p-3 shadow-lg">
              <div className="flex items-start gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Bell className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-foreground">
                    {businessName || "Your shop"}
                  </p>
                  <p className="text-[13px] font-semibold leading-tight text-foreground">
                    {title || "Title"}
                  </p>
                  <p className="text-[12px] leading-snug text-muted-foreground">
                    {body || "Your message"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
            <Users className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Reaches <strong className="text-foreground">{reach}</strong>{" "}
              opted-in customer{reach === 1 ? "" : "s"}. Customers who didn&apos;t
              opt in to offers are never messaged.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
