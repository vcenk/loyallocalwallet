import { Star, Bell } from "lucide-react";

// A phone on its lock screen with the LoyalLocal wallet card and a floating
// notification — shows the "lives on the lock screen" wallet moment. Pure CSS.
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[270px]">
      {/* Floating lock-screen notification */}
      <div className="hero-badge-float absolute -right-6 top-24 z-20 w-60 rounded-2xl bg-white/95 p-3 shadow-2xl ring-1 ring-black/5 backdrop-blur">
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Bell className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-foreground">
              Main Street Cafe
            </p>
            <p className="text-[11px] text-muted-foreground">
              You&apos;re 1 stamp from a free coffee ☕
            </p>
          </div>
        </div>
      </div>

      {/* Phone frame */}
      <div className="relative rounded-[2.75rem] bg-[#1c110e] p-2.5 shadow-2xl">
        <div
          className="relative overflow-hidden rounded-[2.3rem]"
          style={{
            aspectRatio: "9 / 19",
            background:
              "linear-gradient(160deg, #7a2513 0%, #ae3115 45%, #c0421e 100%)",
          }}
        >
          {/* notch */}
          <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/70" />

          {/* soft glow */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 40% at 70% 12%, rgba(255,138,110,0.5), transparent 60%)",
            }}
          />

          {/* lock-screen clock */}
          <div className="relative mt-16 text-center text-white">
            <p className="text-sm font-medium opacity-80">Saturday, July 5</p>
            <p className="font-display text-6xl font-bold tracking-tight">9:41</p>
          </div>

          {/* wallet card peeking from bottom */}
          <div className="absolute inset-x-4 bottom-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#3c2320] to-[#261815] p-4 text-white shadow-xl ring-1 ring-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-widest opacity-80">
                  Main Street Cafe
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary">
                  M
                </span>
              </div>
              <p className="mt-2 font-display text-base font-bold">
                Coffee Rewards
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span
                    key={i}
                    className="flex h-4 w-4 items-center justify-center rounded-full border border-white/60"
                    style={{ background: i < 9 ? "#fff" : "transparent" }}
                  >
                    {i < 9 ? <Star className="h-2 w-2 text-primary" /> : null}
                  </span>
                ))}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[10px]">
                <span className="opacity-90">9 of 10 stamps</span>
                <span className="font-semibold">Free coffee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
