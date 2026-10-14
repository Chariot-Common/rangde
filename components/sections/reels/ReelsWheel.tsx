"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { reelCover, reelUrl, reelVideo, reels, type Reel } from "@/data/reels";

// The ten reels, twice over, so the strip always overfills even a very wide screen.
const STRIP = [...reels, ...reels];
const GAP = 14; // px between cards
const SPEED = 36; // px per second, auto-scroll
// about 19% of the width on desktop (four or five across, ~270px on a laptop); on phones ~40%,
// so two-and-a-bit reels show at a readable size. Never taller than the strip leaves room for
// (h = the strip's height), so a short laptop screen doesn't crop them. A flat, straight
// strip — every reel upright and the same size.
const cardWidth = (w: number, h: number) =>
  Math.min(w < 640 ? w * 0.4 : Math.min(340, Math.max(170, w * 0.19)), ((h - 40) * 9) / 16);

// Reels whose preview file isn't there (yet) — remembered so hovering doesn't keep asking.
const missingVideo = new Set<string>();

function ReelCard({ reel, onOpen, onHover }: { reel: Reel; onOpen: (r: Reel) => void; onHover: (on: boolean) => void }) {
  const [hover, setHover] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [, setMissing] = useState(false);
  const tryVideo = hover && !missingVideo.has(reel.code);

  return (
    <button
      type="button"
      onClick={() => onOpen(reel)}
      onMouseEnter={() => {
        setHover(true);
        onHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
        setPlaying(false);
        onHover(false);
      }}
      aria-label={`Watch reel: ${reel.title}`}
      // Just the reel — no border, title or button; clicking it opens the reel.
      className="group block w-full cursor-pointer overflow-hidden rounded-[14px] shadow-[0_6px_16px_rgba(41,45,54,0.12)]"
      draggable={false}
    >
      <span className="relative block aspect-[9/16] w-full overflow-hidden bg-ink/8">
        <Image
          src={reelCover(reel.code)}
          alt=""
          fill
          sizes="340px"
          draggable={false}
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
        />
        {/* Hover preview: the reel itself, muted, fading in over the cover once it's playing. */}
        {tryVideo && (
          <video
            src={reelVideo(reel.code)}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            onPlaying={() => setPlaying(true)}
            onError={() => {
              missingVideo.add(reel.code);
              setMissing(true);
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </span>
    </button>
  );
}

/** Plays the reel right here, through Instagram's own embed, instead of sending people off-site. */
function ReelDialog({ reel, onClose }: { reel: Reel | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (reel && !d.open) d.showModal();
    if (!reel && d.open) d.close();
  }, [reel]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={reel ? reel.title : "Instagram reel"}
      className="m-auto w-[min(400px,calc(100vw-32px))] overflow-visible bg-transparent p-0 backdrop:bg-black/72 backdrop:backdrop-blur-sm"
    >
      {reel && (
        <div className="relative flex flex-col gap-3">
          <div className="h-[min(720px,calc(100svh-120px))] overflow-hidden rounded-[16px] bg-white">
            <iframe
              key={reel.code}
              src={`${reelUrl(reel.code)}embed/`}
              title={reel.title}
              className="h-full w-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <a
              href={reelUrl(reel.code)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-p4 font-bold text-white underline decoration-white/48 underline-offset-4 hover:decoration-white"
            >
              Open on Instagram
            </a>
            <button
              type="button"
              onClick={onClose}
              className="flex h-[36px] items-center rounded-full bg-white px-4 font-display text-p4 font-bold text-ink hover:bg-bg-grey"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

/**
 * "From our Instagram" — Rang De's most-watched reels in a straight, flat strip. It scrolls on its own,
 * can be dragged (with a little momentum), and holds still while a reel is hovered (that
 * reel plays) or open in the dialog. One screen tall less the nav bar (on phones, just as tall as the strip).
 */
export function ReelsWheel() {
  const [open, setOpen] = useState<Reel | null>(null);
  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = !!open;
  }, [open]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const st = useRef({ offset: 0, vel: 0, hover: false, cw: 200, last: 0,
    drag: null as null | { x: number; o: number; lx: number; lt: number; captured: boolean } });
  const moved = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    const size = () => {
      W = wrap.clientWidth;
      st.current.cw = cardWidth(W, wrap.clientHeight);
      cardRefs.current.forEach((c) => c && (c.style.width = `${st.current.cw}px`));
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);
    let raf = 0;
    const tick = (now: number) => {
      const s = st.current;
      const dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 0;
      s.last = now;
      const step = s.cw + GAP, total = step * STRIP.length;
      if (!s.drag) {
        if (!s.hover && !openRef.current && !reduce) s.offset += SPEED * dt;
        s.offset += s.vel * dt;
        s.vel *= Math.pow(0.04, dt); // momentum dies away after a drag
      }
      s.offset = ((s.offset % total) + total) % total;
      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        // distance along the strip from its centre, wrapped so the loop is seamless
        const u = ((((i * step - s.offset + total / 2) % total) + total) % total) - total / 2;
        if (Math.abs(u) > W / 2 + s.cw) {
          c.style.visibility = "hidden";
          return;
        }
        c.style.visibility = "visible";
        c.style.transform = `translate(-50%, -50%) translateX(${u}px)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // Drag to scroll. The pointer is only captured once it has really moved, so a plain click
  // still reaches the card underneath (and opens the reel).
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    moved.current = false;
    st.current.vel = 0;
    st.current.drag = { x: e.clientX, o: st.current.offset, lx: e.clientX, lt: performance.now(), captured: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = st.current.drag;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.captured && Math.abs(dx) > 6) {
      d.captured = true;
      moved.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!d.captured) return;
    st.current.offset = d.o - dx;
    const now = performance.now();
    if (now > d.lt) st.current.vel = (-(e.clientX - d.lx) / (now - d.lt)) * 1000 * 0.6;
    d.lx = e.clientX;
    d.lt = now;
  };
  const endDrag = () => {
    st.current.drag = null;
  };

  return (
    <section className="mx-2 flex flex-col items-center overflow-hidden rounded-[16px] bg-[#F7F3ED] pb-6 pt-10 sm:h-[calc(100svh-var(--navbar-bottom))] sm:min-h-[600px] sm:pb-0 sm:pt-14 lg:pt-16">
      <h2 className="px-4 text-center font-display text-h3 font-bold text-ink">
        Real people, real businesses,
        <br />
        in their own words
      </h2>

      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative mt-2 h-[320px] min-h-0 w-full cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing sm:mt-6 sm:h-auto sm:flex-1"
      >
        <div className="absolute inset-0">
        {STRIP.map((reel, i) => (
          <div
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2 will-change-transform"
            style={{ width: 200 }}
          >
            <ReelCard
              reel={reel}
              onOpen={(r) => !moved.current && setOpen(r)}
              onHover={(on) => {
                st.current.hover = on;
              }}
            />
          </div>
        ))}
        </div>
      </div>

      <ReelDialog reel={open} onClose={() => setOpen(null)} />
    </section>
  );
}
