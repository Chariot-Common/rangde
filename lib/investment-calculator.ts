/**
 * FRONTEND PROTOTYPE CALCULATIONS — not real financial logic.
 *
 * The Figma design (and follow-up spec) only gives four reference points
 * (₹10,000 / ₹75,000 / ₹1,00,000 / ₹5,00,000) with approximate ranges for returns, jobs,
 * avatars and money icons — not a formula. Everything below piecewise-linearly
 * interpolates between those reference points so the calculator responds smoothly to any
 * slider position in between. Replace with the real business logic / API-backed
 * calculation before this ships.
 */

export const SLIDER_MIN = 1_000;
export const SLIDER_MAX = 500_000;
export const SLIDER_STEP = 1_000;
export const SLIDER_DEFAULT = 100_000;

export const MAX_AVATARS = 7;

interface ReferencePoint {
  amount: number;
  returnMin: number;
  returnMax: number;
  jobsMin: number;
  jobsMax: number;
  avatarCount: number;
}

const REFERENCE_POINTS: ReferencePoint[] = [
  { amount: 10_000, returnMin: 600, returnMax: 1_000, jobsMin: 3, jobsMax: 10, avatarCount: 1 },
  { amount: 75_000, returnMin: 4_500, returnMax: 5_000, jobsMin: 25, jobsMax: 35, avatarCount: 3 },
  { amount: 100_000, returnMin: 6_000, returnMax: 10_000, jobsMin: 30, jobsMax: 80, avatarCount: 5 },
  { amount: 500_000, returnMin: 30_000, returnMax: 40_000, jobsMin: 120, jobsMax: 210, avatarCount: 7 },
];

// Figma's cash icon isn't a count of repeated icons — it's a single icon drawn as a
// thicker stack of bills at each of the 4 reference amounts (1-indexed stage,
// see /images/calculator/cash-icon-{1..4}.png). The slider position picks whichever
// stage's amount it's closest to, split at the midpoints between reference amounts.
export const CASH_ICON_STAGE_COUNT = REFERENCE_POINTS.length;

export function calculateCashIconStage(amount: number): number {
  for (let i = 0; i < REFERENCE_POINTS.length - 1; i++) {
    const midpoint = (REFERENCE_POINTS[i].amount + REFERENCE_POINTS[i + 1].amount) / 2;
    if (amount < midpoint) return i + 1;
  }
  return REFERENCE_POINTS.length;
}

function interpolate(amount: number, pick: (point: ReferencePoint) => number): number {
  const first = REFERENCE_POINTS[0];
  const last = REFERENCE_POINTS[REFERENCE_POINTS.length - 1];
  const clamped = Math.min(Math.max(amount, first.amount), last.amount);

  for (let i = 0; i < REFERENCE_POINTS.length - 1; i++) {
    const a = REFERENCE_POINTS[i];
    const b = REFERENCE_POINTS[i + 1];
    if (clamped >= a.amount && clamped <= b.amount) {
      const t = (clamped - a.amount) / (b.amount - a.amount);
      return pick(a) + (pick(b) - pick(a)) * t;
    }
  }
  return pick(last);
}

export interface InvestmentOutcome {
  /** Potential return (profit) — kept separate from the total. */
  returnMin: number;
  returnMax: number;
  /** Total amount received = investment amount + potential return. */
  totalMin: number;
  totalMax: number;
  jobsMin: number;
  jobsMax: number;
  avatarCount: number;
  cashIconStage: number;
}

export function calculateReturn(amount: number): { min: number; max: number } {
  return {
    min: Math.round(interpolate(amount, (p) => p.returnMin)),
    max: Math.round(interpolate(amount, (p) => p.returnMax)),
  };
}

export function calculateJobs(amount: number): { min: number; max: number } {
  return {
    min: Math.round(interpolate(amount, (p) => p.jobsMin)),
    max: Math.round(interpolate(amount, (p) => p.jobsMax)),
  };
}

export function calculateAvatarCount(amount: number): number {
  const count = Math.round(interpolate(amount, (p) => p.avatarCount));
  return Math.min(MAX_AVATARS, Math.max(1, count));
}

export function calculateInvestmentOutcome(amount: number): InvestmentOutcome {
  const potentialReturn = calculateReturn(amount);
  const jobs = calculateJobs(amount);

  return {
    returnMin: potentialReturn.min,
    returnMax: potentialReturn.max,
    totalMin: amount + potentialReturn.min,
    totalMax: amount + potentialReturn.max,
    jobsMin: jobs.min,
    jobsMax: jobs.max,
    avatarCount: calculateAvatarCount(amount),
    cashIconStage: calculateCashIconStage(amount),
  };
}

export function formatInr(value: number): string {
  return `₹ ${Math.round(value).toLocaleString("en-IN")}`;
}
