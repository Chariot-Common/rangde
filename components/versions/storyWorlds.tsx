/**
 * The two worlds of the character "How it works" (CharacterHowItWorks). The buildings, window,
 * balcony, skyline, hills and clouds are GPT line-art images (WebP) in public/hiw-story (prompts in
 * docs/hiw-story-asset-prompts.md); skies, ground, walls, the lane, furniture and plants are
 * still drawn in code. Coordinates are world units (the same units the characters stand in);
 * every layer is drawn on its own so it can move at its own speed.
 *
 *   Rekha's village: her home (x 0–480), the bank (545–835), the neem tree and charpai
 *   (800–1220), the lane (1300–1680) and her shop (1634–2034). Ground at y 521.
 *   Arjun's flat: the living room window and sofa (40–680), the work desk (1140–1480) and
 *   the balcony (1615–2055). Ceiling at y 140, floor at y 566.
 */

import { memo } from "react";

export const INK = "#1B2A4A";
const MID = "#7F8DAA";
// The background ink: a soft slate grey, lighter than the characters' outlines, so the people and
// props read in front. The GPT line-art images were recoloured to it (and thinned by a pixel).
const LINE = "#7D879C";
const FAR = "#B4BFD3";
export const VILLAGE_BG = "#FBF1E2";
export const FLAT_BG = "#EAF3FC";
const WALL = "#F8FBFF";

// Tints. The worlds stay line art; these flat washes only separate sky, hills, walls and ground so
// the coloured characters and props read in front of them. Things people touch get a little more colour.
const V = {
  skyTop: "#FDF7EE",
  skyLow: "#F8E3C6",
  sun: "#FBE0B2",
  hillFar: "#F3E6D1",
  hill: "#EADCC0",
  hut: "#F8EEDF",
  wall: "#FFF8EE",
  inside: "#F4E2CA",
  roof: "#E8C3A0",
  glass: "#E2EDF1",
  door: "#E6CFB2",
  official: "#E1E8F1",
  shutter: "#E3E7EE",
  canopy: "#DCE8D0",
  stone: "#EFDFC6",
  awning: "#F4C4AF",
  wood: "#E6C49A",
  ground: "#F1DFC0",
  path: "#E2C99F",
};
const F = {
  skyTop: "#D7E8F9",
  skyLow: "#F2F8FE",
  tower: "#CDDDF0",
  towerNear: "#DCE7F5",
  lit: "#FFFFFF",
  wainscot: "#EEF4FB",
  skirting: "#DFE8F3",
  floor: "#D9E3EF",
  rug: "#C9D9EC",
  sofa: "#A9C7E2",
  cushion: "#C3D8EC",
  wood: "#E7D2B6",
  laptop: "#DDE3EA",
  chair: "#9FB6CF",
  pot: "#E7B497",
  artWarm: "#F5E1C6",
  artGreen: "#DDEAD5",
};

/* ── Small drawing helpers ───────────────────────────────────────────────────────────────── */

