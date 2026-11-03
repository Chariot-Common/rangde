"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { reelCover, reelUrl, reels, type Reel } from "@/data/reels";
import { StoryRows } from "@/components/sections/testimonials/StoryPairs";

/**
 * "From both sides of the same coin" (Version B): the reels split into the social investors'
 * side and the entrepreneurs' side. Desktop (Figma 2423:14045): two fans of reels facing away
 * from each other, the front card of each stepping back as the next comes forward. Phones
 * (the mobile carousel prototype): one carousel through both groups, with a pill per group
 * that fills as its cards pass, and a caption naming the group on screen.
 */

const byCode = (codes: string[]) => codes.map((c) => reels.find((r) => r.code === c)!).filter(Boolean);

const GROUPS = [
  {
    label: "Entrepreneurs",
    desc: "Whose lives were changed after getting funding from Rang De.",
    reels: byCode(["DZb43WMJGUk", "DaC1ZZNp7gc", "DZpDB01p6Lo", "DaVC13Wporz", "Db5Qn0bpHwS"]),
  },
  {
    label: "Social Investors",
    desc: "On their thoughts and experiences, social investing with Rang De.",
    reels: byCode(["DKl90LkTp2_", "DJ8m_66TYR1", "DdObR7qNxXJ", "DHsWunxNohj", "Dd3cW7nzdIr"]),
  },
];

function Play({ size }: { size: number }) {
  return (
    <span
      aria-hidden
      className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/72"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" style={{ width: size * 0.4, height: size * 0.4, marginLeft: size * 0.04 }}>
        <path d="M6 3.8v16.4c0 .8.9 1.3 1.6.9l13-8.2c.6-.4.6-1.4 0-1.8l-13-8.2C6.9 2.5 6 3 6 3.8z" fill="#292D36" />
      </svg>
    </span>
  );
}

// Shared timing and geometry helpers, then the two layouts.

// Slot geometry by distance from the centre card, in the prototype's 328px-wide design units.
const SL = [
  { x: 0, s: 1, o: 1 },
  { x: 190, s: 0.56, o: 0.85 },
  { x: 250, s: 0.4, o: 0.45 },
  { x: 280, s: 0.3, o: 0 },
];
const DUR = 2500; // one card's transition
const HOLD = 1200; // rest on each card
const RANGE = 190; // finger px per card
const ALL = GROUPS.flatMap((g) => g.reels);
const N0 = GROUPS[0].reels.length;
const T = ALL.length;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mod = (a: number, n: number) => ((a % n) + n) % n;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const eInOut = (t: number) => 0.5 * (0.5 - 0.5 * Math.cos(Math.PI * t) + (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2));
const eOut = (t: number) => 1 - Math.pow(1 - t, 3);

// A reel opens straight on Instagram, in a new tab: no in-between preview.
const openReel = (r: Reel) => window.open(reelUrl(r.code), "_blank", "noopener,noreferrer");

/* ── Desktop: two fans ─────────────────────────────────────────────────────────────────── */

// Slots behind the front card, measured off the Figma frame: horizontal shift (in front-card
// widths, toward the outside), scale and opacity. The front card is slot 0.
const FAN = [
  { x: 0, s: 1, o: 1 },
  { x: 0.457, s: 0.567, o: 0.78 },
  { x: 0.733, s: 0.327, o: 0.52 },
  { x: 0.854, s: 0.171, o: 0.32 },
  { x: 0.926, s: 0.087, o: 0.16 },
];
const STEP_MS = 3200; // one turn of a fan, rest included
const TURN_MS = 1400; // the turn itself
const DRAG_PX = 220; // pointer px per card
const EXIT = 0.7; // share of a turn the front card spends leaving; the rest it fades in at the back

// The front card leaving (Figma 2423:14045, frames 01 → 03 → 04 → 05 → 06 → 02): it swells a touch,
// then turns on its vertical axis like a door — its inner edge swinging away — while it slides in
// toward the gap between the two fans, until it is a sliver that shrinks and fades out there.
// It stops edge-on (a straight line) and never turns past it; the deep perspective keeps the
// near edge from ballooning on the way, so it reads as a flat card closing, not a tilt.
const TURN_DEG = 89;
const PERSPECTIVE = 2400;
function exitPose(u: number, inward: number) {
  return {
    r: inward * TURN_DEG * eInOut(clamp01(u / 0.8)),
    x: inward * 0.62 * eInOut(u),
    s: u < 0.25 ? 1 + 0.06 * eOut(u / 0.25) : 1.06 - 0.5 * eInOut((u - 0.25) / 0.75),
    o: u < 0.35 ? 1 : 1 - eInOut((u - 0.35) / 0.65),
  };
}

