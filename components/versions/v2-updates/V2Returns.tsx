"use client";

import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/*
 * Version 2 updates (26 Nov 2026): "Why aren't Rang De returns higher?", reworked. Version 2's answer, "because your
 * money earns more than interest", read as a riddle (your money doesn't earn more than interest; it does more), and
 * its card started empty until each line rose in.
 *
 * Now the answer is said plainly in the heading (the rate has to be fair to the person borrowing), and the card shows
 * one loan's two returns side by side: yours (up to 8.5% a year, counted up once) and theirs (four things the same loan
 * builds). Under them, why the rate can't simply go up: the alternative most borrowers have is informal credit at
 * 17.77% a year on average (NABARD, the same figure Version 3's story uses). No comparison with other investments, as
 * the 10 Nov review asked.
 */

const ICONS = "/images/why-rangde-v2";
const GREEN_DARK = "#3A6E0C";
const EASE = [0.22, 1, 0.36, 1] as const;

const THEIRS = [
  { label: "A business that grows", icon: `${ICONS}/icon-bank.webp` },
  { label: "Steady work", icon: `${ICONS}/icon-hand-check.webp` },
  { label: "A credit history", icon: `${ICONS}/icon-bar-chart.webp` },
  { label: "A stronger community", icon: `${ICONS}/icon-network.webp` },
];

function CountUp({ to, play }: { to: number; play: boolean }) {
  const [v, setV] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || !play) return;
    const c = animate(0, to, { duration: 1.1, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [play, to, reduce]);
  return <>{(reduce ? to : v).toFixed(1)}</>;
}

export function V2Returns() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Starts as soon as a fifth of the card shows, so it is never seen empty.
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const shown = !!reduce || inView;
  const rise = (i: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 10 }, animate: shown ? { opacity: 1, y: 0 } : undefined, transition: { duration: 0.45, delay: 0.1 + i * 0.08, ease: EASE } };

  return (
    <section className="mx-2 flex justify-center rounded-[16px] bg-[#cbe0b8] px-4 py-16 sm:px-8 md:py-24 lg:py-[120px]">
      <div className="flex w-full max-w-[1120px] flex-col items-center gap-10 lg:gap-14">
        <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="font-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-ink [text-wrap:balance] md:text-[44px] lg:text-[52px]">
            Why aren’t Rang De returns higher?
            <span className="block text-green-dark">Because the rate has to be fair to them too.</span>
          </h2>
          <p className="max-w-[620px] font-display text-p1 font-medium text-ink/72 lg:text-[20px] lg:leading-[30px]">
            Rang De isn’t built to beat the stock market. Your money earns a steady return, and the same loan keeps working for the person who took it.
          </p>
        </div>

        <div ref={ref} className="w-full overflow-hidden rounded-[20px] bg-white shadow-[0_1px_2px_rgba(41,45,54,0.06),0_20px_48px_rgba(41,45,54,0.08)]">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            {/* Yours. */}
            <div className="flex flex-col justify-between gap-6 border-b border-dashed border-ink/16 p-6 sm:p-8 md:border-b-0 md:border-r lg:p-10">
              <p className="font-display text-[12px] font-bold uppercase tracking-[1px] text-ink/56">Your return</p>
              <div className="flex flex-col gap-2">
                <p className="font-display font-bold leading-none tracking-[-0.03em] text-nav-navy">
                  <span className="text-[20px] align-top lg:text-[24px]">up to </span>
                  <span className="text-[64px] tabular-nums lg:text-[88px]">
                    <CountUp to={8.5} play={shown} />%
                  </span>
                </p>
                <p className="font-display text-p2 font-medium text-ink/64">a year, paid back to you month by month.</p>
              </div>
            </div>

            {/* Theirs. */}
            <div className="flex flex-col gap-5 bg-[#F5F9F1] p-6 sm:p-8 lg:p-10">
              <p className="font-display text-[12px] font-bold uppercase tracking-[1px] text-ink/56">Their return, from the same loan</p>
              <ul className="grid grid-cols-2 gap-2 sm:gap-3">
                {THEIRS.map((t, i) => (
                  <motion.li key={t.label} {...rise(i)} className="flex flex-col items-start gap-2 rounded-[12px] bg-white p-3 ring-1 ring-[#62af1d]/20 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
                    <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6E6] sm:size-[44px]">
                      <span
                        aria-hidden
                        className="block size-[20px] sm:size-[24px]"
                        style={{ backgroundColor: GREEN_DARK, WebkitMask: `url(${t.icon}) center / contain no-repeat`, mask: `url(${t.icon}) center / contain no-repeat` }}
                      />
                    </span>
                    <span className="font-display text-[14px] font-bold leading-[18px] text-ink sm:text-p2">{t.label}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Why the rate can't just go up. */}
          <div className="flex flex-col items-start gap-3 border-t border-ink/8 px-6 py-5 sm:flex-row sm:items-center sm:gap-5 sm:px-8 lg:px-10">
            <span className="shrink-0 rounded-full bg-[#FDECEC] px-3 py-1 font-display text-[13px] font-bold text-[#B42318]">17.77% a year</span>
            <p className="font-display text-p3 font-medium text-ink/72">
              That’s what informal loans in rural India cost on average, the alternative most of these borrowers have. A higher rate here would take them back towards it.
              <span className="ml-1 text-ink/48">Source: NABARD, July 2026.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
