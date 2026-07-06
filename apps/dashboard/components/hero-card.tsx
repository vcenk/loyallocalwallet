"use client";

import { useEffect, useState } from "react";
import { Check, Star } from "lucide-react";

const TOTAL = 10;
const START = 5;

// A living wallet card: stamps fill one-by-one on a loop, the counter and the
// floating badge update live, and the whole card gently floats with a sheen.
export function HeroCard() {
  const [filled, setFilled] = useState(START);
  const [justAdded, setJustAdded] = useState(-1);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = setInterval(() => {
      setFilled((prev) => {
        if (prev >= TOTAL) {
          setJustAdded(-1);
          return START; // reset and climb again
        }
        setJustAdded(prev); // index of the stamp that just landed
        return prev + 1;
      });
    }, 1400);

    return () => clearInterval(id);
  }, []);

  const remaining = TOTAL - filled;
  const ready = remaining <= 0;

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -right-6 top-8 hidden h-full w-full rotate-6 rounded-[2rem] bg-[#f6ddd8] sm:block" />

      <div className="hero-float relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#c0421e] to-[#ae3115] p-7 text-white shadow-2xl shadow-primary/30">
        {/* sweeping sheen */}
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
            Main Street Cafe
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
            M
          </span>
        </div>

        <p className="relative mt-6 font-display text-2xl font-bold">
          Coffee Rewards
        </p>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {Array.from({ length: TOTAL }).map((_, i) => {
            const on = i < filled;
            return (
              <span
                key={i}
                className={`flex h-6 w-6 items-center justify-center rounded-full border border-white/70 ${
                  i === justAdded ? "stamp-pop" : ""
                }`}
                style={{ background: on ? "#fff" : "transparent" }}
              >
                {on ? <Star className="h-3 w-3 text-primary" /> : null}
              </span>
            );
          })}
        </div>

        <div className="relative mt-6 flex items-center justify-between text-sm">
          <span className="opacity-90">
            {filled} of {TOTAL} stamps
          </span>
          <span className="font-semibold">Free coffee</span>
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
              <p className="text-[11px] text-muted-foreground">Free coffee 🎉</p>
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
