"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { FAQS_URL } from "@/data/faqs";
import { Icon, type IconName } from "@/components/ui";
import { FactChip, QUESTION_CARDS } from "./approaches";
import { ScrollInk } from "./ScrollInk";

// Each question's own icon on the coin's face (Figma "FAQ assets", node 2917:86), in QUESTION_CARDS order.
const COIN_ICONS: IconName[] = ["faq-returns", "faq-secure", "faq-nri", "faq-warning"];

/**
 * The coin at the bottom right of a question card. Its face is the question's icon on text grey 48; when the
 * card is hovered (or focused from the keyboard) it flips over like a coin, turning about its vertical axis
 * in perspective (600ms, ease-out), to show a plus (at 80% opacity) on dark blue: the prompt to open the card.
 */
function FlipCoin({ icon, auto = false }: { icon: IconName; auto?: boolean }) {
  return (
    <span aria-hidden className="relative size-16 self-end perspective-near">
      <span className={`relative block size-full transition-transform duration-600 ease-out transform-3d ${auto ? "max-md:rotate-y-180" : ""} md:group-hover:rotate-y-180 md:group-focus-visible:rotate-y-180 motion-reduce:duration-0`}>
        <span className="absolute inset-zero flex items-center justify-center rounded-full bg-text-grey-48 shadow-popup backface-hidden">
          <Icon name={icon} />
        </span>
        <span className="absolute inset-zero flex rotate-y-180 items-center justify-center rounded-full bg-nav-navy shadow-popup backface-hidden">
          <Icon name="faq-plus" className="opacity-80" />
        </span>
      </span>
    </span>
  );
}

/*
 * Version 1.1's question cards: plain. Each is a light-grey card with the question at the top (ink) and a
 * "+" at the bottom right, a white plus in a text-grey-64 circle. The whole card is the button; it opens
 * a pop-up modal with the facts and the answer. (Bottom right keeps the question's lines clear above it, and
 * it's where a thumb lands on a phone.) Escape, the backdrop or the × closes the modal.
 * With `flip` (v6, v1.1) the plus is replaced by FlipCoin: the question's own icon, turning over to the plus on hover,
 * and the cards grow slightly and tint blue on hover. `navyLink` (v6): "Read more FAQs" in the nav's Login colours.
 */
/** `phoneHeading` (Version 1.1): an H3 over the cards on phones only, filling in as it is read.
 * `autoHighlight` (with `flip`, Version 1.1 phones): with no hover on a phone, one card at a time lights itself the way a hovered
 * one does (blue tint, a slight grow, the coin turning to the plus) so it reads as tappable: the first card whose top is
 * between a quarter and three quarters of the way down the screen; as it climbs past the quarter line the next takes over. */
