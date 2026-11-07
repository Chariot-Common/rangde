"use client";

import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { STORY_ART, type StoryArt } from "./story-assets";

/*
 * Version 1.1's six problem / solution scenes, drawn from the cut-out art in public/images/story (the ChatGPT
 * sheets, sliced by name; see docs/v1-1-story-asset-prompts.md). Every scene takes `t`, a 0–1 motion value that
 * is that step's own stretch of the scroll, and plays from it (scrubbed, so scrolling back plays it backwards).
 * Kept deliberately simple: she stays put facing the screen, nothing walks, no furniture; the art is
 * state-swapped (a sad face then a happy one), faded and moved a little. The words in the scenes are live text.
 *
 * The side-by-side pairs, problem ↔ solution:
 *   1. Banks won't lend ........ ↔ Investors lend
 *   2. Informal loans cost more ↔ Interest stays fair (same pill, same place: red 20–30% vs green up to 8.5%)
 *   3. No credit score built ... ↔ Repaying builds credit (the bank again: same bank, document and stamp
 *      positions as panel 1; only the stamp, the words and her face change)
 * The canvas is 400 × 280; each kind of art has one scale, so she is the same size in every scene.
 */

export type SceneProps = { t: MotionValue<number> };

const INK_SOFT = "var(--color-text-grey-48)";
const GREEN = "var(--color-green-100)";
const GREEN_WASH = "var(--color-green-24)";
const RED = "var(--color-red-100)";
const RED_WASH = "var(--color-red-16)";
const WHITE = "var(--color-white-100)";

/** Units per source pixel, per kind of art. */
const K = { vendor: 0.55, investor: 0.3, bank: 0.47 } as const;

const ART_DIR = "/images/story/";

/* ───────────────────────── Helpers ───────────────────────── */

function useKeys(t: MotionValue<number>, input: number[], output: number[]) {
  return useTransform(t, input, output, { clamp: true });
}
/** 1 while t is in [a, b), else 0: a hard swap between two pieces of art. */
function useWin(t: MotionValue<number>, a: number, b = Infinity) {
  return useTransform<number, number>(t, (v) => (v >= a && v < b ? 1 : 0));
}

/** Everything in a scene is drawn at 3/4 size and centred on the canvas: `cx, cy` is the middle of the scene's content. */
const SCENE_SCALE = 0.75;
function Stage({ children, cx, cy }: { children: ReactNode; cx: number; cy: number }) {
  return (
    <svg viewBox="0 0 400 280" className="font-display h-full w-full" role="img" aria-hidden>
      <g transform={`translate(200 140) scale(${SCENE_SCALE}) translate(${-cx} ${-cy})`}>{children}</g>
    </svg>
  );
}

/** A piece of art at scale `k`, with its bottom-centre at (x, y), or its centre there, or its bottom-left. */
function Art({ n, k, x, y, at = "bottom", fade }: { n: StoryArt; k: number; x: number; y: number; at?: "bottom" | "center" | "left-bottom"; fade?: MotionValue<number> }) {
  const { w, h } = STORY_ART[n];
  const W = w * k;
  const H = h * k;
  const left = at === "left-bottom" ? x : x - W / 2;
  const top = at === "center" ? y - H / 2 : y - H;
  const img = <image href={`${ART_DIR}${n}.webp`} x={left} y={top} width={W} height={H} />;
  return fade ? <motion.g style={{ opacity: fade }}>{img}</motion.g> : img;
}

function Tag({ x, y, w, h = 28, fill, color, children }: { x: number; y: number; w: number; h?: number; fill: string; color: string; children: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={color}>
        {children}
      </text>
    </g>
  );
}

/* ───────────────────────── 1 / 6 · The bank: stop ↔ tick ───────────────────────── */

const VENDOR = { x: 30, y: 250 }; // where she stands
const DOC = { x: 170, y: 178 }; // the document in the open space between her and the bank: bottom-centre
const STAMP = { x: DOC.x + 9.5, y: DOC.y - 19.7 }; // the mark on the stamped document: the same spot // the stamp, on the document, the same whichever way it goes

/** She stands facing the screen; the document appears beside her, the stamp lands on it, the words follow, and her
 * face changes. `ok` swaps the stop for a tick and "No credit history" for "Credit history": same places. */
