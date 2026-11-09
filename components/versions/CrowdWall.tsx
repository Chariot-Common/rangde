"use client";

import Image from "next/image";
import { STATS_SNAPSHOT as LIVE } from "@/lib/stats";
import { ARJUN_CHEER, Sprite, type Spr } from "./CharacterHowItWorks";

/*
 * Version 6: the last phase of Rekha and Arjun's story (StoryHowItWorks with `crowd`). After "Rekha's business grew. So
 * did Arjun's money." the story's words fade, Rekha and Arjun glide into two big tiles in the middle of the stage
 * (StoryHowItWorks moves them, using the rects from crowdLayout), and a wall of real people on Rang De fills in around
 * them: borrowers at work and the investors who fund them. Then the line and the two counts come up. It all happens in
 * the story's own pinned stage, so the story turns into the wall rather than handing over to a new section.
 *
 * `c` is the phase's progress, 0–1. The wall is real photos only (collage and reel stills of borrowers, the story
 * portraits, the eight investors); Rekha and Arjun are the only drawn people, as head-and-shoulders portraits.
 */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Head and shoulders, cropped from Rekha's waving pose and Arjun's cheering one.
export const REKHA_BUST: Spr = ["rekha", 1470, 450, 250, 250];
export const ARJUN_BUST: Spr = [ARJUN_CHEER[0], 6, 0, 300, 300];

const BORROWERS = [
  ...["gita-devi", "neilhoupe-u-koza", "sitara-devi", "sivakumar"].map((n) => `/images/stories/avatars/${n}.webp`),
  ...[1, 2, 3, 4].map((i) => `/images/stories/story-${i}-avatar.webp`),
  ...Array.from({ length: 18 }, (_, i) => `/images/collage/collage-${String(i + 1).padStart(2, "0")}.webp`),
  ...["DHsWunxNohj", "DJ8m_66TYR1", "DKl90LkTp2_", "DZb43WMJGUk", "DZpDB01p6Lo", "DaC1ZZNp7gc", "DaVC13Wporz", "Db5Qn0bpHwS", "Dd3cW7nzdIr", "DdObR7qNxXJ"].map(
    (n) => `/images/reels/${n}.jpg`,
  ),
];
const INVESTORS = ["ritika-ojha", "ajay-jain", "shiri-baghar", "kishor-nayar", "chaitanya-nadkarny", "hari-balasubramanian", "mahesh-avasare", "amrudesh-santhanam"].map(
  (n) => `/images/testimonials/${n}.webp`,
);

export type Rect = { x: number; y: number; s: number };
type Cell = { x: number; y: number; w: number; h: number; dist: number; src: string };

const GAP = 10;
const HEAD = 64; // room for the line above the wall
const FOOT = 116; // and for the two counts under it
// Tile shapes, as height ÷ width, cycled per column from a different point so neighbours never line up.
const RATIOS = [1.3, 0.85, 1.1, 1.45, 0.95, 1.2, 0.8, 1.35];

/**
 * Where everything sits on a `w` × `h` stage, as an organic masonry wall (RedNote-style): columns across the full
 * width, each a stack of photos of mixed heights starting at a different offset, and Rekha's and Arjun's big portrait
 * tiles in the middle (each two columns wide, Rekha set a little higher than Arjun). Columns flow around them.
 */
