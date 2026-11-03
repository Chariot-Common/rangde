"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface HowItWorksContextValue {
  isOpen: boolean;
  /** Bumped on every `open()` call — the modal keys its step-index state off this so
   * reopening always restarts at step 1, without needing a setState-in-effect reset. */
  sessionId: number;
  /** Step the overlay opens at (0-based) — lets a CTA deep-link to a specific step. */
  initialStep: number;
  /** Screen rect of the button that opened the overlay, if any — the modal grows out of it. */
  origin: DOMRect | null;
  open: (step?: number, origin?: DOMRect) => void;
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
  const [origin, setOrigin] = useState<DOMRect | null>(null);
  const open = useCallback((step = 0, from?: DOMRect) => {
    setInitialStep(step);
    setOrigin(from ?? null);
    setIsOpen(true);
    setSessionId((id) => id + 1);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, sessionId, initialStep, origin, open, close }), [isOpen, sessionId, initialStep, origin, open, close]);

  return <HowItWorksContext.Provider value={value}>{children}</HowItWorksContext.Provider>;
}

export function useHowItWorks() {
  const ctx = useContext(HowItWorksContext);
  if (!ctx) throw new Error("useHowItWorks must be used within a HowItWorksProvider");
  return ctx;
}
