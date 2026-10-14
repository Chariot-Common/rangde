"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useHowItWorks } from "@/components/how-it-works/HowItWorksContext";

const PRIMARY_LINKS = ["Home", "How it Works", "About", "FAQs", "Social Investors", "Track Record", "Blog", "Contact"];
const SECONDARY_LINKS = ["Partner with Us", "Impact Partners", "In the Press"];
const UTILITY_LINKS = ["Events", "Wall of Love"];

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const STAGGER = 0.06;

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const { open: openHowItWorks } = useHowItWorks();

  // Escape closes; Tab is trapped within the panel while it's open (it behaves like a
  // modal on both mobile and desktop, per the accessibility spec).
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    focusable?.[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const itemTransition = (i: number) =>
    reduceMotion
      ? { duration: 0 }
      : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const, delay: 0.08 + i * STAGGER };

  const allLinks = [...PRIMARY_LINKS, ...SECONDARY_LINKS, ...UTILITY_LINKS];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[90] bg-ink/20 sm:backdrop-blur-[2px]"
          style={{ top: "var(--navbar-bottom)" }}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={onClose}
        >
          {/* Anchored to the navbar's live bottom edge (--navbar-bottom, tracked by
              TopNav) rather than a guessed offset, and sized with dvh so it always
              reaches exactly to the bottom of the viewport — no gap, no floating box,
              no dependency on the announcement bar (which isn't part of the navbar). */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="ml-auto flex w-full flex-col overflow-y-auto bg-white px-6 py-8 sm:w-[420px] sm:px-8 sm:py-8 sm:shadow-[-8px_0_24px_rgba(3,21,56,0.08)]"
            style={{ height: "calc(100dvh - var(--navbar-bottom))" }}
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0, y: -8, transition: { duration: 0 } } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-[2px]">
              {PRIMARY_LINKS.map((link) =>
                link === "How it Works" ? (
                  <motion.button
                    key={link}
                    type="button"
                    onClick={() => {
                      onClose();
                      openHowItWorks();
                    }}
                    className="-mx-3 rounded-[8px] px-3 py-[6px] text-left font-display text-p2 font-bold text-ink transition-colors duration-200 hover:bg-bg-grey"
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={itemTransition(allLinks.indexOf(link))}
                  >
                    {link}
                  </motion.button>
                ) : (
                  <motion.a
                    key={link}
                    href="#"
                    className="-mx-3 rounded-[8px] px-3 py-[6px] font-display text-p2 font-bold text-ink transition-colors duration-200 hover:bg-bg-grey"
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={itemTransition(allLinks.indexOf(link))}
                  >
                    {link}
                  </motion.a>
                ),
              )}
            </nav>

            <div className="my-[14px] h-px w-full bg-ink/16" />

            <nav className="flex flex-col gap-[2px]">
              {SECONDARY_LINKS.map((link) => (
                <motion.a
                  key={link}
                  href="#"
                  className="-mx-3 rounded-[8px] px-3 py-[5px] font-display text-p3 font-medium text-ink/80 transition-colors duration-200 hover:bg-bg-grey"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={itemTransition(allLinks.indexOf(link))}
                >
                  {link}
                </motion.a>
              ))}
            </nav>

            <div className="my-[12px] h-px w-full bg-ink/16" />

            <nav className="flex flex-col gap-[2px]">
              {UTILITY_LINKS.map((link) => (
                <motion.a
                  key={link}
                  href="#"
                  className="-mx-3 rounded-[8px] px-3 py-[5px] font-display text-[11px] font-medium uppercase tracking-[0.5px] text-ink/48 transition-colors duration-200 hover:bg-bg-grey"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={itemTransition(allLinks.indexOf(link))}
                >
                  {link}
                </motion.a>
              ))}
            </nav>

            <motion.div
              className="mt-auto pt-[16px]"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={itemTransition(allLinks.length)}
            >
              <div className="relative h-[16px] w-[180px] max-w-full">
                <Image
                  src="/icons/social-icons-row.svg"
                  alt="Follow Rang De on social media"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
