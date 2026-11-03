"use client";

import { useHowItWorks } from "./HowItWorksContext";

/** Small reusable trigger — lets server components (e.g. Hero) drop in an "opens the
 * How It Works overlay" button without themselves needing to become client components.
 * Passes its own rect along, so the overlay grows out of this button. */
export function HowItWorksTrigger({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const { open } = useHowItWorks();
  return (
    <button type="button" onClick={(e) => open(0, e.currentTarget.getBoundingClientRect())} className={className}>
      {children}
    </button>
  );
}
