import { Check, X, Minus } from "lucide-react";

type Cell = "yes" | "no" | "partial";

const COLS = ["LoyalLocal", "Paper punch card", "Punch-card app"] as const;

const ROWS: { feature: string; cells: [Cell, Cell, Cell] }[] = [
  { feature: "Lives in Apple & Google Wallet", cells: ["yes", "no", "partial"] },
  { feature: "No app for customers to download", cells: ["yes", "yes", "no"] },
  { feature: "Updates instantly after every stamp", cells: ["yes", "no", "yes"] },
  { feature: "Lock-screen reminders", cells: ["yes", "no", "partial"] },
  { feature: "Shows who's fading away", cells: ["yes", "no", "no"] },
  { feature: "One-tap win-back campaigns", cells: ["yes", "no", "no"] },
  { feature: "Can't be lost, damaged, or forged", cells: ["yes", "no", "yes"] },
  { feature: "Your logo, colors & reward", cells: ["yes", "partial", "partial"] },
  { feature: "Flat monthly price", cells: ["yes", "no", "partial"] },
];

function Icon({ cell }: { cell: Cell }) {
  if (cell === "yes")
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)]">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  if (cell === "partial")
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Minus className="h-4 w-4" />
      </span>
    );
  return (
    <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-400">
      <X className="h-4 w-4" strokeWidth={3} />
    </span>
  );
}

export function ComparisonTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white/70 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="p-5 text-sm font-semibold text-muted-foreground">
                Feature
              </th>
              {COLS.map((c, i) => (
                <th
                  key={c}
                  className={`p-5 text-center text-sm font-bold ${
                    i === 0
                      ? "bg-primary/5 font-display text-base text-primary"
                      : "text-foreground"
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr
                key={r.feature}
                className="border-b border-border/60 last:border-0"
              >
                <td className="p-5 text-sm font-medium text-foreground">
                  {r.feature}
                </td>
                {r.cells.map((cell, i) => (
                  <td
                    key={i}
                    className={`p-5 ${i === 0 ? "bg-primary/5" : ""}`}
                  >
                    <Icon cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
