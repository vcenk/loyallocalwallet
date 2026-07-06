"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const INDUSTRIES = [
  "Café",
  "Coffee roaster",
  "Bubble tea",
  "Juice & smoothie bar",
  "Bakery",
  "Dessert shop",
  "Ice cream shop",
  "Restaurant",
  "Food truck",
  "Barber",
  "Hair salon",
  "Nail salon",
  "Pet groomer",
  "Gift shop",
];

const OTHER = "__other";

const FIELD =
  "flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

export function IndustrySelect({ defaultValue = "" }: { defaultValue?: string }) {
  const isKnown = INDUSTRIES.includes(defaultValue);
  const [choice, setChoice] = useState(
    defaultValue ? (isKnown ? defaultValue : OTHER) : "",
  );
  const [custom, setCustom] = useState(isKnown ? "" : defaultValue);

  const isOther = choice === OTHER;
  const value = isOther ? custom : choice;

  return (
    <div className="space-y-2">
      {/* actual submitted value */}
      <input type="hidden" name="industry" value={value} />

      <div className="relative">
        <select
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          className={`${FIELD} appearance-none pr-9`}
        >
          <option value="">Select your industry…</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
          <option value={OTHER}>+ Add your own…</option>
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          ▾
        </span>
      </div>

      {isOther ? (
        <div className="relative">
          <Plus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Type your industry"
            autoFocus
            className={`${FIELD} pl-9`}
          />
        </div>
      ) : null}
    </div>
  );
}
