"use client";

import { usePathname } from "next/navigation";

/** The main call to action's label: Version B ("The idea", /v/idea) says "Invest now". */
export function useCtaLabel() {
  return usePathname()?.startsWith("/v/idea") ? "Invest now" : "Get started";
}
