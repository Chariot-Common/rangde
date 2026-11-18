"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { A } from "./parts";
import s from "./page.module.css";

const PHOTOS = [
  {
    file: "borrower-1",
    alt: "Nangchim Yoma standing on her poppy field in Assam",
    text: "An entrepreneur from Assam, Nangchim Yoma standing on her cultivated stretch of poppy land. She was able to procure seeds through a ₹20,000 investment on Rang De.",
  },
  {
    file: "field-visit-3",
    alt: "Social investors at the April 2025 Mumbai gathering",
    text: "Our April 2025 Social Investors Mumbai gathering, where we discussed the state of rural India and brainstormed on possible solutions that Rang De could try designing.",
  },
  {
    file: "borrower-2",
    alt: "Ramesh Chauhan at his roadside stall",
    text: "A Rang De entrepreneur, Ramesh Chauhan, in his roadside stall. Ramesh was able to procure a ₹30,000 loan through Rang De to manage the rest of his year’s working capital in 2024.",
  },
  {
    file: "field-visit-4",
    alt: "Social investors talking to Mamta Didi in Thane",
    text: "In June 2026 we had a field trip to Mumbai, where we visited local entrepreneurs in the area of Thane who were listed on Rang De. These are a group of social investors talking to Mamta Didi and asking questions about her experience with Rang De.",
  },
];

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const TIP_W = 400;
const TIP_GAP = 16;

/** 01 Hero: the title 80px from the top, then the four photos stretched to the bottom of the screen on load. */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [tip, setTip] = useState<{ i: number; x: number; y: number; on: boolean } | null>(null);

  // The hero fills the screen below the header (measured once, and again only when the width changes, so the
  // phone's collapsing address bar doesn't make the photos jump while scrolling).
  useIsoLayoutEffect(() => {
    let lastW = 0;
    const fit = () => {
      const el = heroRef.current;
      if (!el || window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setHeight(Math.max(480, window.innerHeight - top - 8));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const move = (i: number) => (e: PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    if (!row) return;
    const r = row.getBoundingClientRect();
    const w = Math.min(TIP_W, r.width - 16);
    // Beside the pointer, flipped to its left near the right edge, and kept inside the photo row.
    let x = e.clientX - r.left + TIP_GAP;
    if (x + w > r.width - 8) x = e.clientX - r.left - TIP_GAP - w;
    x = Math.max(8, x);
    // Below the pointer, or above it when there isn't room underneath.
    const th = tipRef.current?.offsetHeight ?? 96;
    let y = e.clientY - r.top + TIP_GAP;
    if (y + th > r.height - 8) y = e.clientY - r.top - TIP_GAP - th;
    y = Math.max(8, y);
    setTip({ i, x, y, on: true });
  };

  return (
    <section ref={heroRef} className={`${s.section} ${s.hero}`} style={height ? { height } : undefined}>
      <div className={s.heroCopy}>
        <p className={s.p1} style={{ width: "100%" }}>Rang De helps build the livelihoods of</p>
        <h1 className={s.displayXl} style={{ width: "100%" }}>India’s Rural Entrepreneurs</h1>
        <p className={s.p1} style={{ width: "100%" }}>through investments funded by people like you</p>
      </div>
      <div ref={rowRef} className={s.heroPhotos} onPointerLeave={() => setTip((t) => (t ? { ...t, on: false } : t))}>
        {PHOTOS.map((p, i) => (
          <div key={p.file} className={s.heroPhoto} onPointerMove={move(i)} onPointerEnter={move(i)}>
            <img src={`${A}/${p.file}.webp`} alt={p.alt} />
          </div>
        ))}
        <div
          ref={tipRef}
          role="tooltip"
          aria-hidden={!tip?.on}
          className={s.heroTip}
          data-on={tip?.on ? "" : undefined}
          style={{ transform: `translate(${tip?.x ?? 0}px, ${tip?.y ?? 0}px)`, maxWidth: TIP_W }}
        >
          {tip ? PHOTOS[tip.i].text : ""}
        </div>
      </div>
    </section>
  );
}
