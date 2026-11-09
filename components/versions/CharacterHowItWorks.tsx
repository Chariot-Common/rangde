"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { STATS_SNAPSHOT as LIVE, roundedPlus } from "@/lib/stats";
import { BANK, FLAT_BG, FlatFar, INK, type Shutter, FlatFurniture, FlatPlants, FlatWalls, VILLAGE_BG, VillageBuildings, VillageFar, VillageGround, VillagePlants } from "./storyWorlds";

/**
 * Version B's "How it works" as a story (first draft): Rekha, a tailor in a Rajasthan village,
 * and Arjun, an investor in Bengaluru, each in their own world, one above the other. Scrolling
 * the page (on every screen size) moves through ten scenes: her machine breaks, the bank says no,
 * a field partner vouches for her, Arjun and others lend, she opens a shop, she repays.
 *
 * Built on the wireframe prototype (public/hiw-scroll): each scene's first half is its own
 * action, the second half is the camera travelling to the next place. Every world has four
 * layers moving at different speeds (sky, buildings, ground, foreground plants), with the
 * characters on the ground layer. The worlds are line art drawn in code (storyWorlds.tsx); the
 * characters and props are the Figma asset sheets (node 2437:1432) in public/hiw-story, drawn as
 * CSS sprites and served through the Next image optimiser.
 */

const PMAX = 9.5; // the last scene's action ends half-way through it
// How much scrolling (in screens) each scene takes. The setup (her machine breaks, the bank, the
// others) moves quickly so readers reach the part that is Rang De, the checks and the money,
// before they lose interest. The last entry is the last scene's half, held a little so the ending can land.
const WEIGHTS = [0.75, 0.5, 0.5, 0.55, 0.9, 0.85, 0.85, 0.85, 1.0, 0.6];
const STOPS = WEIGHTS.reduce<number[]>((acc, w) => [...acc, acc[acc.length - 1] + w], [0]);
const TRAVEL = STOPS[10];
const span_ = (i: number) => (i === 9 ? PMAX - 9 : 1); // how much story scene i plays
/** Scroll travelled (in screens) → story progress. */
const toP = (s: number) => {
  if (s >= TRAVEL) return PMAX;
  const i = Math.max(0, STOPS.findIndex((_, j) => j < 10 && s < STOPS[j + 1]));
  return Math.min(PMAX, i + ((s - STOPS[i]) / WEIGHTS[i]) * span_(i));
};
/** Story progress → scroll travelled (in screens). */
const fromP = (p: number) => {
  const i = Math.min(9, Math.floor(p));
  return STOPS[i] + ((p - i) / span_(i)) * WEIGHTS[i];
};
const EASE = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ── Sheets and sprites (also drawn in the FAQ pop-ups, components/faq/FaqScenes.tsx) ──────────────────────────────────────────────────────────────────── */

const SHEETS = {
  rekha: { w: 1774, h: 887, req: 1920 },
  arjun: { w: 1536, h: 1024, req: 1920 },
  officer: { w: 1536, h: 1024, req: 1920 },
  props: { w: 2072, h: 759, req: 2048 },
  coins: { w: 2072, h: 759, req: 2048 },
  fx: { w: 2072, h: 759, req: 2048 },
  bubbles: { w: 2072, h: 759, req: 2048 },
  avatars: { w: 1536, h: 1024, req: 1920 },
  table: { w: 800, h: 578, req: 828 },
  broken: { w: 800, h: 578, req: 828 },
  shop: { w: 800, h: 578, req: 828 },
  sew: { w: 933, h: 827, req: 1080 },
  think: { w: 236, h: 700, req: 384 },
  cheer: { w: 312, h: 700, req: 384 },
  tap: { w: 273, h: 700, req: 384 },
  customer: { w: 1774, h: 887, req: 1920 },
  pay: { w: 642, h: 700, req: 750 },
  piggy: { w: 438, h: 400, req: 640 },
  objects: { w: 3072, h: 2048, req: 2048 },
  effects: { w: 3072, h: 2048, req: 2048 },
  // The FAQ pop-ups' own sheets (components/faq/FaqScenes.tsx), drawn to match these.
  faqPay: { w: 1536, h: 1024, req: 1920 },
  faqKyc: { w: 1536, h: 1024, req: 1920 },
  faqCur: { w: 1536, h: 1024, req: 1920 },
  faqPlat: { w: 1536, h: 1024, req: 1920 },
  arjunFaq: { w: 1774, h: 887, req: 1920 },
  // The second take on the story's own sheets (components/versions/StoryHowItWorks.tsx).
  sofa: { w: 2000, h: 667, req: 2048 },
  newMachine: { w: 2000, h: 667, req: 2048 },
  orders: { w: 2000, h: 667, req: 2048 },
} as const;
type SheetName = keyof typeof SHEETS;

const FILES: Partial<Record<SheetName, string>> = { table: "machine-table", broken: "machine-broken", shop: "shop-machine", sew: "rekha-shop-sew", think: "arjun-think", cheer: "arjun-cheer", tap: "arjun-tap", pay: "customer-pay", piggy: "icon-idle-savings", faqPay: "faq-payments", faqKyc: "faq-kyc", faqCur: "faq-currency", faqPlat: "faq-platform", arjunFaq: "arjun-faq", sofa: "arjun-sofa", newMachine: "rekha-new-machine", orders: "rekha-orders" };
// `line`: the line-art copy of the sheet (public/hiw-story/line), for the line-art version of the story.
const src = (name: SheetName, req: number, line?: boolean) => `/_next/image?url=${encodeURIComponent(`/hiw-story/${line ? "line/" : ""}${FILES[name] ?? name}.png`)}&w=${req}&q=75`;

/** [sheet, x, y, w, h] in the sheet's own pixels. */
export type Spr = readonly [SheetName, number, number, number, number];

export function Sprite({ s, k, style, stretch, line }: { s: Spr; k: number; style?: CSSProperties; stretch?: [number, number]; line?: boolean }) {
  const [name, x, y, w, h] = s;
  const sh = SHEETS[name];
  const kx = stretch ? stretch[0] / w : k;
  const ky = stretch ? stretch[1] / h : k;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bg-no-repeat"
      style={{
        width: w * kx,
        height: h * ky,
        backgroundImage: `url(${src(name, sh.req, line)})`,
        backgroundSize: `${sh.w * kx}px ${sh.h * ky}px`,
        backgroundPosition: `${-x * kx}px ${-y * ky}px`,
        ...style,
      }}
    />
  );
}

export const REKHA_WALK: Spr[] = [55, 350, 640, 905, 1190, 1480].map((x) => ["rekha", x, 30, 240, 388] as const);
export const REKHA = {
  sew: ["rekha", 70, 450, 375, 410],
  sad: ["rekha", 520, 455, 190, 403],
  hopeful: ["rekha", 810, 455, 190, 403],
  proud: ["rekha", 1150, 455, 250, 403],
  wave: ["rekha", 1490, 455, 210, 403],
} satisfies Record<string, Spr>;
const ARJUN_WALK: Spr[] = [40, 270, 510, 765, 995, 1250].map((x) => ["arjun", x, 50, 240, 455] as const);
export const ARJUN_PHONE: Spr = ["arjun", 1275, 540, 190, 425];
// Arjun's GPT poses, each one cropped to the figure and 700 px tall. refH puts them at the same height
// as ARJUN_PHONE (425 of its sheet's 455 px for a full person).
export const ARJUN_POSE_REF = (700 * 455) / 425;
export const ARJUN_THINK: Spr = ["think", 0, 0, 236, 700];
export const ARJUN_CHEER: Spr = ["cheer", 0, 0, 312, 700];
export const ARJUN_TAP: Spr = ["tap", 0, 0, 273, 700];
// What Arjun is thinking about in the opening: savings sitting idle.
export const PIGGY: Spr = ["piggy", 0, 0, 438, 400];
// A customer at Rekha's shop (GPT sheet): a 6-frame walk drawn facing left, then two standing poses,
// holding out her hands (drawn facing right) and hugging the kurta. The walk frames are drawn smaller
// on the sheet than the standing poses, so each kind gets its own reference height.
const CUSTOMER_WALK: Spr[] = [
  [53, 38, 250, 359], [334, 38, 235, 359], [620, 38, 233, 360], [892, 36, 248, 361], [1186, 38, 243, 359], [1485, 41, 256, 357],
].map(([x, y, w, h]) => ["customer", x, y, w, h] as const);
const CUSTOMER_RECEIVE: Spr = ["customer", 529, 429, 339, 430];
const CUSTOMER_HUG: Spr = ["customer", 978, 429, 250, 427];
// Her own image: paying, notes held out in her right hand (drawn facing right), 700 px a full figure.
const CUSTOMER_PAY: Spr = ["pay", 0, 0, 642, 700];
export const OFFICER_WALK: Spr[] = [55, 290, 540, 780, 1030, 1280].map((x) => ["officer", x, 70, 230, 430] as const);
export const OFFICER = {
  write: ["officer", 215, 515, 250, 460],
  thumbs: ["officer", 1085, 515, 260, 460],
} satisfies Record<string, Spr>;