function Tuft({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y} l-7 -11 M${x} ${y} l-1 -15 M${x} ${y} l6 -12 M${x + 4} ${y} l10 -8`} />;
}

// The three foreground bushes (bush-1…3.webp) as [file, width/height].
const BUSHES = [
  ["bush-1", 571 / 406],
  ["bush-2", 666 / 491],
  ["bush-3", 650 / 390],
] as const;

/** Foreground bushes along the bottom of a band, cycling through the three drawings. */
function Bushes({ xs, base, w }: { xs: number[]; base: number; w: (i: number) => number }) {
  return (
    <g>
      {xs.map((x, i) => {
        const [file, ratio] = BUSHES[i % BUSHES.length];
        return <Art key={x} file={file} x={x - w(i) / 2} w={w(i)} ratio={ratio} base={base} />;
      })}
    </g>
  );
}

/** A GPT image (public/hiw-story/<file>.webp) placed in world units: `x` is its left edge, `w` its width,
 * `ratio` its width/height, and its base sits on `base`. */
function Art({ file, x, w, ratio, base }: { file: string; x: number; w: number; ratio: number; base: number }) {
  const h = w / ratio;
  return <image href={`/hiw-story/${file}.webp`} x={x} y={base - h} width={w} height={h} preserveAspectRatio="none" />;
}

/* ── Rekha's village ─────────────────────────────────────────────────────────────────────── */

/** Sky, sun, the far hills (village-hills.webp, repeated) and clouds (cloud-1…3.webp). */
function VillageFarArt() {
  return (
    <g stroke={FAR} strokeWidth={2.2}>
      <defs>
        <linearGradient id="hiw-village-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={V.skyTop} />
          <stop offset="1" stopColor={V.skyLow} />
        </linearGradient>
      </defs>
      <rect x={-2000} y={0} width={6000} height={530} fill="url(#hiw-village-sky)" stroke="none" />
      <circle cx={1500} cy={330} r={52} fill={V.sun} stroke="none" />
      {/* the hills strip repeats; its baseline sits on the ground */}
      {[-1400, 0, 1400, 2800].map((x) => (
        <Art key={x} file="village-hills" x={x} w={1400} ratio={2000 / 134} base={523} />
      ))}
      {(
        [
          [120, 255, "cloud-1", 82, 565 / 288],
          [720, 225, "cloud-3", 46, 325 / 190],
          [1300, 262, "cloud-2", 104, 700 / 328],
          [1900, 238, "cloud-1", 70, 565 / 288],
          [2500, 255, "cloud-3", 52, 325 / 190],
        ] as const
      ).map(([x, base, file, w, ratio]) => (
        <Art key={x} file={file} x={x} w={w} ratio={ratio} base={base} />
      ))}
    </g>
  );
}

/** Where the bank's roll-down shutter is: `pos` 0 (up) to 1 (down), `dust` 0–1 since it hit the
 * ledge (-1 when there is none), `shake` a small sideways jolt of the building on impact. */
export type Shutter = { pos: number; dust: number; shake: number };

// The bank is GPT line art (public/hiw-story/bank-open.webp, 891×575), drawn 290 units wide with its
// base on the ground. The window opening below the shutter box, in that image's pixels:
const BANK_K = 290 / 891;
export const BANK = { x: 527, y: 521 - 575 * BANK_K, w: 290, h: 575 * BANK_K };
const OPENING = { x: BANK.x + 140 * BANK_K, y: BANK.y + 225 * BANK_K, w: 442 * BANK_K, h: 191 * BANK_K };

/** The bank, its shutter unrolling out from under the shutter box: a strip of slats (bank-shutter.webp)
 * slides down inside the window opening, led by its bottom bar, and kicks up dust when it lands. */
function Bank({ shutter }: { shutter: Shutter }) {
  const o = OPENING;
  const drop = shutter.pos * o.h;
  const d = shutter.dust;
  return (
    <g transform={`translate(${shutter.shake} 0)`}>
      <defs>
        <clipPath id="hiw-bank-opening">
          <rect x={o.x} y={o.y} width={o.w} height={o.h} />
        </clipPath>
        <linearGradient id="hiw-bank-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={INK} stopOpacity={0.28} />
          <stop offset="1" stopColor={INK} stopOpacity={0} />
        </linearGradient>
      </defs>
      <image href="/hiw-story/bank-open.webp" x={BANK.x} y={BANK.y} width={BANK.w} height={BANK.h} preserveAspectRatio="none" />
      <g clipPath="url(#hiw-bank-opening)" stroke="none">
        {drop > 0.2 && (
          <>
            <image href="/hiw-story/bank-shutter.webp" x={o.x} y={o.y - o.h + drop} width={o.w} height={o.h} preserveAspectRatio="none" />
            {/* the bottom bar and its pull handle */}
            <rect x={o.x} y={o.y + drop - 3.4} width={o.w} height={3.4} fill={V.wall} stroke={LINE} strokeWidth={1.2} />
            <rect x={o.x + o.w / 2 - 7} y={o.y + drop - 2.2} width={14} height={2.6} rx={1.2} fill={LINE} />
          </>
        )}
        {/* the shutter box's shadow on whatever is below it */}
        <rect x={o.x} y={o.y} width={o.w} height={6} fill="url(#hiw-bank-shade)" opacity={Math.min(1, shutter.pos * 3)} />
      </g>
      {d >= 0 &&
        [-1, 1].map((side) =>
          [0, 1].map((i) => (
            <ellipse
              key={`${side}${i}`}
              cx={(side < 0 ? o.x + 6 : o.x + o.w - 6) + side * (4 + 14 * d) * (1 + i * 0.6)}
              cy={o.y + o.h - 1 - 5 * d * (1 + i)}
              rx={(3 + 6 * d) * (1 - i * 0.3)}
              ry={(1.6 + 2.6 * d) * (1 - i * 0.3)}
              fill={V.stone}
              stroke={MID}
              strokeWidth={1}
              opacity={(1 - d) * 0.9}
            />
          )),
        )}
    </g>
  );
}

// Clothes she has stitched, hung on a line across the shop's open front, right of her machine.
const GARMENTS = ["#E9806E", "#E9B44C", "#5FA8A0", "#D97BA5", "#7FA65A"];

/** A kurta on a hanger, hanging from (x, y): the work coming out of her shop. */
function Garment({ x, y, fill, show }: { x: number; y: number; fill: string; show: number }) {
  if (show <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y - 6 * (1 - show)})`} opacity={show} stroke={LINE} strokeWidth={1}>
      <path d="M0 0 V3 M-7 7 L0 3 L7 7" fill="none" />
      <path d="M-7 7 L-12 13 L-9 16 L-6 12 L-6 30 H6 V12 L9 16 L12 13 L7 7 L3 8 Q0 11 -3 8 Z" fill={fill} />
      <path d="M0 10 V20" stroke="#ffffff" strokeOpacity={0.7} />
    </g>
  );
}