function BankScene({ t, ok }: SceneProps & { ok: boolean }) {
  const before = useWin(t, 0, 0.55);
  const after = useWin(t, 0.55);
  const docOpacity = useKeys(t, [0.08, 0.24], [0, 1]);
  const docY = useKeys(t, [0.08, 0.24], [14, 0]);
  const docBare = useWin(t, 0, 0.55);
  const docStamped = useWin(t, 0.55);
  const stampScale = useKeys(t, [0.38, 0.52], [2.6, 1]);
  const stampOpacity = useTransform<number, number>(t, (v) => (v < 0.38 ? 0 : v < 0.43 ? (v - 0.38) / 0.05 : v < 0.62 ? 1 : v < 0.7 ? 1 - (v - 0.62) / 0.08 : 0));
  const [stampS, setStampS] = useState(() => stampScale.get());
  useMotionValueEvent(stampScale, "change", setStampS);
  const tagOpacity = useKeys(t, [0.66, 0.8], [0, 1]);
  const tagY = useKeys(t, [0.66, 0.8], [6, 0]);
  const stamp: StoryArt = ok ? "bank__stamp-tick" : "bank__stamp-stop";
  const docDone: StoryArt = ok ? "bank__doc-tick" : "bank__doc-stop";
  const face: StoryArt = ok ? "vendor__happy-front" : "vendor__sad-front";
  return (
    <Stage cx={206} cy={151}>
      <Art n="bank__building" k={K.bank} x={330} y={250} />

      <Art n="vendor__neutral-front" k={K.vendor} x={VENDOR.x} y={VENDOR.y} fade={before} />
      <Art n={face} k={K.vendor} x={VENDOR.x} y={VENDOR.y} fade={after} />

      <motion.g style={{ opacity: docOpacity, y: docY }}>
        <Art n="bank__doc" k={0.24} x={DOC.x} y={DOC.y} fade={docBare} />
        <Art n={docDone} k={0.24} x={DOC.x} y={DOC.y} fade={docStamped} />
      </motion.g>

      <g transform={`translate(${STAMP.x} ${STAMP.y}) scale(${stampS})`}>
        <motion.g style={{ opacity: stampOpacity }}>
          <Art n={stamp} k={0.15} x={0} y={0} at="center" />
          {!ok && <path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke={WHITE} strokeWidth={3} strokeLinecap="round" />}
        </motion.g>
      </g>

      {/* A white cross on the STOP mark, so it reads as "no". */}
      {!ok && (
        <motion.g style={{ opacity: docStamped }}>
          <path d={`M${STAMP.x - 5} ${STAMP.y - 5} L${STAMP.x + 5} ${STAMP.y + 5} M${STAMP.x + 5} ${STAMP.y - 5} L${STAMP.x - 5} ${STAMP.y + 5}`} stroke={WHITE} strokeWidth={3} strokeLinecap="round" />
        </motion.g>
      )}

      {/* The words go above the document, clear of her. */}
      <motion.g style={{ opacity: tagOpacity, y: tagY }}>
        {ok ? (
          <Tag x={DOC.x - 62} y={50} w={124} fill={GREEN_WASH} color={GREEN}>
            Credit history ✓
          </Tag>
        ) : (
          <Tag x={DOC.x - 66} y={50} w={132} fill={RED_WASH} color={RED}>
            No credit history
          </Tag>
        )}
      </motion.g>
    </Stage>
  );
}

export function BanksWontLend({ t }: SceneProps) {
  return <BankScene t={t} ok={false} />;
}
export function RepayingBuildsCredit({ t }: SceneProps) {
  return <BankScene t={t} ok />;
}

/* ───────────────────────── 2 / 6 · The interest rate: red pill ↔ green pill ───────────────────────── */

const PILL = { x: 272, y: 118 }; // the pill's centre: the same on both sides
const PILL_K = 0.68;
const RATE_VENDOR_X = 70; // where she stands beside the pill

/** She stands facing the screen with the interest rate beside her in a pill, and her face changes. Red 20–30% for the
 * problem, green up to 8.5% for the solution: the same pill, the same place. Nothing else. */
