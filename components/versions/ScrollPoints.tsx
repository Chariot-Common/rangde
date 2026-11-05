"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, type MotionValue } from "motion/react";
import { SourceTip } from "@/components/ui/SourceTip";
import { ScrollType } from "./ScrollType";
import { Eyebrow } from "./ui";
import type { Point } from "./approaches";
import { useNavHidden } from "@/lib/nav-intro";

/**
 * Version 5's problem / solution points, played by scroll (Figma reference, four states).
 *
 * Every point starts "disabled": its title and body at 48%, with a small emoji sitting
 * between the title's words. Once the heading has typed itself in, the page glides so the section sits
 * in the middle of the screen, and the section holds still there (sticky) while the reader's scrolling
 * plays the points, one after another, left to right. For each point:
 *  1. the emoji pops out of the title to the top centre of the point, growing to 92px tall and gaining a soft shadow as it grows (as if it comes up towards the reader), while the
 *     title fills to full ink and closes up the gap the emoji left;
 *  2. then its body fills in, slowly, letter by letter: the dotted, sourced phrases to full ink, the
 *     rest to 80%.
 * After the last point the section lets go and the page scrolls on. A point grows taller as its emoji
 * lifts out; the row is centred vertically, so the others stay centred.
 *
 * Phones (and any screen too short to hold the section) skip the hold: the points play as the row
 * scrolls through the screen.
 */

/** Per point, in order: its emoji and where it sits in the title. (The points themselves come in
 * separately, as a whole array: a server page can pass the client module's array on, but not index it.) */
export type ScrollPointItem = {
  /** The emoji image. */
  emoji: string;
  /** How many words of the title come before the emoji. */
  after: number;
};