/** Rekha's home, the bank, the neem tree, the lane wall and her shop. `garments` (0–5) is how many
 * finished clothes hang in the shop: it fills up as the months of repayments go by. */
function VillageBuildingsArt({ shutter, garments = 0 }: { shutter: Shutter; garments?: number }) {
  return (
    <g stroke={LINE} strokeWidth={1.8} fill={V.wall}>
      {/* Rekha's home, a cutaway (village-home.webp) */}
      <Art file="village-home" x={-40} w={480} ratio={1400 / 580} base={521} />

      <Bank shutter={shutter} />

      {/* The neem tree (village-tree.webp) */}
      <Art file="village-tree" x={800} w={420} ratio={1200 / 688} base={521} />

      {/* The lane: a low stone wall and an electricity pole (village-lane.webp), its wire running back
          towards the neem tree */}
      <Art file="village-lane" x={1215} w={445} ratio={1931 / 752} base={523} />

      {/* Rekha's shop (village-shop.webp), its sign painted on the blank board */}
      <Art file="village-shop" x={1680} w={400} ratio={1200 / 702} base={521} />
      <text x={1880} y={316} textAnchor="middle" fill={LINE} stroke="none" fontFamily="var(--font-inter), sans-serif" fontWeight={800} fontSize={17} letterSpacing={3}>
        REKHA TAILORS
      </text>
      {garments > 0.01 && <path d="M1940 402 Q2005 410 2070 402" fill="none" strokeWidth={1.2} />}
      {GARMENTS.map((c, i) => (
        <Garment key={c} x={1952 + i * 26} y={404 + (i === 2 ? 2 : i % 2)} fill={c} show={Math.min(1, Math.max(0, garments - i))} />
      ))}
    </g>
  );
}

/** The ground, the charpai (prop-charpai.webp), grass and stones. */
function VillageGroundArt() {
  return (
    <g stroke={LINE} strokeWidth={1.8} fill="none">
      <rect x={-700} y={521} width={4000} height={260} fill={V.ground} stroke="none" />
      {/* a worn footpath along the lane */}
      <path d="M-640 548 h44 M-420 560 h30 M-180 546 h52 M60 556 h36 M320 548 h48 M560 560 h34 M820 546 h56 M1080 556 h40 M1340 548 h46 M1600 560 h32 M1860 546 h54 M2120 556 h38 M2380 548 h44 M2640 560 h30" stroke={V.path} strokeWidth={4} />
      <path d="M-700 521 H3300" />
      {/* her table at home is the coloured Figma prop (machine-table.png), drawn in CharacterHowItWorks */}
      {/* the charpai under the tree */}
      <Art file="prop-charpai" x={1045} w={150} ratio={1000 / 328} base={524} />
      {[430, 905, 1260, 1700, 2080, 2400].map((x) => <Tuft key={x} x={x} y={521} />)}
      <ellipse cx={700} cy={530} rx={7} ry={3} fill={V.stone} />
      <ellipse cx={1440} cy={532} rx={6} ry={3} fill={V.stone} />
    </g>
  );
}

function VillagePlantsArt() {
  return <Bushes xs={[300, 1150, 1950, 2750, 3500]} base={640} w={(i) => (i % 2 ? 190 : 230)} />;
}

/* ── Arjun's flat ────────────────────────────────────────────────────────────────────────── */

// The flat's line art is GPT images (public/hiw-story/flat-*.webp, decor-*.webp). The wall is drawn in
// code with two holes, one behind each image's glass, so the sky and city show through the panes.

// flat-window.webp (1240×518): its outer frame starts 24 px in and 3 px down, 1191 px wide.
const WIN_K = 640 / 1191;
const WIN_ART = { x: 40 - 24 * WIN_K, y: 176 - 3 * WIN_K, w: 1240 * WIN_K, h: 518 * WIN_K };
const WIN = { x: 40 + 8 * WIN_K, y: 176 + 8 * WIN_K, w: 1175 * WIN_K, h: 449 * WIN_K };

