"use client";
/* eslint-disable @next/next/no-img-element */
import { animate, useMotionValue } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { InkLines } from "./ink";
import { centreScrollFor } from "./pin";
import { A, CROPS, ID_CARD, PASSBOOK, SLIP, Thumb } from "./parts";
import s from "./page.module.css";

/*
 * 03 Why and 04 Contrast, which share the three proof objects (salary slip, ID card, passbook).
 * In Why they bob gently on their own, lean a little towards the pointer, and hovering one turns its phrase green.
 * Scrolling on, they float down on a loose, wobbly path into the left column of the Contrast table (scrubbed by the
 * scroll, easing out), shrinking to icon size. Contrast waits as a loading skeleton until the third row's bottom is on
 * screen, the moment they land; then its words fade in quickly, left column first, then the rural column.
 */

type Obj = {
  src: string;
  label: string;
  /** Figma placement in the 1440 × 360 band under the Why copy: the rotated box's left/top, its size, the image size inside it, the angle. */
  left: number;
  top: number;
  size: number;
  inner: number;
  rot: number;
  /** How far the path swings out sideways (px), how much it spins on the way (deg), how strongly it leans to the pointer (px). */
  swing: number;
  spin: number;
  lean: number;
};

const OBJECTS: Obj[] = [
  { src: SLIP, label: "Salary slip", left: 188, top: 36, size: 267.215, inner: 244.041, rot: 5.74, swing: 150, spin: 22, lean: 18 },
  { src: ID_CARD, label: "ID card", left: 614, top: 43, size: 253.294, inner: 239.127, rot: 3.5, swing: -110, spin: -16, lean: 12 },
  { src: PASSBOOK, label: "Passbook", left: 972, top: 0, size: 316.004, inner: 272.508, rot: -10.08, swing: 120, spin: 26, lean: 24 },
];
const PHRASES = ["Proof of income.", "Proof of identity.", "A record of loans you’ve repaid."];
const ICON = 72;

