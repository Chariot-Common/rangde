"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { HOW_IT_WORKS_STEPS } from "@/components/how-it-works/steps";

/**
 * "How it works" as an inline section (the homepage keeps its modal). Same four steps and
 * copy as components/how-it-works/steps.ts; new illustrations drawn in the homepage's mock-UI
 * style. Desktop: the steps scroll on the left while a sticky panel on the right shows the
 * active step. Phones: each step carries its own illustration.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const face = (f: string, s = 96) => `https://rangde.imgix.net/bImg/${f}?auto=compress,format&w=${s}&h=${s}&fit=facearea&facepad=2.2`;
// Rekha Bai, Vijay Muwel and Monika: the entrepreneurs the existing How it works animation uses.
const REKHA = face("Rekha-42-img.jpg", 160);
const PEOPLE = ["Rekha-42-img.jpg", "Vijay-004-img.jpg", "manawrmonika037-img.jpg", "durgamanawar01-img.jpg", "dnyaneshwar-mahale--img.jpg", "nitin-jadhav-img.jpg", "Jagdish-sahare--img.jpg"].map((f) => face(f));

const tick = (
  <svg viewBox="0 0 12 12" className="size-[10px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2.5 6.2l2.3 2.3L9.5 3.8" />
  </svg>
);

function Card({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-[360px] rounded-[16px] bg-white p-5 shadow-[0_1px_2px_rgba(41,45,54,0.06),0_12px_32px_rgba(41,45,54,0.10)]">{children}</div>;
}

/* 1 — Find, select, verify: five checks, fewer people left after each, the verified few published. */
function VetIllustration({ play, reduce }: { play: boolean; reduce: boolean }) {
  const checks = ["Community identification", "Business assessment", "Credit evaluation", "Identity verification", "Profile review"];
  const [done, setDone] = useState(reduce ? checks.length : 0);
  useEffect(() => {
    if (!play || reduce) return;
    let n = 0;
    const reset = requestAnimationFrame(() => setDone(0));
    const id = setInterval(() => {
      n += 1;
      setDone(n);
      if (n >= checks.length) clearInterval(id);
    }, 650);
    return () => {
      cancelAnimationFrame(reset);
      clearInterval(id);
    };
  }, [play, reduce, checks.length]);
  const left = Math.max(2, PEOPLE.length - done);
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/72">Vetting with partners</p>
        <div className="flex">
          {PEOPLE.slice(0, left).map((src, i) => (
            <motion.div key={src} layout className="relative size-[28px] rounded-full border-2 border-white" style={{ marginLeft: i ? -9 : 0 }}>
              <Image src={src} alt="" fill unoptimized sizes="28px" className="rounded-full object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {checks.map((c, i) => {
          const ok = i < done;
          return (
            <li key={c} className="flex items-center justify-between rounded-[8px] bg-bg-grey px-3 py-2 font-display text-[13px] font-medium text-ink">
              {c}
              <span className={`flex size-[18px] items-center justify-center rounded-full transition-colors duration-300 ${ok ? "bg-green-dark text-white" : "bg-ink/8 text-transparent"}`}>{tick}</span>
            </li>
          );
        })}
      </ul>
      <motion.p
        className="mt-4 inline-flex rounded-full bg-green-dark px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.8px] text-white"
        animate={{ opacity: done >= checks.length ? 1 : 0, scale: done >= checks.length ? 1 : 0.9 }}
        transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
      >
        Verified · now listed
      </motion.p>
    </Card>
  );
}

