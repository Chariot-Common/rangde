"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { imgix, type IndividualOpportunity } from "@/lib/opportunities";

// Version B ("The idea") — the Claude Design homepage's story (lend directly to a person;
// one loan, many outcomes; the Other Startup India; why returns aren't higher), rebuilt with
// the homepage's own components, colours and type. Real people and numbers only.

const EASE = [0.22, 1, 0.36, 1] as const;
const FACES = ["Rekha-42-img.jpg", "Vijay-004-img.jpg", "manawrmonika037-img.jpg", "nitin-jadhav-img.jpg"].map(
  (f) => `https://rangde.imgix.net/bImg/${f}?auto=compress,format&w=96&h=96&fit=facearea&facepad=2.2`,
);

function Faces({ srcs, size = 36 }: { srcs: string[]; size?: number }) {
  return (
    <div className="flex">
      {srcs.map((src, i) => (
        <div key={src} className="relative rounded-full border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]" style={{ width: size, height: size, marginLeft: i ? -size / 3 : 0 }}>
          <Image src={src} alt="" fill unoptimized sizes={`${size}px`} className="rounded-full object-cover" />
        </div>
      ))}
    </div>
  );
}

const STAGES: { key: string; label: string; title: string; text: string; mock: ReactNode }[] = [
  {
    key: "capital",
    label: "Capital",
    title: "People like you fund the loan",
    text: "Many social investors each put in from ₹500. Once the loan is fully funded, it goes straight to the entrepreneur’s bank account.",
    mock: (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-p4 font-bold text-ink">Gita Devi · Fish farm</p>
          <span className="rounded-full bg-green-dark px-2 py-0.5 font-display text-[11px] font-bold text-white">Funded</span>
        </div>
        <div className="h-[8px] overflow-hidden rounded-full bg-ink/8"><div className="h-full w-full rounded-full bg-green-dark" /></div>
        <div className="flex items-center gap-3">
          <div className="flex" aria-hidden>
            {["#0daade", "#8ca21e", "#3a6e0c", "#3eaae0"].map((c, n) => (
              <span key={c} className="size-[28px] rounded-full border-2 border-white" style={{ background: c, marginLeft: n ? -9 : 0 }} />
            ))}
          </div>
          <p className="font-display text-[12px] font-medium text-ink/80">4 social investors · ₹20,000</p>
        </div>
      </div>
    ),
  },
  {
    key: "business",
    label: "Business",
    title: "The business grows",
    text: "Gita Devi bought fish feed and worked more ponds, a season that brought her ₹20,000 in profit.",
    mock: (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[8px]">
        <Image src="/images/stories/story-3-bg.webp" alt="" fill sizes="320px" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 to-transparent p-3">
          <p className="font-display text-p4 font-bold text-white">+ ₹20,000 profit in a season</p>
        </div>
      </div>
    ),
  },
  {
    key: "repayment",
    label: "Repayment",
    title: "She repays, with interest",
    text: "Repayments follow a schedule agreed upfront, and come back to every investor as Rang De credit.",
    mock: (
      <div className="flex flex-col gap-3">
        <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/72">Example schedule</p>
        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex aspect-square items-center justify-center rounded-full bg-green-dark font-display text-[11px] font-bold text-white">₹</div>
          ))}
        </div>
        <p className="font-display text-[12px] font-medium text-ink/80">Each instalment goes back to her investors</p>
      </div>
    ),
  },
  {
    key: "credit",
    label: "Credit history",
    title: "She builds a credit history",
    text: "A repaid formal loan gives her a track record, so the next lender can say yes too.",
    mock: (
      <div className="flex flex-col gap-2">
        <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/72">Example credit record</p>
        {["First formal loan", "Repaid on schedule", "Eligible for more"].map((t) => (
          <div key={t} className="flex items-center justify-between rounded-[6px] bg-bg-grey px-3 py-2 font-display text-[12px] font-medium text-ink">
            {t}
            <span className="flex size-[16px] items-center justify-center rounded-full bg-green-dark text-white">
              <svg viewBox="0 0 12 12" className="size-[9px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M2.5 6.2l2.3 2.3L9.5 3.8" /></svg>
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "next",
    label: "The next person",
    title: "Your money goes round again",
    text: "Reinvest what comes back and it funds someone new. One ₹500 can back person after person.",
    mock: (
      <div className="flex flex-col items-start gap-3">
        <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/72">Example: one ₹500, reinvested</p>
        <Faces srcs={FACES} size={40} />
        <p className="font-display text-[12px] font-medium text-ink/80">Can go on to back four entrepreneurs, one after another</p>
      </div>
    ),
  },
];

/** "One loan. More than one outcome." — the chain of outcomes, stepped through by tap or by itself. */
export function OutcomeChain() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const stage = STAGES[i];

  useEffect(() => {
    if (!auto || !inView || reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % STAGES.length), 3200);
    return () => clearInterval(id);
  }, [auto, inView, reduce]);

  return (
    <section className="relative mx-2 rounded-[16px] bg-[#F7F3ED] px-4 py-16 sm:px-8 md:py-24">
      <div ref={ref} className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-10">
        <AnimatedText
          as="h2"
          segments={[
            { text: "One loan.", className: "text-ink" },
            { text: "More than one outcome.", className: "text-green-dark" },
          ]}
          className="text-center font-display text-[28px] font-bold leading-[32px] sm:text-h3 sm:leading-[48px]"
        />

        <div role="group" aria-label="What one loan makes possible" className="flex max-w-full flex-wrap items-center justify-center gap-y-2">
          {STAGES.map((s, n) => (
            <div key={s.key} className="flex items-center">
              <button
                type="button"
                aria-pressed={n === i}
                aria-controls="outcome-panel"
                onClick={() => {
                  setAuto(false);
                  setI(n);
                }}
                className={`min-h-[44px] rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-dark px-4 font-display text-p3 font-bold transition-colors ${
                  n === i ? "bg-green-dark text-white shadow-[0_2px_8px_rgba(58,110,12,0.32)]" : n < i ? "bg-white text-green-dark" : "bg-white/60 text-ink/72 hover:bg-white"
                }`}
              >
                {s.label}
              </button>
              {n < STAGES.length - 1 && (
                <svg viewBox="0 0 24 24" className={`mx-1 size-[18px] ${n < i ? "text-green-dark" : "text-ink/24"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {!reduce && (
          <button
            type="button"
            onClick={() => setAuto((a) => !a)}
            className="-mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-dark px-4 font-display text-p4 font-bold text-ink/80 hover:bg-white/60"
          >
            {auto ? (
              <svg viewBox="0 0 24 24" className="size-[14px]" fill="currentColor" aria-hidden><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-[14px]" fill="currentColor" aria-hidden><path d="M8 5.5v13l11-6.5z" /></svg>
            )}
            {auto ? "Pause the story" : "Play the story"}
          </button>
        )}

        <div id="outcome-panel" aria-live={auto ? "off" : "polite"} className="grid w-full grid-cols-1 items-center gap-8 rounded-[16px] bg-white p-6 shadow-[0_1px_2px_rgba(41,45,54,0.06),0_12px_32px_rgba(41,45,54,0.06)] sm:p-10 md:grid-cols-[1fr_340px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.key}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
              className="flex flex-col gap-3"
            >
              <p className="font-display text-p4 font-bold uppercase tracking-[0.88px] text-green-dark">
                Step {i + 1} of {STAGES.length}
              </p>
              <h3 className="font-display text-h4 font-bold text-ink">{stage.title}</h3>
              <p className="max-w-[520px] font-display text-p2 font-medium text-ink/80">{stage.text}</p>
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.key}
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
              className="rounded-[12px] bg-white p-4 ring-1 ring-ink/8 shadow-[0_6px_16px_rgba(41,45,54,0.08)]"
            >
              {stage.mock}
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="max-w-[760px] text-center font-display text-p4 font-medium text-ink/72">
          Gita Devi&rsquo;s story is from Rang De&rsquo;s published success stories. Credit-history reporting to be confirmed with Rang De before launch.
        </p>
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