/** `large` (Version 1.1): taller cards with the question at H4 size, so they read as a section of their own. */
/** `fadeIn` (Version 2): the cards fade in, one after another and rising a little, as they come into view (ease-out). */
export function PlainQuestionCards({ heading, phoneHeading, count = 4, flip = false, navyLink = false, autoHighlight = false, large = false, fadeIn = false }: { heading?: string; phoneHeading?: string; count?: 4 | 5; flip?: boolean; navyLink?: boolean; autoHighlight?: boolean; large?: boolean; fadeIn?: boolean }) {
  const cards = QUESTION_CARDS.slice(0, count);
  const reduce = useReducedMotion();
  const fade = fadeIn && !reduce;
  const [open, setOpen] = useState<number | null>(null);
  const [auto, setAuto] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!autoHighlight) return;
    const phone = window.matchMedia("(max-width: 767px)");
    let raf = 0;
    const pick = () => {
      raf = 0;
      if (!phone.matches) return setAuto(null);
      const vh = window.innerHeight;
      const tops = cardRefs.current.map((el) => el?.getBoundingClientRect().top ?? Infinity);
      let next = tops.findIndex((t) => t >= vh * 0.25 && t <= vh * 0.75);
      // Once the last card has passed the quarter line it stays lit, as there is no next card to take over.
      if (next === -1 && tops.length && tops[tops.length - 1] < vh * 0.25 && cardRefs.current[tops.length - 1]!.getBoundingClientRect().bottom > 0) next = tops.length - 1;
      setAuto(next === -1 ? null : next);
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(pick); };
    pick();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, [autoHighlight]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = open === null ? null : cards[open];

  return (
    <section className="mx-2 flex flex-col items-center gap-10 rounded-[16px] bg-white px-4 pb-12 pt-6 sm:px-8 md:py-20">
      {phoneHeading && <ScrollInk as="h2" tone="plain" text={phoneHeading} className="text-center font-display text-h3 font-bold md:hidden" />}
      {heading && <h2 className="text-center font-display text-h3 font-bold text-text-grey-100">{heading}</h2>}
      <div className={`grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 ${large ? "max-w-[1440px] lg:gap-4" : "max-w-[1200px]"}`}>
        {cards.map((c, i) => (
          <motion.button
            key={c.question}
            initial={fade ? { opacity: 0, y: 24 } : false}
            whileInView={fade ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            ref={(el) => { cardRefs.current[i] = el; }}
            type="button"
            aria-haspopup="dialog"
            aria-label={`Open: ${c.question}`}
            onClick={() => setOpen(i)}
            className={`group flex cursor-pointer flex-col justify-between gap-8 rounded-[16px] bg-bg-grey text-left ${large ? "min-h-[300px] p-6 sm:min-h-[400px] sm:p-8 lg:min-h-[500px] lg:rounded-[20px] lg:p-10" : "min-h-[220px] p-6 sm:min-h-[260px]"} ${flip ? `transition-[background-color,scale] duration-600 ease-out hover:scale-[1.025] hover:duration-1200 hover:bg-primary-8 ${auto === i ? "max-md:scale-[1.025] max-md:bg-primary-8" : ""}` : "transition-colors duration-200 hover:bg-text-grey-8"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-grey-100`}
          >
            <span className={`font-display font-bold text-text-grey-100 [text-wrap:balance] ${large ? "text-[24px] leading-[30px] md:text-h4 xl:text-[36px] xl:leading-[44px]" : "text-p1"}`}>{c.question}</span>
            {flip && COIN_ICONS[i] ? <span className={`flex self-end ${large ? "lg:scale-125 lg:origin-bottom-right" : ""}`}><FlipCoin icon={COIN_ICONS[i]} auto={auto === i} /></span> : <span aria-hidden className="flex size-[48px] items-center justify-center self-end rounded-full bg-text-grey-64 text-white transition-transform duration-200 group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>}
          </motion.button>
        ))}
      </div>
      <a
        href={FAQS_URL}
        className={`inline-flex h-[48px] items-center justify-center gap-2 rounded-[4px] px-8 font-display text-p3 font-bold transition-[color,background-color,filter] ${navyLink ? "bg-nav-sky text-nav-navy hover:brightness-95" : "bg-primary/12 text-primary hover:bg-primary/20"}`}
      >
        Read more FAQs
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>

      {current && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={current.question}>
          <button type="button" aria-label="Close" onClick={() => setOpen(null)} className={`absolute inset-0 cursor-default bg-text-grey-100/48 backdrop-blur-sm`} />
          <div className="relative flex max-h-[calc(100svh-32px)] w-full max-w-[560px] flex-col gap-4 overflow-y-auto rounded-[16px] bg-white p-6 shadow-[0_24px_64px_rgba(41,45,54,0.24)] sm:p-8">
            <button
              type="button"
              aria-label={`Close: ${current.question}`}
              onClick={() => setOpen(null)}
              className="absolute right-4 top-4 flex size-[40px] items-center justify-center rounded-full bg-text-grey-64 text-white transition-colors hover:bg-text-grey-80"
            >
              <svg viewBox="0 0 24 24" className="size-[18px] rotate-45" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <h3 className="pr-12 font-display text-p1 font-bold text-text-grey-100">{current.question}</h3>
            <ul className="flex flex-col gap-2">
              {current.facts.map((f) => (
                <FactChip key={f.text} {...f} />
              ))}
            </ul>
            <p className="whitespace-pre-line font-display text-p2 font-medium leading-[26px] text-text-grey-80">{current.answer}</p>
          </div>
        </div>
      )}
    </section>
  );
}