// Rekha's sewing table at home (Figma node 2456:2284), cropped to the same table she sits at in
// REKHA.sew, so it stays put when she gets up instead of swapping for another drawing.
const HOME_TABLE: Spr = ["table", 0, 0, 800, 578];
// The broken machine and the shop's new one (GPT) are fitted onto the same frame as HOME_TABLE, so
// the home one swaps in under the snap and smoke without the table moving.
const HOME_BROKEN: Spr = ["broken", 0, 0, 800, 578];
const SHOP_MACHINE: Spr = ["shop", 0, 0, 800, 578];
// Rekha at work in her shop (GPT), fitted so its table lands on SHOP_MACHINE's; its frame is taller
// (her head) and reaches further left (her dupatta), so it is drawn 11 units left of the machine.
export const SHOP_SEW: Spr = ["sew", 0, 0, 933, 827];
// From the props and effects sheets (Figma 2470:2288), exported at 2×.
export const GIFT_MACHINE: Spr = ["objects", 929, 69, 661, 630]; // the new machine, a red bow on it
export const STAMP: Spr = ["effects", 1582, 69, 522, 461]; // the stamp coming down, with its ink splash
export const CHECK: Spr = ["effects", 2235, 207, 223, 223];
export const BELL: Spr = ["effects", 2534, 791, 446, 400];
export const CALENDAR: Spr = ["effects", 2434, 1482, 553, 492];
export const SPARKLE: Spr = ["effects", 1083, 92, 400, 438];
export const COIN_FLY: Spr[] = [
  ["effects", 100, 875, 476, 254],
  ["effects", 683, 868, 438, 284],
];
export const REKHA_FACE: Spr = ["rekha", 840, 462, 135, 135];
export const FX = {
  snap: ["fx", 41, 249, 208, 202],
  smoke: ["fx", 316, 238, 228, 254],
  cross: ["fx", 611, 269, 182, 176],
  tick: ["fx", 860, 249, 207, 207],
  stamp: ["fx", 1129, 228, 254, 238],
  thought: ["fx", 1450, 221, 280, 276],
  confetti: ["fx", 1782, 236, 249, 256],
} satisfies Record<string, Spr>;
export const BUBBLES: Spr[] = [
  ["bubbles", 52, 62, 606, 596],
  ["bubbles", 710, 54, 642, 619],
  ["bubbles", 1393, 62, 622, 601],
];
export const AVATARS: Spr[] = [
  ["avatars", 90, 70, 400, 420],
  ["avatars", 570, 50, 400, 440],
  ["avatars", 1045, 45, 400, 445],
  ["avatars", 90, 520, 405, 445],
  ["avatars", 605, 520, 350, 445],
  ["avatars", 1035, 550, 410, 415],
];

/* ── Depth ─────────────────────────────────────────────────────────────────────────────────── */

// One fixed order for everything on the stage, back to front. The drawn world layers sit under
// all of it; the foreground bushes are the nearest thing to the camera, so they pass in front of
// the props and people, under only the captions and cards.
const Z = { props: 10, shadow: 14, back: 18, char: 20, fx: 24, plants: 30, veil: 40, coinsInWorld: 42, caption: 45, ui: 50, coins: 60, cta: 80 };

/* ── The two worlds ──────────────────────────────────────────────────────────────────────── */

// World units match the drawings in storyWorlds.tsx. `top`/`bottom` is the slice of the world a
// band shows; `ground` is where feet go. Each world has its own scale (the village is drawn smaller
// than the flat), so each gets its own character height.
const REKHA_WORLD = { minW: 480, w: 2100, top: 200, bottom: 560, ground: 521, person: 140, bg: VILLAGE_BG };
const ARJUN_WORLD = { minW: 640, w: 2100, top: 130, bottom: 590, ground: 566, person: 250, bg: FLAT_BG };

// A drawn layer. `speed` below 1 lags the camera (further away); `align` is the camera position at
// which the layer sits exactly where it was drawn.
type Layer = { key: string; speed: number; align: number; node: ReactNode };

/* ── The story, scene by scene ───────────────────────────────────────────────────────────── */

// Value k holds for the first half of scene k, then eases to value k+1.
// At the shop the camera frames it left of centre, leaving the top-right clear for the caption.
const CAM_R = [200, 200, 680, 680, 1110, 1110, 1110, 1960, 1960, 1960, 1960];
// Arjun stays put while he is on his phone (scenes 5–6), then walks to the balcony.
const CAM_A = [450, 450, 450, 450, 450, 450, 450, 1250, 1830, 1830, 1830];
// On phones the repayment card and the closing phone take the right of Arjun's world, so at the
// balcony the camera looks a little further right and Arjun stands in the left third, clear of them.
const CAM_A_PHONE = [...CAM_A.slice(0, 8), 1985, 1985, 1985];
const REK_X = [176, 280, 540, 540, 1010, 1010, 1010, 1782, 1782, 1782, 1782];
const REK_POSE: (keyof typeof REKHA)[] = ["sad", "sad", "sad", "sad", "hopeful", "hopeful", "hopeful", "proud", "proud", "wave", "wave"];
// The field partner waits under the neem tree, and Rekha walks up to stand on her right, a step in
// front of her: Rekha is the one the scene is about.
const OFF_X = [950, 950, 950, 950, 950, 950, 950, 950, 950, 950, 950];
const OFF_V = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const OFF_POSE: (keyof typeof OFFICER)[] = ["write", "write", "write", "write", "write", "thumbs", "thumbs", "thumbs", "thumbs", "thumbs", "thumbs"];
const ARJ_X = [600, 600, 600, 600, 600, 600, 600, 1060, 1810, 1810, 1810];
// The world the scene is about gets most of the height; the other one is also dimmed (VEIL_*).
const SEAM = [0.5, 0.64, 0.64, 0.64, 0.64, 0.38, 0.38, 0.62, 0.38, 0.42, 0.42];
const VEIL_R = [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1];
const VEIL_A = [0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0];

// The four steps of the model, shown as a rail across the top: which scenes each one covers.
// `label` on wide screens, `mid` from tablets up, `short` on phones. `from` is the scene a step
// starts at; clicking a step jumps the story there.
const STEPS = [
  { label: "Needs a loan", mid: "Needs a loan", short: "Loan", from: 0 },
  { label: "Verified on the ground", mid: "Verified", short: "Verified", from: 4 },
  { label: "Funded by people", mid: "Funded", short: "Funded", from: 5 },
  { label: "Repaid monthly", mid: "Repaid", short: "Repaid", from: 8 },
];

// Who else Rekha could ask (scene 3), and why each one falls through.
const ASKED = [
  { who: "Moneylender", why: "steep interest" },
  { who: "Family", why: "no savings" },
  { who: "Women's group", why: "too small" },
];

// `right`: on laptops the caption sits top-right instead, to keep clear of the shop sign.
// The numbers behind a scene: the same sourced stats the Why Rang De section uses (NABARD's survey,
// and Rang De's own platform numbers from lib/stats). `phrase` is the part of the caption that gets
// the dotted underline; hovering or tapping it opens the stat and its source.
export type Info = { phrase: string; stat: string; source: string };
const NABARD = "Source: NABARD Rural Economic Conditions & Sentiments Survey, July 2026, as reported by Rural Voice on 23 Jul 2026.";
const PLATFORM = "Source: Rang De platform data (rangde.in/stats), as of 14 Oct 2026.";
const INFO: Record<number, Info> = {
  2: { phrase: "The bank says no", stat: "Nearly half of rural households borrow from informal sources.", source: `${NABARD} 23.6% borrow only informally, 25.3% from both.` },
  3: { phrase: "charge too much", stat: "Informal loans average almost 18% interest.", source: `${NABARD} Average rate on informal loans: 17.77%.` },
  5: { phrase: "goes live on Rang De", stat: `${roundedPlus(LIVE.entrepreneurs)} entrepreneurs backed on Rang De, across ${LIVE.states} states.`, source: PLATFORM },
  6: { phrase: "Others chip in", stat: `${roundedPlus(LIVE.investors)} people lend on Rang De, ${roundedPlus(LIVE.investorsAbroad)} of them from abroad.`, source: PLATFORM },
  7: { phrase: "The money reaches Rekha", stat: `₹${LIVE.disbursedCr.toLocaleString("en-IN")} crore lent to entrepreneurs so far.`, source: PLATFORM },
  8: { phrase: "she repays", stat: `${LIVE.principalRepaidPct}% of the money lent has been repaid.`, source: `${PLATFORM} Principal repaid = 100% minus principal written off.` },
};

const CAPTIONS: { scene: number; band: "R" | "A"; text: string; right?: boolean }[] = [
  { scene: 0, band: "R", text: "Meet Rekha. She stitches clothes at home, in a village in Rajasthan." },
  { scene: 0, band: "A", text: "And Arjun, in Bengaluru, wondering what to do with his savings." },
  { scene: 1, band: "R", text: "Her sewing machine breaks, and with it, her income." },
  { scene: 2, band: "R", text: "The bank says no: no credit history, no land to pledge." },
  { scene: 3, band: "R", text: "Moneylenders charge too much. Family and friends can't help." },
  { scene: 4, band: "R", text: "A Rang De field partner meets her, checks her business and vouches for her." },
  { scene: 5, band: "A", text: "Her loan goes live on Rang De, for people like Arjun to see." },
  { scene: 6, band: "A", text: "Arjun lends ₹5,000. Others chip in until the loan is full." },
  { scene: 7, band: "R", text: "The money reaches Rekha. She gets a working machine and opens her own shop.", right: true },
  { scene: 8, band: "A", text: "Every month she repays, and Arjun's money comes back with interest." },
  { scene: 9, band: "A", text: "Arjun can lend it again, to the next Rekha." },
];

function useStory(p: number) {
  const k = Math.min(Math.floor(p), 9);
  const f = p - k;
  const kf = (arr: number[]) => (f < 0.5 ? arr[k] : lerp(arr[k], arr[k + 1], EASE((f - 0.5) / 0.5)));
  /** The action of scene `s`: 0 until it starts, 1 once its first half is over. */
  const act = (s: number) => clamp01((p - s) / 0.5);
  /** Shown from `a` to `b` (in scenes), fading at both ends. */
  const span = (a: number, b: number, fade = 0.15) => Math.min(clamp01((p - a) / fade), clamp01((b - p) / fade));
  return { k, f, kf, act, span };
}