/* 2 — Choose who to back: Rekha Bai's profile, then the amount. */
function ChooseIllustration({ play, reduce }: { play: boolean; reduce: boolean }) {
  const amounts = [500, 2000, 5000];
  const [k, setK] = useState(reduce ? 2 : 0);
  useEffect(() => {
    if (!play || reduce) return;
    const reset = requestAnimationFrame(() => setK(0));
    const id = setInterval(() => setK((n) => Math.min(n + 1, amounts.length - 1)), 900);
    return () => {
      cancelAnimationFrame(reset);
      clearInterval(id);
    };
  }, [play, reduce, amounts.length]);
  const facts = [
    ["State", "Rajasthan"],
    ["Credit rating", "Good"],
    ["Returns", "Up to 8.25% p.a."],
    ["Tenure", "12 months · monthly"],
  ];
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="relative size-[52px] overflow-hidden rounded-full ring-2 ring-green-dark/30">
          <Image src={REKHA} alt="" fill unoptimized sizes="52px" className="object-cover" />
        </div>
        <div>
          <p className="font-display text-p2 font-bold text-ink">Rekha Bai</p>
          <p className="font-display text-[12px] font-medium text-ink/72">Entrepreneur on Rang De</p>
        </div>
        <span className="ml-auto rounded-full bg-green-dark px-2 py-0.5 font-display text-[11px] font-bold text-white">Selected</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2">
        {facts.map(([l, v]) => (
          <div key={l} className="rounded-[8px] bg-bg-grey px-3 py-2">
            <dt className="font-display text-[11px] font-medium text-ink/72">{l}</dt>
            <dd className="font-display text-[13px] font-bold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 font-display text-[12px] font-bold text-ink">How much would you like to invest?</p>
      <div className="mt-2 flex gap-2">
        {amounts.map((a, i) => (
          <span
            key={a}
            className={`flex-1 rounded-full py-2 text-center font-display text-[13px] font-bold transition-colors duration-300 ${i === k ? "bg-green-dark text-white" : "bg-bg-grey text-ink"}`}
          >
            ₹{a.toLocaleString("en-IN")}
          </span>
        ))}
      </div>
      <span className="mt-3 block rounded-[4px] bg-ink py-2 text-center font-display text-[13px] font-bold text-white">Continue</span>
    </Card>
  );
}

/* 3 — Collected on the 1st or 15th; with the borrower within 24 hours. */
function CollectIllustration({ play, reduce }: { play: boolean; reduce: boolean }) {
  const [stage, setStage] = useState(reduce ? 3 : 0);
  useEffect(() => {
    if (!play || reduce) return;
    const reset = requestAnimationFrame(() => setStage(0));
    const id = setInterval(() => setStage((s) => Math.min(s + 1, 3)), 800);
    return () => {
      cancelAnimationFrame(reset);
      clearInterval(id);
    };
  }, [play, reduce]);
  const days = Array.from({ length: 21 }, (_, i) => i + 1);
  const rows = [
    { t: "1st of the month", d: "Your payment is collected" },
    { t: "Within 24 hours", d: "It reaches the borrower’s bank account" },
    { t: "Transfer successful", d: "Rekha Bai, Vijay Muwel and Monika are funded" },
  ];
  return (
    <Card>
      <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/72">Collection dates</p>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = d === 1 || d === 15;
          return (
            <span
              key={d}
              className={`flex aspect-square items-center justify-center rounded-[6px] font-display text-[11px] font-bold ${
                key ? (d === 1 && stage >= 1 ? "bg-green-dark text-white" : "bg-green-dark/16 text-green-dark") : "text-ink/72"
              }`}
            >
              {d}
            </span>
          );
        })}
      </div>
      <ol className="relative mt-4 flex flex-col gap-3 pl-6">
        <span className="absolute bottom-2 left-[7px] top-2 w-[2px] bg-ink/8" aria-hidden />
        <motion.span
          className="absolute left-[7px] top-2 w-[2px] origin-top bg-green-dark"
          aria-hidden
          animate={{ height: `${(Math.max(stage - 1, 0) / 2) * 85}%` }}
          transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
        />
        {rows.map((r, i) => {
          const on = stage >= i + 1;
          return (
            <li key={r.t} className="relative">
              <span className={`absolute -left-6 top-0.5 flex size-[16px] items-center justify-center rounded-full transition-colors duration-300 ${on ? "bg-green-dark text-white" : "bg-white text-transparent ring-2 ring-ink/16"}`}>{tick}</span>
              <p className={`font-display text-[13px] font-bold ${on ? "text-ink" : "text-ink/72"}`}>{r.t}</p>
              <p className="font-display text-[12px] font-medium text-ink/72">{r.d}</p>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex items-center gap-2">
        {PEOPLE.slice(0, 3).map((src) => (
          <motion.div
            key={src}
            className="relative size-[28px] rounded-full border-2 border-white"
            animate={{ opacity: stage >= 3 ? 1 : 0.35 }}
            transition={{ duration: reduce ? 0 : 0.3 }}
          >
            <Image src={src} alt="" fill unoptimized sizes="28px" className="rounded-full object-cover" />
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

/* 4 — Track it all: investments, earnings, and each borrower's repayment timeline. */
function TrackIllustration({ play, reduce }: { play: boolean; reduce: boolean }) {
  const [paid, setPaid] = useState(reduce ? 7 : 0);
  useEffect(() => {
    if (!play || reduce) return;
    const reset = requestAnimationFrame(() => setPaid(0));
    const id = setInterval(() => setPaid((p) => Math.min(p + 1, 7)), 380);
    return () => {
      cancelAnimationFrame(reset);
      clearInterval(id);
    };
  }, [play, reduce]);
  return (
    <Card>
      <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/72">Example dashboard</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["3", "Investees backed"],
          ["₹7,500", "Invested"],
          [`${paid}/12`, "Repayments in"],
        ].map(([v, l]) => (
          <div key={l} className="rounded-[8px] bg-bg-grey px-2 py-2 text-center">
            <p className="font-display text-p3 font-bold text-ink">{v}</p>
            <p className="font-display text-[11px] font-medium text-ink/72">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="relative size-[32px] overflow-hidden rounded-full">
          <Image src={REKHA} alt="" fill unoptimized sizes="32px" className="object-cover" />
        </div>
        <p className="font-display text-[13px] font-bold text-ink">Rekha Bai · repayment timeline</p>
      </div>
      <div className="mt-3 grid grid-cols-12 gap-1" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={`h-[28px] rounded-[4px] transition-colors duration-300 ${i < paid ? "bg-green-dark" : "bg-ink/8"}`} />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-display text-[11px] font-medium text-ink/72">
        <span>Repaid</span>
        <span>Expected</span>
      </div>
    </Card>
  );
}

const ILLUSTRATIONS = [VetIllustration, ChooseIllustration, CollectIllustration, TrackIllustration];

export function HowItWorksSection() {
  const reduce = !!useReducedMotion();
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useInView(sectionRef, { amount: 0.1 });

  // The step crossing the middle of the screen is the active one.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const Active = ILLUSTRATIONS[active];

  return (
    <section ref={sectionRef} id="how-it-works" className="relative mx-2 scroll-mt-[calc(var(--navbar-bottom)+8px)] rounded-[16px] bg-bg-grey px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-12 md:gap-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.44px] text-green-dark">How it works</p>
          <AnimatedText
            as="h2"
            segments={[
              { text: "From your first ₹500", className: "text-ink" },
              { text: "to your first repayment, in four steps.", className: "text-green-dark" },
            ]}
            className="max-w-[820px] font-display text-[28px] font-bold leading-[32px] sm:text-h3 sm:leading-[48px]"
          />
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_400px] md:gap-16">
          {/* Steps, with a progress line that fills as you scroll through them. */}
          <ol className="relative flex flex-col">
            <span className="absolute bottom-6 left-[19px] top-6 hidden w-[2px] bg-ink/8 md:block" aria-hidden />
            <motion.span
              className="absolute left-[19px] top-6 hidden w-[2px] origin-top bg-green-dark md:block"
              aria-hidden
              animate={{ height: `calc((100% - 48px) * ${active / (HOW_IT_WORKS_STEPS.length - 1)})` }}
              transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
            />
            {HOW_IT_WORKS_STEPS.map((s, i) => {
              const Illustration = ILLUSTRATIONS[i];
              const on = i <= active;
              return (
                <li
                  key={s.eyebrow}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  data-step={i}
                  className="relative flex flex-col gap-5 py-6 md:min-h-[60vh] md:justify-center md:pl-16"
                >
                  <span
                    className={`flex size-[40px] items-center justify-center rounded-full font-display text-p2 font-bold transition-colors duration-300 md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 ${
                      on ? "bg-green-dark text-white" : "bg-white text-ink ring-2 ring-ink/16"
                    }`}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div className={`flex flex-col gap-3 transition-opacity duration-300 ${i === active ? "md:opacity-100" : "md:opacity-60"}`}>
                    <p className="font-display text-p4 font-bold uppercase tracking-[0.88px] text-green-dark">{s.eyebrow}</p>
                    <h3 className="font-display text-h4 font-bold text-ink [text-wrap:balance]">{s.headingParts.map((p) => p.text).join("")}</h3>
                    <p className="max-w-[520px] font-display text-p2 font-medium text-ink/80">{s.description}</p>
                  </div>
                  {/* Phones: the illustration sits with its step. */}
                  <div className="flex justify-center md:hidden" role="img" aria-label={s.illustrationLabel}>
                    <Illustration play={i === active && visible} reduce={reduce} />
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Desktop: one sticky panel showing the active step. */}
          <div className="hidden md:block">
            <div className="sticky top-[calc(var(--navbar-bottom)+40px)] flex min-h-[460px] items-center justify-center rounded-[16px] bg-[#cbe8f6] p-8" role="img" aria-label={HOW_IT_WORKS_STEPS[active].illustrationLabel}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  className="flex w-full justify-center"
                  initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                >
                  <Active play={visible} reduce={reduce} />
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden>
                {HOW_IT_WORKS_STEPS.map((_, i) => (
                  <span key={i} className={`h-[6px] rounded-full transition-all duration-300 ${i === active ? "w-[24px] bg-green-dark" : "w-[6px] bg-ink/24"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
