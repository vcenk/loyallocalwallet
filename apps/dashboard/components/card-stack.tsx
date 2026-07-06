import { Wifi } from "lucide-react";

// Three loyalty cards floating in an isometric stack (Lava-style), in the warm
// LoyalLocal palette. Pure CSS animation — each card bobs on its own delay.
const CARDS = [
  {
    gradient: "linear-gradient(135deg, #ff8a6e 0%, #f0a24b 100%)",
    top: "8%",
    left: "10%",
    delay: "0s",
    z: 30,
  },
  {
    gradient: "linear-gradient(135deg, #c0421e 0%, #ae3115 100%)",
    top: "30%",
    left: "0%",
    delay: "0.7s",
    z: 20,
  },
  {
    gradient: "linear-gradient(135deg, #3c2320 0%, #261815 100%)",
    top: "52%",
    left: "-8%",
    delay: "1.4s",
    z: 10,
  },
];

export function CardStack() {
  return (
    <div
      className="relative mx-auto h-[440px] w-full max-w-md"
      style={{ perspective: "1600px" }}
    >
      {CARDS.map((c, i) => (
        <div
          key={i}
          className="absolute w-[300px]"
          style={{ top: c.top, left: c.left, zIndex: c.z }}
        >
          <div className="card-float" style={{ animationDelay: c.delay }}>
            <div
              className="relative flex aspect-[1.586/1] flex-col justify-between rounded-2xl p-5 text-white shadow-2xl"
              style={{
                background: c.gradient,
                transform: "rotateX(56deg) rotateZ(-42deg)",
                transformStyle: "preserve-3d",
                boxShadow: "0 40px 60px -20px rgba(38,24,21,0.45)",
              }}
            >
              {/* soft light bloom */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "radial-gradient(60% 60% at 30% 20%, rgba(255,255,255,0.35), transparent 70%)",
                }}
              />
              <div className="relative flex items-start justify-between">
                <span className="font-display text-lg font-extrabold tracking-tight">
                  LOYAL.
                </span>
                <Wifi className="h-4 w-4 rotate-90 opacity-90" />
              </div>
              <div className="relative">
                <span className="block h-6 w-9 rounded-md bg-white/70 shadow-inner" />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest opacity-80">
                    Main Street Cafe
                  </span>
                  <span className="text-[10px] font-bold opacity-90">
                    7 / 10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
