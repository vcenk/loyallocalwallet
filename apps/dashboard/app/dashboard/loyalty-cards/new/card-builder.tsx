"use client";

import { useState } from "react";
import { Button, Input, Label } from "@llw/ui";
import {
  WalletCardPreview,
  STAMP_ICONS,
  STAMP_ICON_KEYS,
} from "@/components/wallet-card-preview";
import { createProgram } from "../actions";

interface Template {
  label: string;
  name: string;
  description: string;
  stamps: string;
  reward: string;
  rewardDetails: string;
  bg: string;
  fg: string;
  icon: string;
}

const TEMPLATES: Template[] = [
  { label: "Café", name: "Coffee Rewards", description: "Earn a free coffee after 10 visits.", stamps: "10", reward: "Free coffee", rewardDetails: "One regular coffee, any size.", bg: "#4b2e2b", fg: "#ffffff", icon: "coffee" },
  { label: "Bubble tea", name: "Bubble Tea Club", description: "Buy 8, get 1 free.", stamps: "8", reward: "Free drink", rewardDetails: "Any drink with one free topping.", bg: "#0f766e", fg: "#ffffff", icon: "sparkle" },
  { label: "Barber", name: "Barber Loyalty", description: "Visit 5 times, get $10 off.", stamps: "5", reward: "$10 off", rewardDetails: "Any haircut.", bg: "#111827", fg: "#ffffff", icon: "scissors" },
  { label: "Bakery", name: "Bakery Rewards", description: "Collect 8 stamps for a treat.", stamps: "8", reward: "Free pastry", rewardDetails: "Any single pastry.", bg: "#b45309", fg: "#ffffff", icon: "cookie" },
  { label: "Nail salon", name: "Nail Club", description: "5 visits, get $15 off.", stamps: "5", reward: "$15 off", rewardDetails: "Any service.", bg: "#be185d", fg: "#ffffff", icon: "heart" },
  { label: "Pet groomer", name: "Groom Club", description: "5 grooms, get $20 off.", stamps: "5", reward: "$20 off", rewardDetails: "Any grooming.", bg: "#3f6212", fg: "#ffffff", icon: "paw" },
];

export function CardBuilder({ businessName }: { businessName: string }) {
  const [name, setName] = useState("Coffee Rewards");
  const [description, setDescription] = useState("Earn a free coffee after 10 visits.");
  const [stamps, setStamps] = useState("10");
  const [reward, setReward] = useState("Free coffee");
  const [rewardDetails, setRewardDetails] = useState("One regular coffee, any size.");
  const [bg, setBg] = useState("#4b2e2b");
  const [fg, setFg] = useState("#ffffff");
  const [icon, setIcon] = useState("coffee");

  function applyTemplate(t: Template) {
    setName(t.name);
    setDescription(t.description);
    setStamps(t.stamps);
    setReward(t.reward);
    setRewardDetails(t.rewardDetails);
    setBg(t.bg);
    setFg(t.fg);
    setIcon(t.icon);
  }

  const required = Math.max(1, Math.min(Number(stamps) || 10, 12));
  const previewFilled = Math.round(required * 0.6);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Builder */}
      <div className="space-y-8 lg:col-span-3">
        {/* Templates */}
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">
            Start from a template
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {TEMPLATES.map((t) => {
              const TIcon = STAMP_ICONS[t.icon];
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="group flex w-28 shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center transition-all hover:border-primary hover:shadow-md"
                >
                  <span
                    className="flex h-12 w-full items-center justify-center rounded-xl"
                    style={{ backgroundColor: t.bg, color: t.fg }}
                  >
                    <TIcon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form action={createProgram} className="space-y-5">
          {/* hidden design values */}
          <input type="hidden" name="backgroundColor" value={bg} />
          <input type="hidden" name="foregroundColor" value={fg} />
          <input type="hidden" name="stampIcon" value={icon} />

          <div className="space-y-1.5">
            <Label htmlFor="name">Card name</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="stampsRequired">Stamps required</Label>
              <Input id="stampsRequired" name="stampsRequired" type="number" min={1} max={50} value={stamps} onChange={(e) => setStamps(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reward">Reward</Label>
              <Input id="reward" name="rewardTitle" value={reward} onChange={(e) => setReward(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rewardDetails">
              Reward details <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input id="rewardDetails" name="rewardDescription" value={rewardDetails} onChange={(e) => setRewardDetails(e.target.value)} />
          </div>

          {/* Design */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Design</p>
            <div className="mt-4 flex flex-wrap items-end gap-6">
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
            </div>

            <p className="mt-5 text-xs font-medium text-muted-foreground">
              Stamp icon
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {STAMP_ICON_KEYS.map((key) => {
                const IconC = STAMP_ICONS[key];
                const active = key === icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIcon(key)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <IconC className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Create card
          </Button>
        </form>
      </div>

      {/* Live preview */}
      <div className="lg:col-span-2">
        <div className="sticky top-24">
          <p className="mb-3 text-sm font-semibold text-foreground">
            Live preview
          </p>
          <WalletCardPreview
            businessName={businessName}
            programName={name}
            rewardTitle={reward}
            stampsRequired={required}
            currentStamps={previewFilled}
            backgroundColor={bg}
            foregroundColor={fg}
            stampIcon={icon}
          />
          <p className="mt-4 text-xs text-muted-foreground">
            This is how your card appears in Apple &amp; Google Wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
