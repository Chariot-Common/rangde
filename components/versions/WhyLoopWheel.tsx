"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { EASE, Label, Rise } from "./WhyRealStory";

/*
 * Version 4, "Why we exist": the way out of the trap, as a wheel (12 Nov 2026, after titanintake.com/product-solution, in
 * light colours). The stage pins; a large ring sits off the left edge with a real field photo in its band, and the five
 * steps of the loan sit round its rim. Scrolling turns the wheel: the step at three o'clock is level and in full colour,
 * beside a numbered node joined to the ring; the others lie along the rim, turned and faded. On the right, a card shows
 * that step with a real borrower photo and its animated icon. Under 1024px, and with reduced motion, it's a plain list.
 */

const ICONS = "/images/why-rangde-v2";
const STEPS = [
  {
    title: "Your social investment",
    text: "Your money joins other lenders’ until one entrepreneur’s loan is fully funded.",
    icon: `${ICONS}/icon-network.webp`,
    img: "/images/collage/collage-16.webp",
    alt: "A weaver at her loom, smiling.",
  },
  {
    title: "Business",
    text: "They buy equipment, stock a shop, expand a small business or buy livestock.",
    icon: `${ICONS}/icon-banknotes.webp`,
    img: "/images/collage/collage-10.webp",
    alt: "A woman sitting outside her village shop, its shelves stocked.",
  },
  {
    title: "Repayment",
    text: "They repay month by month, on the dates their loan sets out, from what the business earns.",
    icon: `${ICONS}/icon-hand-check.webp`,
    img: "/images/collage/collage-13.webp",
    alt: "A dairy farmer standing with her buffalo.",
  },
  {
    title: "Credit history",
    text: "Every repayment is reported to the credit bureaus. Someone who never had a credit file starts building one.",
    icon: `${ICONS}/icon-bar-chart.webp`,
    img: "/images/collage/collage-12.webp",
    alt: "A young man at work at a machine in his small print shop.",
  },
  {
    title: "Opportunities",
    text: "With a credit history, the bank can finally say yes. More capital goes back into the business.",
    icon: `${ICONS}/icon-target-center.webp`,
    img: "/images/collage/collage-05.webp",
    alt: "A farmer standing in a field of yellow mustard flowers.",
  },
];
const N = STEPS.length;
const STEP_DEG = 26;
const GREEN = "#8CA21E";
const GREEN_DARK = "#3a6e0c";

function Heading() {
  return (
    <Rise className="mx-auto flex max-w-[900px] flex-col items-center gap-4 px-4 text-center">
      <Label className="text-green-dark">The way out</Label>
      <h2 className="font-display text-[36px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink [text-wrap:balance] md:text-[64px]">
        You’re not just giving someone a loan.
        <br />
        <span className="text-ink/40">You’re helping them build a financial future.</span>
      </h2>
    </Rise>
  );
}

