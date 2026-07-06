"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Users,
  Undo2,
  Clock,
  Sparkles,
  Gift,
  Star,
  Crown,
  Zap,
  QrCode,
  type LucideIcon,
} from "lucide-react";
import { Button, Input, Label } from "@llw/ui";
import {
  AUDIENCES,
  MESSAGE_TITLE_MAX,
  MESSAGE_BODY_MAX,
  type AudienceKey,
} from "@/lib/campaigns";
import {
  StepHeader,
  Section,
  SelectableCard,
  PreviewTabs,
  ReadinessChecklist,
  SuggestionPill,
} from "@/components/builder-ui";
import { createCampaign } from "../actions";

type Goal = {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
  audience: AudienceKey;
  msgTitle: string;
  msgBody: string;
};

const GOALS: Goal[] = [
  { key: "bring_back", icon: Undo2, title: "Bring back customers", description: "Reach customers who haven't visited recently.", tag: "Retention", audience: "inactive_21_days", msgTitle: "We miss you", msgBody: "Come back this week for a little something on us." },
  { key: "slow_hours", icon: Clock, title: "Fill slow hours", description: "Send a limited-time offer during quiet times.", tag: "Revenue boost", audience: "all_active", msgTitle: "Slow-afternoon treat", msgBody: "Double stamps from 2–5 PM today — just show your card." },
  { key: "new_item", icon: Sparkles, title: "Promote a new item", description: "Announce a new menu item, service, or product.", tag: "Promotion", audience: "all_active", msgTitle: "New on the menu 🍽️", msgBody: "We just added something new — come try it this week!" },
  { key: "one_away", icon: Gift, title: "One stamp away", description: "Remind customers who are close to a reward.", tag: "Reward reminder", audience: "close_to_reward", msgTitle: "You're almost there", msgBody: "One more visit and your reward is ready!" },
  { key: "birthday", icon: Star, title: "Birthday reward", description: "Send a special birthday offer.", tag: "Personalization", audience: "all_active", msgTitle: "Happy birthday! 🎂", msgBody: "Enjoy a birthday treat on us this week." },
  { key: "review", icon: Star, title: "Ask for a review", description: "Invite happy customers to leave a Google review.", tag: "Reputation", audience: "all_active", msgTitle: "Enjoyed your visit?", msgBody: "We'd love a quick review — it really helps our shop 🙏" },
  { key: "vip", icon: Crown, title: "VIP thank you", description: "Reward your best, most loyal customers.", tag: "Loyalty", audience: "all_active", msgTitle: "A thank-you from us", msgBody: "You're one of our favourites — here's a little extra." },
  { key: "double_stamp", icon: Zap, title: "Double stamp day", description: "Increase visits with bonus stamps.", tag: "Offer", audience: "all_active", msgTitle: "Double stamps today ⚡", msgBody: "Every visit today earns 2 stamps. See you soon!" },
];

const AUDIENCE_DESC: Record<AudienceKey, string> = {
  all_active: "Everyone who opted in to offers.",
  inactive_21_days: "Opted-in customers not seen in 21+ days.",
  close_to_reward: "Opted-in customers one or two stamps away.",
};

const SUGGESTIONS = [
  "We miss you — enjoy double stamps this week.",
  "New on the menu today. Come try it this week.",
  "You're almost there — one more visit unlocks your reward.",
  "Slow afternoon treat: double stamps from 2–5 PM.",
];

