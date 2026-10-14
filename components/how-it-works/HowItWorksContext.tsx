"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface HowItWorksContextValue {
  isOpen: boolean;
  /** Bumped on every `open()` call — the modal keys its step-index state off this so
   * reopening always restarts at step 1, without needing a setState-in-effect reset. */
  sessionId: number;
  /** Step the overlay opens at (0-based) — lets a CTA deep-link to a specific step. */
  initialStep: number;
  open: (step?: number) => void;
  close: () => void;
}

const HowItWorksContext = createContext<HowItWorksContextValue | null>(null);

/**
 * Lives at the root layout (alongside PageLoader) so any component — the nav's "How it
 * works" link, a Hero CTA, a future footer link — can open the same overlay without
 * prop-drilling through unrelated sibling sections.
 */
export function HowItWorksProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(0);
  const [initialStep, setInitialStep] = useState(0);
  const open = useCallback((step = 0) => {
    setInitialStep(step);
    setIsOpen(true);
    setSessionId((id) => id + 1);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, sessionId, initialStep, open, close }), [isOpen, sessionId, initialStep, open, close]);

  return <HowItWorksContext.Provider value={value}>{children}</HowItWorksContext.Provider>;
}

export function useHowItWorks() {
  const ctx = useContext(HowItWorksContext);
  if (!ctx) throw new Error("useHowItWorks must be used within a HowItWorksProvider");
  return ctx;
}