/* ── Rendering ───────────────────────────────────────────────────────────────────────────── */

type World = typeof REKHA_WORLD;
type View = World & { u: number };

/** How a band frames its world: fit the slice from `top` to `bottom` to the band's height, but
 * never show less than `minW` across (narrow phone bands zoom out), keeping the ground at the
 * same height in the band. */
function frame(world: World, h: number, w: number): View {
  // On the first frames, before the stage is measured, a band can be 0 px tall or less: keep the
  // scale positive so the drawn layers never get a negative size.
  const fit = Math.max(1, h) / (world.bottom - world.top);
  const u = Math.max(0.01, Math.min(fit, Math.max(1, w) / world.minW));
  return { ...world, u, top: world.ground - ((world.ground - world.top) * fit) / u };
}

/** The arch the lower world rises into the upper one with: `d` deep at the sides, flush at the centre. */
const arch = (w: number, d: number) => `M0 ${d} Q${w / 2} ${-d} ${w} ${d}`;

function Band({ world, layers, cam, h, w, fore, children, style, veil = 0 }: { world: View; layers: Layer[]; cam: number; h: number; w: number; fore: ReactNode; children: ReactNode; style?: CSSProperties; veil?: number }) {
  const u = world.u;
  const draw = (l: Layer, z?: number) => {
    const shift = cam * l.speed + (1 - l.speed) * l.align;
    return (
      <svg
        key={l.key}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 overflow-visible"
        width={world.w * u}
        height={760 * u}
        viewBox={`0 0 ${world.w} 760`}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: `translate3d(${w / 2 - shift * u}px, ${-world.top * u}px, 0)`, zIndex: z }}
      >
        {l.node}
      </svg>
    );
  };
  return (
    // `isolate`: each world keeps its own depth order, so the lower one can sit over the upper one's edge.
    <div className="absolute inset-x-0 isolate overflow-hidden" style={{ height: h, background: world.bg, ...style }}>
      {layers.map((l) => draw(l))}
      {children}
      {/* Foreground plants: closest to the camera, so they pass fastest and sit in front of everything
          in the world. */}
      {draw({ key: "fore", speed: 1.3, align: 0, node: fore }, Z.plants)}
      {/* When the scene is about the other world, this one steps back behind a pale veil. */}
      {veil > 0.01 && <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: world.bg, opacity: veil * 0.62, zIndex: Z.veil }} />}
    </div>
  );
}

/** A character or prop standing on the band's ground: centred on world x, feet on the ground. */
function OnGround({ world, cam, h, w, x, s, refH, flip, opacity = 1, z = Z.props, lift = 0, shadow }: { world: View; cam: number; h: number; w: number; x: number; s: Spr; refH: number; flip?: boolean; opacity?: number; z?: number; lift?: number; shadow?: boolean }) {
  const u = world.u;
  const k = (world.person * u) / refH;
  const sw = s[3] * k;
  const sh = s[4] * k;
  if (opacity <= 0.01) return null;
  const left = (x - cam) * u + w / 2 - sw / 2;
  const feet = (world.ground - world.top - lift) * u;
  return (
    <>
      {/* A soft contact shadow, so people stand on the ground instead of floating over the line art. */}
      {shadow && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-[50%] bg-ink/12 blur-[2px]"
          style={{ left: left + sw * 0.2, top: feet - 4 * u, width: sw * 0.6, height: 8 * u, opacity, zIndex: Z.shadow }}
        />
      )}
      <Sprite s={s} k={k} style={{ left, top: feet - sh, opacity, zIndex: z, transform: flip ? "scaleX(-1)" : undefined }} />
    </>
  );
}

/** A scene's line, on its own card in the band's top-left corner: clear of the line art behind it,
 * and clear of the loan and repayment cards, which sit on the right. */
/** Words in a caption that open the stat behind them: a dotted underline and a small black overlay,
 * the same look and behaviour as Why Rang De's SourceTip (hover or keyboard focus opens it; on touch a
 * tap opens it and tapping anywhere else closes it). The overlay is drawn at page level, so the phone
 * and cards on the stage can't cover it; it closes when the page scrolls on. */
export function StatTip({ info }: { info: Info }) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const w = 260;
    // Below the whole caption card, so it never covers the rest of the line.
    const card = ref.current?.closest("p")?.getBoundingClientRect();
    setAt({ x: Math.min(window.innerWidth - w - 12, Math.max(12, r.left + r.width / 2 - w / 2)), y: (card?.bottom ?? r.bottom) + 8 });
  };
  useEffect(() => {
    if (!at) return;
    const close = (e: Event) => {
      if (e.type === "scroll" || !ref.current?.contains(e.target as Node)) setAt(null);
    };
    document.addEventListener("pointerdown", close);
    window.addEventListener("scroll", close, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("scroll", close);
    };
  }, [at]);
  return (
    <>
      {/* A span, not a button: a button's text never wraps, so a long phrase moved to a line of its own and left the
          words before it ("Like") stranded on theirs. It still behaves as the button it was. */}
      <span
        ref={ref}
        role="button"
        // The caption is hidden from screen readers (the hidden story list reads every line with its
        // stat), so this stays out of the tab order too.
        tabIndex={-1}
        aria-describedby={at ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={() => setAt(null)}
        onClick={show}
        onFocus={show}
        onBlur={() => setAt(null)}
        className="pointer-events-auto cursor-help text-left font-bold text-ink underline decoration-ink/40 decoration-dotted decoration-2 underline-offset-[4px]"
      >
        {info.phrase}
      </span>
      {at &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            className="pointer-events-none fixed z-[1000] w-[260px] rounded-[8px] bg-[#1d1f24] px-3 py-2 text-left font-display text-white shadow-[0_6px_20px_rgba(0,0,0,0.18)]"
            style={{ left: at.x, top: at.y }}
          >
            {info.stat && <span className="mb-1 block text-[13px] font-bold leading-[18px]">{info.stat}</span>}
            <span className="block text-[12px] font-medium leading-[17px] text-white/72">{info.source}</span>
          </span>,
          document.body,
        )}
    </>
  );
}

function Caption({ text, opacity, drop = 0, right, info }: { text: string; opacity: number; drop?: number; right?: boolean; info?: Info }) {
  if (opacity <= 0.01) return null;
  const cut = info ? text.indexOf(info.phrase) : -1;
  return (
    <p
      aria-hidden
      className={`absolute left-3 right-3 top-3 rounded-[12px] bg-white/92 px-3 py-2 text-left font-display text-[16px] font-bold leading-[24px] text-ink shadow-[0_4px_16px_rgba(41,45,54,0.08)] backdrop-blur-sm ${right ? "sm:left-auto sm:right-6" : "sm:left-6 sm:right-auto"} sm:top-5 sm:max-w-[400px] sm:px-4 sm:py-3 sm:text-[20px] sm:leading-[28px]`}
      style={{ opacity, zIndex: Z.caption, marginTop: drop, transform: `translateY(${(1 - opacity) * 8}px)` }}
    >
      {info && cut >= 0 ? (
        <>
          {text.slice(0, cut)}
          <StatTip info={info} />
          {text.slice(cut + info.phrase.length)}
        </>
      ) : (
        text
      )}
    </p>
  );
}

/** Each band's captions, timed so one is fully gone before the next arrives. */
function captionsFor(band: "R" | "A", span: (a: number, b: number, fade?: number) => number) {
  const list = CAPTIONS.filter((c) => c.band === band);
  return list.map((c, i) => {
    const next = list[i + 1]?.scene ?? 99;
    // In the opening, Arjun's line waits until Rekha's has been read.
    const start = c.scene === 0 ? (band === "A" ? 0.3 : -1) : c.scene - 0.1;
    const end = i === list.length - 1 ? (band === "R" ? c.scene + 0.9 : 99) : Math.min(next - 0.12, c.scene + 0.9);
    return { text: c.text, right: c.right, info: INFO[c.scene], opacity: span(start, end, 0.12) };
  });
}

// The five checks every borrower passes before their loan is listed (approach 1's Step 1 funnel).
// On Rekha's loan card they tick off one by one in scene 4. `short` is for phones, where the card
// has to stay narrow enough to leave Rekha and the field partner in view.
const CHECKS = [
  { label: "Community identification", short: "Community identified" },
  { label: "Business assessment", short: "Business assessed" },
  { label: "Credit evaluation", short: "Credit evaluated" },
  { label: "Identity verification", short: "Identity verified" },
  { label: "Profile review & publishing", short: "Reviewed & published" },
];

function Card({ children, style, wide }: { children: ReactNode; style: CSSProperties; wide?: boolean }) {
  return (
    <div className={`absolute z-50 rounded-[12px] bg-white p-3 shadow-[0_8px_24px_rgba(41,45,54,0.14)] sm:p-4 ${wide ? "w-[196px] sm:w-[276px]" : "w-[200px] sm:w-[240px]"}`} style={style}>
      {children}
    </div>
  );
}

/* ── Arjun's phone ───────────────────────────────────────────────────────────────────────── */

