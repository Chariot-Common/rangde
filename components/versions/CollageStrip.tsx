"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/*
 * Version 6's hero gallery: a collage of photos filling the screen below the stats, 8px apart with 8px
 * corners and 8px from either edge of the screen, laid out like the reference: columns that are either one
 * photo or two rows, where a row is one to three photos side by side (never more than two rows). The columns
 * always fit the screen exactly.
 *
 * The frames never move. Every 4 seconds one photo, working left to right, fades out into another that is
 * already waiting behind it, so the change is a smooth dissolve inside a still frame.
 */

const GAP = 8; // px between photos, and from the edges of the screen
const INTERVAL = 4000; // ms between one photo changing and the next
const FADE = 1.2; // s for a photo to dissolve into the next

// The gallery photos (public/images/hero-gallery: 18 borrowers, 9 field visits), used in turn. Two borrowers,
// then a field visit, so the two kinds stay mixed across the strip.
const pad = (n: number) => String(n).padStart(2, "0");
const POOL = Array.from({ length: 9 }, (_, i) => [
  `/images/hero-gallery/borrower-${pad(2 * i + 1)}.webp`,
  `/images/hero-gallery/borrower-${pad(2 * i + 2)}.webp`,
  `/images/hero-gallery/field-visit-${pad(i + 1)}.webp`,
]).flat();

/** A row: the photos side by side, each as its share of the row's width. */
type Row = number[];
/** A column: its natural width as a multiple of the strip's height, and one or two rows (`split` = the top row's share). */
type Shape = { w: number; rows: Row[]; split: number };

// The column shapes in the reference, in order: a wide single photo; two photos stacked; a tall pair over
// a short strip of three (the strip's wide left part is two photos, so no frame is a thin 4:1 band);
// another wide single; a narrow portrait; a pair over a single.
const SHAPES: Shape[] = [
  { w: 1.32, rows: [[1]], split: 1 },
  { w: 0.54, rows: [[1], [1]], split: 0.36 },
  { w: 1.66, rows: [[0.36, 0.64], [0.42, 0.42, 0.16]], split: 0.66 },
  { w: 1.25, rows: [[1]], split: 1 },
  { w: 0.42, rows: [[1]], split: 1 },
  { w: 0.95, rows: [[0.5, 0.5], [1]], split: 0.42 },
];

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

export function CollageStrip() {
  const reduce = useReducedMotion();
  const stripRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(5);

  // Fill the screen from the strip's top down to 8px above the bottom of the viewport, on every device (at least), and
  // pick how many columns fit. The top is measured with offsetTop (not getBoundingClientRect) so the gallery's
  // rise-in transform doesn't count; the height uses 100svh so a phone's address bar showing or hiding while
  // scrolling doesn't make the strip jump.
  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const fit = () => {
      let top = 0;
      for (let el: HTMLElement | null = strip; el; el = el.offsetParent as HTMLElement | null) top += el.offsetTop;
      // Never shorter than --min (360px on phones, 404px from md up), so short screens keep a full-size gallery.
      strip.style.setProperty("--h", `max(var(--min), calc(100svh - ${top}px - ${GAP}px))`);
      setCount(columnsFor(strip.clientWidth - 2 * GAP, strip.clientHeight));
    };
    fit();
    // Anything above that changes height (the headline rewrapping once the web font loads, say) moves the
    // strip's top, so measure again. Re-measuring doesn't move the top, so this settles after one pass.
    const ro = new ResizeObserver(fit);
    ro.observe(document.body);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  const columns = useMemo(() => Array.from({ length: count }, (_, i) => SHAPES[i % SHAPES.length]), [count]);
  const total = columns.reduce((n, c) => n + c.rows.reduce((m, r) => m + r.length, 0), 0);

  // What each frame shows, in reading order. The pool is dealt out in turn, skipping any photo already on screen.
  const [photos, setPhotos] = useState<string[]>(() => Array.from({ length: 40 }, (_, i) => POOL[i % POOL.length]));
  const photosRef = useRef(photos);
  const tick = useRef(0);
  const dealt = useRef(40);

  useEffect(() => {
    if (reduce || total === 0) return;
    const id = setInterval(() => {
      const cell = tick.current++ % total;
      const shown = new Set(photosRef.current.slice(0, total));
      let src = POOL[dealt.current++ % POOL.length];
      for (let guard = 0; shown.has(src) && guard < POOL.length; guard++) src = POOL[dealt.current++ % POOL.length];
      const next = photosRef.current.slice();
      next[cell] = src;
      photosRef.current = next;
      setPhotos(next);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [reduce, total]);

  let cellIndex = 0;
  return (
    <div ref={stripRef} className="flex w-full overflow-hidden px-2 [--min:360px] md:[--min:404px] [--h:var(--min)]" style={{ height: "var(--h)", gap: GAP }}>
      {columns.map((c, ci) => (
        <div key={ci} className="flex h-full min-w-0 flex-col" style={{ flex: `${c.w} 1 0px`, gap: GAP }}>
          {c.rows.map((row, ri) => (
            <div key={ri} className="flex min-h-0" style={{ flex: `${c.rows.length === 1 ? 1 : ri === 0 ? c.split : 1 - c.split} 1 0px`, gap: GAP }}>
              {row.map((share, k) => {
                const src = photos[cellIndex++ % photos.length];
                return (
                  <div key={k} className="relative min-w-0 overflow-hidden rounded-[8px] bg-ink/8" style={{ flex: `${share} 1 0px` }}>
                    <Slot src={src} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** One frame: the photo that was here stays underneath while the new one fades in over it. */
function Slot({ src }: { src: string }) {
  const [layers, setLayers] = useState<string[]>([src]);
  useEffect(() => {
    setLayers((l) => (l[l.length - 1] === src ? l : [...l, src].slice(-2)));
  }, [src]);
  return (
    <>
      {layers.map((s, i) => (
        <motion.img
          key={s}
          src={s}
          alt=""
          loading="eager"
          className="absolute inset-0 size-full object-cover"
          initial={{ opacity: layers.length > 1 && i === layers.length - 1 ? 0 : 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FADE, ease: "easeInOut" }}
          onAnimationComplete={() => setLayers((l) => (l.length > 1 && l[l.length - 1] === s ? [s] : l))}
        />
      ))}
    </>
  );
}