// flat-balcony.webp (1065×993): the door frame's sill stands on the floor; the opening is 66 px in
// from the left and 48 px down, 934 × 891 px.
const BAL_K = 410 / 993;
const BAL_ART = { x: 1615, y: 566 - 993 * BAL_K, w: 1065 * BAL_K, h: 993 * BAL_K };
const BAL = { x: BAL_ART.x + 66 * BAL_K, y: BAL_ART.y + 48 * BAL_K, w: 934 * BAL_K, h: 891 * BAL_K };

/** The sky, clouds and the city (flat-skyline.webp, repeated) seen through the window and the balcony. */
function FlatFarArt() {
  return (
    <g>
      <defs>
        <linearGradient id="hiw-flat-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={F.skyTop} />
          <stop offset="1" stopColor={F.skyLow} />
        </linearGradient>
      </defs>
      <rect x={-2000} y={100} width={6000} height={500} fill="url(#hiw-flat-sky)" />
      {(
        [
          [140, 236, "cloud-2", 92, 700 / 328],
          [440, 214, "cloud-3", 46, 325 / 190],
          [1560, 214, "cloud-1", 84, 565 / 288],
          [1820, 236, "cloud-3", 44, 325 / 190],
        ] as const
      ).map(([x, base, file, w, ratio]) => (
        <Art key={x} file={file} x={x} w={w} ratio={ratio} base={base} />
      ))}
      {[-1100, 0, 1100, 2200].map((x) => (
        <Art key={x} file="flat-skyline" x={x} w={1100} ratio={2000 / 342} base={452} />
      ))}
    </g>
  );
}

/** The wall (with holes behind the window and balcony glass), skirting, the window,
 * the balcony door, and the pictures and clock. */
function FlatWallsArt() {
  const hole = (r: typeof WIN) => `M${r.x} ${r.y} V${r.y + r.h} H${r.x + r.w} V${r.y} Z`;
  return (
    <g stroke={LINE} strokeWidth={1.6}>
      <path d={`M-700 0 H3300 V566 H-700 Z ${hole(WIN)} ${hole(BAL)}`} fill={WALL} fillRule="evenodd" stroke="none" />
      {/* skirting, either side of the balcony door (no cornice: the seam arch is the only line up top) */}
      <path d={`M-700 548 H${BAL_ART.x} V566 H-700 Z M${BAL_ART.x + BAL_ART.w} 548 H3300 V566 H${BAL_ART.x + BAL_ART.w} Z`} fill={WALL} />
      <image href="/hiw-story/flat-window.webp" x={WIN_ART.x} y={WIN_ART.y} width={WIN_ART.w} height={WIN_ART.h} preserveAspectRatio="none" />
      <image href="/hiw-story/flat-balcony.webp" x={BAL_ART.x} y={BAL_ART.y} width={BAL_ART.w} height={BAL_ART.h} preserveAspectRatio="none" />
      <Art file="decor-tall" x={760} w={70} ratio={384 / 530} base={345} />
      <Art file="decor-square" x={850} w={58} ratio={292 / 288} base={334} />
      <Art file="decor-clock" x={1285} w={50} ratio={392 / 388} base={276} />
    </g>
  );
}

/** The floor and rug, then the sofa, the work desk (with its laptop, mug and chair) and the
 * balcony plant: prop-sofa.webp, prop-desk.webp, prop-balcony-plant.webp. */
function FlatFurnitureArt() {
  return (
    <g>
      <rect x={-700} y={566} width={4000} height={200} fill={F.floor} />
      <ellipse cx={420} cy={578} rx={330} ry={12} fill={F.rug} />
      <path d="M-700 566 H3300" stroke={LINE} strokeWidth={1.8} />
      <Art file="prop-sofa" x={85} w={420} ratio={1200 / 417} base={567} />
      {/* sized so the desktop sits where Arjun's desk always has, at y 428 */}
      <Art file="prop-desk" x={1145} w={318} ratio={1100 / 665} base={567} />
      <Art file="prop-balcony-plant" x={1922} w={110} ratio={600 / 581} base={567} />
    </g>
  );
}

function FlatPlantsArt() {
  return <Bushes xs={[150, 1000, 1800, 2700, 3500]} base={690} w={(i) => (i % 2 ? 230 : 270)} />;
}

// The scenery never changes while the story scrolls (only the camera, a few props and the bank's
// shutter do), so it is memoized: the story re-renders every frame, the art doesn't.
export const VillageFar = memo(VillageFarArt);
export const VillageBuildings = memo(VillageBuildingsArt);
export const VillageGround = memo(VillageGroundArt);
export const VillagePlants = memo(VillagePlantsArt);
export const FlatFar = memo(FlatFarArt);
export const FlatWalls = memo(FlatWallsArt);
export const FlatFurniture = memo(FlatFurnitureArt);
export const FlatPlants = memo(FlatPlantsArt);
