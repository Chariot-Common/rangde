"use client";

import Image from "next/image";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScrollInk } from "./ScrollInk";

/*
 * Version 6's trust section: Rang De as a node graph, after Obsidian's graph view, drawn from the assets in the Figma frame
 * "Node graphic reference" (the logo circle, four icon nodes, thin lines; positions and proportions as in the frame).
 * - The Rang De logo (80px in a 120px circle) sits in the middle with four smaller nodes (a third of its
 *   size, 40px) joined to it by thin lines. The nodes drift gently and trail the logo like they are on elastic;
 *   the logo itself subtly leans towards the mouse.
 * - Scrolling carries the section: the nodes grow and travel to a horizontal strip (Regulated, Curated,
 *   Transparent, Credit-linked, each with its line of copy) and the logo rises above them, still joined to all four.
 *
 * Everything is placed in a rAF loop straight onto the elements' transforms (no React renders per frame).
 * PLACEHOLDER icons: the existing Why Rang De set, until the real four arrive.
 */

// From the Figma frame "Node graphic reference" (2909:46): where each node sits round the logo (angle, and distance in
// units of the logo's own diameter) and its icon. The icons are the frame's own SVGs (public/brand/trust-*.svg).
const NODES = [
  { title: "Regulated", text: "Built within India’s regulated P2P lending framework.", icon: "/brand/trust-regulated.svg", angle: -137.5, dist: 1.62 },
  { title: "Curated", text: "Borrowers are screened and authenticated diligently.", icon: "/brand/trust-curated.svg", angle: -42, dist: 1.72 },
  { title: "Transparent", text: "You see where your money goes and follow its progress.", icon: "/brand/trust-transparent.svg", angle: 135.6, dist: 1.8 },
  { title: "Credit-linked", text: "Repayments build borrowers’ formal credit histories.", icon: "/brand/trust-credit-linked.svg", angle: 46.4, dist: 1.65 },
] as const;

const LOGO = 120; // the Rang De circle (Figma: 196.5)
const NODE = (LOGO * 84.2) / 196.5; // each smaller node, in the Figma frame's proportion to it (84.2)
const NODE_MAX = 1.7; // the node is drawn at this multiple (its largest, in the strip) and scaled DOWN from it, so the icon never blurs
const ICON = (LOGO * 44.5) / 196.5; // the icon in it (44.5)
const LOGO_ART = (LOGO * 131) / 196.5; // the logo art in the circle (131 wide)
const SCROLL_VH = 1.6; // extra scroll the morph takes, in viewport heights
const STRIP_Y = 0.6; // the strip's height in the stage
const LOGO_STRIP_Y = 0.2; // where the logo rests above it
const END_PROGRESS = 0.84; // scroll progress where the morph has finished (it completes at 0.82) — where a click skips to

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