function RateScene({ t, fair }: SceneProps & { fair: boolean }) {
  const before = useWin(t, 0, 0.35);
  const after = useWin(t, 0.35);
  const opacity = useKeys(t, [0.1, 0.3], [0, 1]);
  const lift = useKeys(t, [0.1, 0.3], [16, 0]);
  const face: StoryArt = fair ? "vendor__happy-front" : "vendor__sad-front";
  return (
    <Stage cx={212} cy={161}>
      <Art n="vendor__neutral-front" k={K.vendor} x={RATE_VENDOR_X} y={VENDOR.y} fade={before} />
      <Art n={face} k={K.vendor} x={RATE_VENDOR_X} y={VENDOR.y} fade={after} />
      <motion.g style={{ opacity, y: lift }}>
        <Art n={fair ? "money__pill-green" : "money__pill-red"} k={PILL_K} x={PILL.x} y={PILL.y} at="center" />
        <text x={PILL.x} y={PILL.y + 5} textAnchor="middle" fontSize={15} fontWeight={800} fill={WHITE}>
          {fair ? "up to 8.5% interest p.a." : "20–30% interest p.a."}
        </text>
      </motion.g>
    </Stage>
  );
}

export function InformalLoansCostMore({ t }: SceneProps) {
  return <RateScene t={t} fair={false} />;
}
export function InterestStaysFair({ t }: SceneProps) {
  return <RateScene t={t} fair />;
}

/* ───────────────────────── 3 / 6 · Credit meter: fills, then snaps back to zero ───────────────────────── */

const GX = 225; // the gauge's centre
const GY = 176;
const GK = 0.48; // the track's scale
const R_FILL = 186.5 * GK; // the track's centre line, which the fill follows
const NEEDLE_K = 0.37;

export function NoCreditScoreBuilt({ t }: SceneProps) {
  // Fills while she repays, holds, then snaps back to 0 when the loan ends.
  const frac = useKeys(t, [0, 0.05, 0.5, 0.62, 0.7, 1], [0, 0, 0.8, 0.8, 0, 0]);
  const arc = useTransform(frac, (g) => {
    const a = Math.PI * (1 - g);
    const x = GX + R_FILL * Math.cos(a);
    const y = GY - R_FILL * Math.sin(a);
    return g <= 0.001 ? `M${GX - R_FILL} ${GY}` : `M${GX - R_FILL} ${GY} A${R_FILL} ${R_FILL} 0 0 1 ${x} ${y}`;
  });
  const [f, setF] = useState(() => frac.get());
  useMotionValueEvent(frac, "change", setF);
  const happy = useWin(t, 0, 0.62);
  const sad = useWin(t, 0.62);
  const repaid = useKeys(t, [0.45, 0.52, 0.62, 0.68], [0, 1, 1, 0]);
  const noRecord = useKeys(t, [0.72, 0.85], [0, 1]);
  const { w: nw, h: nh } = STORY_ART["gauge__needle"];
  return (
    <Stage cx={174} cy={136}>
      <Art n="vendor__happy-front" k={K.vendor * 0.8} x={52} y={255} fade={happy} />
      <Art n="vendor__sad-front" k={K.vendor * 0.8} x={52} y={255} fade={sad} />

      <Art n="gauge__card" k={0.5} x={GX} y={152} at="center" />
      <Art n="gauge__track" k={GK} x={GX} y={GY + STORY_ART["gauge__track"].h * GK * 0.07} />
      <motion.path d={arc} stroke={GREEN} strokeWidth={17} strokeLinecap="round" fill="none" />
      {/* The needle swings from its pivot. */}
      <g transform={`translate(${GX} ${GY}) rotate(${(f - 0.5) * 180})`}>
        <image href={`${ART_DIR}gauge__needle.webp`} x={-(nw * NEEDLE_K) / 2} y={-(nh * NEEDLE_K) + 35 * NEEDLE_K} width={nw * NEEDLE_K} height={nh * NEEDLE_K} />
      </g>

      {/* H6 (10px, 5% tracking, bold, uppercase), two lines under the needle's pivot. */}
      <text textAnchor="middle" fill={INK_SOFT} style={{ fontSize: "var(--font-size-h6)", letterSpacing: "var(--letter-spacing-h6)", fontWeight: 700, textTransform: "uppercase" }}>
        <tspan x={GX} y={GY + 32}>
          Credit
        </tspan>
        <tspan x={GX} y={GY + 46}>
          Capacity
        </tspan>
      </text>

      <motion.g style={{ opacity: repaid }}>
        <Tag x={GX - 66} y={12} w={132} fill={GREEN_WASH} color={GREEN}>
          Loan repaid ✓
        </Tag>
      </motion.g>
      <motion.g style={{ opacity: noRecord }}>
        <Tag x={GX - 66} y={12} w={132} fill={RED_WASH} color={RED}>
          No record kept
        </Tag>
      </motion.g>
    </Stage>
  );
}

