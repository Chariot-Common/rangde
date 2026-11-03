"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { LiveSignal } from "@/components/sections/opportunities/LiveSignal";
import { imgix, type IndividualOpportunity, type StateOpportunity } from "@/lib/opportunities";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Version D: "Where is home?" — pick a state, meet who is raising a loan there right now (live listings). */
export function HomeStatePicker({ individuals, states }: { individuals: IndividualOpportunity[]; states: StateOpportunity[] }) {
  const reduce = useReducedMotion();
  const byState = useMemo(() => {
    const m = new Map<string, IndividualOpportunity[]>();
    for (const o of individuals) m.set(o.state, [...(m.get(o.state) ?? []), o]);
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [individuals]);
  const [state, setState] = useState(byState[0]?.[0] ?? "");
  const list = byState.find(([s]) => s === state)?.[1] ?? [];
  const summary = states.find((s) => s.name.toLowerCase() === state.toLowerCase());

  if (byState.length === 0) return null;

  return (
    <section id="home-state" className="relative mx-2 flex scroll-mt-[calc(var(--navbar-bottom)+8px)] flex-col items-center gap-8 rounded-[16px] bg-[#cbe8f6] px-4 py-12 sm:px-8 sm:py-16 lg:py-[80px]">
      <h2 className="text-center font-display text-h3 font-bold text-ink">
        <span className="block text-ink/72">Where is home?</span>
        <span className="inline-flex items-center gap-3">
          <LiveSignal className="size-[0.85em] shrink-0" />
          Back someone there
        </span>
      </h2>

      <div role="group" aria-label="Your home state" className="flex max-w-[960px] flex-wrap justify-center gap-2">
        {byState.map(([s, items]) => {
          const active = s === state;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              aria-label={`${s}, ${items.length} borrower${items.length === 1 ? "" : "s"}`}
              onClick={() => setState(s)}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-dark px-4 font-display text-p3 font-bold transition-colors ${
                active ? "bg-green-dark text-white shadow-[0_2px_8px_rgba(58,110,12,0.32)]" : "bg-white/70 text-ink/80 ring-1 ring-ink/12 hover:bg-white"
              }`}
            >
              {s}
              <span className={`flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] ${active ? "bg-white text-green-dark" : "bg-ink/8 text-ink"}`}>
                {items.length}
              </span>
            </button>
          );
        })}
      </div>

      {summary && (
        <p className="max-w-[760px] text-center font-display text-p1 font-medium text-ink/80">
          In <span className="font-bold text-ink">{summary.name}</span>, {summary.investors} social investors have already backed{" "}
          <span className="font-bold text-green-dark">{summary.investees} entrepreneurs</span> with {summary.invested}.
        </p>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={
            list.length > 3
              ? "-mx-4 flex w-[calc(100%+32px)] snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:w-[calc(100%+64px)] sm:px-8"
              : "flex w-full max-w-[1200px] flex-wrap justify-center gap-4"
          }
        >
          {list.map((o) => {
            const pct = Math.min(100, Math.round((o.raised / o.goal) * 100));
            return (
              <a
                key={o.key}
                href={`https://rangde.in/i/${o.key}`}
                className="flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_4px_16px_rgba(41,45,54,0.08)] transition-shadow hover:shadow-[0_8px_24px_rgba(41,45,54,0.14)] sm:w-[300px]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/8">
                  <Image src={imgix(o.photo, 600, 450)} alt="" fill unoptimized sizes="300px" className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/72 via-black/32 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-4">
                    <p className="font-display text-p2 font-bold leading-[22px] text-white">{o.name}</p>
                    <p className="font-display text-p4 font-medium text-white/90">
                      {o.district}, {o.state}
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <p className="line-clamp-2 min-h-[40px] font-display text-p3 font-medium text-ink/80">{o.purpose}</p>
                  <div className="flex flex-col gap-2">
                    <div className="h-[6px] overflow-hidden rounded-full bg-ink/8" aria-hidden>
                      <div className="h-full rounded-full bg-green-dark" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                    <p className="flex justify-between font-display text-p4 text-ink/72">
                      <span>
                        <span className="font-bold text-ink">{inr(Math.max(o.goal - o.raised, 0))}</span> to go
                      </span>
                      <span>of {inr(o.goal)}</span>
                    </p>
                  </div>
                  <div className="mt-auto flex divide-x divide-ink/8 border-t border-ink/8 pt-4 text-center">
                    {[
                      ["Returns", `${o.returnRate}%`, "p.a."],
                      ["Tenure", String(o.tenureMonths), "months"],
                      ["Rating", o.ratingLabel || "—", ""],
                    ].map(([l, v, s]) => (
                      <div key={l} className="flex flex-1 flex-col items-center gap-0.5">
                        <span className="font-display text-[11px] font-medium text-ink/72">{l}</span>
                        <span className="font-display text-p3 font-bold capitalize text-ink">{v.toLowerCase()}</span>
                        {s && <span className="font-display text-[10px] font-semibold uppercase tracking-[0.5px] text-ink/72">{s}</span>}
                      </div>
                    ))}
                  </div>
                  <span className="font-display text-p3 font-bold text-green-dark">Back {o.name.split(" ")[0]} →</span>
                </div>
              </a>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