// The feed borrows approach 1's Step 2 ("Choose entrepreneurs"): the same people, cards and
// details, scrolled past until it settles on Rekha, then her invest sheet and ₹500 → ₹5,000.
const FEED: { name: string; need: string; av?: number }[] = [
  { name: "Jagdish", need: "A garage for his bike repair shop", av: 2 },
  { name: "Monika", need: "Stock and a better setup for her cosmetics store", av: 3 },
  { name: "Vijay", need: "Furniture and groceries for his store", av: 12 },
  { name: "Chunni Bai", need: "Clothing and jewellery to sell", av: 18 },
  { name: "Rekha", need: "A new sewing machine for her tailoring" },
  { name: "Durga", need: "To start a tent decoration business", av: 15 },
  { name: "Swarna", need: "Thread and dye for her handloom work", av: 1 },
];
const REKHA_ROW = FEED.findIndex((e) => !e.av);
const AMOUNTS = ["₹500", "₹2,000", "₹5,000"];
const GOAL = 25000;
// Arjun's share and what comes back: ₹5,000 at 8.25% p.a. (the rate on her invest sheet) over 12
// months is an EMI of ₹436, so ₹5,232 back in all.
const LENT = 5000;
const EMI = 436;

function Face({ e, size }: { e: (typeof FEED)[number]; size: number }) {
  return (
    <span className="relative shrink-0 overflow-hidden rounded-full bg-[#A8D8F0]" style={{ width: size, height: size }}>
      {e.av ? (
        <Image src={`/how-it-works/s1-av${e.av}.webp`} alt="" width={size} height={size} loading="eager" className="size-full object-cover" />
      ) : (
        <Sprite s={REKHA_FACE} k={size / REKHA_FACE[3]} style={{ left: 0, top: 0 }} />
      )}
    </span>
  );
}

