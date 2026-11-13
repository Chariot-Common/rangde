"use client";

import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { EASE, Label, Rise } from "./WhyRealStory";

/*
 * /v/why, "Why it happens" (13 Nov 2026, restyled after the second review). One pinned stage, one step on screen at a time:
 * a coin (her money) travels a ring of four big illustrated stops. Today it goes round and lands back at the start; then the
 * line "Rang De opens the loop" takes the whole screen, the background warms from grey to lime, and the coin follows the
 * same stops the Rang De way until it leaves the circle for the bank that can now say yes. The motion is the argument.
 * Tone: honest, calm, in Rang De's voice. The reduced-motion version is two plain lists (ArcList).
 */

const S = "/images/story";
const GREEN = "#8CA21E";
const GREEN_DARK = "#3a6e0c";
const PAPER = "#F7F3ED";

/* eslint-disable @next/next/no-img-element -- the story sprites are small, transparent and laid out by hand */
const Sprite = ({ src, className }: { src: string; className?: string }) => (
  <img src={src} alt="" className={`pointer-events-none select-none object-contain ${className ?? ""}`} />
);

// The story's credit gauge: needle hard over at empty, or the green fill with the needle climbing.
const Gauge = ({ filled = false }: { filled?: boolean }) => (
  <span className="relative block h-[40px] w-[64px]">
    <Sprite src={`${S}/gauge__track.webp`} className="absolute inset-x-0 top-0 w-full" />
    {filled && <Sprite src={`${S}/gauge__fill-green.webp`} className="absolute inset-x-0 top-0 w-full" />}
    <Sprite
      src={`${S}/gauge__needle.webp`}
      className={`absolute bottom-[8%] left-1/2 h-[78%] origin-bottom -translate-x-1/2 ${filled ? "rotate-[40deg]" : "-rotate-[80deg]"}`}
    />
  </span>
);

const H2 = "font-display text-[32px] font-bold leading-[38px] text-ink [text-wrap:balance] md:text-[48px] md:leading-[56px]";

/* ── The steps. ──────────────────────────────────────────────────────────────────────────────────────────────── */

type Step = { art: ReactNode; title: string; line?: string };

const TODAY: Step[] = [
  { art: <Gauge />, title: "No credit history yet" },
  {
    art: (
      <span className="relative">
        <Sprite src={`${S}/bank__building.webp`} className="h-[46px]" />
        <Sprite src={`${S}/bank__badge-no.webp`} className="absolute -right-3 -top-2 h-[20px]" />
      </span>
    ),
    title: "The bank can’t say yes",
  },
  { art: <Sprite src={`${S}/lender__give.webp`} className="h-[52px]" />, title: "She borrows from a moneylender" },
  { art: <Sprite src={`${S}/gauge__ledger.webp`} className="h-[44px]" />, title: "Her repayments aren’t recorded" },
];

const WITH_RANG_DE: Step[] = [
  { art: <Gauge />, title: "No credit history yet" },
  { art: <Sprite src={`${S}/investor-office__1.webp`} className="h-[52px]" />, title: "People on Rang De fund her loan" },
  { art: <Sprite src={`${S}/gauge__ledger-tick.webp`} className="h-[44px]" />, title: "She repays month by month" },
  { art: <Gauge filled />, title: "Every repayment is reported" },
];

const EXIT: Step = {
  art: (
    <span className="relative">
      <Sprite src={`${S}/bank__building.webp`} className="h-[46px]" />
      <Sprite src={`${S}/bank__badge-ok.webp`} className="absolute -right-3 -top-2 h-[20px]" />
    </span>
  ),
  title: "Now she has a credit history",
  line: "and the bank can say yes.",
};


// The ring, in a 120 × 100 box: centre (60, 52), radius 34. Steps sit at twelve, three, six and nine o'clock; the way out
// leaves the circle at nine o'clock and ends top left.
const CX = 60;
const CY = 52;
const R = 34;
const AT = [
  [CX, CY - R],
  [CX + R, CY],
  [CX, CY + R],
  [CX - R, CY],
] as const;
const EXIT_AT = [16, 8] as const;
const RING = `M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX - 0.01} ${CY - R}`;
const OPEN = `M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX - R} ${CY} C ${CX - R} ${CY - 18}, ${EXIT_AT[0] + 4} ${EXIT_AT[1] + 22}, ${EXIT_AT[0]} ${EXIT_AT[1] + 8}`;
const pos = ([x, y]: readonly [number, number]) => ({ left: `${(x / 120) * 100}%`, top: `${y}%` });

/* ── Why it happens: the loop, told one step at a time as you scroll. ───────────────────────────────────────── */

