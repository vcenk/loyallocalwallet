// @llw/config — shared plan limits, enums, constants, feature flags.

// Plan limits — see docs/pricing.md. Enforce via getPlanLimits(), never hardcode.
export const PLAN_LIMITS = {
  trial: { locations: 1, programs: 3, staff: 10, campaigns: true, export: false },
  starter: { locations: 1, programs: 1, staff: 3, campaigns: false, export: false },
  growth: { locations: 1, programs: 3, staff: 10, campaigns: true, export: true },
  pro: { locations: 3, programs: 10, staff: 30, campaigns: true, export: true },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;
export type PlanLimits = (typeof PLAN_LIMITS)[PlanKey];

export function getPlanLimits(planKey: string | null | undefined): PlanLimits {
  if (planKey && planKey in PLAN_LIMITS) {
    return PLAN_LIMITS[planKey as PlanKey];
  }
  return PLAN_LIMITS.trial;
}

// Program constants (mirror the DB enums; used for UI selects).
export const PROGRAM_TYPES = ["stamps", "points", "visits", "spend"] as const;
export type ProgramType = (typeof PROGRAM_TYPES)[number];

// How each reward model presents to shop + customer. The math is identical
// (calculateProgress sums quantity ÷ required); only the unit/label differ.
export interface RewardModel {
  key: ProgramType;
  label: string; // shown in the builder select
  unit: string; // "stamps" | "points" | "visits"
  currency: boolean; // spend mode → format as money
  fixedQuantity: number | null; // +1 per action (stamps/visits) or staff-entered (points/spend)
  actionVerb: string; // "Add stamp" | "Add points" | "Add visit" | "Record spend"
  targetLabel: string; // "Stamps required" | "Points per reward" | ...
  hint: string;
}

export const REWARD_MODELS: RewardModel[] = [
  { key: "stamps", label: "Stamp card", unit: "stamps", currency: false, fixedQuantity: 1, actionVerb: "Add stamp", targetLabel: "Stamps required", hint: "A stamp per visit — buy 9, get 1 free." },
  { key: "points", label: "Points", unit: "points", currency: false, fixedQuantity: null, actionVerb: "Add points", targetLabel: "Points per reward", hint: "Earn points per purchase; redeem at a target." },
  { key: "visits", label: "Visit count", unit: "visits", currency: false, fixedQuantity: 1, actionVerb: "Add visit", targetLabel: "Visits required", hint: "Count each visit toward a reward." },
  { key: "spend", label: "Money spent", unit: "$", currency: true, fixedQuantity: null, actionVerb: "Record spend", targetLabel: "Spend target ($)", hint: "Track dollars spent; reward at a threshold." },
];

export function rewardModel(type: ProgramType | string): RewardModel {
  return REWARD_MODELS.find((m) => m.key === type) ?? REWARD_MODELS[0];
}

// Format a single value: "6 stamps", "60 points", "$60".
export function formatUnits(type: ProgramType | string, value: number): string {
  const m = rewardModel(type);
  return m.currency ? `$${value}` : `${value} ${m.unit}`;
}

// Format progress: "6 of 10 stamps", "$60 of $100".
export function formatProgressText(
  type: ProgramType | string,
  value: number,
  required: number,
): string {
  const m = rewardModel(type);
  return m.currency
    ? `$${value} of $${required}`
    : `${value} of ${required} ${m.unit}`;
}

export const PROGRAM_STATUSES = ["draft", "active", "paused", "archived"] as const;
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

// Editable-in-UI statuses (archived is a terminal state set elsewhere).
export const EDITABLE_PROGRAM_STATUSES = ["draft", "active", "paused"] as const;

export const DEFAULT_STAMPS_REQUIRED = 10;

// Bonus stamp reasons (docs/design.md §5). Used by staff bonus-stamp UI.
export const BONUS_STAMP_REASONS = [
  "Referral",
  "Social share",
  "Birthday",
  "Manager bonus",
  "Apology / service recovery",
  "Special event",
] as const;

// ---------------------------------------------------------------------------
// Progress calculation — the ONE shared function (CLAUDE.md rule).
// Sums stamp_events.quantity (earn + bonus + adjustment − remove) per pass.
// program_type is a parameter so points/visits modes can diverge later without
// refactoring callers (scan, stamp, redeem, analytics all use this).
// ---------------------------------------------------------------------------
export type StampEventType = "earn" | "bonus" | "adjustment" | "remove";

export interface StampEventInput {
  event_type: StampEventType | string;
  quantity: number | null;
}

export interface Progress {
  /** Net unredeemed units (stamps/points/visits). */
  total: number;
  /** Units needed per reward. */
  required: number;
  /** Whole rewards currently available to redeem. */
  rewardsAvailable: number;
  /** Units toward the next reward (0..required-1). */
  towardNext: number;
  /** True when at least one reward is available. */
  complete: boolean;
}

export function calculateProgress(params: {
  programType: ProgramType;
  stampsRequired: number;
  events: StampEventInput[];
}): Progress {
  const required = Math.max(1, params.stampsRequired || 1);

  let total = 0;
  for (const e of params.events) {
    const q = e.quantity ?? 0;
    switch (e.event_type) {
      case "earn":
      case "bonus":
      case "adjustment":
        total += q; // adjustment may carry a negative quantity
        break;
      case "remove":
        total -= q;
        break;
    }
  }
  total = Math.max(0, total);

  const rewardsAvailable = Math.floor(total / required);
  const towardNext = total % required;
  return { total, required, rewardsAvailable, towardNext, complete: rewardsAvailable > 0 };
}
