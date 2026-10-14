/** Rang De's headline numbers — the same public feed rangde.in's homepage reads (rangde.in/stats/v2). */
export interface RangDeStats {
  /** "Entrepreneurs backed" / loans fulfilled since the P2P launch (Sep 2019). */
  entrepreneurs: number;
  /** Total loans disbursed, in crore rupees. */
  disbursedCr: number;
  /** Social investors on the platform. */
  investors: number;
  /** NRI and OCI investors among them. */
  investorsAbroad: number;
  /** 100 − principal lost %. */
  principalRepaidPct: number;
  /** States with active loans. */
  states: number;
}

/** Captured from rangde.in/stats/v2 on 14 Oct 2026 — only used if the live request fails. */
export const STATS_SNAPSHOT: RangDeStats = {
  entrepreneurs: 31_702,
  disbursedCr: 122.45,
  investors: 11_839,
  investorsAbroad: 1_320,
  principalRepaidPct: 99.71,
  states: 29,
};

const STATS_URL = "https://rangde.in/stats/v2";
const num = (v: unknown) => Number(String(v).replace(/,/g, ""));

export async function getRangDeStats(): Promise<RangDeStats> {
  try {
    const res = await fetch(STATS_URL, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(String(res.status));
    const d = await res.json();
    const stats: RangDeStats = {
      entrepreneurs: num(d.loansFulfilled),
      disbursedCr: Math.round((num(d.totalAmountDisbursed) / 1e7) * 100) / 100,
      investors: num(d.noOfSocialInvestorsInt ?? d.noOfSocialInvestors),
      investorsAbroad: num(d.totalNoOfNRIandOCIs),
      principalRepaidPct: Math.round((100 - num(d.writtenOffPrincipalPct)) * 100) / 100,
      states: num(d.activeLoanStatesCount),
    };
    // Any field that didn't parse falls back to the snapshot rather than showing NaN.
    for (const k of Object.keys(stats) as (keyof RangDeStats)[]) {
      if (!Number.isFinite(stats[k]) || stats[k] <= 0) stats[k] = STATS_SNAPSHOT[k];
    }
    return stats;
  } catch {
    return STATS_SNAPSHOT;
  }
}

/** 31,702 → "31,700+" — for running copy, where an exact live figure would read oddly. */
export function roundedPlus(n: number, step = 100) {
  return `${(Math.floor(n / step) * step).toLocaleString("en-IN")}+`;
}
