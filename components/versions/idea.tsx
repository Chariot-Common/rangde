"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { imgix, type IndividualOpportunity } from "@/lib/opportunities";

// Version B ("The idea") — the Claude Design homepage's story (lend directly to a person;
// one loan, many outcomes; the Other Startup India; why returns aren't higher), rebuilt with
// the homepage's own components, colours and type. Real people and numbers only.

const EASE = [0.22, 1, 0.36, 1] as const;
const FACES = ["Rekha-42-img.jpg", "Vijay-004-img.jpg", "manawrmonika037-img.jpg", "nitin-jadhav-img.jpg"].map(
  (f) => `https://rangde.imgix.net/bImg/${f}?auto=compress,format&w=96&h=96&fit=facearea&facepad=2.2`,
);

// Gita Devi, from rangde.in's published success stories: 4 social investors, ₹20,000, 8% a year; she
// bought fish feed, worked more ponds, and the season brought her ₹20,000 in profit. The repayment
// schedule and the credit record below are illustrations, labelled as such on the card. The credit
// line ("her repayments go on record") matches the copy used elsewhere on the approach pages; confirm
// bureau reporting with Rang De before launch.
const GITA = { name: "Gita Devi", trade: "Fish farmer", avatar: "/images/stories/story-3-avatar.webp", raised: 20000, investors: 4, rate: "8% p.a." };
const STEP_MS = 6000;

const STAGES: { key: string; label: string; title: string; text: string }[] = [
  { key: "capital", label: "Capital", title: "People like you fund her loan", text: "Four social investors each put in a share. Once the ₹20,000 is raised, it goes straight to her bank account." },
  { key: "business", label: "Business", title: "Her business grows", text: "She buys fish feed and works more ponds. That season brings her ₹20,000 in profit." },
  { key: "repayment", label: "Repayment", title: "She repays, with interest", text: "Instalments follow a schedule agreed upfront, and each one goes back to her investors." },
  { key: "credit", label: "Credit history", title: "She builds a credit record", text: "Her repayments go on record, so the next lender can say yes too." },
  { key: "next", label: "The next person", title: "Your money goes round again", text: "What comes back to you can back someone new. One share can fund person after person." },
];

const tick = (
  <svg viewBox="0 0 12 12" className="size-[9px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2.5 6.2l2.3 2.3L9.5 3.8" />
  </svg>
);

