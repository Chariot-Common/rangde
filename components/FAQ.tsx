"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FAQS_URL, type FaqGroup } from "@/data/faqs";

interface FAQProps {
  groups: FaqGroup[];
  heading?: string;
}

/** Down-caret that flips up when open — clearer than +/× about what a click does. Drawn as
 * one SVG stroke so its weight stays identical through the rotation. */
function CaretIcon({ open }: { open: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-[22px] shrink-0 text-ink/64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ rotate: open ? 180 : 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
    >
      <path d="M6 9l6 6 6-6" />
    </motion.svg>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  isFirst: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function FAQItem({ question, answer, isOpen, isFirst, onOpen, onClose }: FAQItemProps) {
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const buttonId = useId();

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape" && isOpen) {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className={isFirst ? "" : "border-t border-ink/16"}>
      <h3 className="m-0">
        <button
          id={buttonId}
          type="button"
          className="flex w-full items-center justify-between gap-[24px] py-[24px] text-left"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => (isOpen ? onClose() : onOpen())}
          onKeyDown={handleKeyDown}
        >
          <span className="font-display text-p1 font-bold text-ink">{question}</span>
          <CaretIcon open={isOpen} />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { height: 0, opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="whitespace-pre-line pb-[24px] font-body text-p2 leading-[28px] text-ink/64">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Editorial FAQ accordion — centred heading, a short selection of the live FAQs as one
 * list, one item open at a time, and a "See all FAQs" link to the full page.
 */
export function FAQ({ groups, heading = "FAQ" }: FAQProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <section className="w-full px-4 pb-20 pt-8 sm:px-8 sm:pt-12 md:pb-24 lg:pb-[120px]">
      <h2 className="text-center font-display text-h3 font-bold text-ink">{heading}</h2>

      {/* One continuous list; the groups only keep the data organised like rangde.in/faqs. */}
      <div className="mx-auto mt-12 w-full max-w-[720px] lg:mt-16">
        {groups
          .flatMap((group) => group.faqs)
          .map((faq, i) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openKey === faq.question}
              isFirst={i === 0}
              onOpen={() => setOpenKey(faq.question)}
              onClose={() => setOpenKey(null)}
            />
          ))}
      </div>

      <div className="mt-12 flex justify-center">
        <a
          href={FAQS_URL}
          className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[4px] bg-primary/12 px-8 font-display text-p3 font-bold text-primary transition-colors hover:bg-primary/20"
        >
          See all FAQs
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