function PhoneFeed({ p, mobile, style }: { p: number; mobile: boolean; style: { left: number; top: number; width: number; height: number } }) {
  const o = Math.min(clamp01((p - 4.95) / 0.15), clamp01((7.05 - p) / 0.15));
  if (o <= 0.01) return null;
  const rowH = mobile ? 58 : 62;
  const gap = 6;
  const scroll = EASE(clamp01((p - 5.1) / 0.4)); // past the others, settling on Rekha
  const picked = clamp01((p - 5.45) / 0.08);
  const sheet = EASE(clamp01((p - 5.55) / 0.25)); // her invest sheet slides up
  const chosen = p < 6.05 ? -1 : p < 6.13 ? 0 : p < 6.21 ? 1 : 2;
  const pressed = p >= 6.28;
  const fill = EASE(clamp01((p - 6.34) / 0.3)); // others chip in until it is full
  const raised = pressed ? 15000 + 10000 * fill : 10000;
  const full = fill >= 0.99;
  const rekha = FEED[REKHA_ROW];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute rounded-[22px] bg-ink p-[6px] shadow-[0_12px_32px_rgba(41,45,54,0.22)]"
      style={{ ...style, opacity: o, zIndex: Z.ui, transform: `scale(${0.85 + 0.15 * o})`, transformOrigin: "left bottom" }}
    >
      <div className="relative size-full overflow-hidden rounded-[16px] bg-[#F4F6F9]">
        <p className="relative z-10 bg-white px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[1px] text-ink/56 shadow-[0_1px_0_rgba(41,45,54,0.08)]">Businesses in need</p>

        {/* The feed */}
        <div className="absolute inset-x-2 top-[36px] flex flex-col" style={{ gap, transform: `translateY(${-scroll * REKHA_ROW * (rowH + gap)}px)` }}>
          {FEED.map((e, i) => {
            const me = i === REKHA_ROW;
            return (
              <div
                key={e.name}
                className="flex shrink-0 items-center gap-2 rounded-[8px] border-[1.5px] bg-white p-2"
                style={{
                  height: rowH,
                  borderColor: me && picked > 0 ? "var(--color-green-dark)" : "rgba(41,45,54,0.16)",
                  transform: me ? `scale(${1 + 0.03 * picked})` : undefined,
                  opacity: !me && picked > 0 ? 1 - 0.4 * picked : 1,
                }}
              >
                <Face e={e} size={rowH - 20} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[12px] font-bold leading-[16px] text-ink">
                    {e.name}
                    {me && <span className="ml-1 rounded-full bg-green-dark px-1.5 py-px align-middle text-[8px] uppercase tracking-[0.5px] text-white">New</span>}
                  </p>
                  <p className="line-clamp-2 font-display text-[10px] leading-[13px] text-ink/64">{e.need}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rekha's invest sheet */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 rounded-t-[14px] bg-white p-3 shadow-[0_-8px_24px_rgba(41,45,54,0.14)]"
          style={{ transform: `translateY(${(1 - sheet) * 105}%)` }}
        >
          <div className="flex items-center gap-2">
            <Face e={rekha} size={mobile ? 30 : 36} />
            <div className="min-w-0">
              <p className="font-display text-[13px] font-bold leading-[17px] text-ink">Rekha · Tailor</p>
              <p className="font-display text-[10px] leading-[13px] text-ink/64">Rajasthan · a new sewing machine</p>
            </div>
          </div>
          {!mobile && (
            <div className="grid grid-cols-3 gap-1 rounded-[8px] bg-[rgba(140,162,30,0.08)] p-2 text-center font-display">
              {[["8.25%", "p.a."], ["12 mo", "tenure"], ["Good", "credit"]].map(([v, l]) => (
                <div key={l}>
                  <p className="text-[11px] font-bold leading-[14px] text-ink">{v}</p>
                  <p className="text-[9px] leading-[12px] text-ink/56">{l}</p>
                </div>
              ))}
            </div>
          )}
          <div>
            <div className="flex items-center justify-between font-display text-[11px] font-bold text-ink/72">
              <span>₹{(Math.round(raised / 500) * 500).toLocaleString("en-IN")} of ₹{GOAL.toLocaleString("en-IN")}</span>
              <span className="flex">
                {AVATARS.slice(0, 5).map((a, i) => {
                  const t = clamp01((p - 6.36 - i * 0.05) / 0.06);
                  return (
                    <span key={i} className="relative -ml-1 size-[16px] overflow-hidden rounded-full border border-white bg-[#DCE7F5]" style={{ opacity: t, transform: `scale(${0.5 + 0.5 * t})` }}>
                      <Sprite s={a} k={18 / a[3]} style={{ left: -1, top: 0 }} />
                    </span>
                  );
                })}
              </span>
            </div>
            <div className="mt-1 h-[6px] overflow-hidden rounded-full bg-ink/8">
              <div className="h-full rounded-full bg-green-dark" style={{ width: `${(raised / GOAL) * 100}%` }} />
            </div>
          </div>
          <div className="flex gap-1">
            {AMOUNTS.map((a, i) => (
              <span key={a} className={`flex-1 rounded-full py-1 text-center font-display text-[11px] font-bold ${i === chosen ? "bg-ink text-white" : "bg-ink/8 text-ink"}`}>
                {a}
              </span>
            ))}
          </div>
          <span
            className={`rounded-[6px] py-2 text-center font-display text-[13px] font-bold text-white ${pressed ? "bg-green-dark" : "bg-primary"}`}
            style={{ transform: p >= 6.26 && p < 6.32 ? "scale(0.95)" : undefined }}
          >
            {full ? "Fully funded ✓" : pressed ? "You backed Rekha ✓" : `Lend ${chosen >= 0 ? AMOUNTS[chosen] : ""}`}
          </span>
        </div>
      </div>
    </div>
  );
}

/** The story's last frame (scene 9): Arjun's phone again, the feed scrolled so Rekha sits second,
 * marked repaid, and the next person (Durga) is the new one on top. Its button is the real way in. */
function NextOnPhone({ p, style }: { p: number; style: { left: number; top: number; width: number; height: number } }) {
  const o = clamp01((p - 9.05) / 0.2);
  if (o <= 0.01) return null;
  const rows = [FEED[REKHA_ROW + 1], FEED[REKHA_ROW], FEED[REKHA_ROW + 2]];
  return (
    <div
      className="absolute rounded-[22px] bg-ink p-[6px] shadow-[0_12px_32px_rgba(41,45,54,0.22)]"
      style={{ ...style, opacity: o, zIndex: Z.cta, transform: `scale(${0.9 + 0.1 * o})`, transformOrigin: "left bottom" }}
    >
      <div className="relative flex size-full flex-col overflow-hidden rounded-[16px] bg-[#F4F6F9]">
        <p aria-hidden className="bg-white px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[1px] text-ink/56 shadow-[0_1px_0_rgba(41,45,54,0.08)]">Businesses in need</p>
        <div aria-hidden className="flex flex-1 flex-col gap-1.5 overflow-hidden p-2">
          {rows.map((e, i) => {
            const isNew = i === 0;
            const repaid = e === FEED[REKHA_ROW];
            return (
              <div
                key={e.name}
                className="flex shrink-0 items-center gap-2 rounded-[8px] border-[1.5px] bg-white p-2"
                style={{ height: 58, borderColor: isNew ? "var(--color-green-dark)" : "rgba(41,45,54,0.16)", opacity: repaid ? 0.85 : 1 }}
              >
                <Face e={e} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[12px] font-bold leading-[16px] text-ink">
                    {e.name}
                    {isNew && <span className="ml-1 rounded-full bg-green-dark px-1.5 py-px align-middle text-[8px] uppercase tracking-[0.5px] text-white">New</span>}
                    {repaid && <span className="ml-1 rounded-full bg-green-dark/12 px-1.5 py-px align-middle text-[8px] uppercase tracking-[0.5px] text-green-dark">Repaid ✓</span>}
                  </p>
                  <p className="line-clamp-2 font-display text-[10px] leading-[13px] text-ink/64">{e.need}</p>
                </div>
              </div>
            );
          })}
        </div>
        <a
          href="#opportunities"
          className="m-2 rounded-[8px] bg-primary py-3 text-center font-display text-[14px] font-bold text-white shadow-[0_0_0_4px_rgba(56,152,212,0.22)] hover:brightness-95"
        >
          Meet businesses in need
        </a>
      </div>
    </div>
  );
}

/** The bank's shutter runs on real time, not on scroll: once the story reaches the bank's "no" it
 * drops under its own weight, bounces twice on the ledge and settles; scrolling back rolls it up
 * again by hand, steady and slowing at the top. */
function useShutter(down: boolean): Shutter {
  const [state, setState] = useState<Shutter>({ pos: down ? 1 : 0, dust: -1, shake: 0 });
  const sim = useRef({ pos: down ? 1 : 0, v: 0, hit: -1 });
  useEffect(() => {
    const s = sim.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      s.pos = down ? 1 : 0;
      s.v = 0;
      setState({ pos: s.pos, dust: -1, shake: 0 });
      return;
    }
    const G = 7; // openings per second², so the drop takes about half a second
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (down) {
        s.v += G * dt;
        s.pos += s.v * dt;
        if (s.pos >= 1) {
          s.pos = 1;
          if (s.v > 0.5) {
            if (s.hit < 0) s.hit = now;
            s.v = -s.v * 0.28;
          } else s.v = 0;
        }
      } else {
        s.v = 0;
        s.pos = Math.max(0, s.pos - dt * 1.4 * (0.25 + s.pos));
        if (s.pos === 0) s.hit = -1;
      }
      const since = s.hit < 0 ? Infinity : now - s.hit;
      const dust = since < 650 ? since / 650 : -1;
      const shake = since < 180 ? Math.sin(since / 14) * 0.9 * (1 - since / 180) : 0;
      setState({ pos: s.pos, dust, shake });
      const settled = down ? s.pos === 1 && s.v === 0 && dust < 0 : s.pos === 0;
      if (!settled) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [down]);
  return state;
}

/**
 * The end of the step row: "Scroll ↓" until the reader starts, then a "Skip story" button. Both
 * stay mounted in one slot whose width eases between theirs, so the pills beside it slide over
 * as the button grows instead of jumping, while one label fades out and the other fades in.
 */
function ScrollOrSkip({ skip, hint, label, onSkip }: { skip: boolean; hint: number; label: string; onSkip: () => void }) {
  const scrollRef = useRef<HTMLParagraphElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const [w, setW] = useState<{ scroll: number; skip: number } | null>(null);
  useEffect(() => {
    const a = scrollRef.current;
    const b = skipRef.current;
    if (!a || !b) return;
    const measure = () => setW({ scroll: a.offsetWidth, skip: b.offsetWidth });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(a);
    ro.observe(b);
    return () => ro.disconnect();
  }, []);
  const ease = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";
  return (
    <div
      // Both labels are pinned to the slot's right edge, so neither can spill past the screen while the
      // slot is narrower than the button.
      className={`relative shrink-0 self-stretch transition-[width] motion-reduce:transition-none ${ease}`}
      style={w ? { width: skip ? w.skip : w.scroll } : undefined}
    >
      <p
        ref={scrollRef}
        aria-hidden={skip}
        className={`absolute right-0 top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[11px] font-bold text-ink/56 transition-opacity sm:text-p4 ${ease}`}
        style={{ opacity: skip ? 0 : hint }}
      >
        Scroll ↓
      </p>
      <button
        ref={skipRef}
        type="button"
        onClick={onSkip}
        tabIndex={skip ? 0 : -1}
        aria-hidden={!skip}
        className={`absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap rounded-full bg-white px-3 py-1.5 font-display text-[11px] font-bold text-primary shadow-[0_1px_4px_rgba(41,45,54,0.08)] transition-[opacity,transform,background-color,color] hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-p4 ${ease} ${skip ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        {label}
      </button>
    </div>
  );
}

export function CharacterHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  // Whether the worlds' art may load yet (see below).
  const [near, setNear] = useState(false);
  // `clear`: how far down the stage stays visible above the floating "Invest now" button. On
  // some phone browsers the screen is taller than the stage's 100svh, and the button (pinned to
  // the screen's bottom) can sit over the stage, so it is measured rather than assumed.
  const [size, setSize] = useState({ w: 1200, h: 700, clear: 700 });
  const mobile = size.w < 768;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-bottom")) || 0;
      const screenH = window.visualViewport?.height ?? window.innerHeight;
      setSize({ w: stage.clientWidth, h: stage.clientHeight, clear: Math.min(stage.clientHeight, screenH - nav - 84) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, []);

  // The story sits right under the hero, so "near the screen" would be true straight away. Its art
  // waits for the page's own load (hero images, fonts, scripts) and then a quiet moment, unless the
  // reader scrolls to it first.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let idle = 0;
    const go = () => setNear(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && go(), { rootMargin: "25% 0px" });
    io.observe(section);
    const onLoad = () => {
      idle = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(go, { timeout: 1500 }) : window.setTimeout(go, 500);
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      io.disconnect();
      window.removeEventListener("load", onLoad);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
    };
  }, []);

  // The characters and props are CSS background sprites, which a browser only fetches and decodes
  // when one first appears, mid-scroll, and that shows as a hitch. Once the story's art may load,
  // fetch and decode every story sheet in the background so each scene is ready before it's reached.
  useEffect(() => {
    if (!near) return;
    const urls = (Object.keys(SHEETS) as SheetName[])
      .filter((n) => !n.startsWith("faq") && !["arjunFaq", "sofa", "newMachine", "orders"].includes(n))
      .map((n) => src(n, SHEETS[n].req));
    // The bank's shutter only mounts when it rolls down (scene 2), so it isn't fetched with the rest.
    urls.push("/hiw-story/bank-shutter.webp");
    let cancelled = false;
    (async () => {
      for (const url of urls) {
        if (cancelled) return;
        const img = new window.Image();
        img.src = url;
        await img.decode().catch(() => {});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [near]);

  // On every screen size the page's vertical scroll through the tall section drives the story:
  // the stage stays pinned under the navbar while the reader scrolls.
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-bottom")) || 0;
      const travel = section.offsetHeight - (window.innerHeight - nav);
      setP(toP(clamp01((nav - rect.top) / Math.max(1, travel)) * TRAVEL));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const { k, f, kf, act, span } = useStory(p);
  const shutter = useShutter(p >= 2.1);

  /** Scroll the page so the story stands at scene `scene` (a little past its start). */
  const jumpTo = (scene: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-bottom")) || 0;
    const travel = section.offsetHeight - (window.innerHeight - nav);
    const top = section.getBoundingClientRect().top + window.scrollY - nav;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: top + (travel * fromP(Math.min(PMAX, scene + (scene > 0 ? 0.05 : 0)))) / TRAVEL, behavior: reduce ? "auto" : "smooth" });
  };
  const wide = size.w >= 1280;

  /** Skip the rest of the story: scroll to whatever section comes right after it. */
  const skipStory = () => {
    const section = sectionRef.current;
    if (!section) return;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-bottom")) || 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bottom = section.getBoundingClientRect().bottom + window.scrollY - nav;
    window.scrollTo({ top: bottom, behavior: reduce ? "auto" : "smooth" });
  };

  // Stage layout: two inset bands, Rekha's above Arjun's, the split leaning toward whoever the
  // scene is about.
  const pad = 8;
  const RAIL = mobile ? 46 : 54;
  const top0 = pad;
  // The step pills run along the bottom, under the two worlds. On phones the site's floating
  // "Invest now" button covers the bottom of the screen, so they sit just above it.
  const railGap = mobile ? 72 : pad;
  const bottomGap = railGap + RAIL;
  const inner = size.h - top0 - bottomGap;
  const archD = mobile ? 16 : 26;
  const hR = Math.round(inner * kf(SEAM));
  const hA = inner - hR;
  const bw = size.w - pad * 2;
  const camR = kf(CAM_R);
  // Arjun's phone (scenes 5–6) takes the right of his world on phones: the camera pans so he
  // stands in the space to its left instead of behind it.
  const PW = mobile ? 216 : 232;
  const phoneRight = mobile ? 12 : 40;
  const phoneUp = mobile ? kf([0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]) : 0;
  const camA0 = kf(mobile ? CAM_A_PHONE : CAM_A);
  const vR = frame(REKHA_WORLD, hR, bw);
  const vA = frame(ARJUN_WORLD, hA, bw);
  const leftOfPhone = (size.w - phoneRight - PW - pad) / 2; // the middle of the space left of it
  const camA = lerp(camA0, kf(ARJ_X) + (bw / 2 - leftOfPhone) / vA.u, phoneUp);
  const uR = vR.u;
  const uA = vA.u;
  const toR = (x: number, y: number) => ({ x: pad + (x - camR) * uR + bw / 2, y: top0 + (y - vR.top) * uR });
  const toA = (x: number, y: number) => ({ x: pad + (x - camA) * uA + bw / 2, y: top0 + hR + (y - vA.top) * uA });

  // A walker: moving in the second half of a scene whose next position differs.
  const walker = (xs: number[], walk: Spr[], person: number) => {
    const x = kf(xs);
    const moving = f >= 0.5 && xs[k] !== xs[k + 1];
    const frame = walk[Math.floor(Math.abs(x) / (person * 0.16)) % walk.length];
    return { x, moving, frame, flip: moving && xs[k + 1] < xs[k] };
  };

  // Scene 1: the machine breaks part-way through its action.
  const broke = clamp01((p - 1.15) / 0.12);
  // Scene 8: at her shop, Rekha sits down at the new machine and sews.
  const sewing = clamp01((p - 8.08) / 0.06);
  const rekha = walker(REK_X, REKHA_WALK, REKHA_WORLD.person);
  const officer = walker(OFF_X, OFFICER_WALK, REKHA_WORLD.person);
  const arjun = walker(ARJ_X, ARJUN_WALK, ARJUN_WORLD.person);

  // Arjun's phone, opened up beside him in scenes 5–6: the feed of loans, then Rekha's.
  // On phones the caption takes the top of Arjun's world, so the phone opens below it, and it
  // ends above the floating "Invest now" button.
  const phoneCap = mobile ? archD + 78 : archD;
  const phoneFrom = top0 + hR + phoneCap;
  const phoneTo = Math.min(top0 + hR + hA, mobile ? size.clear : size.h);
  const PH = Math.min(phoneTo - phoneFrom - 16, mobile ? 340 : 430);
  const phoneTop = phoneFrom + (phoneTo - phoneFrom - PH) / 2;
  const phoneLeft = size.w - phoneRight - PW;

  // Scene 4: the loan card is checked off in Rekha's world; scene 5: it flies down into the phone.
  const stamps = act(4);
  const fly = EASE(clamp01((p - 5.02) / 0.3));
  const cardTop = lerp(top0 + (mobile ? 132 : 76), phoneTop + PH * 0.4, fly);

  // The money crossing between the worlds, the heart of the model: once Rekha has reached her shop
  // (scene 7) coins arc from Arjun down to it, and in scene 8 they come back up to him. Both happen
  // while the cameras hold still, so the eye is free to follow them.
  const coinSize = mobile ? 34 : 48;
  const trip = (t: number, from: { x: number; y: number }, to: { x: number; y: number }, key: string, count = 7, gap = 0.07, label?: string) => {
    if (t <= 0 || t >= 1) return null;
    // The two ends sit nearly one above the other, so a straight drop would read as a pile of
    // coins. The path bows out sideways, toward the open middle of the stage, so it reads as a
    // journey from one person to the other. It always bows left: the repayment card holds the right.
    const mx = (from.x + to.x) / 2;
    const side = -1;
    const cx = mx + side * Math.max(90, bw * (mobile ? 0.3 : 0.2));
    const cy = (from.y + to.y) / 2;
    const at = (e: number) => ({
      x: (1 - e) * (1 - e) * from.x + 2 * (1 - e) * e * cx + e * e * to.x,
      y: (1 - e) * (1 - e) * from.y + 2 * (1 - e) * e * cy + e * e * to.y,
    });
    return (
      <div key={key} aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: Z.coinsInWorld }}>
        {Array.from({ length: count }, (_, i) => {
          const q = clamp01((t - i * gap) / 0.5);
          if (q <= 0 || q >= 1) return null;
          const e = EASE(q);
          const pt = at(e);
          // The coin art has speed lines trailing to the left, so turn each coin to face its path.
          const dx = 2 * (1 - e) * (cx - from.x) + 2 * e * (to.x - cx);
          const dy = 2 * (1 - e) * (cy - from.y) + 2 * e * (to.y - cy);
          const art = COIN_FLY[(i + Math.floor(q * 6)) % 2];
          const k = (coinSize * 1.7) / art[3];
          return (
            <Sprite
              key={i}
              s={art}
              k={k}
              style={{ left: pt.x - (art[3] * k) / 2, top: pt.y - (art[4] * k) / 2, transform: `rotate(${Math.atan2(dy, dx)}rad)` }}
            />
          );
        })}
        {/* What is travelling, riding just ahead of the stream. */}
        {label &&
          (() => {
            const lead = at(EASE(clamp01(t / 0.55)));
            const o = Math.min(clamp01(t / 0.08), clamp01((0.95 - t) / 0.12));
            return (
              <p
                className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-green-dark px-3 py-1 font-display text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(41,45,54,0.2)] sm:text-p3"
                style={{ left: lead.x + side * (mobile ? 40 : 64), top: lead.y, opacity: o }}
              >
                {label}
              </p>
            );
          })()}
      </div>
    );
  };
  // The money lands on her counter, beside the machine, not on top of her.
  const shopAt = toR(1990, REKHA_WORLD.ground - 75);
  const arjunHand = toA(arjun.x, ARJUN_WORLD.ground - 170);
  // t runs 0 → 1 over each action; the last coin lands at about 0.92.
  // Scene 8 in order: a customer comes in and pays Rekha (one coin, customer → Rekha), and only then
  // do her monthly repayments start going up to Arjun, one coin a month for the rest of the scene.
  const PAY_T = (p - 8.19) / 0.16;
  const REPAY_T = (p - 8.3) / 0.58;
  const REPAY_GAP = 0.042;
  const customerHand = toR(1972, REKHA_WORLD.ground - 88);
  const rekhaHands = toR(1890, REKHA_WORLD.ground - 78);
  type Flight = { t: number; from: { x: number; y: number }; to: { x: number; y: number }; key: string; count: number; gap: number; label?: string };
  // Every coin flight, in stage coordinates. t runs 0 → 1 over each; a coin lands half a unit after it leaves.
  const flights = [
    p < 7.65 && { t: (p - 7.0) / 0.5, from: arjunHand, to: shopAt, key: "down", count: 7, gap: 0.07, label: `₹${GOAL.toLocaleString("en-IN")} loan → Rekha` },
    p < 8.4 && { t: PAY_T, from: customerHand, to: rekhaHands, key: "pay", count: 1, gap: 0 },
    p < 8.9 && { t: REPAY_T, from: shopAt, to: arjunHand, key: "up", count: 12, gap: REPAY_GAP },
  ].filter((x): x is Flight => !!x);
  /** The coins as one world draws them: each band renders every flight in its own coordinates and
   * clips it to itself, so a coin crossing the arch is drawn by both and reads as one. */
  const coinsIn = (ox: number, oy: number) =>
    flights.map((fl) => trip(fl.t, { x: fl.from.x - ox, y: fl.from.y - oy }, { x: fl.to.x - ox, y: fl.to.y - oy }, fl.key, fl.count, fl.gap, fl.label));
  // How many monthly repayments have reached Arjun: a coin lands half a unit after it leaves.
  const months = p >= 9 ? 12 : REPAY_T < 0.5 ? 0 : Math.min(12, Math.floor((REPAY_T - 0.5) / REPAY_GAP) + 1);
  const sinceLanding = months > 0 && months < 12 ? REPAY_T - (0.5 + (months - 1) * REPAY_GAP) : 1;
  // Rekha's shop fills with finished work: a first kurta once it opens, then one every few months.
  const garments = p < 7.3 ? 0 : Math.min(5, 1 + clamp01((p - 7.3) / 0.2) - 1 + months / 3);
  // Arjun's poses: wondering about his savings (opening), on his phone through the feed and
  // choosing an amount (scenes 5–6: the sheet's own phone pose; the separate tapping drawing,
  // ARJUN_TAP, didn't match the others), a fist pump the moment he lends and again when the last
  // repayment lands.
  const arjunPose: [Spr, number] = arjun.moving
    ? [arjun.frame, 455]
    : p < 1
      ? [ARJUN_THINK, ARJUN_POSE_REF]
      : (p >= 6.28 && p < 6.5) || (months === 12 && p < 9.05)
          ? [ARJUN_CHEER, ARJUN_POSE_REF]
          : [ARJUN_PHONE, 455];

  const bubbleSize = mobile ? 56 : 84;

  return (
    // The heading sits in the same card but outside the scroll-driven section, so it scrolls away
    // before the story pins and the story's progress still starts when the stage reaches the top.
    <div id="how-it-works" className="relative mx-2 overflow-clip rounded-[16px] bg-bg-grey">
    <div className="flex flex-col items-center gap-2 px-4 pb-6 pt-12 text-center sm:px-8 sm:pb-10 sm:pt-16 md:pb-14 lg:pt-[80px]">
      <p className="font-eyebrow text-h5 font-semibold uppercase tracking-[1.44px] text-ink/72">How Rang De works</p>
      <h2 className="font-display text-h3 font-bold text-ink [text-wrap:balance]">From Rekha&rsquo;s loan to your monthly returns</h2>
    </div>
    <section
      ref={sectionRef}
      aria-label="How Rang De works, told as a story"
      className="relative"
      style={{ height: `calc(${TRAVEL + 1} * (100svh - var(--navbar-bottom, 0px)))` }}
    >
      {/* The animation only shows each line while it is on screen, so the story is also here, in order. */}
      <div className="sr-only">
        <ol>
          {CAPTIONS.map((c) => (
            <li key={c.text}>
              {c.text}
              {INFO[c.scene] && ` ${INFO[c.scene].stat} ${INFO[c.scene].source}`}
            </li>
          ))}
        </ol>
        <a href="#opportunities">Meet businesses in need</a>
      </div>
      <div
        ref={stageRef}
        className="sticky w-full overflow-hidden"
        // dvh, not svh: when a phone browser's toolbar slides away mid-scroll the stage grows with the
        // screen, instead of leaving an empty strip under the story.
        style={{ top: "var(--navbar-bottom, 0px)", height: "calc(100dvh - var(--navbar-bottom, 0px))", minHeight: 520 }}
      >
        {/* The two worlds' art (about 1.5MB of sprite sheets and line art) loads after the page itself,
            so it doesn't compete with the hero. */}
        {near && (
        <div className="pointer-events-none absolute overflow-hidden rounded-[12px]" style={{ top: top0, left: pad, right: pad, bottom: bottomGap }}>
          <Band
            veil={kf(VEIL_R)}
            style={{ top: 0 }}
            world={vR}
            cam={camR}
            h={hR + archD}
            w={bw}
            layers={[
              { key: "far", speed: 0.4, align: 1000, node: <VillageFar /> },
              { key: "buildings", speed: 1, align: 0, node: <VillageBuildings shutter={shutter} garments={garments} /> },
              { key: "ground", speed: 1, align: 0, node: <VillageGround /> },
            ]}
            fore={<VillagePlants />}
          >
            {/* Home: her sewing table never moves. Rekha sits at it, then gets up when it breaks. */}
            <OnGround world={vR} cam={camR} h={hR} w={bw} x={176.25} s={HOME_TABLE} refH={848} lift={1.4} opacity={1 - broke} z={Z.props} />
            <OnGround world={vR} cam={camR} h={hR} w={bw} x={176.25} s={HOME_BROKEN} refH={848} lift={1.4} opacity={broke} z={Z.props} />
            <OnGround world={vR} cam={camR} h={hR} w={bw} x={176} s={REKHA.sew} refH={388} opacity={1 - broke} z={Z.props + 1} />
            <OnGround world={vR} cam={camR} h={hR} w={bw} x={150} s={FX.snap} refH={388 * 1.5} lift={95} opacity={span(1.1, 1.6, 0.06)} z={Z.fx} />
            <OnGround world={vR} cam={camR} h={hR} w={bw} x={190} s={FX.smoke} refH={388 * 1.3} lift={100} opacity={span(1.15, 1.8, 0.12) * 0.85} z={Z.fx} />

            {/* The shop: a working machine, once she gets there. */}
            {/* It arrives new, a red bow on it, as the coins land; by the time she repays, the bow is
                off and it is just her working machine. */}
            <OnGround world={vR} cam={camR} h={hR} w={bw} x={1878} s={GIFT_MACHINE} refH={757} opacity={span(7.3, 8.0, 0.12)} z={Z.props} />
            <OnGround world={vR} cam={camR} h={hR} w={bw} x={1878} s={SHOP_MACHINE} refH={848} lift={1.4} opacity={span(7.9, 99, 0.12) * (1 - sewing)} z={Z.props} />
            {/* The coins, as this world draws them. */}
            {coinsIn(pad, top0)}
            {/* Scene 8: a customer walks in from the lane, pays Rekha, hugs her new kurta and leaves.
                She comes first: her payment is what the monthly repayments are made of. */}
            {(() => {
              const IN = [8.0, 8.18], OUT = [8.38, 8.56];
              if (p < IN[0] || p > OUT[1]) return null;
              const far = 2560, stop = 2035;
              const walking = p < IN[1] || p > OUT[0];
              const x = p < IN[1] ? lerp(far, stop, EASE((p - IN[0]) / (IN[1] - IN[0]))) : p > OUT[0] ? lerp(stop, far, EASE((p - OUT[0]) / (OUT[1] - OUT[0]))) : stop;
              const s = walking ? CUSTOMER_WALK[Math.floor(Math.abs(x) / (REKHA_WORLD.person * 0.16)) % CUSTOMER_WALK.length] : p < 8.26 ? CUSTOMER_PAY : p < 8.32 ? CUSTOMER_RECEIVE : CUSTOMER_HUG;
              // Facing left on the way in and while she takes it from Rekha; facing right on the way out.
              const flip = walking ? p > OUT[0] : s === CUSTOMER_RECEIVE || s === CUSTOMER_PAY;
              // The paying arm reaches out past her body, so that image is centred a little off her: shift
              // it so she stands where she does in the other poses.
              const dx = s === CUSTOMER_PAY ? -26 : 0;
              return <OnGround world={vR} cam={camR} h={hR} w={bw} x={x + dx} s={s} refH={walking ? 359 : s === CUSTOMER_PAY ? 700 : 428} flip={flip} z={Z.char} shadow />;
            })()}
            {/* Scene 8: she sits down at it and works through the year of repayments. */}
            <OnGround world={vR} cam={camR} h={hR} w={bw} x={1867} s={SHOP_SEW} refH={848} lift={1.4} opacity={sewing} z={Z.char} shadow />
            <OnGround world={vR} cam={camR} h={hR} w={bw} x={1900} s={SPARKLE} refH={388 * 1.9} lift={70} opacity={span(7.35, 7.8, 0.08)} z={Z.fx} />

            {/* Rekha: on her feet from the moment the machine breaks, always in front. */}
            <OnGround
              world={vR}
              cam={camR}
              h={hR}
              w={bw}
              x={rekha.x}
              s={rekha.moving ? rekha.frame : REKHA[k === 1 && f < 0.5 ? "sad" : REK_POSE[k]]}
              refH={388}
              flip={rekha.flip}
              opacity={broke * (1 - sewing)}
              z={Z.char}
              shadow
            />
            {/* The field partner walks in and stands a step behind her, a little further back. */}
            <OnGround
              world={vR}
              cam={camR}
              h={hR}
              w={bw}
              x={officer.x}
              s={officer.moving ? officer.frame : OFFICER[OFF_POSE[k]]}
              refH={430 * 1.06}
              lift={4}
              flip={officer.moving && !officer.flip}
              opacity={kf(OFF_V)}
              z={Z.back}
              shadow
            />

            {captionsFor("R", span).map((c) => (
              <Caption key={c.text} text={c.text} opacity={c.opacity * (1 - kf(VEIL_R))} right={c.right} info={c.info} />
            ))}

            {/* Scene 3: everyone else she could ask, each crossed out in turn, in a row over the bank she
                can't borrow from (they follow it as the camera moves). */}
            {BUBBLES.map((b, i) => {
              const o = span(3 + i * 0.1, 3.8, 0.1);
              if (o <= 0.01) return null;
              const crossed = clamp01((p - 3.15 - i * 0.1) / 0.08);
              const bank = toR(BANK.x + BANK.w / 2, BANK.y);
              // Keep the whole row inside the band, and its labels (about 44px) clear of the bank's roof:
              // on short laptop screens the bubbles shrink (down to the phone size) to fit above it.
              const roof = bank.y - top0; // the bank's top edge, in band coordinates
              // Phones: the caption card spans the band's top, so the row goes in the gap between the
              // card's bottom (12px inset, 8px padding, 24px lines at about 8.4px a character) and the
              // roof, centred there and shrunk when the gap is tight. Its labels take about 32px.
              const capBottom = 12 + 16 + 24 * Math.ceil((60 * 8.4) / Math.max(1, bw - 48)) + 8;
              const gap = roof - capBottom;
              // Short phones: drop the "why" line (labels then take about 20px) so the row still fits.
              const compact = mobile && gap < bubbleSize + 32 + 12;
              const labelH = compact ? 20 : 32;
              const size = mobile
                ? Math.max(28, Math.min(bubbleSize, gap - labelH - 8))
                : Math.max(56, Math.min(bubbleSize, roof - 28 - 56));
              // Centre to centre: at least wide enough that the labels ("Women's group") don't touch.
              const step = Math.max(size + 12, mobile ? 92 : 104);
              const half = step + size / 2;
              const mid = Math.min(bw - half, Math.max(half, bank.x - pad));
              const cx = mid + (i - 1) * step;
              const top = mobile ? capBottom + Math.max(0, (gap - size - labelH) / 2) : Math.max(28, roof - size - 56);
              return (
                <div key={i} className="absolute" style={{ left: cx - size / 2, top, width: size, height: size, opacity: o, zIndex: Z.caption, transform: `scale(${0.7 + 0.3 * o})` }}>
                  <Sprite s={b} k={size / b[3]} style={{ left: 0, top: 0 }} />
                  <Sprite s={FX.cross} k={(size * 0.4) / 182} style={{ right: -6, bottom: -6, opacity: crossed, transform: `scale(${0.6 + 0.4 * crossed})` }} />
                  <p className="absolute left-1/2 -translate-x-1/2 text-center font-display text-[10px] leading-[13px] text-ink sm:text-[12px] sm:leading-[16px]" style={{ top: size + 6, width: step - 4 }}>
                    <span className="block whitespace-nowrap font-bold">{ASKED[i].who}</span>
                    {!compact && <span className="text-ink/64">{ASKED[i].why}</span>}
                  </p>
                </div>
              );
            })}
          </Band>

          <Band
            veil={kf(VEIL_A)}
            style={{ top: hR, zIndex: 1, clipPath: `path("${arch(bw, archD)} V${hA} H0 Z")` }}
            world={vA}
            cam={camA}
            h={hA}
            w={bw}
            layers={[
              { key: "far", speed: 0.9, align: 450, node: <FlatFar /> },
              { key: "walls", speed: 1, align: 0, node: <FlatWalls /> },
              { key: "furniture", speed: 1, align: 0, node: <FlatFurniture /> },
            ]}
            fore={<FlatPlants />}
          >
            {/* The coins, as this world draws them. */}
            {coinsIn(pad, top0 + hR)}
            <OnGround world={vA} cam={camA} h={hA} w={bw} x={arjun.x} s={arjunPose[0]} refH={arjunPose[1]} flip={arjun.flip} z={Z.char} shadow />
            {/* The opening: a thought bubble over him, about money sitting idle. */}
            {(() => {
              const t = span(0.35, 0.95, 0.1);
              if (t <= 0.01) return null;
              return (
                <>
                  <OnGround world={vA} cam={camA} h={hA} w={bw} x={arjun.x + 62} s={FX.thought} refH={455 * 1.1} lift={ARJUN_WORLD.person * 0.92} opacity={t} z={Z.fx} />
                  <OnGround world={vA} cam={camA} h={hA} w={bw} x={arjun.x + 72} s={PIGGY} refH={400 * 3.4} lift={ARJUN_WORLD.person * 1.08} opacity={t} z={Z.fx + 1} />
                </>
              );
            })()}
            {captionsFor("A", span).map((c) => (
              <Caption key={c.text} text={c.text} opacity={c.opacity * (1 - kf(VEIL_A))} drop={archD} info={c.info} />
            ))}
          </Band>
          {/* The seam: one inked arch where the two worlds meet. */}
          <svg aria-hidden className="absolute left-0 overflow-visible" width={bw} height={archD * 2} style={{ top: hR, zIndex: 2 }}>
            <path d={arch(bw, archD)} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          </svg>
        </div>
        )}

        {/* Scene 4: Rekha's loan card, checked off in her world, then (scene 5) into Arjun's phone. */}
        {(() => {
          const o = span(4, 5.32, 0.1);
          if (o <= 0.01) return null;
          return (
            <Card wide style={{ right: mobile ? 16 : 32, top: cardTop, opacity: o, transform: `scale(${lerp(1, 0.45, fly)})`, transformOrigin: "right top" }}>
              <p className="font-display text-[11px] font-bold uppercase tracking-[1px] text-ink/56">Loan request</p>
              <p className="font-display text-[15px] font-bold text-ink sm:text-p2">Rekha · Tailor, Rajasthan</p>
              <ul className="mt-2 flex flex-col gap-1" aria-label="Checks before a loan is listed">
                {CHECKS.map((c, i) => {
                  const t = clamp01((stamps - i * 0.17) / 0.2);
                  return (
                    <li key={c.label} className="flex items-center gap-2 font-display text-[12px] font-medium text-ink/80 sm:text-p4">
                      <span className="relative size-[16px] shrink-0 rounded-full bg-ink/8">
                        <Sprite s={CHECK} k={16 / 223} style={{ left: 0, top: 0, opacity: t, transform: `scale(${0.4 + 0.6 * t})` }} />
                      </span>
                      {mobile ? c.short : c.label}
                    </li>
                  );
                })}
              </ul>
              {/* Once all five are ticked, the field partner's stamp comes down on it. */}
              {(() => {
                const s = clamp01((p - 4.42) / 0.06);
                if (s <= 0) return null;
                return <Sprite s={STAMP} k={(mobile ? 58 : 72) / 522} style={{ right: -18, top: -30, opacity: s, transform: `scale(${1.5 - 0.5 * s}) rotate(-8deg)`, transformOrigin: "center" }} />;
              })()}
            </Card>
          );
        })()}

        {/* Scene 5: a notification lands on Arjun's phone: a new loan is live. */}
        {(() => {
          const b = Math.min(clamp01((p - 4.95) / 0.08), clamp01((5.45 - p) / 0.1));
          if (b <= 0.01) return null;
          const size = mobile ? 44 : 60;
          return <Sprite s={BELL} k={size / 446} style={{ left: phoneLeft - size * 0.55, top: phoneTop - size * 0.45, opacity: b, zIndex: Z.coins, transform: `scale(${0.6 + 0.4 * b}) rotate(${Math.sin(p * 120) * 8 * b}deg)` }} />;
        })()}

        {/* Scenes 5–6: what Arjun sees on his phone. */}
        <PhoneFeed p={p} mobile={mobile} style={{ left: phoneLeft, top: phoneTop, width: PW, height: PH }} />

        {/* Scenes 8–9: repayments coming back. */}
        {(() => {
          const o = span(8, 9.05, 0.12); // it makes way for the ending, on his phone
          if (o <= 0.01) return null;
          return (
            <Card style={{ right: mobile ? 16 : 32, top: top0 + hR + (mobile ? archD + 86 : 56), opacity: o }}>
              <Sprite s={CALENDAR} k={(mobile ? 34 : 44) / 553} style={{ right: 12, top: -14 }} />
              <p className="font-display text-[11px] font-bold uppercase tracking-[1px] text-ink/56">Arjun&apos;s ₹{LENT.toLocaleString("en-IN")}, coming back</p>
              <p className="font-display text-[20px] font-bold leading-[26px] text-green-dark sm:text-[24px] sm:leading-[30px]">
                ₹{(months * EMI).toLocaleString("en-IN")}
                <span className="font-display text-[13px] font-bold text-ink/48 sm:text-p4"> of ₹{(12 * EMI).toLocaleString("en-IN")}</span>
              </p>
              <div className="mt-2 h-[8px] overflow-hidden rounded-full bg-ink/8">
                <div className="h-full rounded-full bg-green-dark transition-[width] duration-200" style={{ width: `${(months / 12) * 100}%` }} />
              </div>
              <p className="mt-1 font-display text-[11px] font-bold text-ink/64 sm:text-p4">
                {months === 0 ? "First repayment on its way" : `Month ${months} of 12 · ₹${EMI} a month`}
              </p>
              <p className="mt-1 font-display text-[11px] font-medium text-ink/56 sm:text-[12px]">
                {months === 12 ? `₹${(12 * EMI - LENT).toLocaleString("en-IN")} earned in interest at 8.25% p.a.` : "Principal + 8.25% p.a. interest"}
              </p>
            </Card>
          );
        })()}



        {/* Arjun's reactions: a tick as he lends; "+₹436" as each monthly repayment reaches him. */}
        {(() => {
          const t = span(6.28, 6.5, 0.05);
          if (t <= 0.01) return null;
          const at = toA(arjun.x, ARJUN_WORLD.ground - ARJUN_WORLD.person - 18);
          const size = mobile ? 26 : 34;
          return <Sprite s={FX.tick} k={size / 207} style={{ left: at.x - size / 2, top: at.y - size - 8 * t, opacity: t, zIndex: Z.coins, transform: `scale(${0.6 + 0.4 * t})` }} />;
        })()}
        {sinceLanding < 0.08 && (
          <p
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-green-dark px-2 py-0.5 font-display text-[12px] font-bold text-white shadow-sm sm:text-p4"
            style={{ left: arjunHand.x + 14, top: arjunHand.y - 20 - (sinceLanding / 0.08) * 22, opacity: 1 - sinceLanding / 0.08, zIndex: Z.coins }}
          >
            +₹{EMI}
          </p>
        )}

        {/* The end: back on Arjun's phone, where it began. Rekha's loan is repaid, the next person is
            new at the top, and the way in is the button on his screen. */}
        <NextOnPhone p={p} style={{ left: phoneLeft, top: phoneTop, width: PW, height: PH }} />

        {/* The ask, at the moment the reader has seen the whole loop: on laptops it stands on its own
            under the last line, big enough to be the obvious next step. (On phones the phone's own
            button is it; there is no room for both.) */}
        {!mobile &&
          (() => {
            const o = clamp01((p - 9.12) / 0.18);
            if (o <= 0.01) return null;
            return (
              <div
                className="absolute flex flex-col items-start gap-2"
                style={{ left: pad + 24, top: top0 + hR + archD + 116, opacity: o, zIndex: Z.cta, transform: `translateY(${(1 - o) * 12}px)` }}
              >
                <a
                  href="#opportunities"
                  className="flex h-[56px] items-center gap-2 rounded-[8px] bg-primary px-7 font-display text-p2 font-bold text-white shadow-[0_8px_24px_rgba(41,45,54,0.18)] transition hover:brightness-95"
                >
                  Meet businesses in need <span aria-hidden>→</span>
                </a>
                <p className="rounded-full bg-white/90 px-3 py-1 font-display text-p4 font-medium text-ink/72">
                  Rekha is one of {roundedPlus(LIVE.entrepreneurs)} entrepreneurs backed on Rang De
                </p>
              </div>
            );
          })()}

        {/* The model in four steps, along the bottom: says where the reader is, and by the end has
            ticked off the whole loop. Before they start, it says how to move. */}
        <div className="absolute inset-x-2 flex items-center gap-2 sm:gap-4" style={{ bottom: railGap, height: RAIL - 6 }}>
          <ol aria-label="The story's four steps" className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
            {STEPS.map((s, i) => {
              const next = STEPS[i + 1]?.from ?? 99;
              const done = p >= next - 0.05;
              const on = !done && p >= s.from - 0.05;
              // How far through this step the story is: the pill fills left to right with the scroll.
              const fill = clamp01((p - s.from) / ((STEPS[i + 1]?.from ?? PMAX) - s.from));
              const body = (filled: boolean) => (
                <>
                  {(!mobile || on) && (
                    <span className={`grid size-[18px] shrink-0 place-items-center rounded-full text-[10px] ${filled ? "bg-white text-green-dark" : "bg-ink/8"}`}>{done ? "✓" : i + 1}</span>
                  )}
                  <span className="truncate">{mobile ? `${done ? "✓ " : ""}${s.short}` : wide ? s.label : s.mid}</span>
                </>
              );
              const pillBox = "flex min-w-0 items-center gap-1 px-[7px] py-1.5 sm:gap-1.5 sm:px-3";
              return (
                // On phones every step keeps a one-word name so the four still read as the model; only the
                // current one gets its number badge.
                <li key={s.label} className={`flex min-w-0 ${mobile && !on ? "flex-none" : "flex-1"}`}>
                  <button
                    type="button"
                    onClick={() => jumpTo(s.from)}
                    aria-current={on ? "step" : undefined}
                    aria-label={`Step ${i + 1}: ${s.label}${done ? " (done)" : ""}. Jump the story here.`}
                    className={`relative flex min-w-0 flex-1 cursor-pointer overflow-hidden rounded-full bg-white font-display text-[11px] font-bold text-ink/48 hover:ring-2 hover:ring-green-dark/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-dark sm:text-p4 ${pillBox}`}
                  >
                    {body(false)}
                    {/* The same label in white on green, revealed from the left as the step plays out. */}
                    <span
                      aria-hidden
                      className={`absolute inset-0 bg-green-dark text-white ${pillBox}`}
                      style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0 round 999px)` }}
                    >
                      {body(true)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {/* Until the reader starts, how to move; after that, the way out. Never both at once. */}
          <ScrollOrSkip skip={p >= 0.4} hint={1 - clamp01(p / 0.4)} label={mobile ? "Skip ↓" : "Skip story ↓"} onSkip={skipStory} />
        </div>
      </div>
    </section>
    </div>
  );
}
