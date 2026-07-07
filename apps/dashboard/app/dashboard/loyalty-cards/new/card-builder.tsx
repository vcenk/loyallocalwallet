"use client";

import { useState } from "react";
import {
  Coffee,
  Heart,
  Crown,
  Cake,
  Ticket,
  Users,
  Zap,
  Undo2,
  Star,
  QrCode,
  Smartphone,
  ScanLine,
  Printer,
} from "lucide-react";
import { Button, Input, Label } from "@llw/ui";
import { REWARD_MODELS, rewardModel } from "@llw/config";
import {
  WalletCardPreview,
  STAMP_ICONS,
  STAMP_ICON_KEYS,
  PATTERN_KEYS,
  CARD_STYLE_KEYS,
  STAMP_STYLE_KEYS,
  patternStyle,
} from "@/components/wallet-card-preview";
import {
  StepHeader,
  Section,
  SelectableCard,
  ReadinessChecklist,
  SuggestionPill,
} from "@/components/builder-ui";
import { createProgram } from "../actions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

type Template = {
  key: string;
  icon: typeof Coffee;
  title: string;
  description: string;
  tag: string;
  name: string;
  stamps: string;
  reward: string;
  details: string;
  bg: string;
  fg: string;
  stampIcon: string;
  pattern: string;
  suggestions: string[];
};

const STEPS = ["Reward", "Design", "Review"] as const;

const TEMPLATES: Template[] = [
  { key: "coffee", icon: Coffee, title: "Coffee Stamp Card", description: "Buy 9, get 1 free.", tag: "Cafes & bakeries", name: "Coffee Rewards", stamps: "9", reward: "Free coffee", details: "One regular coffee, any size.", bg: "#4b2e2b", fg: "#ffffff", stampIcon: "coffee", pattern: "dots", suggestions: ["Buy 9 coffees, get 1 free", "Free pastry after 5 visits", "Double stamps before 10 AM"] },
  { key: "visits", icon: Heart, title: "Visit Rewards", description: "Reward customers after repeat visits.", tag: "Salons, barbers, groomers", name: "Visit Rewards", stamps: "6", reward: "$10 off", details: "Any service.", bg: "#be185d", fg: "#ffffff", stampIcon: "heart", pattern: "none", suggestions: ["6 visits, $10 off", "Free add-on after 5 visits", "VIP pricing after 10 visits"] },
  { key: "vip", icon: Crown, title: "VIP Club", description: "Create Bronze, Silver, Gold levels.", tag: "Premium local shops", name: "VIP Club", stamps: "12", reward: "VIP perk", details: "A members-only treat.", bg: "#1e293b", fg: "#ffffff", stampIcon: "crown", pattern: "vertical", suggestions: ["Gold status after 12 visits", "Members-only offers", "Early access for VIPs"] },
  { key: "birthday", icon: Cake, title: "Birthday Club", description: "Collect birthdays and send offers.", tag: "Restaurants & beauty", name: "Birthday Club", stamps: "8", reward: "Birthday treat", details: "On us, during your birthday week.", bg: "#b45309", fg: "#ffffff", stampIcon: "cake", pattern: "diagonal", suggestions: ["Free dessert on birthdays", "Birthday-week double stamps", "Bring a friend on your birthday"] },
  { key: "prepaid", icon: Ticket, title: "Prepaid Pass", description: "Sell 5 or 10 visit packages.", tag: "Gyms, tutors, car washes", name: "Visit Pass", stamps: "10", reward: "Free visit", details: "Your 11th visit is on us.", bg: "#0e7490", fg: "#ffffff", stampIcon: "stamp", pattern: "grid", suggestions: ["Buy 10, get 1 free", "5-visit starter pack", "Monthly unlimited pass"] },
  { key: "referral", icon: Users, title: "Referral Reward", description: "Reward customers who bring friends.", tag: "Growing businesses", name: "Referral Rewards", stamps: "5", reward: "Bonus reward", details: "You and your friend both win.", bg: "#3f6212", fg: "#ffffff", stampIcon: "sparkle", pattern: "crosshatch", suggestions: ["Both get a bonus stamp", "Refer 3 friends, get a reward", "Friends get a welcome bonus"] },
];

const PALETTES = [
  { key: "Espresso", bg: "#4b2e2b", fg: "#ffffff" },
  { key: "Matcha", bg: "#3f6212", fg: "#ffffff" },
  { key: "Berry", bg: "#be185d", fg: "#ffffff" },
  { key: "Midnight", bg: "#1e293b", fg: "#ffffff" },
  { key: "Cream", bg: "#f3e9df", fg: "#4b2e2b" },
  { key: "Ocean", bg: "#0e7490", fg: "#ffffff" },
];