/** What the loan card shows at each step: one card that changes as the story moves on. */
function StageVisual({ k, reduce }: { k: string; reduce: boolean }) {
  const t = (delay = 0) => ({ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay, ease: EASE });
  if (k === "capital")
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-h4 font-bold text-ink">₹20,000</p>
          <p className="font-display text-p4 font-bold text-green-dark">raised · {GITA.rate}</p>
        </div>
        <div className="h-[10px] overflow-hidden rounded-full bg-ink/8">
          <motion.div className="h-full rounded-full bg-green-dark" initial={{ width: reduce ? "100%" : "0%" }} animate={{ width: "100%" }} transition={t(0.15)} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex" aria-hidden>
            {Array.from({ length: GITA.investors }, (_, n) => (
              <motion.span
                key={n}
                className="flex size-[30px] items-center justify-center rounded-full border-2 border-white bg-[#cbe0b8] text-green-dark"
                style={{ marginLeft: n ? -9 : 0 }}
                initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={t(0.2 + n * 0.12)}
              >
                <svg viewBox="0 0 24 24" className="size-[16px]" fill="currentColor" aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" /></svg>
              </motion.span>
            ))}
          </div>
          <p className="font-display text-p4 font-medium text-ink/80">{GITA.investors} social investors</p>
        </div>
      </div>
    );
  if (k === "business")
    return (
      <div className="flex flex-col gap-3">
        <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/56">This season</p>
        <div className="flex items-end gap-2" aria-hidden>
          {[0.35, 0.5, 0.7, 1].map((h, n) => (
            <motion.div key={n} className="w-full rounded-t-[6px] bg-[#62af1d]" style={{ height: 72 * h, transformOrigin: "bottom" }} initial={reduce ? false : { scaleY: 0 }} animate={{ scaleY: 1 }} transition={t(0.1 + n * 0.12)} />
          ))}
        </div>
        <p className="font-display text-h4 font-bold text-green-dark">+ ₹20,000 profit</p>
        <p className="-mt-2 font-display text-p4 font-medium text-ink/72">More fish feed, more ponds worked</p>
      </div>
    );
  if (k === "repayment")
    return (
      <div className="flex flex-col gap-3">
        <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/56">Example schedule</p>
        <div className="grid grid-cols-6 gap-1.5" aria-hidden>
          {Array.from({ length: 12 }, (_, n) => (
            <motion.div
              key={n}
              className="flex aspect-square items-center justify-center rounded-[8px] font-display text-[11px] font-bold"
              initial={reduce ? false : { backgroundColor: "rgba(41,45,54,0.08)", color: "rgba(41,45,54,0.32)" }}
              animate={{ backgroundColor: "#3a6e0c", color: "#fff" }}
              transition={t(0.15 + n * 0.22)}
            >
              ₹
            </motion.div>
          ))}
        </div>
        <p className="font-display text-p4 font-medium text-ink/72">Each instalment goes back to her investors, with interest</p>
      </div>
    );
  if (k === "credit")
    return (
      <div className="flex flex-col gap-2">
        <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/56">Example credit record</p>
        {["First formal loan", "Repaid on schedule", "Eligible for a bigger loan"].map((line, n) => (
          <motion.div
            key={line}
            className="flex items-center justify-between rounded-[8px] bg-bg-grey px-3 py-2.5 font-display text-p4 font-bold text-ink"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={t(0.15 + n * 0.35)}
          >
            {line}
            <span className="flex size-[18px] items-center justify-center rounded-full bg-green-dark text-white">{tick}</span>
          </motion.div>
        ))}
      </div>
    );
  return (
    <div className="flex flex-col gap-3">
      <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/56">Your share, lent again</p>
      <div className="flex items-center gap-1.5 sm:gap-2" aria-hidden>
        <div className="relative size-[32px] shrink-0 overflow-hidden rounded-full ring-2 ring-white sm:size-[40px]">
          <Image src={GITA.avatar} alt="" fill sizes="40px" className="object-cover" />
        </div>
        {FACES.map((src, n) => (
          <div key={src} className="flex items-center gap-1.5 sm:gap-2">
            <motion.svg viewBox="0 0 24 24" className="size-[10px] text-ink/32 sm:size-[14px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={t(0.2 + n * 0.3)}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </motion.svg>
            <motion.div className="relative size-[32px] shrink-0 overflow-hidden rounded-full ring-2 ring-white sm:size-[40px]" initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={t(0.3 + n * 0.3)}>
              <Image src={src} alt="" fill unoptimized sizes="40px" className="object-cover" />
            </motion.div>
          </div>
        ))}
      </div>
      <p className="font-display text-p4 font-medium text-ink/72">Reinvested, the same money backs one entrepreneur after another</p>
    </div>
  );
}

/**
 * "One loan. More than one outcome." — one real loan (Gita Devi's) followed through five outcomes.
 * Left: who she is, then the five steps as a list; the open step shows its line and a bar for how long
 * until the story moves on, and any step can be opened. Right: her loan card, which changes with the
 * step so the story reads as one thing happening. It plays on its own and loops while on screen,
 * holds for a moment after a step is chosen, and doesn't move with reduced motion.
 */