export function TrustGraph() {
  const reduce = useReducedMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const progress = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });
  const inView = useInView(outerRef, { margin: "200px 0px 200px 0px" });

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scroll → 0–1 across the pinned stretch.
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => {
      // The stage sticks under the nav once the title above it has scrolled away; progress runs while it is stuck.
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-bottom")) || 0;
      const top = nav + 8;
      const stageH = window.innerHeight - nav - 16;
      const r = el.getBoundingClientRect();
      const span = r.height - stageH;
      progress.current = span > 0 ? clamp((top - r.top) / span) : 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // A click anywhere in the section carries it on to the end state (the four points in their strip): the page
  // scrolls itself, smoothly (ease-in-out), to where the morph has finished. The stage is pinned, so the view
  // doesn't move; the morph simply plays on from wherever the nodes are. Any wheel, touch or key from the user
  // hands control straight back. Does nothing once the section is already there or past it.
  const skipAnim = useRef(0);
  useEffect(() => () => cancelAnimationFrame(skipAnim.current), []);
  const skipToEnd = () => {
    const el = outerRef.current;
    if (!el || skipAnim.current) return;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-bottom")) || 0;
    const top = nav + 8;
    const stageH = window.innerHeight - nav - 16;
    const r = el.getBoundingClientRect();
    const span = r.height - stageH;
    if (span <= 0 || progress.current >= END_PROGRESS) return;
    // progress = (top - r.top) / span, so the end state is reached when r.top = top - END_PROGRESS * span.
    const from = window.scrollY;
    const to = from + r.top - (top - END_PROGRESS * span);
    if (reduce) {
      window.scrollTo({ top: to, behavior: "instant" });
      return;
    }
    // Longer the further it has to go: 0.9s for a short hop up to 1.6s from the very start.
    const duration = 900 + 700 * clamp(1 - progress.current / END_PROGRESS);
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const stop = () => {
      cancelAnimationFrame(skipAnim.current);
      skipAnim.current = 0;
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    const start = performance.now();
    const step = (now: number) => {
      const t = clamp((now - start) / duration);
      window.scrollTo({ top: from + (to - from) * ease(t), behavior: "instant" });
      if (t < 1) skipAnim.current = requestAnimationFrame(step);
      else stop();
    };
    skipAnim.current = requestAnimationFrame(step);
  };

  // The mouse, as an offset from the middle of the stage.
  useEffect(() => {
    const el = outerRef.current;
    if (!el || reduce) return;
    const move = (e: MouseEvent) => {
      const r = stageRef.current?.getBoundingClientRect();
      if (!r) return;
      mouse.current = { x: e.clientX - (r.left + r.width / 2), y: e.clientY - (r.top + r.height / 2) };
    };
    const leave = () => (mouse.current = { x: 0, y: 0 });
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [reduce]);

  // The loop.
  useEffect(() => {
    const { w, h } = size;
    if (!inView || !w || !h) return;
    const mobile = w < 640;
    const grown = mobile ? 1.4 : NODE_MAX; // how much a node grows on its way to the strip
    const spread = clamp(Math.min(w, h) * 0.34, 110, 220) / 200; // scales the Figma spacing to the room
    // The graph sits so its topmost node is 120px under the title (the stage starts right under it), or centred if the room is short.
    const topReach = Math.max(...NODES.map((n) => -n.dist * LOGO * spread * Math.sin((n.angle * Math.PI) / 180))) + NODE / 2;
    const cy = Math.min(h / 2, 120 + topReach);
    const logo = { x: w / 2, y: cy };
    const nodes = NODES.map((n) => ({ x: w / 2 + n.dist * LOGO * spread * Math.cos((n.angle * Math.PI) / 180), y: cy + n.dist * LOGO * spread * Math.sin((n.angle * Math.PI) / 180) }));
    let raf = 0;
    const frame = (time: number) => {
      const q = smooth(clamp((progress.current - 0.12) / 0.7)); // 0 = graph, 1 = strip
      const free = 1 - q;
      // The logo leans a little towards the mouse (at most 36px), and rises to its place above the strip.
      const lean = reduce ? { x: 0, y: 0 } : { x: clamp(mouse.current.x * 0.4, -170, 170), y: clamp(mouse.current.y * 0.4, -130, 130) };
      const lx = w / 2 + lean.x * free;
      const ly = lerp(cy, h * LOGO_STRIP_Y, q) + lean.y * free;
      logo.x += (lx - logo.x) * 0.14;
      logo.y += (ly - logo.y) * 0.14;
      if (logoRef.current) logoRef.current.style.transform = `translate(${logo.x - LOGO / 2}px, ${logo.y - LOGO / 2}px)`;

      NODES.forEach((n, i) => {
        // In the graph: on its spoke from the logo, drifting a little. In the strip: its column.
        const drift = reduce ? { x: 0, y: 0 } : { x: Math.sin(time * 0.0007 * (1 + i * 0.13) + i * 1.7) * 18, y: Math.cos(time * 0.0009 * (1 + i * 0.11) + i * 2.3) * 18 };
        const a = (n.angle * Math.PI) / 180;
        const gx = logo.x + n.dist * LOGO * spread * Math.cos(a) + drift.x;
        const gy = logo.y + n.dist * LOGO * spread * Math.sin(a) + drift.y;
        const sx = (w * (i + 0.5)) / NODES.length;
        const sy = h * STRIP_Y;
        const tx = lerp(gx, sx, q);
        const ty = lerp(gy, sy, q);
        const node = nodes[i];
        node.x += (tx - node.x) * 0.07;
        node.y += (ty - node.y) * 0.07;
        const el = nodeRefs.current[i];
        const s = lerp(1, grown, q);
        if (el) el.style.transform = `translate(${node.x - (NODE * s) / 2}px, ${node.y - (NODE * s) / 2}px) scale(${s / NODE_MAX})`;
        const line = lineRefs.current[i];
        if (line) {
          line.setAttribute("x1", String(logo.x));
          line.setAttribute("y1", String(logo.y));
          line.setAttribute("x2", String(node.x));
          line.setAttribute("y2", String(node.y));
        }
        const label = labelRefs.current[i];
        if (label) label.style.opacity = String(clamp((q - 0.7) / 0.3));
        // As a node nears the strip (most of the way there, before it arrives) its circle fades from blue 4 to
        // white (data-near); once it has come to rest its icon turns dark blue (data-settled), drawing the eye to
        // the four points. Both clear again if the node goes back up.
        if (el) {
          const near = el.dataset.near === "true";
          if (!near && q > 0.75) el.dataset.near = "true";
          else if (near && q < 0.7) el.dataset.near = "false";
          const atRest = q > 0.99 && Math.hypot(sx - node.x, sy - node.y) < 1.5;
          const settled = el.dataset.settled === "true";
          if (atRest !== settled && (atRest || q < 0.97)) el.dataset.settled = String(atRest);
        }
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, size, reduce]);

  const mobile = size.w < 640;
  const labelTop = size.h * STRIP_Y + (NODE / 2) * (mobile ? 1.4 : NODE_MAX) + 16;

  return (
    // A click is a shortcut only (no keyboard equivalent needed): scrolling reaches the same state.
    <section onClick={skipToEnd} className="mx-2 rounded-[16px] bg-bg-grey bg-[linear-gradient(var(--color-primary-8),var(--color-primary-8))]">
      {/* The title is ordinary page content: 80px above it; the stage the nodes move in starts right under it, and the graph sits 120px below it,
          and it scrolls up behind the nav. Only the stage below it is pinned. */}
      {/* Fills in as it is read, with the same red-green-blue edge as the page's other section titles. */}
      <ScrollInk
        as="h2"
        text="A new way of lending needs serious infrastructure."
        offset={["start 1", "start 0.75"]}
        className="mx-auto max-w-[900px] px-r3 pt-r8 text-center font-display text-h3 font-bold [text-wrap:balance]"
      />
      <div ref={outerRef} style={{ height: `calc(100svh - var(--navbar-bottom, 0px) - 16px + ${SCROLL_VH * 100}svh)` }}>
      <div className="sticky top-[calc(var(--navbar-bottom,0px)+8px)] h-[calc(100svh-var(--navbar-bottom,0px)-16px)] overflow-hidden">
        <div ref={stageRef} className="relative mx-auto h-full w-full max-w-[1200px]">
          <svg aria-hidden className="pointer-events-none absolute inset-0 size-full">
            {NODES.map((n, i) => (
              <line
                key={n.title}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                stroke="var(--color-text-grey-32)"
                strokeWidth={1}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {NODES.map((n, i) => (
            <div
              key={n.title}
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              aria-hidden
              className="group absolute left-0 top-0 flex items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_10px_rgba(41,45,54,0.12)]"
              style={{ width: NODE * NODE_MAX, height: NODE * NODE_MAX, transformOrigin: "0 0" }}
            >
              {/* Primary blue 4 over the white circle (kept opaque so the lines don't show through) while the node is in
                  the graph; it slowly fades away to plain white as the node nears its place in the strip. */}
              <span className="absolute inset-zero bg-primary-4 transition-opacity duration-1000 ease-out group-data-[near=true]:opacity-0" />
              {/* The icon as a mask so its colour can change: text grey 64 in the graph, the nav's dark blue once settled. */}
              <span
                className="relative bg-text-grey-64 transition-colors duration-600 ease-out group-data-[settled=true]:bg-nav-navy"
                style={{ width: ICON * NODE_MAX, height: ICON * NODE_MAX, mask: `url(${n.icon}) center / contain no-repeat`, WebkitMask: `url(${n.icon}) center / contain no-repeat` }}
              />
            </div>
          ))}

          <div
            ref={logoRef}
            className="absolute left-0 top-0 flex items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(41,45,54,0.14)]"
            style={{ width: LOGO, height: LOGO }}
          >
            <Image src="/brand/trust-logo.svg" alt="Rang De" width={LOGO_ART} height={(LOGO_ART * 104.8) / 131} unoptimized style={{ width: LOGO_ART, height: "auto" }} />
          </div>

          {/* The strip's words, in place under each column and fading in as the nodes arrive. */}
          {size.h > 0 &&
            NODES.map((n, i) => (
              <div
                key={n.title}
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className="absolute flex -translate-x-1/2 flex-col items-center gap-1 px-1 text-center opacity-0"
                style={{ left: `${((i + 0.5) / NODES.length) * 100}%`, top: labelTop, width: `${100 / NODES.length}%`, maxWidth: 260 }}
              >
                <h3 className="font-display text-p4 font-bold text-text-grey-100 sm:text-p2">{n.title}</h3>
                <p className="font-display text-[12px] font-medium leading-[16px] text-text-grey-64 sm:text-p3 sm:leading-[22px]">{n.text}</p>
              </div>
            ))}
        </div>
      </div>
      </div>
    </section>
  );
}
