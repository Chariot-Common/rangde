"use client";
import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { InkPiece, shares, useInkDrive } from "./ink";
import { pinProgress, pinTop } from "./pin";
import s from "./page.module.css";

const WORDS = ["finance", "grassroots", "unacknowledged", "systemic", "real"];
const article = (w: string) => (/^[aeiou]/i.test(w) ? "an" : "a");
const HOLD_MS = 2000;
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * A word that morphs into the next: the old one blurs out as the new one blurs in, while the slot's width eases to
 * the new word's width over 800ms, so the centred sentence around it ("Our country has", "problem") slides smoothly.
 */
function MorphSlot({ value, options }: { value: string; options: string[] }) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});
  useIsoLayoutEffect(() => {
    const measure = () => {
      const el = measureRef.current;
      if (!el) return;
      const next: Record<string, number> = {};
      el.querySelectorAll<HTMLSpanElement>("[data-w]").forEach((n) => (next[n.dataset.w!] = n.getBoundingClientRect().width));
      setWidths(next);
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return (
    <span className={s.morph} style={{ width: widths[value] ?? "auto" }}>
      <span ref={measureRef} aria-hidden className={s.morphMeasure}>
        {options.map((o) => (
          <span key={o} data-w={o}>
            {o}
          </span>
        ))}
      </span>
      {options.map((o) => (
        <span key={o} className={s.morphWord} data-on={o === value ? "" : undefined} aria-hidden={o !== value}>
          {o}
        </span>
      ))}
    </span>
  );
}

const LINES = ["In rural India, it’s extremely", "difficult for business owners", "to get a formal", "loan."];

/**
 * 02 Problem. The section pins in the middle of the screen. Arriving, it reads as one sentence ("…to get a formal
 * loan."); scrolling on while it's pinned, "to get a formal" slides left, "loan." slides right, and the note grows out
 * of the gap between them.
 */
export function Problem() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % WORDS.length), HOLD_MS);
    return () => clearInterval(id);
  }, [reduce]);
  const word = WORDS[i];

  const pinRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const progress = useMotionValue(0);
  useEffect(() => {
    const pin = pinRef.current;
    if (!pin) return;
    const panel = pin.firstElementChild as HTMLElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      panel.style.top = `${pinTop(panel)}px`;
      progress.set(pinProgress(pin));
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, [progress]);

  const open = useTransform(progress, [0.08, 0.7], [0, 1], { clamp: true });
  const pill = useTransform(progress, [0.35, 1], [0, 1], { clamp: true });
  const gapW = useTransform(open, (v) => `calc(var(--pill-gap) * ${v})`);

  const ink = useInkDrive(headRef);
  const parts = shares(LINES);

  return (
    <div ref={pinRef} className={s.problemPin} data-fw-pin="0,1">
      <section className={`${s.section} ${s.dark} ${s.problem}`}>
        <div className={s.problemCopy}>
          <p className={`${s.p1} ${s.onDarkMuted}`}>
            Our country has <MorphSlot value={article(word)} options={["a", "an"]} /> <MorphSlot value={word} options={WORDS} /> problem
          </p>
          <h2 ref={headRef} className={`${s.display} ${s.onDark}`}>
            <InkPiece text={LINES[0]} drive={ink} from={parts[0][0]} to={parts[0][1]} tone="white" className={s.inkLine} />
            <InkPiece text={LINES[1]} drive={ink} from={parts[1][0]} to={parts[1][1]} tone="white" className={s.inkLine} />
            <span className={s.openLine}>
              <InkPiece text={LINES[2]} drive={ink} from={parts[2][0]} to={parts[2][1]} tone="white" />
              <motion.span className={s.pillGap} style={{ width: gapW }}>
                <motion.span className={s.pill} style={{ scale: pill, opacity: pill }}>
                  By “formal”, we mean recorded on paper by a Government recognised body.
                </motion.span>
              </motion.span>
              <InkPiece text={LINES[3]} drive={ink} from={parts[3][0]} to={parts[3][1]} tone="white" />
            </span>
          </h2>
          <p className={`${s.p1} ${s.onDarkMuted}`}>Without credit, a business can’t grow. For some, it means losing a livelihood.</p>
        </div>
      </section>
    </div>
  );
}
