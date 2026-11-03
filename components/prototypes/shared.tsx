"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { formatInr } from "@/lib/investment-calculator";
import { imgix, type IndividualOpportunity } from "@/lib/opportunities";

export const AMOUNT_OPTIONS = [1_000, 2_000, 5_000, 10_000];

export const INPUT_CLASS =
  "h-[48px] w-full rounded-[8px] border border-ink/16 bg-white px-4 font-display text-p2 font-medium text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-primary";

export function StepCard({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-[16px] bg-white p-5 shadow-[0px_4px_16px_rgba(41,45,54,0.08)] sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-primary font-display text-p2 font-bold text-white">
          {n}
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-p1 font-bold text-ink">{title}</h2>
          {hint && <p className="font-display text-p3 font-medium text-ink/64">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-4 py-2 font-display text-p3 font-bold transition-colors ${
        active ? "bg-primary text-white" : "bg-primary/8 text-primary hover:bg-primary/16"
      }`}
    >
      {children}
    </button>
  );
}

export function Notice({ tone, title, children }: { tone: "amber" | "blue"; title: string; children: ReactNode }) {
  const toneClass = tone === "amber" ? "border-[#FEC700] bg-[#FFF1C7]" : "border-primary/32 bg-primary/8";
  return (
    <div role="note" className={`flex flex-col gap-1 rounded-[12px] border-2 p-4 ${toneClass}`}>
      <p className="font-display text-p3 font-bold text-ink">{title}</p>
      <p className="font-display text-p3 font-medium text-ink/80">{children}</p>
    </div>
  );
}

export function ProgressBar({ raised, extra = 0, goal }: { raised: number; extra?: number; goal: number }) {
  const base = Math.min(100, (raised / goal) * 100);
  const add = Math.min(100 - base, (extra / goal) * 100);
  return (
    <div className="flex h-[8px] w-full overflow-hidden rounded-full bg-ink/8" role="img" aria-label={`${Math.round(base + add)}% funded`}>
      <div className="h-full bg-green" style={{ width: `${base}%` }} />
      <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${add}%` }} />
    </div>
  );
}

export function EntrepreneurPicker({
  items,
  selectedKey,
  onSelect,
}: {
  items: IndividualOpportunity[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((o) => {
        const selected = o.key === selectedKey;
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(o.key)}
            className={`flex flex-col overflow-hidden rounded-[12px] bg-white text-left transition-shadow ${
              selected ? "ring-2 ring-primary shadow-[0_4px_16px_rgba(13,170,222,0.24)]" : "ring-1 ring-ink/16 hover:ring-ink/32"
            }`}
          >
            <div className="relative aspect-[16/9] w-full bg-ink/8">
              <Image src={imgix(o.photo, 480, 270)} alt="" fill unoptimized sizes="320px" className="object-cover" />
              {selected && (
                <span className="absolute right-2 top-2 rounded-full bg-primary px-3 py-1 font-display text-p4 font-bold text-white">
                  Selected
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 p-4">
              <div className="flex flex-col">
                <p className="font-display text-p2 font-bold text-ink">{o.name}</p>
                <p className="font-display text-p4 font-medium text-ink/64">
                  {o.district}, {o.state}
                </p>
              </div>
              <p className="line-clamp-2 font-display text-p3 font-medium text-ink/80">{o.purpose}</p>
              <ProgressBar raised={o.raised} goal={o.goal} />
              <p className="font-display text-p4 font-medium text-ink/64">
                {formatInr(o.raised)} of {formatInr(o.goal)} · {o.returnRate}% p.a. · {o.tenureMonths} months
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function PrototypeHeader({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <p className="rounded-full bg-[#FFF1C7] px-4 py-1 font-display text-p4 font-bold uppercase tracking-[0.88px] text-ink">
        {eyebrow}
      </p>
      <h1 className="font-display text-h2 font-bold text-green-dark">{title}</h1>
      <p className="max-w-[640px] font-display text-p1 font-medium text-ink/80">{lead}</p>
    </header>
  );
}