const STAMP_STYLE_LABEL: Record<string, string> = {
  circles: "Circles",
  pills: "Pills",
  progress: "Progress bar",
};

const AUTOMATION_HINTS = [
  { icon: Zap, label: "Notify when 1 stamp away" },
  { icon: Undo2, label: "Win-back after 30 days inactive" },
  { icon: Cake, label: "Send birthday reward" },
  { icon: Star, label: "Ask for a Google review after redemption" },
];

const LAUNCH_KIT = [
  { icon: QrCode, label: "Customer signup QR" },
  { icon: ScanLine, label: "Staff scanner link" },
  { icon: Printer, label: "Printable counter sign" },
  { icon: Smartphone, label: "Apple & Google Wallet buttons" },
];

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function CardBuilder({
  businessName,
  logoUrl,
}: {
  businessName: string;
  logoUrl?: string | null;
}) {
  const [step, setStep] = useState(0);
  const [templateKey, setTemplateKey] = useState("coffee");
  const [name, setName] = useState("Coffee Rewards");
  const [description] = useState("Earn a free coffee after 9 visits.");
  const [stamps, setStamps] = useState("9");
  const [reward, setReward] = useState("Free coffee");
  const [rewardDetails, setRewardDetails] = useState("One regular coffee, any size.");
  const [bg, setBg] = useState("#4b2e2b");
  const [fg, setFg] = useState("#ffffff");
  const [icon, setIcon] = useState("coffee");
  const [pattern, setPattern] = useState("dots");
  const [cardStyle, setCardStyle] = useState("retail");
  const [stampStyle, setStampStyle] = useState("circles");
  const [programType, setProgramType] = useState("stamps");

  const model = rewardModel(programType);
  const template = TEMPLATES.find((t) => t.key === templateKey) ?? TEMPLATES[0];
  const requiredNum = Math.max(1, Number(stamps) || 9);
  const previewFilled = Math.round(requiredNum * 0.6);
  const canContinue =
    name.trim().length > 1 && reward.trim().length > 1 && requiredNum > 0;

  function applyTemplate(t: Template) {
    setTemplateKey(t.key);
    setName(t.name);
    setStamps(t.stamps);
    setReward(t.reward);
    setRewardDetails(t.details);
    setBg(t.bg);
    setFg(t.fg);
    setIcon(t.stampIcon);
    setPattern(t.pattern);
  }

  function applyPalette(p: (typeof PALETTES)[number]) {
    setBg(p.bg);
    setFg(p.fg);
  }

  return (
    <div>
      <StepHeader steps={[...STEPS]} current={step} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <form action={createProgram} className="space-y-6">
            <input type="hidden" name="backgroundColor" value={bg} />
            <input type="hidden" name="foregroundColor" value={fg} />
            <input type="hidden" name="stampIcon" value={icon} />
            <input type="hidden" name="pattern" value={pattern} />
            <input type="hidden" name="cardStyle" value={cardStyle} />
            <input type="hidden" name="stampStyle" value={stampStyle} />
            <input type="hidden" name="description" value={description} />

            {step === 0 ? (
              <div className="space-y-6">
                <Section
                  title="Choose a Card Template"
                  description="Start with the closest real-world loyalty setup. You can adjust every detail before creating the card."
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {TEMPLATES.map((t) => (
                      <SelectableCard
                        key={t.key}
                        icon={<t.icon className="h-5 w-5" aria-hidden="true" />}
                        title={t.title}
                        description={t.description}
                        tag={t.tag}
                        selected={templateKey === t.key}
                        onClick={() => applyTemplate(t)}
                      />
                    ))}
                  </div>
                </Section>

                <Section
                  title="Set the Reward"
                  description="Keep the offer simple enough for customers to understand at the counter."
                >
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Card name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="rewardModel">Reward model</Label>
                        <select
                          id="rewardModel"
                          name="rewardModel"
                          value={programType}
                          onChange={(e) => setProgramType(e.target.value)}
                          className={SELECT_CLASS}
                        >
                          {REWARD_MODELS.map((m) => (
                            <option key={m.key} value={m.key}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="stampsRequired">{model.targetLabel}</Label>
                        <Input
                          id="stampsRequired"
                          name="stampsRequired"
                          type="number"
                          min={1}
                          max={100000}
                          value={stamps}
                          onChange={(e) => setStamps(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">{model.hint}</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="rewardTitle">Reward</Label>
                        <Input
                          id="rewardTitle"
                          name="rewardTitle"
                          value={reward}
                          onChange={(e) => setReward(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="rewardDescription">
                        Reward details <span className="text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="rewardDescription"
                        name="rewardDescription"
                        value={rewardDetails}
                        onChange={(e) => setRewardDetails(e.target.value)}
                      />
                    </div>

                    <div className="rounded-2xl bg-muted/50 p-4">
                      <p className="text-xs font-semibold text-foreground">
                        Popular rewards for {template.title}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {template.suggestions.map((s) => (
                          <SuggestionPill key={s} label={s} onClick={() => setReward(s)} />
                        ))}
                      </div>
                    </div>
                  </div>
                </Section>
              </div>
            ) : null}

            {step === 1 ? (
              <Section
                title="Design the Wallet Card"
                description="Tune the card so it looks recognizable in Apple Wallet and Google Wallet."
              >
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Preset palettes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PALETTES.map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => applyPalette(p)}
                          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                            bg === p.bg
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: p.bg }}
                          />
                          {p.key}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-6">
                    <label className="space-y-1.5">
                      <span className="block text-xs font-medium text-muted-foreground">
                        Background
                      </span>
                      <input
                        type="color"
                        value={bg}
                        onChange={(e) => setBg(e.target.value)}
                        className="h-10 w-16 cursor-pointer rounded-lg border border-input bg-card"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="block text-xs font-medium text-muted-foreground">
                        Text
                      </span>
                      <input
                        type="color"
                        value={fg}
                        onChange={(e) => setFg(e.target.value)}
                        className="h-10 w-16 cursor-pointer rounded-lg border border-input bg-card"
                      />
                    </label>
                    <label className="min-w-[140px] flex-1 space-y-1.5">
                      <span className="block text-xs font-medium text-muted-foreground">
                        Card style
                      </span>
                      <select
                        value={cardStyle}
                        onChange={(e) => setCardStyle(e.target.value)}
                        className={SELECT_CLASS}
                      >
                        {CARD_STYLE_KEYS.map((s) => (
                          <option key={s} value={s}>
                            {cap(s)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Stamp style
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {STAMP_STYLE_KEYS.map((s) => {
                        const active = s === stampStyle;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setStampStyle(s)}
                            className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                              active
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-foreground hover:bg-muted"
                            }`}
                          >
                            {STAMP_STYLE_LABEL[s]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Background pattern
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PATTERN_KEYS.map((p) => {
                        const active = p === pattern;
                        const st = patternStyle(p, fg);
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPattern(p)}
                            title={p}
                            className={`relative h-10 w-14 overflow-hidden rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                              active ? "border-primary ring-2 ring-primary/30" : "border-border"
                            }`}
                            style={{ backgroundColor: bg }}
                          >
                            {st ? <span aria-hidden className="absolute inset-0" style={st} /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Stamp icon
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {STAMP_ICON_KEYS.map((key) => {
                        const IconC = STAMP_ICONS[key];
                        const active = key === icon;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setIcon(key)}
                            aria-label={`Use ${key} stamp icon`}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                              active
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <IconC className="h-4 w-4" aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Section>
            ) : null}

            {step === 2 ? (
              <Section
                title="Review and Create"
                description="This creates a draft card. You can activate it and print the QR from the card detail page."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-muted/50 p-4">
                    <p className="text-xs font-semibold text-muted-foreground">Reward</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{reward}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {requiredNum} {model.unit} required
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted/50 p-4">
                    <p className="text-xs font-semibold text-muted-foreground">Card</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {template.title} template
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-card p-4">
                  <p className="mb-3 text-sm font-semibold text-foreground">
                    Ready after creation
                  </p>
                  <ReadinessChecklist
                    items={LAUNCH_KIT.map((k) => ({
                      label: k.label,
                      state: "done",
                    }))}
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-gradient-to-br from-[#fce3dd] to-[#f6ddd8] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
                    <p className="text-sm font-semibold text-foreground">
                      Suggested automations
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {AUTOMATION_HINTS.map((a) => (
                      <li key={a.label} className="flex items-center gap-2.5 text-sm text-foreground/80">
                        <a.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                        {a.label}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    You can turn these on from Automations after the card exists.
                  </p>
                </div>
              </Section>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Step {step + 1} of {STEPS.length}:{" "}
                <span className="font-semibold text-foreground">{STEPS[step]}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                  >
                    Back
                  </Button>
                ) : null}
                {step < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                    disabled={!canContinue}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" size="lg">
                    Create draft card
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Live Wallet Preview
            </p>
            <WalletCardPreview
              businessName={businessName}
              programName={name}
              rewardTitle={reward}
              stampsRequired={requiredNum}
              currentStamps={previewFilled}
              backgroundColor={bg}
              foregroundColor={fg}
              stampIcon={icon}
              pattern={pattern}
              cardStyle={cardStyle}
              stampStyle={stampStyle}
              programType={programType}
              logoUrl={logoUrl}
            />
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">What happens next</p>
              <p className="mt-1">
                The card starts as a draft. Open it after creation to activate enrollment,
                download the QR, and print the counter poster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