type Geo = { from: { x: number; y: number; w: number }[]; to: { x: number; y: number }[]; start: number; end: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A piece of the table: text grey 24 (icons at 24%) until the objects have landed, then its full colour after `d` ms. */
function Fade({ as: Tag = "p", d, className = "", children }: { as?: "p" | "div"; d: number; className?: string; children: ReactNode }) {
  return (
    <Tag className={`${s.fade} ${className}`} style={{ "--d": `${d}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}

export function ProofJourney() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contrastRef = useRef<HTMLElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const scatterRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  // The Contrast heading fills in (text grey 24 → 100, letter by letter) once the objects have landed.
  const headInk = useMotionValue(0);
  const whySlots = useRef<(HTMLDivElement | null)[]>([]);
  const iconSlots = useRef<(HTMLDivElement | null)[]>([]);
  const flyers = useRef<(HTMLDivElement | null)[]>([]);
  const geo = useRef<Geo | null>(null);
  const progress = useRef(0);
  const [hover, setHover] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const a = animate(headInk, revealed ? 1 : 0, { duration: revealed ? 0.7 : 0.3, ease: "easeOut" });
    return () => a.stop();
  }, [revealed, headInk]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { tx: 0, ty: 0, x: 0, y: 0 };
    let raf = 0;
    let visible = false;
    let shown = false;

    const measure = () => {
      const w = wrap.getBoundingClientRect();
      const c = contrastRef.current?.getBoundingClientRect();
      const end = endRef.current?.getBoundingClientRect();
      if (!c || !end) return;
      const from = whySlots.current.map((el) => {
        const r = el!.getBoundingClientRect();
        return { x: r.left - w.left + r.width / 2, y: r.top - w.top + r.height / 2, w: r.width };
      });
      const to = iconSlots.current.map((el) => {
        const r = el!.getBoundingClientRect();
        return { x: r.left - w.left + r.width / 2, y: r.top - w.top + r.height / 2 };
      });
      // They leave as their band reaches the middle of the screen, and land as the Contrast heading and table sit
      // centred on screen (the third row's cards fully in view): the same spot the scroll steps stop at.
      const start = scatterRef.current ? centreScrollFor(scatterRef.current) : c.top + window.scrollY - window.innerHeight;
      const stop = blockRef.current ? centreScrollFor(blockRef.current) : end.bottom + window.scrollY - window.innerHeight;
      geo.current = { from, to, start, end: Math.max(stop, start + 200) };
      flyers.current.forEach((el, i) => {
        if (!el) return;
        el.style.width = el.style.height = `${from[i].w}px`;
      });
    };

    /** Where the flight is (0–1). Start and end are read fresh each time: anything above (the Problem pin, fonts,
     * images) can move them. Also flips the table to full colour once they've landed (back to grey 24 well above). */
    const flight = (g: Geo) => {
      if (scatterRef.current && blockRef.current) {
        g.start = centreScrollFor(scatterRef.current);
        g.end = Math.max(centreScrollFor(blockRef.current), g.start + 200);
      }
      const p = clamp01((window.scrollY - g.start) / (g.end - g.start));
      progress.current = p;
      if (p >= 0.98 && !shown) {
        shown = true;
        setRevealed(true);
      } else if (p < 0.35 && shown) {
        shown = false;
        setRevealed(false);
      }
      return p;
    };

    const frame = (t: number) => {
      raf = 0;
      const g = geo.current;
      if (!g) return;
      const p = flight(g);
      // Ease out: most of the travel early, settling softly into the table.
      const e = 1 - Math.pow(1 - p, 2);
      const settle = 1 - e;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      const sec = t / 1000;
      OBJECTS.forEach((o, i) => {
        const el = flyers.current[i];
        if (!el) return;
        const f = g.from[i];
        const to = g.to[i];
        // Swing out to the side of the straight line and back, with a smaller second wobble on the way.
        const dx = to.x - f.x;
        const dy = to.y - f.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const swing = reduce ? 0 : Math.sin(Math.PI * p) * o.swing + Math.sin(Math.PI * 2 * p) * o.swing * 0.3;
        // Idle bob (left/right and a little up/down), and the lean towards the pointer, both fading out as it leaves.
        const bobX = reduce ? 0 : Math.sin(sec * 0.7 + i * 2.1) * 10 * settle;
        const bobY = reduce ? 0 : Math.sin(sec * 1.1 + i * 1.3) * 7 * settle;
        const leanX = pointer.x * o.lean * settle;
        const leanY = pointer.y * o.lean * 0.6 * settle;
        const x = lerp(f.x, to.x, e) + nx * swing + bobX + leanX;
        const y = lerp(f.y, to.y, e) + ny * swing + bobY + leanY;
        const rot = lerp(o.rot, 0, e) + (reduce ? 0 : Math.sin(Math.PI * p) * o.spin + Math.sin(sec * 0.8 + i) * 1.5 * settle);
        const scale = lerp(1, ICON / f.w, e);
        el.style.transform = `translate(${x - f.w / 2}px, ${y - f.w / 2}px) rotate(${rot}deg) scale(${scale})`;
        el.style.pointerEvents = p < 0.12 ? "auto" : "none";
      });
      if (visible) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (geo.current) flight(geo.current);
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(wrap);
    const ro = new ResizeObserver(() => {
      measure();
      kick();
    });
    ro.observe(wrap);
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      pointer.tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      pointer.ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + window.innerHeight / 2)) / (window.innerHeight / 2)));
    };
    const onLeave = () => {
      pointer.tx = pointer.ty = 0;
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", kick, { passive: true });
    measure();
    kick();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", kick);
    };
  }, []);

  const onEnter = (i: number) => () => {
    if (progress.current < 0.12) setHover(i);
  };

  const rows: { you: string; them: string; icon: ReactNode }[] = [
    { you: "Your salary is proof of income.", them: "Their income comes in cash, by season, and rarely on paper.", icon: <Thumb src={`${A}/banknotes.webp`} crop={CROPS.banknotes} h={64} /> },
    { you: "Your ID documents were a short trip away.", them: "Their documents are often incomplete or don’t match.", icon: <Thumb src={`${A}/paper.webp`} crop={CROPS.paper} h={74} /> },
    { you: "Every credit card bill or EMI you’ve paid built your credit record.", them: "The loans they’ve repaid to local lenders were never recorded.", icon: <Thumb src={`${A}/money-bag.webp`} crop={CROPS.bag} h={70} /> },
  ];

  return (
    <div ref={wrapRef} className={s.journey}>
      {/* 03 Why */}
      <section className={`${s.section} ${s.why}`}>
        <div className={s.whyCopy} data-fw-snap="center">
          <InkLines lines={["A bank needs proof", "before it lends."]} className={s.display} />
          <p className={`${s.p1} ${s.muted}`} style={{ width: "100%" }}>
            {PHRASES.map((ph, i) => (
              <span key={ph}>
                <span className={s.phrase} data-on={hover === i ? "" : undefined}>
                  {ph}
                </span>
                {i < PHRASES.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        </div>
        <div ref={scatterRef} className={s.scatter} aria-hidden>
          {OBJECTS.map((o, i) => (
            <div
              key={o.label}
              ref={(el) => {
                whySlots.current[i] = el;
              }}
              className={s.scatterSlot}
              style={{
                left: `${((o.left + o.size / 2) / 1440) * 100}%`,
                top: `${((o.top + o.size / 2) / 360) * 100}%`,
                width: `max(${Math.round(o.inner * 0.42)}px, ${((o.inner / 1440) * 100).toFixed(2)}%)`,
              }}
            />
          ))}
        </div>
      </section>

      {/* 04 Contrast */}
      <section ref={contrastRef} className={`${s.section} ${s.contrast}`} data-revealed={revealed ? "" : undefined}>
        <div ref={blockRef} className={s.contrastBlock} data-fw-snap="center">
        <div className={s.copy}>
          <InkLines lines={["You probably have all three,", "without even trying."]} className={s.display} drive={headInk} />
        </div>
        <div className={s.table}>
          <div className={s.tableHead}>
            <Fade d={80}>You</Fade>
            <Fade d={240}>A rural entrepreneur</Fade>
          </div>
          {rows.map((r, i) => (
            <div key={r.you} className={s.row}>
              <div className={s.cell} ref={i === rows.length - 1 ? endRef : undefined}>
                <div
                  ref={(el) => {
                    iconSlots.current[i] = el;
                  }}
                  className={s.iconSlotFly}
                />
                <Fade d={140 + i * 40} className={s.p2}>{r.you}</Fade>
              </div>
              <div className={s.cell}>
                <Fade as="div" d={300 + i * 40} className={s.fadeIcon}>{r.icon}</Fade>
                <Fade d={380 + i * 40} className={s.p2}>{r.them}</Fade>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* The three objects themselves, above both sections. */}
      <div className={s.flyers}>
        {OBJECTS.map((o, i) => (
          <div
            key={o.label}
            ref={(el) => {
              flyers.current[i] = el;
            }}
            className={s.flyer}
            data-hover={hover === i ? "" : undefined}
            onPointerEnter={onEnter(i)}
            onPointerLeave={() => setHover(null)}
          >
            <img src={o.src} alt={o.label} draggable={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