export function OutcomeChain() {
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = !!useReducedMotion();
  const playing = inView && !chosen && !reduce;
  const stage = STAGES[i];

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setI((n) => (n + 1) % STAGES.length), STEP_MS);
    return () => clearTimeout(id);
  }, [i, playing]);

  // After a step is picked, let the reader take it in, then carry on.
  useEffect(() => {
    if (!chosen) return;
    const id = setTimeout(() => setChosen(false), 8000);
    return () => clearTimeout(id);
  }, [chosen, i]);

  return (
    <section className="relative mx-2 rounded-[16px] bg-[#F7F3ED] px-4 py-14 sm:px-8 md:py-24">
      <div ref={ref} className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-8 md:gap-12">
        <AnimatedText
          as="h2"
          segments={[
            { text: "One loan.", className: "text-ink" },
            { text: "More than one outcome.", className: "text-green-dark" },
          ]}
          className="text-center font-display text-[28px] font-bold leading-[32px] sm:text-h3 sm:leading-[48px]"
        />

        <div
          className="grid w-full grid-cols-1 gap-6 rounded-[16px] bg-white p-4 shadow-[0_1px_2px_rgba(41,45,54,0.06),0_12px_32px_rgba(41,45,54,0.06)] sm:p-8 md:grid-cols-[1fr_380px] md:gap-10 md:p-10"
        >
          {/* The steps. */}
          <div className="order-2 flex flex-col md:order-1">
            <div className="mb-5 flex items-center gap-3 border-b border-ink/8 pb-5">
              <div className="relative size-[48px] shrink-0 overflow-hidden rounded-full">
                <Image src={GITA.avatar} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div>
                <p className="font-display text-p2 font-bold text-ink">Follow one loan: {GITA.name}&rsquo;s</p>
                <p className="font-display text-p4 font-medium text-ink/64">
                  {GITA.trade} · ₹{GITA.raised.toLocaleString("en-IN")} from {GITA.investors} social investors
                </p>
              </div>
            </div>
            <ol aria-label="What one loan makes possible" className="relative flex flex-col">
              {STAGES.map((s, n) => {
                const on = n === i;
                const done = n < i;
                return (
                  <li key={s.key} className="relative flex gap-4">
                    {/* The thread between the numbers. */}
                    {n < STAGES.length - 1 && (
                      <span aria-hidden className="absolute left-[15px] top-[34px] bottom-0 w-[2px] bg-ink/8">
                        <span className={`block w-full bg-green-dark transition-[height] duration-500 ease-out ${done ? "h-full" : "h-0"}`} />
                      </span>
                    )}
                    <span
                      aria-hidden
                      className={`relative z-10 mt-1 flex size-[32px] shrink-0 items-center justify-center rounded-full font-display text-p4 font-bold transition-colors duration-300 ${
                        on ? "bg-green-dark text-white" : done ? "bg-[#cbe0b8] text-green-dark" : "bg-white text-ink/56 ring-2 ring-ink/12"
                      }`}
                    >
                      {done ? tick : n + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col pb-4">
                      <button
                        type="button"
                        aria-expanded={on}
                        aria-controls="outcome-visual"
                        onClick={() => {
                          setI(n);
                          setChosen(true);
                        }}
                        className={`min-h-[40px] text-left font-display text-p2 font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-dark ${
                          on ? "text-ink" : "text-ink/56 hover:text-ink"
                        }`}
                      >
                        {on ? s.title : s.label}
                      </button>
                      <AnimatePresence initial={false}>
                        {on && (
                          <motion.div
                            key="body"
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <p className="max-w-[460px] font-display text-p3 font-medium text-ink/80 sm:text-p2">{s.text}</p>
                            {/* How long until the story moves on. */}
                            <div className="mt-3 h-[3px] w-full max-w-[460px] overflow-hidden rounded-full bg-ink/8" aria-hidden>
                              <motion.div
                                key={`${i}-${playing}`}
                                className="h-full rounded-full bg-green-dark"
                                initial={{ width: playing ? "0%" : "100%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: playing ? STEP_MS / 1000 : 0, ease: "linear" }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Her loan card, changing with the step. */}
          <div className="order-1 md:order-2 md:self-center">
            <div id="outcome-visual" aria-live="polite" className="rounded-[16px] bg-[#F7F3ED] p-3 sm:p-4">
              <div className="rounded-[12px] bg-white p-4 shadow-[0_6px_16px_rgba(41,45,54,0.08)] sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative size-[36px] shrink-0 overflow-hidden rounded-full">
                    <Image src={GITA.avatar} alt="" fill sizes="36px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-p3 font-bold text-ink">{GITA.name}</p>
                    <p className="truncate font-display text-[12px] font-medium text-ink/56">{GITA.trade}</p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-[#cbe0b8] px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.5px] text-green-dark sm:px-2.5 sm:text-[11px] sm:tracking-[0.6px]">{stage.label}</span>
                </div>
                <div className="min-h-[176px]">
                  {/* Swapped at once and faded in (no exit wait), so the card never lags the step. */}
                  <motion.div
                    key={stage.key}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                  >
                    <StageVisual k={stage.key} reduce={reduce} />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** "Meet the Other Startup India." — live borrowers, presented as founders raising a round. */
export function OtherStartupIndia({ people }: { people: IndividualOpportunity[] }) {
  return (
    <section id="people" className="relative mx-2 flex scroll-mt-[calc(var(--navbar-bottom)+8px)] flex-col items-center gap-10 overflow-hidden rounded-[16px] bg-white px-4 py-16 sm:px-8 md:py-24">
      <div className="flex max-w-[860px] flex-col items-center gap-4 text-center">
        <AnimatedText
          as="h2"
          segments={[
            { text: "Meet the Other Startup India.", className: "text-ink" },
            { text: "No pitch decks. No valuations. Just people building Bharat.", className: "text-green-dark" },
          ]}
          className="font-display text-[28px] font-bold leading-[32px] sm:text-h3 sm:leading-[48px]"
        />
        <p className="font-display text-p1 font-medium text-ink/80">Founders raising a round right now. You decide who you back.</p>
      </div>
      <div className="-mx-4 flex w-[calc(100%+32px)] snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:w-[calc(100%+64px)] sm:px-8">
        {people.map((o) => {
          const pct = Math.min(100, Math.round((o.raised / o.goal) * 100));
          return (
            <a
              key={o.key}
              href={`https://rangde.in/i/${o.key}`}
              className="flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-[16px] bg-[#F7F3ED] transition-shadow hover:shadow-[0_8px_24px_rgba(41,45,54,0.14)] sm:w-[300px]"
            >
              <div className="flex items-center gap-3 p-4">
                <div className="relative size-[56px] shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                  <Image src={imgix(o.photo, 160, 160)} alt="" fill unoptimized sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/72">Founder</p>
                  <p className="truncate font-display text-p2 font-bold text-ink">{o.name}</p>
                  <p className="truncate font-display text-p4 font-medium text-ink/72">
                    {o.district}, {o.state}
                  </p>
                </div>
              </div>
              <div className="mx-4 flex flex-1 flex-col gap-3 rounded-[12px] bg-white p-4">
                <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/72">The plan</p>
                <p className="line-clamp-3 min-h-[60px] font-display text-p3 font-medium text-ink">{o.purpose}</p>
                <div className="mt-auto flex flex-col gap-2">
                  <div className="flex justify-between font-display text-p4 text-ink/72">
                    <span>
                      Raising <span className="font-bold text-ink">₹{o.goal.toLocaleString("en-IN")}</span>
                    </span>
                    <span className="font-bold text-green-dark">{pct}% in</span>
                  </div>
                  <div className="h-[6px] overflow-hidden rounded-full bg-ink/8" aria-hidden>
                    <div className="h-full rounded-full bg-green-dark" style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                </div>
              </div>
              <p className="p-4 font-display text-p3 font-bold text-green-dark">
                Back {o.name.split(" ")[0]} · {o.returnRate}% p.a. →
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}

const MODES = {
  returns: { label: "Investing for returns only", builds: ["Financial return"] },
  social: { label: "Social investing on Rang De", builds: ["Financial return", "A business", "A livelihood", "A credit history", "A stronger community"] },
} as const;
const ALL = MODES.social.builds;

/** "Why aren't Rang De returns higher?" — flip between two kinds of investing and see what each builds. */
export function WhyNotHigher() {
  const [mode, setMode] = useState<keyof typeof MODES>("social");
  const reduce = useReducedMotion();
  const builds: readonly string[] = MODES[mode].builds;

  return (
    <section className="relative mx-2 rounded-[16px] bg-[#cbe0b8] px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-10">
        <AnimatedText
          as="h2"
          segments={[
            { text: "Why aren’t Rang De returns higher?", className: "text-ink" },
            { text: "Because we’re not trying to be the stock market.", className: "text-green-dark" },
          ]}
          className="max-w-[860px] text-center font-display text-[24px] font-bold leading-[28px] sm:text-h4 md:text-[36px] md:leading-[44px]"
        />
        <p className="max-w-[720px] text-center font-display text-p1 font-medium text-ink/80">
          If your only goal is the highest return, there are other places for your money. On Rang De, the same rupee earns up to 8.5% p.a.
          and builds more.
        </p>

        <div role="group" aria-label="Kind of investing" className="inline-flex flex-wrap justify-center rounded-full bg-white/70 p-1">
          {(Object.keys(MODES) as (keyof typeof MODES)[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={mode === k}
              onClick={() => setMode(k)}
              className={`min-h-[44px] rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-dark px-5 font-display text-p3 font-bold transition-colors ${mode === k ? "bg-green-dark text-white" : "text-ink/80 hover:bg-white"}`}
            >
              {MODES[k].label}
            </button>
          ))}
        </div>

        <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-5" aria-label={`What ${MODES[mode].label.toLowerCase()} builds`}>
          {ALL.map((b) => {
            const on = builds.includes(b);
            return (
              <motion.li
                key={b}
                animate={{ opacity: on ? 1 : 0.45, scale: on ? 1 : 0.97 }}
                transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                className={`flex items-center gap-3 rounded-[12px] p-4 sm:flex-col sm:text-center ${on ? "bg-white shadow-[0_4px_16px_rgba(41,45,54,0.08)]" : "bg-white/40"}`}
              >
                <span className={`flex size-[32px] shrink-0 items-center justify-center rounded-full ${on ? "bg-green-dark text-white" : "bg-ink/8 text-ink/72"}`}>
                  {on ? (
                    <svg viewBox="0 0 12 12" className="size-[12px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M2.5 6.2l2.3 2.3L9.5 3.8" /></svg>
                  ) : (
                    <span className="block h-[2px] w-[10px] rounded bg-current" aria-hidden />
                  )}
                </span>
                <span className="font-display text-p3 font-bold text-ink">
                  {b}
                  <span className="sr-only">{on ? ", yes" : ", no"}</span>
                </span>
              </motion.li>
            );
          })}
        </ul>
        <p className="font-display text-p2 font-bold text-ink">Both are investments. They simply build different things.</p>
      </div>
    </section>
  );
}
