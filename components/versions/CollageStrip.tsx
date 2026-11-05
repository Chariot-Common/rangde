"use client";

import { animate, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/*
 * Version 3's hero gallery: a collage of photos filling the screen below the stats, 8px apart with
 * 8px corners and 8px from either edge of the screen, laid out like the reference: columns that are
 * either one photo or two rows, where a row is one photo or two side by side (never more than two
 * rows). The columns always fit the screen exactly. When the reader scrolls (at most once every 4
 * seconds, so steady scrolling doesn't churn it) the leftmost column closes up,
 * its right edge wiping across to the left, while a new column opens up at the right edge, its left
 * edge wiping in; the columns between them ease over and share the space. That is the only
 * movement. A closing or opening column takes the 8px gap beside it only once it is narrower than
 * that itself, so no gap anywhere ever changes size.
 */

const GAP = 8; // px between photos, and from the edges of the screen
const COOLDOWN = 4000; // ms after a move starts before scrolling can start the next
const MOVE = 1.8; // s for a column to close up / open up
const EASE = [0.22, 1, 0.36, 1] as const;

// The gallery photos (public/images/collage), used in turn as columns come in.
const POOL = Array.from({ length: 15 }, (_, i) => `/images/collage/collage-${String(i + 1).padStart(2, "0")}.webp`);

/** A row: one photo, or two side by side (`split` = the left photo's share of the width). */
type Row = { srcs: string[]; split: number };
type Phase = "idle" | "leaving" | "entering";
/** A column: its natural width as a multiple of the strip's height, and one or two rows (`split` = the top row's share). */
type Column = { id: number; w: number; rows: Row[]; split: number; phase: Phase };
type Shape = { w: number; rows: number[]; split: number; rowSplits: number[] };

// The column shapes in the reference, in order: a wide single photo; two photos stacked; two rows of
// two side by side (a tall pair over a short strip); another wide single; a narrow portrait; a pair
// over a single.
const SHAPES: Shape[] = [
  { w: 1.32, rows: [1], split: 1, rowSplits: [1] },
  { w: 0.54, rows: [1, 1], split: 0.36, rowSplits: [1, 1] },
  { w: 1.66, rows: [2, 2], split: 0.66, rowSplits: [0.36, 0.84] },
  { w: 1.25, rows: [1], split: 1, rowSplits: [1] },
  { w: 0.42, rows: [1], split: 1, rowSplits: [1] },
  { w: 0.95, rows: [2, 1], split: 0.42, rowSplits: [0.5, 1] },
];

let nextId = 0;
let nextShape = 0;
let nextPhoto = 0;
const photo = () => POOL[nextPhoto++ % POOL.length];

function makeColumn(phase: Phase = "idle"): Column {
  const s = SHAPES[nextShape++ % SHAPES.length];
  return {
    id: nextId++,
    w: s.w,
    split: s.split,
    rows: s.rows.map((cells, i) => ({ srcs: Array.from({ length: cells }, photo), split: s.rowSplits[i] })),
    phase,
  };
}

/** How many columns (from the start of the sequence) best fill `width` at strip height `h`. */
function columnsFor(width: number, h: number) {
  let used = 0;
  for (let n = 1; n <= 12; n++) {
    const next = used + SHAPES[(n - 1) % SHAPES.length].w * h + (n > 1 ? GAP : 0);
    // Stop at the count whose natural widths come closest to the room.
    if (next > width) return Math.abs(next - width) < Math.abs(used - width) ? n : Math.max(1, n - 1);
    used = next;
  }
  return 12;
}

// The same starting collage on the server and in the browser (sized properly once measured).
function startColumns(count: number) {
  nextId = 0;
  nextShape = 0;
  nextPhoto = 0;
  return Array.from({ length: count }, () => makeColumn());
}

export function CollageStrip() {
  const reduce = useReducedMotion();
  const [columns, setColumns] = useState<Column[]>(() => startColumns(5));
  const stripRef = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<number, HTMLDivElement>());
  const moving = useRef(false);

  /** Lay the columns out at `t` (0→1) of a move: widths and gaps in px, filling the strip exactly. */
  const layout = useCallback((cols: Column[], t: number, leaving0 = 0) => {
    const strip = stripRef.current;
    if (!strip) return;
    const room = strip.clientWidth - 2 * GAP;
    const h = strip.clientHeight;
    const settled = cols.filter((c) => c.phase !== "leaving");
    const natural = (c: Column) => c.w * h;
    // Where everything ends up: the columns that stay share the room by their natural widths.
    const finalRoom = room - GAP * (settled.length - 1);
    const finalTotal = settled.reduce((s, c) => s + natural(c), 0);
    const enter = cols.find((c) => c.phase === "entering");
    const enterW = enter ? (natural(enter) / finalTotal) * finalRoom * t : 0;
    const leaveW = leaving0 * (1 - t);
    // The gaps beside a closing/opening column shrink with it once it is narrower than 8px.
    const fixedGaps = GAP * (cols.length - 1 - (enter ? 1 : 0) - (cols.some((c) => c.phase === "leaving") ? 1 : 0));
    const edgeGaps = (enter ? Math.min(GAP, enterW) : 0) + (cols.some((c) => c.phase === "leaving") ? Math.min(GAP, leaveW) : 0);
    const middle = cols.filter((c) => c.phase === "idle");
    const middleRoom = room - leaveW - enterW - fixedGaps - edgeGaps;
    const middleTotal = middle.reduce((s, c) => s + natural(c), 0);
    cols.forEach((c, i) => {
      const el = els.current.get(c.id);
      if (!el) return;
      const w = c.phase === "leaving" ? leaveW : c.phase === "entering" ? enterW : (natural(c) / middleTotal) * middleRoom;
      el.style.flex = "0 0 auto";
      el.style.width = `${w}px`;
      // While closing or opening, the photos keep their full width, pinned to the edge that isn't
      // moving, so the column wipes shut or open rather than squashing them.
      const photos = el.firstElementChild as HTMLElement | null;
      if (photos) {
        const full = c.phase === "leaving" ? leaving0 : c.phase === "entering" && enter ? (natural(enter) / finalTotal) * finalRoom : null;
        photos.style.flex = full === null ? "" : `0 0 ${full}px`;
        photos.style.width = full === null ? "100%" : `${full}px`;
      }
      el.style.marginLeft = i === 0 ? "0px" : c.phase === "entering" ? `${Math.min(GAP, w)}px` : cols[i - 1].phase === "leaving" ? `${Math.min(GAP, leaveW)}px` : `${GAP}px`;
    });
  }, []);

  // Size the strip to fill the screen down to the bottom, pick how many columns fit, and lay them out.
  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const fit = () => {
      let top = 0;
      for (let el: HTMLElement | null = strip; el; el = el.offsetParent as HTMLElement | null) top += el.offsetTop;
      const h = Math.min(560, Math.max(220, window.innerHeight - top - GAP));
      strip.style.setProperty("--h", `${h}px`);
      if (moving.current) return;
      const count = columnsFor(strip.clientWidth - 2 * GAP, h);
      setColumns((cols) => (cols.length === count ? cols : startColumns(count)));
    };
    const raf = requestAnimationFrame(fit);
    window.addEventListener("resize", fit);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, []);

  // Whenever the columns change while nothing is moving, lay them out at rest.
  useLayoutEffect(() => {
    if (!columns.some((c) => c.phase !== "idle")) layout(columns, 1);
  }, [columns, layout]);
  useEffect(() => {
    const onResize = () => !moving.current && layout(columns, 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [columns, layout]);

  // When the reader scrolls (or turns the wheel), the leftmost column closes while a new one opens
  // at the right; then nothing more for 4 seconds, however much they keep scrolling.
  useEffect(() => {
    if (reduce) return;
    let last = -Infinity;
    const onScroll = () => {
      const now = performance.now();
      if (moving.current || now - last < COOLDOWN) return;
      last = now;
      moving.current = true;
      setColumns((cols) => [...cols.map((c, i) => (i === 0 ? { ...c, phase: "leaving" as Phase } : c)), makeColumn("entering")]);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
    };
  }, [reduce]);

  // Run a move once its columns are on the page.
  useLayoutEffect(() => {
    const leaving = columns.find((c) => c.phase === "leaving");
    if (!leaving) return;
    const leaving0 = els.current.get(leaving.id)?.offsetWidth ?? 0;
    layout(columns, 0, leaving0);
    const anim = animate(0, 1, {
      duration: MOVE,
      ease: EASE,
      onUpdate: (t) => layout(columns, t, leaving0),
      onComplete: () => {
        moving.current = false;
        setColumns((cols) => cols.filter((c) => c.phase !== "leaving").map((c) => (c.phase === "entering" ? { ...c, phase: "idle" } : c)));
      },
    });
    return () => anim.stop();
  }, [columns, layout]);

  return (
    <div ref={stripRef} className="flex w-full overflow-hidden px-2 [--h:280px]" style={{ height: "var(--h)" }}>
      {columns.map((c) => (
        <div
          key={c.id}
          ref={(el) => {
            if (el) els.current.set(c.id, el);
            else els.current.delete(c.id);
          }}
          // Before the first measure, share the room by natural width.
          className={`flex h-full shrink-0 overflow-hidden ${c.phase === "entering" ? "justify-end" : "justify-start"}`}
          style={{ flex: `${c.w} 1 0px` }}
        >
          <ColumnPhotos column={c} />
        </div>
      ))}
    </div>
  );
}

/** A column's photos: one or two rows, each one photo or two side by side. */
function ColumnPhotos({ column }: { column: Column }) {
  return (
    <div className="flex h-full w-full flex-col" style={{ gap: GAP }}>
      {column.rows.map((row, ri) => (
        <div key={ri} className="flex min-h-0" style={{ flex: `${column.rows.length === 1 ? 1 : ri === 0 ? column.split : 1 - column.split} 1 0px`, gap: GAP }}>
          {row.srcs.map((src, ci) => (
            <div key={ci} className="relative min-w-0 overflow-hidden rounded-[8px] bg-ink/8" style={{ flex: `${row.srcs.length === 1 ? 1 : ci === 0 ? row.split : 1 - row.split} 1 0px` }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- cropped to its cell by object-cover */}
              <img src={src} alt="" loading="eager" className="absolute inset-0 size-full object-cover" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