export function CampaignComposer({
  businessName,
  counts,
}: {
  businessName: string;
  counts: Record<AudienceKey, number>;
}) {
  const [goalKey, setGoalKey] = useState("bring_back");
  const [audienceKey, setAudienceKey] = useState<AudienceKey>("inactive_21_days");
  const [name, setName] = useState("Bring back customers");
  const [title, setTitle] = useState("We miss you");
  const [body, setBody] = useState("Come back this week for a little something on us.");
  const [tab, setTab] = useState("Lock screen");
  const [demo, setDemo] = useState(false);

  function applyGoal(g: Goal) {
    setGoalKey(g.key);
    setAudienceKey(g.audience);
    setName(g.title);
    setTitle(g.msgTitle);
    setBody(g.msgBody);
  }

  const reach = counts[audienceKey] ?? 0;
  const canSend = reach > 0 || demo;
  const initial = (businessName || "L").charAt(0).toUpperCase();

  return (
    <div>
      <StepHeader steps={["Goal", "Audience", "Message", "Send"]} current={2} />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Builder */}
        <div className="space-y-6 lg:col-span-3">
          <Section title="What's the goal?" description="Pick an outcome — we'll set a smart audience and starting message.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GOALS.map((g) => (
                <SelectableCard
                  key={g.key}
                  icon={<g.icon className="h-5 w-5" />}
                  title={g.title}
                  description={g.description}
                  tag={g.tag}
                  selected={goalKey === g.key}
                  onClick={() => applyGoal(g)}
                />
              ))}
            </div>
          </Section>

          <Section title="Who should get it?" description="Only customers who opted in to offers are ever messaged.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {AUDIENCES.map((a) => (
                <SelectableCard
                  key={a.key}
                  title={a.label}
                  description={AUDIENCE_DESC[a.key]}
                  meta={`${counts[a.key] ?? 0} customers`}
                  selected={audienceKey === a.key}
                  onClick={() => setAudienceKey(a.key)}
                />
              ))}
            </div>
          </Section>

          <Section title="Write the message" description="Keep it short — this lands on the lock screen as a wallet update.">
            <form action={createCampaign} className="space-y-4">
              <input type="hidden" name="audienceKey" value={audienceKey} />
              <input type="hidden" name="messageTitle" value={title} />
              <input type="hidden" name="messageBody" value={body} />

              <div className="space-y-1.5">
                <Label htmlFor="c-name">Campaign name</Label>
                <Input id="c-name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="c-title">Notification title</Label>
                  <span className="text-xs text-muted-foreground">{title.length}/{MESSAGE_TITLE_MAX}</span>
                </div>
                <Input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={MESSAGE_TITLE_MAX} required />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="c-body">Message</Label>
                  <span className="text-xs text-muted-foreground">{body.length}/{MESSAGE_BODY_MAX}</span>
                </div>
                <textarea id="c-body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={MESSAGE_BODY_MAX} rows={3} required
                  className="flex w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Need a line? Tap to use one:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <SuggestionPill key={s} label={s} onClick={() => setBody(s)} />
                  ))}
                </div>
              </div>

              {canSend ? (
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button type="submit" name="sendNow" value="1" size="lg">
                    Send wallet campaign
                  </Button>
                  <Button type="submit" name="sendNow" value="0" variant="outline">
                    Save draft
                  </Button>
                  {reach === 0 ? (
                    <p className="w-full text-xs text-muted-foreground">
                      Demo mode — this reaches 0 real customers until people opt in.
                    </p>
                  ) : null}
                </div>
              ) : (
                <EmptyAudienceState onDemo={() => setDemo(true)} />
              )}
            </form>
          </Section>
        </div>

        {/* Preview + readiness */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <PreviewTabs tabs={["Lock screen", "Wallet card"]} active={tab} onChange={setTab} />

            {tab === "Lock screen" ? (
              <div className="rounded-3xl bg-gradient-to-br from-[#3c2320] to-[#1c110e] p-5">
                <div className="rounded-2xl bg-white/95 p-3 shadow-lg">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">{initial}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-[11px] font-bold text-foreground">{businessName || "Your shop"}</p>
                        <span className="text-[10px] text-muted-foreground">now</span>
                      </div>
                      <p className="text-[13px] font-semibold leading-tight text-foreground">{title || "Title"}</p>
                      <p className="text-[12px] leading-snug text-muted-foreground">{body || "Your message"}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-gradient-to-br from-[#c0421e] to-[#ae3115] p-5 text-white shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">{businessName || "Your shop"}</p>
                <p className="mt-1 font-display text-lg font-bold">{title || "Campaign title"}</p>
                <p className="mt-1 text-sm opacity-90">{body || "Your offer message"}</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-xs">
                  <span className="opacity-80">Wallet update</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 font-semibold">View</span>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">Campaign readiness</p>
              <ReadinessChecklist
                items={[
                  { label: "Goal selected", state: goalKey ? "done" : "todo" },
                  { label: `Audience: ${counts[audienceKey] ?? 0} opted-in`, state: reach > 0 ? "done" : "warn" },
                  { label: "Message written", state: title && body ? "done" : "todo" },
                  { label: "Channel: free wallet update", state: "done" },
                ]}
              />
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                <Users className="mr-1 inline h-3.5 w-3.5" />
                Reaches {reach} opted-in customer{reach === 1 ? "" : "s"}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyAudienceState({ onDemo }: { onDemo: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <QrCode className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-foreground">No opted-in customers yet</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Share your signup QR or launch a loyalty card first. Once customers
            join, you can send wallet campaigns.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard/loyalty-cards">Create customer signup QR</Link>
        </Button>
        <Button type="button" variant="outline" onClick={onDemo}>
          Preview with demo customer
        </Button>
      </div>
    </div>
  );
}