// Nine beats. 0–3: the loop she's in today. 4: the turn, full screen. 5–7: the same ring, the Rang De way. 8: out of the loop.
const BEATS: { act: "today" | "rangde"; step: number; title: string; sub: string }[] = [
  { act: "today", step: 0, title: "No credit history yet.", sub: "She’s run her tailoring shop for years, but none of it is on paper." },
  { act: "today", step: 1, title: "So the bank can’t say yes.", sub: "With no record to go on, it has nothing to judge her by." },
  { act: "today", step: 2, title: "A moneylender will.", sub: "Quick and close to home. And he charges for it." },
  { act: "today", step: 3, title: "But none of it is recorded.", sub: "His notebook never reaches a credit bureau. However well she repays, she’s back where she started." },
  { act: "rangde", step: 0, title: "Rang De opens the loop.", sub: "Same shop, same skill. A different first loan." },
  { act: "rangde", step: 1, title: "People across India fund her loan.", sub: "Lenders on Rang De fund it together, after a local partner has met her in person." },
  { act: "rangde", step: 2, title: "She repays month by month.", sub: "From what the business earns, on the dates the loan sets out." },
  { act: "rangde", step: 3, title: "Every repayment is reported.", sub: "Each one goes to the credit bureaus, so her record starts to grow." },
  { act: "rangde", step: 4, title: "Now she has a credit history.", sub: "And the next time she walks into a bank, it can say yes." },
];
const N = BEATS.length;
const TURN = 4;
// Where the coin is at each beat, as a share of its path. Today it stops at each step; on the last it carries on round,
// back to the start. With Rang De it follows the open path and leaves the circle.
const RING_AT = [0, 0.25, 0.5, 1];
const OPEN_AT = [0, 0.255, 0.51, 0.76, 1];
const BG_TODAY = "#ECEAE4";
const BG_RANGDE = "#EEF3DA";

function Stop({ s, at, reached, on, tone, size }: { s: Step; at: readonly [number, number]; reached: boolean; on: boolean; tone: string; size: string }) {
  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={pos(at)}
      initial={false}
      animate={{ scale: on ? 1.18 : 1, opacity: reached ? 1 : 0.4, filter: reached ? "grayscale(0)" : "grayscale(1)" }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div
        className={`grid place-items-center rounded-full bg-white ${size}`}
        style={{ boxShadow: on ? `0 0 0 4px ${tone}, 0 18px 40px rgba(41,45,54,0.16)` : "0 8px 24px rgba(41,45,54,0.08)" }}
      >
        <div className="origin-center scale-[0.8] md:scale-[1.45]">{s.art}</div>
      </div>
    </motion.div>
  );
}

