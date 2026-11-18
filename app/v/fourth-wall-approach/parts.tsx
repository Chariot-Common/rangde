/* eslint-disable @next/next/no-img-element */
// Shared artwork for /v/fourth-wall-approach: the asset paths and the small icon groups the sections reuse.
// Crops are Figma's own (node 3132:2), so each icon shows exactly what the design frame shows.
import type { ReactNode } from "react";
import s from "./page.module.css";

export const A = "/v/fourth-wall-approach";
export const SLIP = `${A}/salary-slip.webp`;
export const ID_CARD = `${A}/id-card.webp`;
export const PASSBOOK = `${A}/passbook.webp`;

export type Crop = { h: string; w: string; left: string; top: string };
export const CROPS = {
  id: { h: "106.67%", w: "100%", left: "0", top: "-6.67%" },
  passbook: { h: "106.67%", w: "100%", left: "0", top: "-5.56%" },
  banknotes: { h: "100%", w: "139.25%", left: "-19.63%", top: "0" },
  paper: { h: "100%", w: "76.6%", left: "11.7%", top: "0" },
  bag: { h: "100%", w: "106.21%", left: "-0.16%", top: "0" },
} satisfies Record<string, Crop>;

export function Thumb({ src, crop, h = 72, className = "" }: { src: string; crop?: Crop; h?: number; className?: string }) {
  return (
    <div className={`${s.thumb} ${className}`} style={{ height: h }}>
      <img loading="lazy" decoding="async"
        src={src}
        alt=""
        style={crop ? { height: crop.h, width: crop.w, left: crop.left, top: crop.top } : { inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

/** Slip, ID card and passbook fanned out: "valid proof" in the catch sequences. */
export function ProofStack() {
  const box = (left: number, top: number, src: string, crop?: Crop) => (
    <div style={{ left, top, width: 72, height: 72 }}>
      <Thumb src={src} crop={crop} />
    </div>
  );
  return (
    <div className={s.stack} style={{ width: 131, height: 110 }}>
      {box(0, 0, SLIP)}
      {box(33, 16, ID_CARD, CROPS.id)}
      {box(59, 38, PASSBOOK, CROPS.passbook)}
    </div>
  );
}

export function PenStack() {
  return (
    <div className={s.stack} style={{ width: 131, height: 117 }}>
      <div style={{ left: 0, top: 0, width: 59.028, height: 100.285, overflow: "hidden" }}>
        <img loading="lazy" decoding="async" src={`${A}/pen.webp`} alt="" style={{ position: "absolute", height: "99.6%", width: "169.21%", left: "-34.41%", top: "0.13%", maxWidth: "none" }} />
      </div>
      <div style={{ left: 26.6, top: 2.8, width: 104.398, height: 114.416, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: "rotate(-55.85deg)", width: 97.586, height: 59.955, position: "relative", overflow: "hidden" }}>
          <img loading="lazy" decoding="async" src={`${A}/pen-2.webp`} alt="" style={{ position: "absolute", height: "166.59%", width: "102.35%", left: "-1.18%", top: "-33.79%", maxWidth: "none" }} />
        </div>
      </div>
    </div>
  );
}

export function HistoryVisual() {
  return (
    <div className={s.thumb} style={{ width: 131, height: 102 }}>
      <img loading="lazy" decoding="async" src={PASSBOOK} alt="" style={{ height: "136.99%", width: "100%", left: 0, top: "-20.86%" }} />
    </div>
  );
}

export function Step({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className={s.step}>
      {children}
      <p className={s.p2}>{label}</p>
    </div>
  );
}

/** Figma's arrow: "r" points right (urban flow), "l" points left (rural flow). */
export function Line({ dir }: { dir: "r" | "l" }) {
  return (
    <div className={`${s.line} ${dir === "r" ? s.lineR : s.lineL}`}>
      <img loading="lazy" decoding="async" src={`${A}/${dir === "r" ? "line-2" : "line-3"}.svg`} alt="" />
    </div>
  );
}

export const CATCH_TOP = ["You need credit", "to build a credit history."];
export const CATCH_BOTTOM = ["You need a credit history", "to get credit."];
