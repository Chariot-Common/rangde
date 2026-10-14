"use client";

import { createContext, useContext, type ReactNode } from "react";
import { STATS_SNAPSHOT, type RangDeStats } from "@/lib/stats";

const StatsContext = createContext<RangDeStats>(STATS_SNAPSHOT);

/** Hands the live rangde.in numbers (fetched once in the root layout) to any section. */
export function StatsProvider({ stats, children }: { stats: RangDeStats; children: ReactNode }) {
  return <StatsContext.Provider value={stats}>{children}</StatsContext.Provider>;
}

export const useRangDeStats = () => useContext(StatsContext);
