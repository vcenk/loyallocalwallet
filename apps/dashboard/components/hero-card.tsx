"use client";

import { useEffect, useState } from "react";
import { Check, Coffee, Heart, Scissors, Cookie, type LucideIcon } from "lucide-react";

type Shop = {
  name: string;
  program: string;
  reward: string;
  letter: string;
  gradient: string;
  ink: string;
  icon: LucideIcon;
  total: number;
  start: number;
};

// The hero card cycles through different local shops — each with its own
// colors, reward, and stamp icon — while stamps fill in on a loop.
const SHOPS: Shop[] = [
  {
    name: "Main Street Cafe",
    program: "Coffee Rewards",
    reward: "Free coffee",
    letter: "M",
    gradient: "linear-gradient(135deg, #c0421e 0%, #ae3115 100%)",
    ink: "#ae3115",
    icon: Coffee,
    total: 10,
    start: 4,
  },
  {
    name: "Bella Nails",
    program: "Nail Club",
    reward: "$15 off",
    letter: "B",
    gradient: "linear-gradient(135deg, #db2777 0%, #9d174d 100%)",
    ink: "#9d174d",
    icon: Heart,
    total: 6,
    start: 2,
  },
  {
    name: "The Corner Barber",
    program: "Cuts Club",
    reward: "Free cut",
    letter: "C",
    gradient: "linear-gradient(135deg, #334155 0%, #111827 100%)",
    ink: "#111827",
    icon: Scissors,
    total: 8,
    start: 3,
  },
  {
    name: "Sunrise Bakery",
    program: "Bakery Rewards",
    reward: "Free pastry",
    letter: "S",
    gradient: "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
    ink: "#92400e",
    icon: Cookie,
    total: 8,
    start: 3,
  },
];

export function HeroCard() {
  const [index, setIndex] = useState(0);
  const [filled, setFilled] = useState(SHOPS[0].start);

  const shop = SHOPS[index];

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // Fill one stamp at a time; once full, pause then switch to the next shop.
    if (filled < shop.total) {
      const t = setTimeout(() => setFilled((f) => f + 1), 430);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const next = (index + 1) % SHOPS.length;
      setIndex(next);
      setFilled(SHOPS[next].start);
    }, 1700);
    return () => clearTimeout(t);
  }, [index, filled, shop.total]);

  const remaining = shop.total - filled;
  const ready = remaining <= 0;
  const Icon = shop.icon;

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -right-6 top-8 hidden h-full w-full rotate-6 rounded-[2rem] bg-[#f6ddd8] sm:block" />

      <div className="hero-float relative">
        {/* keyed inner re-mounts on shop change → swap animation plays */}
        <div
          key={index}
          className="card-swap relative overflow-hidden rounded-[2rem] p-7 text-white shadow-2xl shadow-primary/30"
          style={{ background: shop.gradient }}
        >
          <span
            aria-hidden
            className="hero-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-1/2"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
            }}
          />

          <div className="relative flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
              {shop.name}
            </span>
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold"
              style={{ color: shop.ink }}
            >
              {shop.letter}
            </span>
          </div>

          <p className="relative mt-6 font-display text-2xl font-bold">
            {shop.program}
          </p>

          <div className="relative mt-5 flex flex-wrap gap-2">
            {Array.from({ length: shop.total }).map((_, i) => {
              const on = i < filled;
              return (
                <span
                  key={i}
                  className={`flex h-6 w-6 items-center justify-center rounded-full border border-white/70 ${
                    on && i === filled - 1 ? "stamp-pop" : ""
                  }`}
                  style={{ background: on ? "#fff" : "transparent" }}
                >
                  {on ? <Icon className="h-3 w-3" style={{ color: shop.ink }} /> : null}
                </span>
              );
            })}
          </div>

          <div className="relative mt-6 flex items-center justify-between text-sm">
            <span className="opacity-90">
              {filled} of {shop.total} stamps
            </span>
            <span className="font-semibold">{shop.reward}</span>
          </div>
        </div>
      </div>

      <div className="hero-badge-float absolute -bottom-5 -left-5 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f4ec] text-[color:var(--success)]">
          <Check className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          {ready ? (
            <>
              <p className="text-xs font-bold text-foreground">Reward ready</p>
              <p className="text-[11px] text-muted-foreground">{shop.reward} 🎉</p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-foreground">
                {remaining} more visit{remaining === 1 ? "" : "s"}
              </p>
              <p className="text-[11px] text-muted-foreground">until a reward</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