export function crowdLayout(w: number, h: number, mobile: boolean): { cells: Cell[]; rekha: Rect; arjun: Rect; top: number; bottom: number } {
  const padX = mobile ? 12 : 24;
  const padY = mobile ? 16 : 24;
  const cols = mobile ? 4 : Math.max(6, 2 * Math.round((w - 2 * padX) / 2 / 170));
  const cw = (w - 2 * padX - (cols - 1) * GAP) / cols;
  const top = padY + HEAD;
  const bottom = h - padY - FOOT;
  const colX = (c: number) => padX + c * (cw + GAP);

  // The pair: Rekha in the two columns left of the middle, Arjun in the two right of it, each a square two columns wide.
  const big = 2 * cw + GAP;
  const mid = (top + bottom) / 2;
  const shift = Math.min(36, (bottom - top - big) / 2);
  const rekha = { x: colX(cols / 2 - 2), y: mid - big / 2 - shift * 0.6, s: big };
  const arjun = { x: colX(cols / 2), y: mid - big / 2 + shift * 0.6, s: big };
  const blocked = (c: number) => (c === cols / 2 - 2 || c === cols / 2 - 1 ? rekha : c === cols / 2 || c === cols / 2 + 1 ? arjun : null);

  const cells: Cell[] = [];
  let b = 0;
  let v = 0;
  let n = 0;
  const pick = () => {
    const src = n % 5 === 2 && v < INVESTORS.length ? INVESTORS[v++] : BORROWERS[b++ % BORROWERS.length];
    n++;
    return src;
  };
  const cx = w / 2;
  for (let c = 0; c < cols; c++) {
    const x = colX(c);
    const block = blocked(c);
    // Each column is filled in up to two runs: above the pair's tile, and below it (or one run if it has none, starting
    // and ending a little in from the wall's edges so the top and bottom are ragged, not ruled).
    const runs: [number, number][] = block ? [[top, block.y - GAP], [block.y + block.s + GAP, bottom]] : [[top + ((c * 37) % 44), bottom - ((c * 53) % 48)]];
    let k = (c * 3) % RATIOS.length;
    for (const [from, to] of runs) {
      let y = from;
      while (to - y > cw * 0.45) {
        let hh = cw * RATIOS[k++ % RATIOS.length];
        // Stretch the last tile to the end of the run rather than leave a sliver.
        if (to - (y + hh + GAP) < cw * 0.55) hh = to - y;
        const dx = (x + cw / 2 - cx) / w;
        const dy = (y + hh / 2 - mid) / h;
        cells.push({ x, y, w: cw, h: hh, dist: Math.hypot(dx * 1.4, dy), src: pick() });
        y += hh + GAP;
      }
    }
  }
  return { cells, rekha, arjun, top, bottom };
}

export function CrowdWall({ c, w, h, mobile }: { c: number; w: number; h: number; mobile: boolean }) {
  if (c <= 0) return null;
  const { cells, rekha, arjun, top, bottom } = crowdLayout(w, h, mobile);
  const bust = clamp01((c - 0.55) / 0.12); // the moving figures hand over to the portraits
  const words = clamp01((c - 0.6) / 0.15);
  const count = clamp01((c - 0.6) / 0.25);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <p
        className="absolute inset-x-4 z-10 text-center font-display text-h3 font-bold text-text-grey-100 [text-wrap:balance]"
        style={{ top: top - HEAD, opacity: words, transform: `translateY(${(1 - words) * 12}px)` }}
      >
        Rekha and Arjun aren’t the only ones.
      </p>
      {cells.map((cell, i) => {
        const start = 0.28 + cell.dist * 0.45;
        const o = clamp01((c - start) / 0.14);
        return (
          <div
            key={i}
            className="absolute overflow-hidden rounded-[14px] bg-text-grey-8"
            style={{ left: cell.x, top: cell.y, width: cell.w, height: cell.h, opacity: o, transform: `scale(${0.85 + 0.15 * o})` }}
          >
            <Image src={cell.src} alt="" fill loading="eager" sizes="(min-width: 768px) 200px, 100px" className="object-cover" />
          </div>
        );
      })}
      <Bust rect={rekha} s={REKHA_BUST} o={bust} tile="bg-[#DCEBCD] ring-[#62af1d]" />
      <Bust rect={arjun} s={ARJUN_BUST} o={bust} tile="bg-[#DCEEFB] ring-primary" />
      <div className="absolute inset-x-0 z-10 flex justify-center gap-8 sm:gap-16" style={{ top: bottom + 20, opacity: words }}>
        <Stat n={Math.round(count * LIVE.entrepreneurs)} label="businesses funded" className="text-green-dark" />
        <Stat n={Math.round(count * LIVE.investors)} label="investors funding them" className="text-primary" />
      </div>
    </div>
  );
}

function Bust({ rect, s, o, tile }: { rect: Rect; s: Spr; o: number; tile: string }) {
  return (
    <div className={`absolute overflow-hidden rounded-[18px] ring-4 ring-inset ${tile}`} style={{ left: rect.x, top: rect.y, width: rect.s, height: rect.s, opacity: o }}>
      <Sprite s={s} k={rect.s / s[3]} style={{ left: 0, top: 0 }} />
    </div>
  );
}

function Stat({ n, label, className }: { n: number; label: string; className: string }) {
  return (
    <p className="flex flex-col items-center">
      <span className={`font-display text-[32px] font-bold leading-[40px] tabular-nums sm:text-[44px] sm:leading-[52px] ${className}`}>{n.toLocaleString("en-IN")}</span>
      <span className="font-display text-p2 font-medium text-text-grey-64 sm:text-p1">{label}</span>
    </p>
  );
}