// A card's pose at distance d (0 = front) from the fan's position, d in [0, n).
function fanPose(d: number, n: number, side: -1 | 1) {
  if (d <= n - 1) {
    const i = Math.min(Math.floor(d), FAN.length - 2);
    const f = clamp01(d - i);
    const a = FAN[Math.min(i, FAN.length - 1)];
    const b = FAN[Math.min(i + 1, FAN.length - 1)];
    return { x: side * lerp(a.x, b.x, f), s: lerp(a.s, b.s, f), o: lerp(a.o, b.o, f), r: 0, z: Math.round(10 - d) };
  }
  const e = n - d; // 0 → 1 as the front card leaves
  if (e < EXIT) return { ...exitPose(e / EXIT, -side), z: 20 };
  const back = FAN[Math.min(n - 1, FAN.length - 1)];
  return { x: side * back.x, s: back.s, o: back.o * ((e - EXIT) / (1 - EXIT)), r: 0, z: 1 };
}

type FanState = {
  Q: number;
  hold: number;
  tween: null | { from: number; to: number; dur: number; t: number; ease: (t: number) => number };
  drag: null | { id: number; x0: number; Q0: number; moved: boolean; samples: { t: number; Q: number }[] };
  justDragged: boolean;
};

function Fan({ group, side, stagger, live }: { group: (typeof GROUPS)[number]; side: -1 | 1; stagger: number; live: React.RefObject<boolean> }) {
  const n = group.reels.length;
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const st = useRef<FanState>({ Q: 0, hold: STEP_MS - TURN_MS + stagger, tween: null, drag: null, justDragged: false });

  useEffect(() => {
    const s = st.current;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!s.drag) {
        const tw = s.tween;
        if (tw) {
          tw.t += dt;
          const k = Math.min(1, tw.t / tw.dur);
          s.Q = tw.from + (tw.to - tw.from) * tw.ease(k);
          if (k >= 1) {
            s.Q = mod(tw.to, n);
            s.tween = null;
            s.hold = STEP_MS - TURN_MS;
          }
        } else if (live.current) {
          s.hold -= dt;
          if (s.hold <= 0) s.tween = { from: s.Q, to: Math.round(s.Q) + 1, dur: TURN_MS, t: 0, ease: eInOut };
        }
      }
      cards.current.forEach((el, k) => {
        if (!el) return;
        const p = fanPose(mod(k - s.Q, n), n, side);
        el.style.transform = `perspective(${PERSPECTIVE}px) translate3d(${p.x * 100}%,0,0) scale(${p.s}) rotateY(${p.r}deg)`;
        el.style.opacity = String(p.o);
        el.style.zIndex = String(p.z);
        el.style.visibility = p.o < 0.01 ? "hidden" : "visible";
        el.tabIndex = Math.abs(mod(k - s.Q + n / 2, n) - n / 2) < 0.5 ? 0 : -1;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n, side, live]);

  // Dragging toward the gap between the fans turns this fan forward; dragging away from it
  // brings back the card that last left. Let go midway and it glides on and settles.
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const s = st.current;
    s.tween = null;
    s.justDragged = false;
    s.drag = { id: e.pointerId, x0: e.clientX, Q0: s.Q, moved: false, samples: [{ t: performance.now(), Q: s.Q }] };
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    const D = s.drag;
    if (!D || D.id !== e.pointerId) return;
    if (!D.moved && Math.abs(e.clientX - D.x0) > 6) {
      D.moved = true;
      // Capture only once it is a drag, so a plain click still lands on the card's link.
      if (e.currentTarget.hasPointerCapture?.(e.pointerId) === false) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
      }
    }
    if (!D.moved) return;
    s.Q = D.Q0 - (side * (e.clientX - D.x0)) / DRAG_PX;
    const now = performance.now();
    D.samples.push({ t: now, Q: s.Q });
    while (D.samples.length > 2 && now - D.samples[0].t > 100) D.samples.shift();
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    const D = s.drag;
    if (!D || D.id !== e.pointerId) return;
    s.drag = null;
    s.hold = STEP_MS - TURN_MS;
    if (!D.moved) return;
    s.justDragged = true;
    const a = D.samples[0];
    const b = D.samples[D.samples.length - 1];
    const v = b.t > a.t && performance.now() - b.t < 80 ? (b.Q - a.Q) / (b.t - a.t) : 0; // cards per ms
    const to = Math.round(s.Q + Math.max(-2, Math.min(2, v * 260)));
    const dist = Math.abs(to - s.Q);
    // An ease-out whose opening speed matches the throw, so the fan glides to a halt.
    const dur = Math.max(320, Math.min(TURN_MS, Math.abs(v) > 1e-4 ? (3 * dist) / Math.abs(v) : dist * TURN_MS));
    s.tween = { from: s.Q, to, dur, t: 0, ease: eOut };
  };

  return (
    <div className={`flex flex-col gap-6 ${side < 0 ? "items-end" : "items-start"}`}>
      <div
        className="relative aspect-[176/224] w-[clamp(200px,20vw,290px)] cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        // A drag that ends over a card must not also open it.
        onClickCapture={(e) => {
          if (st.current.justDragged) {
            e.preventDefault();
            st.current.justDragged = false;
          }
        }}
      >
        {group.reels.map((reel, k) => (
          <a
            key={reel.code}
            ref={(el) => {
              cards.current[k] = el;
            }}
            href={reelUrl(reel.code)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch on Instagram: ${reel.title}`}
            draggable={false}
            className="absolute inset-0 overflow-hidden rounded-[10px] bg-ink/8 shadow-[0_6px_16px_rgba(41,45,54,0.12)] will-change-transform"
          >
            <Image src={reelCover(reel.code)} alt="" fill sizes="290px" className="pointer-events-none object-cover" draggable={false} />
            <Play size={48} />
          </a>
        ))}
      </div>
      <div className="flex w-[clamp(200px,20vw,290px)] flex-col gap-1 text-center">
        <h3 className="font-display text-h4 font-bold text-ink">{group.label}</h3>
        <p className="font-display text-p3 font-medium text-ink/80">{group.desc}</p>
      </div>
    </div>
  );
}

// The fans keep turning while hovered; they rest only off screen or for reduced motion.
function DesktopFans() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const live = useRef(false);
  useEffect(() => {
    live.current = inView && !reduce;
  }, [inView, reduce]);

  return (
    <div ref={ref} className="relative hidden w-full justify-center gap-[clamp(64px,8vw,120px)] md:flex">
      <Fan group={GROUPS[0]} side={-1} stagger={0} live={live} />
      <Fan group={GROUPS[1]} side={1} stagger={STEP_MS / 2} live={live} />
      {/* The fans fade out into the section at both edges. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-30 w-[12%] bg-gradient-to-r from-[#F7F3ED] to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-30 w-[12%] bg-gradient-to-l from-[#F7F3ED] to-transparent" />
    </div>
  );
}


function slotAt(a: number) {
  const i = Math.min(Math.floor(a), SL.length - 2);
  const f = clamp01(a - i);
  return { x: lerp(SL[i].x, SL[i + 1].x, f), s: lerp(SL[i].s, SL[i + 1].s, f), o: lerp(SL[i].o, SL[i + 1].o, f) };
}

// Pill fills as a function of the position: the first fills card by card through its group,
// then holds full while the second fills; both fade to grey when the loop wraps.
function pillState(Q: number) {
  const q = mod(Q, T);
  const M = T - N0;
  if (q <= N0 - 1) return { s: (q + 1) / N0, so: 1, e: 0, eo: 1 };
  if (q <= T - 1) return { s: 1, so: 1, e: (q - (N0 - 1)) / M, eo: 1 };
  const u = q - (T - 1);
  if (u < 0.6) {
    const o = 0.5 + 0.5 * Math.cos((Math.PI * u) / 0.6);
    return { s: 1, so: o, e: 1, eo: o };
  }
  return { s: (u - 0.6) / 0.4 / N0, so: 1, e: 0, eo: 1 };
}

/* ── Phones: one carousel through both groups ──────────────────────────────────────────── */

function MobileCarousel() {
  const fitRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const [group, setGroup] = useState(0);
  const [scale, setScale] = useState(1);
  const inView = useInView(fitRef, { amount: 0.4 });
  const reduce = useReducedMotion();
  const live = useRef({ inView, reduce });
  useEffect(() => {
    live.current = { inView, reduce };
  }, [inView, reduce]);

  const st = useRef({
    Q: 0,
    tween: null as null | { from: number; to: number; dur: number; t: number; ease: (t: number) => number },
    drag: null as null | { id: number; x0: number; Q0: number; moved: boolean; idx: number; samples: { t: number; x: number }[] },
    hold: HOLD,
  });

  useEffect(() => {
    const fit = fitRef.current;
    if (!fit) return;
    const ro = new ResizeObserver(() => setScale(fit.clientWidth / 328));
    ro.observe(fit);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const s = st.current;
    let raf = 0;
    let last = performance.now();
    const render = () => {
      cards.current.forEach((el, i) => {
        if (!el) return;
        const d = mod(i - s.Q + T / 2, T) - T / 2;
        const a = Math.abs(d);
        const sl = slotAt(a);
        el.style.transform = `translate3d(${(d < 0 ? -1 : 1) * sl.x}px,0,0) scale(${sl.s})`;
        el.style.opacity = String(sl.o);
        el.style.zIndex = String(Math.round(200 - a * 20));
        el.style.visibility = sl.o < 0.01 ? "hidden" : "visible";
      });
      const ps = pillState(s.Q);
      const [f0, f1] = fills.current;
      if (f0) {
        f0.style.transform = `scaleX(${clamp01(ps.s)})`;
        f0.style.opacity = String(ps.so);
      }
      if (f1) {
        f1.style.transform = `scaleX(${clamp01(ps.e)})`;
        f1.style.opacity = String(ps.eo);
      }
      const g = mod(Math.round(s.Q), T) < N0 ? 0 : 1;
      setGroup((prev) => (prev === g ? prev : g));
    };
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const { inView, reduce } = live.current;
      if (!s.drag) {
        const tw = s.tween;
        if (tw) {
          tw.t += dt;
          const k = Math.min(1, tw.t / tw.dur);
          s.Q = tw.from + (tw.to - tw.from) * tw.ease(k);
          if (k >= 1) {
            s.Q = mod(tw.to, T);
            s.tween = null;
            s.hold = HOLD;
          }
        } else if (inView && !reduce) {
          s.hold -= dt;
          if (s.hold <= 0) s.tween = { from: s.Q, to: Math.round(s.Q) + 1, dur: DUR, t: 0, ease: eInOut };
        }
      }
      render();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const tweenTo = (to: number, dur: number, ease = eInOut) => {
    const s = st.current;
    s.tween = { from: s.Q, to, dur: Math.max(1, dur), t: 0, ease };
  };

  const jumpTo = (g: number) => {
    const s = st.current;
    const r = Math.round(s.Q);
    const dist = mod((g === 0 ? 0 : N0) - mod(r, T), T);
    if (dist) tweenTo(r + dist, DUR);
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-idx]");
    e.currentTarget.setPointerCapture(e.pointerId);
    st.current.tween = null;
    st.current.drag = { id: e.pointerId, x0: e.clientX, Q0: st.current.Q, moved: false, idx: el ? Number(el.dataset.idx) : -1, samples: [{ t: performance.now(), x: e.clientX }] };
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const D = st.current.drag;
    if (!D || D.id !== e.pointerId) return;
    if (Math.abs(e.clientX - D.x0) > 6) D.moved = true;
    if (D.moved) st.current.Q = D.Q0 + Math.max(-1, Math.min(1, -(e.clientX - D.x0) / scale / RANGE));
    const now = performance.now();
    D.samples.push({ t: now, x: e.clientX });
    while (D.samples.length > 2 && now - D.samples[0].t > 120) D.samples.shift();
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    const D = s.drag;
    if (!D || D.id !== e.pointerId) return;
    s.drag = null;
    s.hold = HOLD;
    if (!D.moved) {
      if (D.idx < 0) return;
      const d = mod(D.idx - s.Q + T / 2, T) - T / 2;
      if (Math.abs(d) < 0.15) openReel(ALL[D.idx]);
      else if (Math.abs(d) < 1.15) tweenTo(s.Q + Math.round(d), DUR * 0.6);
      return;
    }
    const a = D.samples[0];
    const b = D.samples[D.samples.length - 1];
    const v = b.t > a.t ? -(b.x - a.x) / scale / (b.t - a.t) : 0;
    const Q = s.Q;
    const lo = Math.floor(Q + 1e-6);
    const fr = Q - lo;
    let target = Math.round(Q);
    if (Math.abs(v) > 0.45) target = v > 0 ? lo + 1 : Math.ceil(Q - 1e-6) - 1;
    else if (Q > D.Q0) target = fr > 0.25 ? lo + 1 : lo;
    else if (Q < D.Q0) target = 1 - fr > 0.25 ? lo : lo + 1;
    tweenTo(target, Math.max(380, Math.abs(target - Q) * DUR * 0.6), eOut);
  };

  return (
    <div ref={fitRef} className="relative aspect-[328/512] w-full max-w-[420px] select-none overflow-hidden md:hidden">
      <div className="absolute left-0 top-0 h-[512px] w-[328px] origin-top-left" style={{ transform: `scale(${scale})` }}>
        <div className="absolute inset-x-0 top-6 z-[300] flex justify-center gap-2" role="group" aria-label="Story groups">
          {GROUPS.map((g, gi) => (
            <button
              key={g.label}
              type="button"
              onClick={() => jumpTo(gi)}
              aria-pressed={group === gi}
              className="relative h-[32px] overflow-hidden whitespace-nowrap rounded-[10px] bg-[#E4E0D7] px-3 font-display text-[13px] font-medium leading-[32px] text-ink"
            >
              <span
                ref={(el) => {
                  fills.current[gi] = el;
                }}
                className="absolute inset-0 origin-left scale-x-0 bg-white"
              />
              <span className="relative">{g.label}</span>
            </button>
          ))}
        </div>
        <div
          className="absolute left-0 top-0 h-[420px] w-[328px] touch-pan-y"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {ALL.map((reel, i) => (
            <button
              key={reel.code}
              ref={(el) => {
                cards.current[i] = el;
              }}
              data-idx={i}
              type="button"
              aria-label={`Watch on Instagram: ${reel.title}`}
              // Pointer taps are handled on the track (so a swipe never opens a reel); this
              // catches keyboard presses, which arrive as clicks with no pointer detail.
              onClick={(e) => e.detail === 0 && openReel(reel)}
              className="absolute left-[44.5px] top-[80px] h-[305px] w-[239px] overflow-hidden rounded-[4px] bg-ink/8 will-change-transform"
            >
              <Image src={reelCover(reel.code)} alt="" fill sizes="240px" className="pointer-events-none object-cover" draggable={false} />
              <Play size={48} />
            </button>
          ))}
        </div>
        <div className="absolute left-[26px] top-[409px] h-[72px] w-[276px]" aria-live="polite">
          {GROUPS.map((g, gi) => (
            <p
              key={g.label}
              className={`absolute inset-x-0 top-0 line-clamp-3 text-center font-display text-[16px] leading-[24px] text-ink transition-opacity duration-500 ${group === gi ? "opacity-100" : "opacity-0"}`}
            >
              <strong className="font-semibold">{g.label}</strong> · {g.desc}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReelsTwoSides() {
  return (
    <section className="mx-2 flex flex-col items-center gap-8 overflow-hidden rounded-[16px] bg-[#F7F3ED] px-4 py-12 sm:px-8 sm:py-16 md:gap-14 lg:py-[80px]">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.44px] text-ink/72">Listen to stories</p>
        <h2 className="font-display text-h3 font-bold text-ink [text-wrap:balance]">From both sides of the same coin</h2>
      </div>
      <DesktopFans />
      <MobileCarousel />
      {/* The same two sides in their own words: the success-story and testimonial cards, run
          edge to edge (out of the section's side padding), 120px under the reels on desktop. */}
      <div className="-mx-4 w-[calc(100%+32px)] sm:-mx-8 sm:w-[calc(100%+64px)] md:mt-[64px]">
        <StoryRows />
      </div>
    </section>
  );
}
