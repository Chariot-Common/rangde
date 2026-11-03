"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FAQS_URL, faqGroups, type Faq } from "@/data/faqs";
import { FaqScene, hasFaqScene } from "@/components/faq/FaqScenes";

// The original two tints, green and blue, alternating by the question's FAQ group (as on
// rangde.in/faqs); a pill and its pop-up share a colour.
const TINTS = ["#E8F3DE", "#DCEFF8"];
const tintOf = (faq: Faq) => TINTS[Math.max(0, faqGroups.findIndex((g) => g.faqs.some((f) => f.answer === faq.answer))) % TINTS.length];

/**
 * The FAQ as pills (Version B): every question is a green or blue pill, wrapped and centred, and tapping one opens it in a pop-up: an illustration on the left (a scene in the
 * How it works story's style, components/faq/FaqScenes.tsx), the question and answer on the right.
 */
export function FAQPills({ faqs, heading = "What do people ask us the most?" }: { faqs: Faq[]; heading?: string }) {
  const [open, setOpen] = useState<{ faq: Faq; tint: string } | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <section className="w-full px-4 pb-20 pt-8 sm:px-8 sm:pt-12 md:pb-24 lg:pb-[120px]">
      <h2 className="text-center font-display text-h3 font-bold text-ink">{heading}</h2>

      <div className="mx-auto mt-10 flex w-full max-w-[1240px] flex-wrap justify-center gap-3 lg:mt-14">
        {faqs.map((faq, i) => {
          const tint = tintOf(faq);
          return (
            <motion.button
              key={faq.question}
              type="button"
              onClick={() => setOpen({ faq, tint })}
              className="rounded-full border border-ink/8 px-4 py-2.5 text-left font-display text-p3 font-bold text-ink xl:px-5 xl:py-3 xl:text-p2 transition-[filter,transform] hover:brightness-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98]"
              style={{ backgroundColor: tint }}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45, delay: Math.min(i, 10) * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              {faq.question}
            </motion.button>
          );
        })}
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

      <dialog
        ref={ref}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === ref.current && setOpen(null)}
        aria-label={open?.faq.question ?? "FAQ"}
        className="m-auto w-[min(1200px,calc(100vw-32px))] overflow-visible rounded-[16px] bg-white p-0 backdrop:bg-black/56 backdrop:backdrop-blur-sm"
      >
        {open && (
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 flex size-[40px] items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_1px_4px_rgb(0_0_0/0.12)] transition-[filter,transform] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-95 lg:right-4 lg:top-4"
          >
            <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
        {open && (
          // Illustration left (540 × 540 on laptops), question and answer right; stacked on phones.
          <div className="flex max-h-[calc(100svh-48px)] flex-col overflow-y-auto lg:grid lg:h-[540px] lg:grid-cols-[540px_1fr] lg:overflow-hidden">
            <div
              className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-t-[16px] lg:aspect-auto lg:h-[540px] lg:rounded-l-[16px] lg:rounded-tr-none"
              style={{ backgroundColor: open.tint }}
            >
              {hasFaqScene(open.faq.question) ? (
                <FaqScene question={open.faq.question} />
              ) : (
                open.faq.illustration && <Image src={open.faq.illustration} alt="" fill sizes="(min-width: 1024px) 540px, 100vw" className="object-contain" />
              )}
            </div>
            <div className="flex flex-col gap-3 p-6 sm:p-8 lg:overflow-y-auto lg:p-12">
              {/* Right padding on laptops keeps the question clear of the close icon. */}
              <h3 className="font-display text-h4 font-bold text-ink lg:pr-8">{open.faq.question}</h3>
              <p className="whitespace-pre-line font-body text-p2 leading-[28px] text-ink/72">{open.faq.answer}</p>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