function StepCard({ i }: { i: number }) {
  const s = STEPS[i];
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[#F7F3ED]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Image src={s.img} alt={s.alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/92 py-1.5 pl-1.5 pr-4 shadow-[0_4px_16px_rgba(41,45,54,0.12)] backdrop-blur">
            {/* eslint-disable-next-line @next/next/no-img-element -- small animated icon */}
            <img src={s.icon} alt="" className="size-[32px] rounded-full bg-[#eef4e2] p-1" />
            <span className="font-display text-[14px] font-bold text-ink">{s.title}</span>
          </div>
          <p className="absolute bottom-5 left-5 font-mono text-[12px] font-medium tracking-[0.12em] text-white/90">
            {String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** The list: phones, tablets, and reduced motion. */
function StepList() {
  return (
    <ol className="mx-auto mt-12 flex max-w-[640px] flex-col gap-10 px-4 sm:px-8">
      {STEPS.map((s, i) => (
        <Rise key={s.title}>
          <li className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span
                className="grid size-[40px] place-items-center rounded-full border font-mono text-[13px] font-medium text-ink"
                style={{ borderColor: GREEN }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-display text-[24px] font-extrabold leading-[30px] tracking-[-0.02em] text-ink">{s.title}</p>
            </div>
            <p className="font-display text-[16px] font-medium leading-[24px] text-ink/64">{s.text}</p>
            <div className="relative aspect-[4/3] w-full">
              <StepCard i={i} />
            </div>
          </li>
        </Rise>
      ))}
    </ol>
  );
}

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

function Wheel() {
  const outer = useRef<HTMLDivElement>(null);
  const [stage, { w, h }] = useSize<HTMLDivElement>();
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  const [f, setF] = useState(0); // 0 … N−1, continuous
  // Each step holds level for a while, then the wheel turns to the next: a pause, then an eased turn.
  useMotionValueEvent(p, "change", (v) => {
    const raw = Math.min(N - 1, Math.max(0, v * (N - 1) * 1.06 - 0.03));
    const i = Math.floor(raw);
    const t = Math.min(1, Math.max(0, (raw - i - 0.3) / 0.4));
    setF(Math.min(N - 1, i + t * t * (3 - 2 * t)));
  });
  const active = Math.round(f);

  // The ring: most of it off the left edge, its rim through the left third.
  const R = Math.max(240, Math.min(h * 0.6, w * 0.34));
  const cx = -R * 0.42;
  const cy = h / 2;
  const band = R * 0.2;
  const nodeR = R + 56;
  const labelR = R + 104;

  return (
    <div ref={outer} style={{ height: `${N * 75 + 60}svh` }} className="relative">
      <div ref={stage} className="sticky top-[var(--navbar-bottom,0px)] h-[calc(100svh-var(--navbar-bottom,0px))] overflow-hidden">
        {w > 0 && (
          <>
            {/* The ring: a real field photo in the band, dashed guides either side. */}
            <div
              className="absolute overflow-hidden rounded-full"
              style={{ left: cx - R, top: cy - R, width: R * 2, height: R * 2 }}
              aria-hidden
            >
              <motion.div className="absolute inset-0" style={{ rotate: -f * 6 }}>
                <Image src="/images/collage/collage-11.webp" alt="" fill sizes="900px" className="object-cover" />
              </motion.div>
              <div className="absolute rounded-full bg-white" style={{ inset: band }} />
            </div>
            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              <circle cx={cx} cy={cy} r={R} fill="none" stroke={GREEN} strokeWidth="1.25" />
              <circle cx={cx} cy={cy} r={R - band} fill="none" stroke={GREEN} strokeOpacity="0.5" strokeWidth="1" />
              <circle cx={cx} cy={cy} r={R + 16} fill="none" stroke="#292d36" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 5" />
              <circle cx={cx} cy={cy} r={R - band - 16} fill="none" stroke="#292d36" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="3 5" />
              {/* The connector at three o'clock. */}
              <line x1={cx + R} y1={cy} x2={cx + nodeR - 26} y2={cy} stroke={GREEN} strokeWidth="1.5" />
            </svg>

            {/* The node: the step number. */}
            <div
              className="absolute grid size-[52px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[1.5px] bg-white font-mono text-[16px] font-medium text-ink"
              style={{ left: cx + nodeR, top: cy, borderColor: GREEN }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={active}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {String(active + 1).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* The steps round the rim. */}
            {STEPS.map((s, i) => {
              const a = (i - f) * STEP_DEG; // degrees from three o'clock, clockwise
              const rad = (a * Math.PI) / 180;
              const d = Math.abs(i - f);
              const opacity = Math.max(0.1, 1 - d * 0.7);
              const on = d < 0.5;
              return (
                <div
                  key={s.title}
                  className="absolute w-[min(380px,30vw)] origin-left"
                  style={{
                    left: cx + labelR * Math.cos(rad),
                    top: cy + labelR * Math.sin(rad),
                    transform: `translateY(-50%) rotate(${a}deg)`,
                    opacity,
                  }}
                >
                  <p
                    className="font-display text-[34px] font-extrabold leading-[38px] tracking-[-0.03em] xl:text-[40px] xl:leading-[44px]"
                    style={{ color: on ? GREEN_DARK : "#292d36" }}
                  >
                    {s.title}
                  </p>
                  <p className="mt-3 font-display text-[17px] font-medium leading-[26px] text-ink/72">{s.text}</p>
                </div>
              );
            })}

            {/* The card. */}
            <div className="absolute right-[3%] top-1/2 aspect-[4/5] w-[min(38%,560px)] max-h-[82%] -translate-y-1/2">
              <StepCard i={active} />
            </div>

            {/* Progress, bottom right. */}
            <div className="absolute bottom-6 right-[3%] flex gap-1.5" aria-hidden>
              {STEPS.map((s, i) => (
                <span
                  key={s.title}
                  className="h-[4px] rounded-full transition-all duration-300"
                  style={{ width: i === active ? 28 : 10, backgroundColor: i <= active ? GREEN : "rgba(41,45,54,0.16)" }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function LoopWheel() {
  const reduce = useReducedMotion();
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const wheel = wide && !reduce;

  return (
    <section className="mx-2 rounded-[16px] bg-white pb-16 pt-24 md:pt-32">
      <Heading />
      {wheel ? (
        <div className="mt-10">
          <Wheel />
        </div>
      ) : (
        <StepList />
      )}
    </section>
  );
}