function Ring({ beat }: { beat: number }) {
  const { act, step } = BEATS[beat];
  const rangde = act === "rangde";
  const ringEl = useRef<SVGPathElement>(null);
  const openEl = useRef<SVGPathElement>(null);
  const ring = useMotionValue(0); // share of the ring the coin has travelled
  const out = useMotionValue(0); // share of the open path
  const coinX = useMotionValue("50%");
  const coinY = useMotionValue(`${CY - R}%`);

  // Move the coin to this beat's stop. Today's last stop runs on past nine o'clock and round to the top again.
  useEffect(() => {
    const opts = { duration: 0.9, ease: [0.45, 0, 0.2, 1] as const };
    if (!rangde) {
      out.set(0);
      const c = beat === 3 ? animate(ring, [ring.get(), 0.75, 1], { duration: 1.8, times: [0, 0.45, 1], ease: "easeInOut" }) : animate(ring, RING_AT[step], opts);
      return () => c.stop();
    }
    const c = animate(out, OPEN_AT[step], opts);
    return () => c.stop();
  }, [beat, rangde, step, ring, out]);

  const place = (el: SVGPathElement | null, f: number) => {
    if (!el) return;
    const pt = el.getPointAtLength(f * el.getTotalLength());
    coinX.set(`${(pt.x / 120) * 100}%`);
    coinY.set(`${pt.y}%`);
  };
  useMotionValueEvent(ring, "change", (f) => !rangde && place(ringEl.current, f));
  useMotionValueEvent(out, "change", (f) => rangde && place(openEl.current, f));
  useEffect(() => {
    if (rangde) place(openEl.current, out.get());
    else place(ringEl.current, ring.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangde]);

  const steps = rangde ? WITH_RANG_DE : TODAY;
  const tone = rangde ? GREEN : "#292D36";
  const size = "size-[64px] md:size-[124px]";
  // The trail behind the coin.
  const ringTrail = useTransform(ring, (f) => Math.max(0.001, f));
  const outTrail = useTransform(out, (f) => Math.max(0.001, f));

  return (
    <motion.div
      className="relative mx-auto aspect-[120/100] w-full max-w-[360px] md:max-w-[640px]"
      initial={false}
      animate={{ opacity: beat === TURN ? 0.12 : 1, scale: beat === TURN ? 0.92 : 1 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <svg viewBox="0 0 120 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <path d={RING} fill="none" stroke="rgba(41,45,54,0.16)" strokeWidth="0.45" strokeDasharray="1.2 1.6" />
        <motion.path ref={ringEl} d={RING} fill="none" stroke="#292D36" strokeWidth="0.9" strokeLinecap="round" style={{ pathLength: ringTrail }} animate={{ opacity: rangde ? 0 : 0.7 }} />
        <motion.path ref={openEl} d={OPEN} fill="none" stroke={GREEN} strokeWidth="1.3" strokeLinecap="round" style={{ pathLength: outTrail }} animate={{ opacity: rangde ? 1 : 0 }} />
      </svg>

      {/* "Back to the start": the loop closes on itself. */}
      <motion.div
        initial={false}
        animate={{ opacity: beat === 3 ? 1 : 0, scale: beat === 3 ? 1 : 0.9 }}
        transition={{ duration: 0.4, delay: beat === 3 ? 1.4 : 0 }}
        className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 text-center"
      >
        <p className="font-display text-[34px] leading-none text-ink/40 md:text-[64px]">↺</p>
        <p className="mt-1 whitespace-nowrap font-display text-[13px] font-bold leading-[18px] text-ink/56 md:text-[17px] md:leading-[22px]">Back to the start</p>
      </motion.div>

      {steps.map((s, i) => (
        <Stop key={`${act}-${i}`} s={s} at={AT[i]} reached={i <= step} on={i === step && beat !== TURN} tone={tone} size={size} />
      ))}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={pos(EXIT_AT)}
        initial={false}
        animate={{ opacity: step === 4 ? 1 : 0, scale: step === 4 ? 1.2 : 0.6 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: step === 4 ? 0.7 : 0 }}
      >
        <div className={`grid place-items-center rounded-full ${size}`} style={{ backgroundColor: GREEN_DARK, boxShadow: `0 0 0 6px rgba(140,162,30,0.35), 0 18px 40px rgba(41,45,54,0.2)` }}>
          <div className="origin-center scale-[0.8] rounded-full bg-white p-2 md:scale-[1.2]">{EXIT.art}</div>
        </div>
      </motion.div>

      {/* Her money, going round. */}
      <motion.div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: coinX, top: coinY }} animate={{ opacity: beat === TURN ? 0 : 1 }}>
        <Sprite src={`${S}/money__coin.webp`} className="h-[26px] drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)] md:h-[44px]" />
      </motion.div>
    </motion.div>
  );
}

// Reduced motion: each arc as a short column; the first points back to its start, the second leads out.
function ArcList({ kind }: { kind: "today" | "rangde" }) {
  const steps = kind === "today" ? TODAY : [...WITH_RANG_DE, EXIT];
  return (
    <ol className="mx-auto flex w-full max-w-[360px] flex-col items-center">
      {steps.map((s, i) => {
        const exit = kind === "rangde" && i === steps.length - 1;
        return (
          <li key={s.title} className="flex w-full flex-col items-center">
            <Rise className="w-full">
              <div
                className="flex w-full items-center gap-4 rounded-[16px] p-3"
                style={{ backgroundColor: exit ? GREEN_DARK : "#fff", color: exit ? "#fff" : undefined }}
              >
                <div className="grid size-[64px] shrink-0 place-items-center rounded-[12px]" style={{ backgroundColor: exit ? "#fff" : PAPER }}>
                  {s.art}
                </div>
                <p className={`font-display text-[16px] font-bold leading-[22px] ${exit ? "" : "text-ink"}`}>
                  {s.title}
                  {s.line && <span className="font-medium text-white/80"> {s.line}</span>}
                </p>
              </div>
            </Rise>
            {i < steps.length - 1 && (
              <span className="py-1 text-[18px] leading-none" style={{ color: kind === "today" ? "#9a958c" : GREEN }} aria-hidden>
                ↓
              </span>
            )}
          </li>
        );
      })}
      {kind === "today" && <p className="pt-2 text-center font-display text-[14px] font-bold leading-[20px] text-ink/56">↺ and back to the start</p>}
    </ol>
  );
}


export function WhyLoopStory() {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => setBeat(Math.min(N - 1, Math.max(0, Math.floor(p * N)))));
  const b = BEATS[beat];
  const rangde = b.act === "rangde";
  const total = 4;
  const stepNo = rangde ? b.step : b.step + 1;

  return (
    <section id="ch-loop" className="mx-2 overflow-clip rounded-[16px]" style={{ backgroundColor: reduce ? "#fff" : undefined }}>
      {reduce ? (
        <div className="px-4 py-20 sm:px-8">
          <Rise className="mx-auto flex max-w-[820px] flex-col items-center gap-4 pb-12 text-center">
            <Label className="text-green-dark">Why it happens</Label>
            <h2 className={H2}>A bank needs a credit history. You need a loan to build one.</h2>
          </Rise>
          <div className="mx-auto grid max-w-[900px] gap-14 md:grid-cols-2">
            <ArcList kind="today" />
            <ArcList kind="rangde" />
          </div>
        </div>
      ) : (
        <motion.div ref={stage} className="relative" style={{ height: `${N * 80 + 100}svh` }} initial={false} animate={{ backgroundColor: rangde ? BG_RANGDE : BG_TODAY }} transition={{ duration: 0.8 }}>
          <div className="sticky top-[var(--navbar-bottom,0px)] flex h-[calc(100svh-var(--navbar-bottom,0px))] flex-col overflow-hidden px-4 sm:px-8">
            {/* The question this section answers, kept small at the top. */}
            <div className="flex items-center justify-between gap-4 pt-5 md:pt-8">
              <p className="font-display text-[12px] font-bold uppercase leading-[16px] tracking-[1.44px] text-ink/56 md:text-[13px]">Why it happens</p>
              <motion.p
                key={b.act}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-full px-4 py-1.5 font-display text-[13px] font-bold leading-[18px] md:text-[14px]"
                style={{ backgroundColor: rangde ? GREEN_DARK : "#292D36", color: "#fff" }}
              >
                {rangde ? "With Rang De" : "Today"}
              </motion.p>
            </div>

            <div className="relative mx-auto grid w-full max-w-[1280px] flex-1 content-center items-center gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12">
              <Ring beat={beat} />
              <div className="flex min-h-[220px] flex-col items-center text-center md:min-h-[320px] md:items-start md:text-left">
                <AnimatePresence mode="wait">
                  {beat !== TURN && (
                    <motion.div
                      key={beat}
                      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="flex flex-col items-center gap-4 md:items-start"
                    >
                      <p className="font-display text-[13px] font-bold leading-[16px] tabular-nums md:text-[15px]" style={{ color: rangde ? GREEN_DARK : "rgba(41,45,54,0.56)" }}>
                        {String(stepNo).padStart(2, "0")} / {String(total).padStart(2, "0")}
                      </p>
                      <p
                        className="font-display text-[34px] font-extrabold leading-[1] tracking-[-0.035em] [text-wrap:balance] md:text-[64px] lg:text-[76px]"
                        style={{ color: beat === N - 1 ? GREEN_DARK : "#292D36" }}
                      >
                        {b.title}
                      </p>
                      <p className="max-w-[460px] font-display text-p1 font-medium text-ink/64 [text-wrap:balance] md:text-[20px] md:leading-[30px]">{b.sub}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* The turn: one line, full screen, word by word. */}
              <AnimatePresence>
                {beat === TURN && (
                  <motion.div key="turn" className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
                    <p className="max-w-[1000px] font-display text-[52px] font-extrabold leading-[0.95] tracking-[-0.045em] text-ink [text-wrap:balance] md:text-[104px] lg:text-[128px]">
                      {"Rang De opens the loop.".split(" ").map((w, i) => (
                        <motion.span
                          key={i}
                          className="inline-block"
                          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{ duration: 0.55, delay: 0.1 + i * 0.12, ease: EASE }}
                          style={{ color: w === "opens" ? GREEN_DARK : undefined }}
                        >
                          {w}&nbsp;
                        </motion.span>
                      ))}
                    </p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 font-display text-[18px] font-bold leading-[26px] text-ink/64 md:text-[22px]">
                      {b.sub}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Where you are. */}
            <div className="flex items-center justify-center gap-1.5 pb-24 md:pb-8" aria-hidden>
              {BEATS.map((x, i) => (
                <span
                  key={i}
                  className={`h-[6px] rounded-full transition-all duration-300 ${i === TURN ? "mx-2" : ""} ${i === beat ? "w-[28px]" : "w-[6px]"}`}
                  style={{ backgroundColor: i <= beat ? (x.act === "rangde" ? GREEN : "#292D36") : "rgba(41,45,54,0.16)" }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
