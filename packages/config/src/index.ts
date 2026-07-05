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
export const PROGRAM_TYPES = ["stamps", "points", "visits"] as const;
export type ProgramType = (typeof PROGRAM_TYPES)[number];

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