const EMOJI_H = 92; // final emoji height
const EMOJI_GAP = 16; // between the lifted emoji and the title
const DIM = 0.48; // the disabled state
const INLINE = 1.05; // the emoji's height in the title, in ems
const PLACE = 1.3; // the room it takes in the title (the emoji plus a space), in ems
const PER_POINT = 800; // px of scrolling per point while the section is held
const EMOJI_SHARE = 0.3; // of each point's scrolling: the emoji pops out; the rest fills the body
const TAIL = 0.06; // a short hold after the last point before the section lets go

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function ScrollPoints({
  heading,
  eyebrow,
  points,
  items,
  tone = "white",
}: {
  heading: string;
  eyebrow?: string;
  points: Point[];
  items: ScrollPointItem[];
  tone?: "white" | "green";
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // Page positions, refreshed on resize: where the hold starts and how long it lasts.
  const geo = useRef({ pinned: false, start: 0, length: 1, typedAt: 0 });
  const snapped = useRef(false);
  const lastY = useRef(0);
  const raw = useMotionValue(0);
  const progress = useSpring(raw, { stiffness: 90, damping: 24, restDelta: 0.0005 });
  const { scrollY } = useScroll();
  // The hero's intro hides the nav while it runs; no snapping until it has finished.
  const introRunning = useRef(false);
  const navHidden = useNavHidden();
  useEffect(() => {
    introRunning.current = navHidden;
  }, [navHidden]);

  const measure = () => {
    const wrap = wrapRef.current, section = sectionRef.current, head = headRef.current, grid = gridRef.current;
    if (!wrap || !section || !head || !grid) return;
    const vh = window.innerHeight;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-bottom")) || 0;
    const y = window.scrollY;
    // The content (heading + points, with the emojis grown), without the section's own padding.
    section.style.paddingTop = section.style.paddingBottom = "";
    const cs = getComputedStyle(section);
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const content = section.offsetHeight - pad + (raw.get() > 0 ? 0 : EMOJI_H + EMOJI_GAP);
    // Hold wherever the content fits below the nav; on shorter screens the section's top and bottom
    // padding shrinks (down to 24px) so that it does, rather than skipping the hold.
    const room = vh - nav - 16;
    const pinned = !reduce && window.innerWidth >= 768 && content + 48 <= room;
    if (pinned) {
      const each = Math.min(pad / 2, (room - content) / 2);
      section.style.paddingTop = section.style.paddingBottom = `${each}px`;
      const full = content + 2 * each;
      // Centred in the screen (as it will be once all three emojis have grown), clear of the nav.
      const top = Math.max(nav + 8, (vh - full) / 2);
      const length = points.length * PER_POINT;
      section.style.position = "sticky";
      section.style.top = `${top}px`;
      wrap.style.height = `${full + length}px`;
      const wrapTop = wrap.getBoundingClientRect().top + y;
      // The heading has typed itself in once its top is 75% of the way down the screen (ScrollType).
      const typedAt = head.getBoundingClientRect().top - section.getBoundingClientRect().top + wrapTop - 0.75 * vh;
      geo.current = { pinned, start: wrapTop - top, length, typedAt };
    } else {
      section.style.position = "";
      section.style.top = "";
      wrap.style.height = "";
      const g = grid.getBoundingClientRect();
      // From the points' top coming up past 90% of the screen until their bottom reaches 25% from the top.
      geo.current = { pinned, start: g.top + y - 0.9 * vh, length: Math.max(1, g.height + 0.65 * vh), typedAt: 0 };
    }
    raw.set(clamp((y - geo.current.start) / geo.current.length));
  };

  useMotionValueEvent(scrollY, "change", (y) => {
    const g = geo.current;
    const wrap = wrapRef.current, section = sectionRef.current, head = headRef.current;
    if (g.pinned && wrap && section && head) {
      // Read live: what sits above the section (the hero, its cards) can change height after mounting.
      const vh = window.innerHeight;
      g.start = wrap.getBoundingClientRect().top + y - parseFloat(section.style.top);
      const headTop = head.getBoundingClientRect().top;
      g.typedAt = headTop + y - 0.75 * vh;
      // Once the heading has typed in (scrolling down, the section not yet held), glide the page so the
      // section sits in the middle of the screen. Re-armed once the reader goes back above it.
      if (!snapped.current && !introRunning.current && y > lastY.current && headTop <= 0.75 * vh && y < g.start - 4) {
        snapped.current = true;
        window.scrollTo({ top: g.start, behavior: "smooth" });
      } else if (headTop > vh) snapped.current = false;
    }
    raw.set(clamp((y - g.start) / g.length));
    lastY.current = y;
  });

  useLayoutEffect(() => {
    measure();
    lastY.current = window.scrollY;
    const onResize = () => {
      geo.current.pinned = false;
      measure();
    };
    window.addEventListener("resize", onResize);
    // Re-measure while the section is still untouched (fonts and images settling change its height).
    const ro = new ResizeObserver(() => raw.get() === 0 && measure());
    if (sectionRef.current) ro.observe(sectionRef.current);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <div ref={wrapRef} className="relative">
      <section
        ref={sectionRef}
        className={`mx-2 flex flex-col items-center gap-8 rounded-[16px] px-5 py-14 sm:gap-12 sm:px-8 sm:py-20 md:gap-16 md:py-24 lg:py-[120px] ${
          tone === "green" ? "bg-[#cbe0b8]" : "bg-white"
        }`}
      >
        <div ref={headRef} className="flex max-w-[1200px] flex-col items-center gap-2 text-center">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <ScrollType text={heading} className="max-w-[780px] font-display text-h3 font-bold text-ink" />
        </div>
        <div
          ref={gridRef}
          className="grid w-full max-w-[1200px] grid-cols-1 items-center gap-12 md:grid-cols-[repeat(3,minmax(0,368px))] md:justify-center"
        >
          {points.map((point, i) => (
            <ScrollPoint key={point.title} point={point} item={items[i]} index={i} count={points.length} progress={progress} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ScrollPoint({ point, item, index, count, progress }: { point: Point; item: ScrollPointItem; index: number; count: number; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const placeRef = useRef<HTMLSpanElement>(null);
  const emojiRef = useRef<HTMLImageElement>(null);
  const chars = useRef<HTMLSpanElement[]>([]);
  const filled = useRef(-1);
  const aspect = useRef(1);

  const update = (p: number) => {
    const box = boxRef.current, slot = slotRef.current, title = titleRef.current, place = placeRef.current, emoji = emojiRef.current;
    if (!box || !slot || !title || !place || !emoji) return;
    // This point's share of the scroll: the first half lifts the emoji, the second fills the body.
    const seg = reduce ? 1 : clamp(p / (1 - TAIL)) * count - index;
    const e = ease(clamp(seg / EMOJI_SHARE));
    const body = clamp((seg - EMOJI_SHARE) / (1 - EMOJI_SHARE));
    const fs = parseFloat(getComputedStyle(title).fontSize) || 18;

    slot.style.height = `${e * (EMOJI_H + EMOJI_GAP)}px`;
    place.style.width = `${(1 - e) * PLACE * fs}px`;
    title.style.opacity = String(lerp(DIM, 1, e));

    // From its spot in the title to the top centre of the point.
    const b = box.getBoundingClientRect();
    const r = place.getBoundingClientRect();
    const h0 = INLINE * fs;
    const h = lerp(h0, EMOJI_H, e);
    const x = lerp(r.left - b.left, (b.width - EMOJI_H * aspect.current) / 2, e);
    const y = lerp(r.top - b.top - (h0 - fs) / 2, 0, e);
    emoji.style.height = `${h}px`;
    emoji.style.transform = `translate(${x}px, ${y}px)`;
    // In full colour throughout, with a soft shadow that grows with it: 4px down,
    // well blurred, 14% at full size.
    emoji.style.filter = `drop-shadow(0 ${4 * e}px ${16 * e}px rgba(0, 0, 0, ${0.14 * e}))`;

    // The body, letter by letter.
    const list = chars.current;
    const n = Math.round(body * list.length);
    if (n !== filled.current) {
      filled.current = n;
      list.forEach((el, i) => {
        el.style.opacity = String(i < n ? (el.dataset.tip ? 1 : 0.8) : DIM);
      });
    }
  };

  useMotionValueEvent(progress, "change", update);
  useLayoutEffect(() => {
    update(progress.get());
    const ro = new ResizeObserver(() => update(progress.get()));
    if (boxRef.current) ro.observe(boxRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const words = point.title.split(" ");
  const before = words.slice(0, item.after).join(" ");
  const after = words.slice(item.after).join(" ");

  let ci = 0;
  const register = (el: HTMLSpanElement | null) => {
    if (el) chars.current[Number(el.dataset.i)] = el;
  };
  const letters = (text: string, tip: boolean): ReactNode =>
    text.split(" ").map((word, wi) => (
      <Fragment key={wi}>
        {wi > 0 && " "}
        <span className="whitespace-nowrap">
          {word.split("").map((ch) => {
            const i = ci++;
            return (
              <span key={i} ref={register} data-i={i} data-tip={tip || undefined} style={{ opacity: DIM }}>
                {ch}
              </span>
            );
          })}
        </span>
      </Fragment>
    ));

  return (
    <div ref={boxRef} className="relative flex flex-col items-center text-center">
      <div ref={slotRef} aria-hidden className="h-0 shrink-0" />
      <h3 ref={titleRef} className="font-display text-p2 font-bold text-ink sm:text-p1" style={{ opacity: DIM }}>
        {before}{" "}
        <span ref={placeRef} aria-hidden className="inline-block h-[1em] align-[-0.12em]" style={{ width: `${PLACE}em` }} />
        {after}
      </h3>
      <p className="mt-1 font-display text-p3 font-medium leading-[22px] text-ink sm:text-p2 sm:leading-[24px]">
        {point.text.map((part, k) =>
          typeof part === "string" ? (
            <Fragment key={k}>{letters(part, false)}</Fragment>
          ) : "tip" in part ? (
            <SourceTip key={k} source={part.source} plain>
              {letters(part.tip, true)}
            </SourceTip>
          ) : (
            <Fragment key={k}>{letters(part.bold, false)}</Fragment>
          ),
        )}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={emojiRef}
        src={item.emoji}
        alt=""
        aria-hidden
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalHeight) aspect.current = img.naturalWidth / img.naturalHeight;
          update(progress.get());
        }}
        className="pointer-events-none absolute left-0 top-0 w-auto max-w-none origin-top-left"
        style={{ height: 0 }}
      />
    </div>
  );
}