/* ───────────────────────── 4 / 6 · Investors: ordinary people, coins from their phones ───────────────────────── */

// A row of five, small and well above her, so they read as behind her and not in front of her.
const INVESTORS: { x: number; art: StoryArt }[] = [
  { x: 48, art: "investor-student__2" },
  { x: 124, art: "investor-office__2" },
  { x: 200, art: "investor-retiree__2" },
  { x: 276, art: "investor-student__3" },
  { x: 352, art: "investor-office__3" },
];
const ROW_FEET = 88; // where their feet are
const PHONE_Y = 50; // about where each holds their phone
const COINS_EACH = 5;
const HER = { x: 150, y: 270 }; // her feet; she is the same size as everywhere else
const TARGET = { x: 150, y: 168 }; // her chest, where the coins land

export function InvestorsLend({ t }: SceneProps) {
  const peopleOpacity = useKeys(t, [0, 0.06], [0, 1]);
  const funded = useKeys(t, [0.08, 0.84], [0, 1]);
  const clipId = `${useId()}-funded`;
  const barWidth = useTransform(funded, (v) => 100 * v);
  return (
    <Stage cx={205} cy={141}>
      <Art n="cart__side" k={0.25} x={320} y={270} />
      <Art n="vendor__happy-front" k={K.vendor} x={HER.x} y={HER.y} />

      <motion.g style={{ opacity: peopleOpacity }}>
        {INVESTORS.map((p) => (
          <Art key={p.x} n={p.art} k={K.investor} x={p.x} y={ROW_FEET} />
        ))}
      </motion.g>

      {INVESTORS.flatMap((p, i) =>
        Array.from({ length: COINS_EACH }, (_, j) => (
          <Coin key={`${i}-${j}`} t={t} from={{ x: p.x + 4, y: PHONE_Y }} start={0.06 + i * 0.075 + j * 0.035} seed={i * 7 + j} />
        )),
      )}

      {/* How much of her loan is funded: the green fills the empty bar. */}
      <text x={270} y={104} fontSize={11} fontWeight={700} fill={INK_SOFT}>
        Funded
      </text>
      <Art n="money__bar-empty" k={0.156} x={270} y={120} at="left-bottom" />
      <clipPath id={clipId}>
        <motion.rect x={270} y={104} height={20} style={{ width: barWidth }} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <Art n="money__bar-full" k={0.156} x={270} y={120} at="left-bottom" />
      </g>
    </Stage>
  );
}

/** One small coin, from an investor's phone to her. */
function Coin({ t, from, start, seed }: { t: MotionValue<number>; from: { x: number; y: number }; start: number; seed: number }) {
  const end = start + 0.2;
  const spread = ((seed * 37) % 13) - 6; // a fixed scatter, so five coins from one phone don't ride on top of each other
  const x = useKeys(t, [start, end], [from.x + spread * 0.5, TARGET.x + spread * 1.2]);
  const y = useKeys(t, [start, end], [from.y, TARGET.y + (spread % 5) * 2]);
  const opacity = useKeys(t, [start, start + 0.015, end - 0.03, end], [0, 1, 1, 0]);
  return (
    <motion.g style={{ x, y, opacity }}>
      <Art n="money__coin" k={0.05} x={0} y={0} at="center" />
    </motion.g>
  );
}

/* ───────────────────────── The six, in order, with a still frame for the storyboard ───────────────────────── */

export type SceneDef = { name: string; Scene: (p: SceneProps) => ReactNode; still: number };

export const PROBLEM_SCENES: SceneDef[] = [
  { name: "Banks won’t lend", Scene: BanksWontLend, still: 0.9 },
  { name: "Informal loans cost more", Scene: InformalLoansCostMore, still: 0.6 },
  { name: "No credit score built", Scene: NoCreditScoreBuilt, still: 0.5 },
];

export const SOLUTION_SCENES: SceneDef[] = [
  { name: "Investors lend", Scene: InvestorsLend, still: 0.45 },
  { name: "Interest stays fair", Scene: InterestStaysFair, still: 0.6 },
  { name: "Repaying builds credit", Scene: RepayingBuildsCredit, still: 0.9 },
];
