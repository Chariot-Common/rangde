"use client";
import { useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { InkLines } from "./ink";
import { CATCH_BOTTOM, CATCH_TOP, HistoryVisual, Line, PenStack, ProofStack, Step } from "./parts";
import { pinProgress, pinScrollAt, pinTop } from "./pin";
import s from "./page.module.css";

/*
 * 05 Catch sequence, pinned to the screen while it scrolls (laptops; phones and tablets get the three states stacked).
 *   Stage 0  "You need credit…" fills in white, letter by letter, as it arrives; only once it is full does "You need a
 *            credit history…" fill in (primary blue 24 → 100), while the section is pinned. Then, scrubbed by the scroll,
 *            the two lines part (up and down), blur fully and fade to 8%.
 *   Stage 1  "It's easier for people in urban areas", then the urban strip, left to right, quickly.
 *   Stage 2  The strip slides right; everything after "Valid Proof" fades out on the way, "Valid Proof" lands where the
 *            rural strip ends and becomes "No Valid Proof"; the rural strip then builds right to left.
 */

// Figma: 131px steps, 77px arrows, 24px gaps, so a step and an arrow are 128px apart, centre to centre.
const P = 128;
type Piece = { key: string; x: number; node: ReactNode };

const URBAN: Piece[] = [
  { key: "u0", x: -4 * P, node: null }, // Valid Proof: rendered separately, it is the piece that travels
  { key: "a1", x: -3 * P, node: <Line dir="r" /> },
  { key: "u1", x: -2 * P, node: <Step label="Low Risk Credit"><PenStack /></Step> },
  { key: "a2", x: -1 * P, node: <Line dir="r" /> },
  { key: "u2", x: 0, node: <Step label="Recorded Repayments"><ProofStack /></Step> },
  { key: "a3", x: P, node: <Line dir="r" /> },
  { key: "u3", x: 2 * P, node: <Step label="Credit History"><HistoryVisual /></Step> },
  { key: "a4", x: 3 * P, node: <Line dir="r" /> },
  { key: "u4", x: 4 * P, node: <Step label="Business Loans"><ProofStack /></Step> },
];
// Right to left, in the order they appear.
const RURAL: Piece[] = [
  { key: "l1", x: 2 * P, node: <Line dir="l" /> },
  { key: "r1", x: P, node: <Step label="Informal Sources"><ProofStack /></Step> },
  { key: "l2", x: 0, node: <Line dir="l" /> },
  { key: "r2", x: -P, node: <Step label="Uncertain Terms"><ProofStack /></Step> },
  { key: "l3", x: -2 * P, node: <Line dir="l" /> },
  { key: "r3", x: -3 * P, node: <Step label="No Repayment Record"><ProofStack /></Step> },
];
const TRAVEL = 3 * P + 4 * P; // Valid Proof: from -4P to +3P (the rural strip is 4 steps wide, centred)
const STRIP_W = 9 * P + 24; // urban strip, outer edge to outer edge

// Scroll thresholds through the pinned stretch (0 → 1).
const FILL_END = 0.2; // the second line is full
const OPEN_FROM = 0.24;
const OPEN_TO = 0.42;
const URBAN_AT = 0.44;
const RURAL_AT = 0.7;

function piece(x: number, opacity: number, ms: { t: number; o: number; d: number; od?: number }): CSSProperties {
  return {
    transform: `translate(calc(${x}px - 50%), -50%)`,
    opacity,
    transition: `transform ${ms.t}ms cubic-bezier(0.65, 0, 0.35, 1) ${ms.d}ms, opacity ${ms.o}ms ease ${ms.od ?? ms.d}ms`,
  };
}

export function CatchSequence() {
  const outerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  // The two lines' fill, 0 → 1: from the section's top 60% of the way down the screen until FILL_END of the pin.
  // The first line takes the first half, the second line the second half, so it only starts once the first is full.
  const fillRaw = useMotionValue(0);
  const fill = useSpring(fillRaw, { stiffness: 70, damping: 22, restDelta: 0.0005 });
  const fillTop = useTransform(fill, [0, 0.5], [0, 1], { clamp: true });
  const fillBottom = useTransform(fill, [0.5, 1], [0, 1], { clamp: true });

  useEffect(() => {
    const outer = outerRef.current;
    const panel = stageRef.current;
    if (!outer || !panel) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      panel.style.top = `${pinTop(panel)}px`;
      const p = pinProgress(outer);
      const from = outer.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.6;
      const to = pinScrollAt(outer, FILL_END);
      fillRaw.set(Math.min(1, Math.max(0, (window.scrollY - from) / Math.max(1, to - from))));
      const open = Math.min(1, Math.max(0, (p - OPEN_FROM) / (OPEN_TO - OPEN_FROM)));
      panel.style.setProperty("--open", String(open));
      // The urban strip is 1176px; scale it down to fit narrower laptops.
      panel.style.setProperty("--strip", String(Math.min(1, (panel.clientWidth - 64) / STRIP_W)));
      setStage(p >= RURAL_AT ? 2 : p >= URBAN_AT ? 1 : 0);
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
  }, [fillRaw]);

  return (
    <>
      <div ref={outerRef} className={s.catchPin}>
        <section ref={stageRef} className={`${s.section} ${s.dark} ${s.catchStage}`} data-stage={stage}>
          {/* Filled in one after the other (white, then primary blue); as the strip comes in they part, shrink, blur and fade to 8%. */}
          <InkLines lines={CATCH_TOP} tone="white" drive={fillTop} className={`${s.display} ${s.catchTop}`} />
          <InkLines lines={CATCH_BOTTOM} tone="blue" drive={fillBottom} className={`${s.display} ${s.catchBottom}`} />

          <div className={s.catchMiddle}>
            <div className={s.catchHeads}>
              <p className={`${s.h1} ${s.onDark}`} style={{ opacity: stage === 1 ? 1 : 0, transition: `opacity 250ms ease ${stage === 1 ? 0 : 0}ms` }}>
                It’s easier for people in urban areas
              </p>
              <p className={`${s.h1} ${s.onDark}`} aria-hidden={stage !== 2} style={{ opacity: stage === 2 ? 1 : 0, transition: `opacity 300ms ease ${stage === 2 ? 350 : 0}ms` }}>
                In rural areas, most are led astray
              </p>
            </div>

            <div className={s.strip}>
              {/* Valid Proof → No Valid Proof: the one piece that travels. */}
              <div
                className={s.stripPiece}
                style={piece(stage === 2 ? -4 * P + TRAVEL : stage === 1 ? -4 * P : -4 * P - 16, stage === 0 ? 0 : 1, stage === 2 ? { t: 800, o: 200, d: 0 } : { t: stage === 1 ? 800 : 250, o: 250, d: stage === 1 ? 80 : 0 })}
              >
                <Step
                  label={
                    <span className={s.swapLabel}>
                      <span style={{ opacity: stage === 2 ? 0 : 1, transition: `opacity 250ms ease ${stage === 2 ? 450 : 0}ms` }}>Valid Proof</span>
                      <span style={{ opacity: stage === 2 ? 1 : 0, transition: `opacity 250ms ease ${stage === 2 ? 600 : 0}ms` }}>No Valid Proof</span>
                    </span>
                  }
                >
                  <ProofStack />
                </Step>
              </div>

              {URBAN.slice(1).map((u, k) => {
                const i = k + 1;
                const style =
                  stage === 1
                    ? piece(u.x, 1, { t: 300, o: 300, d: 140 + i * 60 }) // in, left to right, fast
                    : stage === 2
                      ? piece(u.x + TRAVEL, 0, { t: 800, o: 350, d: 0 }) // carried right while fading out
                      : piece(u.x - 16, 0, { t: 200, o: 200, d: 0 });
                return (
                  <div key={u.key} className={s.stripPiece} style={style} aria-hidden={stage !== 1}>
                    {u.node}
                  </div>
                );
              })}

              {RURAL.map((r, k) => (
                <div
                  key={r.key}
                  className={s.stripPiece}
                  aria-hidden={stage !== 2}
                  style={stage === 2 ? piece(r.x, 1, { t: 300, o: 300, d: 850 + k * 70 }) : piece(r.x + 16, 0, { t: 200, o: 150, d: 0 })}
                >
                  {r.node}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Phones and tablets: the three states, one after another. */}
      <div className={s.catchStatic}>
        <section className={`${s.section} ${s.dark} ${s.catch}`}>
          <div className={s.catchCopy}>
            <h2 className={`${s.display} ${s.onDark}`}>{CATCH_TOP.join(" ")}</h2>
            <h2 className={`${s.display} ${s.catchBlue}`}>{CATCH_BOTTOM.join(" ")}</h2>
          </div>
        </section>
        <section className={`${s.section} ${s.dark} ${s.catch}`}>
          <div className={s.catchCopy}>
            <p className={`${s.display} ${s.ghost}`}>{CATCH_TOP.join(" ")}</p>
            <h2 className={`${s.h1} ${s.onDark}`}>It’s easier for people in urban areas</h2>
            <div className={s.flow}>
              <Step label="Valid Proof"><ProofStack /></Step>
              <Step label="Low Risk Credit"><PenStack /></Step>
              <Step label="Recorded Repayments"><ProofStack /></Step>
              <Step label="Credit History"><HistoryVisual /></Step>
              <Step label="Business Loans"><ProofStack /></Step>
            </div>
            <p className={`${s.display} ${s.ghost}`}>{CATCH_BOTTOM.join(" ")}</p>
          </div>
        </section>
        <section className={`${s.section} ${s.dark} ${s.catch}`}>
          <div className={s.catchCopy}>
            <p className={`${s.display} ${s.ghost}`}>{CATCH_TOP.join(" ")}</p>
            <h2 className={`${s.h1} ${s.onDark}`}>In rural areas, most are led astray</h2>
            <div className={s.flow}>
              <Step label="No Valid Proof"><ProofStack /></Step>
              <Step label="Informal Sources"><ProofStack /></Step>
              <Step label="Uncertain Terms"><ProofStack /></Step>
              <Step label="No Repayment Record"><ProofStack /></Step>
            </div>
            <p className={`${s.display} ${s.ghost}`}>{CATCH_BOTTOM.join(" ")}</p>
          </div>
        </section>
      </div>
    </>
  );
}
