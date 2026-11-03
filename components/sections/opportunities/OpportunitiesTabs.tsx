"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { Ticker } from "@/components/ui/Ticker";
import {
  STATE_TERMS,
  imgix,
  type FundOpportunity,
  type IndividualOpportunity,
  type StateOpportunity,
} from "@/lib/opportunities";

type TabKey = "individuals" | "states" | "funds";

const EXPLORE_URL: Record<TabKey, string> = {
  individuals: "https://rangde.in/invest/individuals",
  states: "https://rangde.in/invest/state",
  funds: "https://rangde.in/invest/fund",
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// The live feed can list 70+ people. The row shows the first dozen, in rangde.in's own order, and
// ends with a card to see the rest there: every card carries photos and rolling-digit numbers, and
// rendering them all added about 10,000 elements to the page.
const MAX_CARDS = 12;

interface Props {
  individuals: IndividualOpportunity[];
  states: StateOpportunity[];
  funds: FundOpportunity[];
}

export function OpportunitiesTabs({ individuals, states, funds }: Props) {
  const [tab, setTab] = useState<TabKey>("individuals");
  const allTabs: { key: TabKey; label: string; count: number }[] = [
    { key: "individuals", label: "Individuals", count: individuals.length },
    { key: "states", label: "States", count: states.length },
    { key: "funds", label: "Funds", count: funds.length },
  ];
  // A tab with nothing open (e.g. no funds right now) is hidden.
  const tabs = allTabs.filter((t) => t.count > 0);
  const activeIndex = tabs.findIndex((t) => t.key === tab);

  return (
    <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
      {/* Segmented control — the active blue pill slides between tabs. */}
      <div role="tablist" aria-label="Investment opportunities" className="relative flex rounded-full bg-primary/8 p-1 ring-1 ring-primary/16">
        <span
          aria-hidden
          className="absolute bottom-1 left-1 top-1 rounded-full bg-primary shadow-[0_2px_8px_rgba(13,170,222,0.32)] transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{ width: `calc((100% - 8px) / ${tabs.length})`, transform: `translateX(${activeIndex * 100}%)` }}
        />
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            aria-controls={`opps-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`relative z-10 flex w-[112px] items-center justify-center gap-1.5 rounded-full py-2.5 font-display text-p4 font-bold transition-colors sm:w-[140px] sm:text-p3 ${
              tab === t.key ? "text-white" : "text-ink/72 hover:text-primary"
            }`}
          >
            {t.label}
            <span
              className={`flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-bold leading-none transition-colors ${
                tab === t.key ? "bg-white text-primary" : "bg-primary/12 text-primary"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div id={`opps-${tab}`} role="tabpanel" className="w-full">
        {tab === "individuals" && (
          <CardRow key="individuals">
            {individuals.slice(0, MAX_CARDS).map((o) => (
              <IndividualCard key={o.key} o={o} />
            ))}
            {individuals.length > MAX_CARDS && (
              <a
                href={EXPLORE_URL.individuals}
                className="flex w-[280px] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-[16px] bg-white/60 p-6 text-center font-display text-p2 font-bold text-primary ring-1 ring-primary/16 transition-colors hover:bg-white sm:w-[300px]"
              >
                See all {individuals.length} people on Rang De
                <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            )}
          </CardRow>
        )}
        {tab === "states" && (
          <CardRow key="states">
            {states.map((s) => (
              <StateCard key={s.slug} s={s} />
            ))}
          </CardRow>
        )}
        {tab === "funds" && (
          <CardRow key="funds">
            {funds.map((f) => (
              <FundCard key={f.slug} f={f} />
            ))}
          </CardRow>
        )}
      </div>

      <a
        href={EXPLORE_URL[tab]}
        className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[4px] bg-primary px-8 font-display text-p3 font-bold text-white transition-[filter] hover:brightness-95"
      >
        Explore all opportunities
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>

      {/* Moved down from under the heading (too small there, and it crowded the tabs). */}
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 font-display text-p4 font-medium text-ink/64">
        {TRUST.map(({ label, icon }) => (
          <li key={label} className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="size-[16px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {icon}
            </svg>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const TRUST = [
  { label: "₹500 minimum investment", icon: <><circle cx="12" cy="12" r="8" /><path d="M12 8v8M9 12h6" /></> },
  { label: "Secured by Razorpay", icon: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></> },
  { label: "Regulated by RBI", icon: <><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></> },
];

/**
 * Horizontally scrolling row with native touch scroll + snap. Centres itself when the
 * cards fit (e.g. one fund), and shows prev/next arrows on desktop only when it overflows.
 */
function CardRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 300), behavior: "smooth" });
  };

  const overflows = !(edges.start && edges.end);

  return (
    // Sized for exactly four 300px cards: 4×300 + 3×16 gap + 2×24 padding + 2×16 outer = 1328, so even on very
    // wide or zoomed-out screens no more than four show at once; the rest scroll inside it.
    <div className="relative mx-auto w-full max-w-[1328px] px-2 sm:px-4">
      <div
        ref={ref}
        className={`flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-4 pt-1 [scrollbar-width:none] sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden ${
          overflows ? "" : "justify-center"
        }`}
      >
        {children}
      </div>
      {overflows && (
        <>
          <ArrowButton dir={-1} hidden={edges.start} onClick={() => page(-1)} />
          <ArrowButton dir={1} hidden={edges.end} onClick={() => page(1)} />
        </>
      )}
    </div>
  );
}

function ArrowButton({ dir, hidden, onClick }: { dir: 1 | -1; hidden: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === 1 ? "Next opportunities" : "Previous opportunities"}
      onClick={onClick}
      tabIndex={hidden ? -1 : 0}
      className={`absolute top-1/2 hidden size-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-[0_4px_16px_rgba(41,45,54,0.16)] transition-opacity hover:bg-bg-grey md:flex ${
        dir === 1 ? "right-0 sm:right-1" : "left-0 sm:left-1"
      } ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={dir === 1 ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
      </svg>
    </button>
  );
}

const CARD = "group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_4px_16px_rgba(41,45,54,0.08)] sm:w-[300px]";

function PhotoHeader({ src, alt, title, subtitle }: { src: string; alt: string; title: string; subtitle: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/8">
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes="300px"
        className="object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/72 via-black/32 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-4">
        <p className="font-display text-p2 font-bold leading-[22px] text-white">{title}</p>
        <p className="font-display text-p4 font-medium text-white/80">{subtitle}</p>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 text-center">
      <span className="font-display text-[11px] font-medium text-ink/56">{label}</span>
      <span className="font-display text-p2 font-bold text-ink">{value}</span>
      <span className="font-display text-[10px] font-semibold uppercase tracking-[0.5px] text-ink/56">{sub}</span>
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-[1px]" aria-label={`${count} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={`size-[12px] ${i < count ? "text-[#f5b301]" : "text-ink/16"}`} fill="currentColor" aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

function IndividualCard({ o }: { o: IndividualOpportunity }) {
  const ref = useRef<HTMLAnchorElement>(null);
  // Numbers tick up and the bar fills the first time the card is properly on screen —
  // cards further along the row wait until they're scrolled into view.
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const left = Math.max(o.goal - o.raised, 0);
  const pct = Math.min(100, Math.round((o.raised / o.goal) * 100));
  return (
    <a ref={ref} href={`https://rangde.in/i/${o.key}`} className={CARD}>
      <PhotoHeader src={imgix(o.photo, 600, 450)} alt={o.name} title={o.name} subtitle={`${o.district}, ${o.state}`} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <p className="line-clamp-2 min-h-[40px] font-display text-p3 font-medium text-ink/80">{o.purpose}</p>
        <div className="flex flex-col gap-2">
          <div className="h-[6px] overflow-hidden rounded-full bg-ink/8">
            <div
              className="h-full rounded-full bg-[#62af1d] transition-[width] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: seen ? `${Math.max(pct, 2)}%` : "0%" }}
            />
          </div>
          <p className="flex justify-between font-display text-p4 text-ink/64">
            <span>
              <Ticker value={inr(left)} play={seen} className="font-bold text-ink" /> to go
            </span>
            <span>of {inr(o.goal)}</span>
          </p>
        </div>
        <div className="mt-auto flex divide-x divide-ink/8 border-t border-ink/8 pt-4">
          <Stat label="Returns" value={<Ticker value={`${o.returnRate}%`} play={seen} delay={200} />} sub="p.a." />
          <Stat label="Tenure" value={<Ticker value={String(o.tenureMonths)} play={seen} delay={300} />} sub="months" />
          <Stat label="Credit rating" value={<Stars count={o.ratingStars} />} sub={o.ratingLabel || "—"} />
        </div>
      </div>
    </a>
  );
}

function StateCard({ s }: { s: StateOpportunity }) {
  return (
    <a href={`https://rangde.in/state/${s.slug}`} className={CARD}>
      <PhotoHeader src={imgix(s.image, 600, 450)} alt={s.name} title={s.name} subtitle={s.sectors} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <p className="font-display text-p3 font-medium text-ink/80">
          <b className="font-bold text-ink">{s.investors} investors</b> have invested{" "}
          <b className="font-bold text-ink">{s.invested}</b> in {s.investees} entrepreneurs so far.
        </p>
        <div className="mt-auto flex divide-x divide-ink/8 border-t border-ink/8 pt-4">
          <Stat label="Returns up to" value={STATE_TERMS.returnsUpTo} sub="p.a." />
          <Stat label="Tenure" value={STATE_TERMS.tenureMonths} sub="months" />
        </div>
      </div>
    </a>
  );
}

function FundCard({ f }: { f: FundOpportunity }) {
  return (
    <a href={`https://rangde.in/fund/${f.slug}`} className={`${CARD} sm:w-[360px]`}>
      <PhotoHeader src={imgix(f.image, 720, 540)} alt={f.name} title={f.name} subtitle={f.focus} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <p className="font-display text-p3 font-medium text-ink/80">{f.description}</p>
        <div className="mt-auto flex divide-x divide-ink/8 border-t border-ink/8 pt-4">
          <Stat label="Returns up to" value={f.returnsUpTo} sub="p.a." />
          <Stat label="Tenure" value={f.tenureMonths} sub="months" />
        </div>
      </div>
    </a>
  );
}
