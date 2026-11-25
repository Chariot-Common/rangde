"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";

/*
 * Animations for the /v/why2 "Before you lend" pop-ups (24 Nov 2026), in the How it works animations' style: ink text,
 * the app's green buttons, light grey panels, light blue avatar circles with a white ring. Colours are the How it works
 * palette (components/how-it-works/figma-motion.css).
 *
 * Second round (23 Nov 2026): each animation is drawn on a fixed 496 × 372 stage (the pop-up's width on desktop, so
 * 1px = 1px there) that scales down to fit narrower pop-ups, with 32px of breathing room on every side. No cards
 * inside the frame: the elements sit straight on the grey.
 */

const INK = "#292D36";
const INK_2 = "#4A4F5A";
const GREEN = "#62AF1D";
const GREEN_DARK = "#3A6E0C"; // the pop-up's fact ticks (bg-green-dark)
const PANEL = "#F1F2F5";
const LINE = "#E7E7E7";
const AV_BG = "#A8D8F0";
const RED = "#E0503C";
const RING = "#CBE0B8";
const TRACK = "#E1E3E8";
const EASE = [0.22, 1, 0.36, 1] as const;

const STAGE_W = 496;
const STAGE_H = 372;
const PAD = 32;
const INNER_W = STAGE_W - 2 * PAD; // 432

/** The animation frame: a 4:3 grey panel holding a fixed-size stage that scales to the frame's width. */
function Stage({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(e.contentRect.width / STAGE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} role="img" aria-label={label} className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[12px]" style={{ backgroundColor: PANEL }}>
      <div aria-hidden className="absolute left-0 top-0 origin-top-left" style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${k})` }}>
        {children}
      </div>
    </div>
  );
}

/** Field titles, the KYC line and the card names all share this: small bold capitals. */
const LABEL = "font-display text-[12px] font-bold uppercase leading-[16px] tracking-[0.08em]";

/** A tick in a green circle that pops in. */
function Tick({ delay, reduce, size = 20, color = GREEN }: { delay: number; reduce: boolean; size?: number; color?: string }) {
  return (
    <motion.span
      className="flex items-center justify-center rounded-full text-white shadow-[0_0_0_2px_#fff]"
      style={{ width: size, height: size, backgroundColor: color }}
      initial={reduce ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 18, delay }}
    >
      <svg viewBox="0 0 24 24" className="size-[60%]" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </motion.span>
  );
}

/** A green button that's "clicked": it grows a little and settles back, turning from the button green to the
 *  pop-up's darker tick green as it does. No press-in. */
function ClickButton({ at, reduce, className = "", children }: { at: number; reduce: boolean; className?: string; children: React.ReactNode }) {
  return (
    <motion.span
      className={`flex items-center justify-center gap-2 rounded-[8px] font-display font-bold text-white ${className}`}
      initial={{ scale: 1, backgroundColor: GREEN }}
      animate={reduce ? undefined : { scale: [1, 1.06, 1], backgroundColor: [GREEN, GREEN_DARK, GREEN_DARK] }}
      transition={{ delay: at, duration: 0.55, times: [0, 0.45, 1], ease: "easeInOut" }}
    >
      {children}
    </motion.span>
  );
}

/* ── 1 · How do I get started? Three screens on a loop, each sliding in from the right as the last leaves to the left:
      1. Sign up: First name | Last name, Phone number, Email address, each field filling with grey X's one character
         at a time, one field after another; then "Proceed to KYC →" is clicked.
      2. KYC: "KYC uploads, per RBI regulation", an address proof and a PAN card that load and are ticked; then
         "Sign up" is clicked.
      3. A big tick and "You’re ready to invest". ── */

const GS_SCENES = [3400, 2900, 2600]; // ms per screen
const CHAR = 0.035; // s per X
const FIELD_GAP = 0.12; // s between one field finishing and the next starting
const TYPE_AT = 0.5;
const GS_FIELDS = [
  { label: "First name", text: "XXXXX" },
  { label: "Last name", text: "XXXXXXX" },
  { label: "Phone number", text: "XX XXXXX XXXXX" },
  { label: "Email address", text: "XXXXXXXXXX@xxxx.com" },
].reduce<{ label: string; text: string; at: number }[]>((acc, f) => {
  const prev = acc[acc.length - 1];
  const at = prev ? prev.at + prev.text.length * CHAR + FIELD_GAP : TYPE_AT;
  return [...acc, { ...f, at }];
}, []);
const PROCEED_AT = GS_FIELDS[3].at + GS_FIELDS[3].text.length * CHAR + 0.2;

export function GetStartedAnim() {
  const reduce = !!useReducedMotion();
  const [scene, setScene] = useState(0);
  const [first, setFirst] = useState(true); // the first screen is already in place when the pop-up opens
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => {
      setFirst(false);
      setScene((s) => (s + 1) % GS_SCENES.length);
    }, GS_SCENES[scene]);
    return () => clearTimeout(t);
  }, [scene, reduce]);

  return (
    <Stage label="Getting started on Rang De: sign up with your name, phone and email; complete KYC with an address proof and your PAN card; then you’re ready to invest.">
      {/* No initial={false} here: it would also switch off the fields' and ticks' own entrances. */}
      <AnimatePresence>
        <motion.div
          key={scene}
          className="absolute"
          style={{ left: PAD, top: PAD, width: INNER_W, height: STAGE_H - 2 * PAD }}
          initial={reduce || first ? false : { x: STAGE_W }}
          animate={{ x: 0 }}
          exit={reduce ? undefined : { x: -STAGE_W }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {scene === 0 && <SignUp reduce={reduce} />}
          {scene === 1 && <Kyc reduce={reduce} />}
          {scene === 2 && <Ready reduce={reduce} />}
        </motion.div>
      </AnimatePresence>
    </Stage>
  );
}

function Field({ label, text, at, reduce }: { label: string; text: string; at: number; reduce: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className={LABEL} style={{ color: INK_2 }}>
        {label}
      </span>
      <span className="flex h-12 items-center overflow-hidden whitespace-pre rounded-[8px] border bg-white px-3.5 font-display text-[16px] font-medium tracking-[0.06em]" style={{ borderColor: LINE, color: INK }}>
        {/* The X's sit at 64% and appear one at a time, left to right. */}
        <span style={{ opacity: 0.64 }}>
          {[...text].map((c, i) => (
            <motion.span key={i} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.05, delay: at + i * CHAR }}>
              {c}
            </motion.span>
          ))}
        </span>
      </span>
    </div>
  );
}

function SignUp({ reduce }: { reduce: boolean }) {
  const [first, last, phone, email] = GS_FIELDS;
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="grid grid-cols-2 gap-2">
        <Field {...first} reduce={reduce} />
        <Field {...last} reduce={reduce} />
      </div>
      <Field {...phone} reduce={reduce} />
      <Field {...email} reduce={reduce} />
      <ClickButton at={PROCEED_AT} reduce={reduce} className="px-4 py-2 text-[16px] leading-[24px]">
        Proceed to KYC
        <span aria-hidden>→</span>
      </ClickButton>
    </div>
  );
}

/** Loading lines on an ID card: they shimmer until the card is ticked. */
function Shimmer({ w, color, delay, reduce }: { w: string; color: string; delay: number; reduce: boolean }) {
  return (
    <motion.span
      className="block h-[7px] rounded-full"
      style={{ width: w, backgroundColor: color }}
      initial={false}
      animate={reduce ? undefined : { opacity: [0.35, 1, 0.35] }}
      transition={{ duration: 1.1, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

function Kyc({ reduce }: { reduce: boolean }) {
  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <span className={LABEL} style={{ color: INK_2 }}>
        KYC uploads, per RBI regulation
      </span>
      <div className="grid grid-cols-2 gap-4">
        {/* Address proof: a white card with a saffron band on top and a green one below. */}
        <div className="flex flex-col gap-2">
          <div className="relative w-full">
            <div className="flex aspect-[1.58] w-full flex-col overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: LINE }}>
              <span className="block h-[16%]" style={{ backgroundColor: "#F4A340" }} />
              <span className="flex flex-1 items-center gap-3 px-3">
                <span className="block aspect-[3/4] h-[70%] rounded-[4px]" style={{ backgroundColor: LINE }} />
                <span className="flex flex-1 flex-col gap-2">
                  <Shimmer w="90%" color="rgba(41,45,54,0.18)" delay={0} reduce={reduce} />
                  <Shimmer w="70%" color="rgba(41,45,54,0.18)" delay={0.15} reduce={reduce} />
                  <Shimmer w="80%" color="rgba(41,45,54,0.18)" delay={0.3} reduce={reduce} />
                </span>
              </span>
              <span className="block h-[10%]" style={{ backgroundColor: "#4CAF50" }} />
            </div>
            <span className="absolute -right-2 -top-2">
              <Tick delay={1.0} reduce={reduce} size={28} />
            </span>
          </div>
          <span className={LABEL} style={{ color: INK_2 }}>
            Address Proof
          </span>
        </div>
        {/* PAN: a blue card. */}
        <div className="flex flex-col gap-2">
          <div className="relative w-full">
            <div className="flex aspect-[1.58] w-full flex-col justify-center gap-2 overflow-hidden rounded-[10px] px-3" style={{ backgroundColor: "#1F5FA8" }}>
              <Shimmer w="60%" color="rgba(255,255,255,0.45)" delay={0.1} reduce={reduce} />
              <span className="flex items-center gap-3">
                <span className="flex flex-1 flex-col gap-2">
                  <Shimmer w="85%" color="rgba(255,255,255,0.45)" delay={0.25} reduce={reduce} />
                  <Shimmer w="65%" color="rgba(255,255,255,0.45)" delay={0.4} reduce={reduce} />
                </span>
                <span className="block aspect-[3/4] h-12 rounded-[4px]" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
              </span>
            </div>
            <span className="absolute -right-2 -top-2">
              <Tick delay={1.4} reduce={reduce} size={28} />
            </span>
          </div>
          <span className={LABEL} style={{ color: INK_2 }}>
            PAN Card
          </span>
        </div>
      </div>
      <ClickButton at={2.0} reduce={reduce} className="px-4 py-2 text-[16px] leading-[24px]">
        Sign up
      </ClickButton>
    </div>
  );
}

function Ready({ reduce }: { reduce: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <Tick delay={0.55} reduce={reduce} size={80} color={GREEN_DARK} />
      <motion.p
        className="font-display text-[26px] font-bold leading-[32px]"
        style={{ color: INK }}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.75, ease: EASE }}
      >
        You’re ready to invest
      </motion.p>
    </div>
  );
}

/* ── 3 · What happens if a borrower doesn't repay? One borrower's story on a loop:
      The borrower (her own face, in How it works' light blue circle with the light green ring) sits above a "Monthly
      repayments" bar of six dots: "Investment received" (larger) on the left, four repayments, "Repayment complete"
      (larger) on the right. The bar fills green one repayment at a time; it stalls short of the fifth dot, which turns
      red, and her face falls. The (smaller) on-ground partner flies in from the top left. The red dot moves right (that
      repayment is given more time): the bar lengthens and re-centres while the green line already filled stays as it
      is. Then she catches up, the dot turns green, she smiles, and the bar fills to the end. It fades to a green tick,
      "Repayment complete", and the note that repayments aren't guaranteed. ── */

const U = 58; // one repayment's stretch of the bar, px
const LONG = 100; // the fifth repayment's stretch once it's been given more time

// Beats (ms): start, three repayments, stall + fifth dot red, partner arrives, the dot moves right, she catches up to
// it, she completes, the end frame.
const BEATS = [700, 480, 480, 480, 1000, 1100, 900, 800, 900, 3400];

/** A face in How it works' frame: light blue circle, a white gap, then the light green ring. */
function Face({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size, backgroundColor: AV_BG, boxShadow: `0 0 0 2px #fff, 0 0 0 ${Math.round(size / 22) + 2}px ${RING}` }}
    >
      {children}
    </span>
  );
}

/** Small bold capitals for the labels around the bar and the faces. */
function H6({ children, color = INK_2, className = "" }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <span className={`font-display text-[12px] font-bold uppercase leading-[14px] tracking-[0.08em] ${className}`} style={{ color }}>
      {children}
    </span>
  );
}

export function NoRepayAnim() {
  const reduce = !!useReducedMotion();
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setBeat((b) => (b + 1) % BEATS.length), BEATS[beat]);
    return () => clearTimeout(t);
  }, [beat, reduce]);

  // Reduced motion: hold the resolved story (partner in, fifth stretch lengthened, fully repaid) with the note.
  const b = reduce ? 8 : beat;
  const red = b >= 4 && b <= 6; // the fifth dot (index 4) is missed
  const sad = red;
  const partner = b >= 5;
  const gap = b >= 6 ? LONG : U; // the stretch up to the fifth dot
  const done = b === 9;
  const total = 4 * U + gap;
  const dots = [0, U, 2 * U, 3 * U, 3 * U + gap, 4 * U + gap];
  const fill = b <= 3 ? b * U : b <= 6 ? 3 * U + 0.45 * U : b === 7 ? 3 * U + gap : total;
  const t = { duration: 0.6, ease: EASE };

  return (
    <Stage label="A borrower repays month by month. She misses the fifth repayment and it turns red. The on-ground partner steps in, that repayment is given more time, and she completes the loan. Most delays are worked out with the partner. Repayments aren’t guaranteed.">
      <AnimatePresence mode="wait" initial={false}>
        {!done ? (
          <motion.div key="story" className="absolute flex flex-col items-center justify-center gap-9" style={{ inset: PAD }} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            {/* The faces: the partner flies in from the top left and the pair re-centres. */}
            <div className="flex items-end justify-center gap-6">
              <AnimatePresence initial={false}>
                {partner && (
                  <motion.div
                    key="partner"
                    className="flex flex-col items-center gap-2"
                    initial={reduce ? false : { opacity: 0, x: -260, y: -170 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: EASE }}
                  >
                    <Face size={56}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar */}
                      <img src="/images/why2-faq/partner.webp" alt="" className="absolute inset-0 size-full object-cover" />
                    </Face>
                    <H6 className="text-center">
                      On ground
                      <br />
                      partner
                    </H6>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div layout={!reduce} transition={{ duration: 0.8, ease: EASE }} className="flex flex-col items-center gap-2.5">
                <Face size={112}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar */}
                  <img src="/images/why2-faq/borrower-happy.webp" alt="" className="absolute inset-0 size-full object-cover" />
                  <motion.img
                    src="/images/why2-faq/borrower-sad.webp"
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    initial={false}
                    animate={{ opacity: sad ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Face>
                <H6>Borrower</H6>
              </motion.div>
            </div>

            {/* The repayments bar: grey track, a green fill, and six dots; the missed one turns red. */}
            <div className="flex flex-col items-center gap-4">
              <H6>Monthly repayments</H6>
              <motion.div className="relative h-[18px]" initial={false} animate={{ width: total }} transition={t}>
                <span className="absolute inset-x-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full" style={{ backgroundColor: TRACK }} />
                <motion.span
                  className="absolute left-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: GREEN }}
                  initial={false}
                  animate={{ width: fill }}
                  transition={{ duration: b >= 7 ? 0.7 : 0.42, ease: "easeOut" }}
                />
                {dots.map((x, i) => {
                  const big = i === 0 || i === dots.length - 1;
                  const size = big ? 18 : 13;
                  const missed = i === 4 && red;
                  const reached = fill >= x - 0.5;
                  return (
                    <motion.span
                      key={i}
                      className="absolute top-1/2 rounded-full border-2 border-white"
                      style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
                      initial={false}
                      animate={{ left: x, scale: missed ? 1.3 : 1, backgroundColor: missed ? RED : reached ? GREEN : TRACK }}
                      transition={{ left: t, scale: { type: "spring", stiffness: 420, damping: 16 }, backgroundColor: { duration: 0.3 } }}
                    />
                  );
                })}
                {/* The end labels, under the two larger dots. */}
                <H6 className="absolute left-0 top-[28px] w-[100px] -translate-x-1/2 text-center">Investment received</H6>
                <motion.span className="absolute top-[28px] w-[100px] -translate-x-1/2 text-center leading-[14px]" initial={false} animate={{ left: total }} transition={t}>
                  <H6>Repayment complete</H6>
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="done" className="absolute inset-0 flex flex-col items-center justify-center gap-4 pb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <Tick delay={0.1} reduce={reduce} size={80} />
            <span className="font-display text-[24px] font-bold leading-[32px]" style={{ color: GREEN }}>
              Repayment complete
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* The note, at the bottom of the end frame (and always, when motion is reduced). */}
      <AnimatePresence>
        {(done || reduce) && (
          <motion.p
            key="note"
            className="absolute text-center font-display text-[14px] font-medium leading-[20px]"
            style={{ color: INK_2, left: PAD, right: PAD, bottom: reduce ? 8 : PAD }}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: reduce ? 0 : 0.5 }}
          >
            Most delays are worked out with the partner. Repayments aren’t guaranteed.
          </motion.p>
        )}
      </AnimatePresence>
    </Stage>
  );
}

/* ── 2 · I'm an NRI/OCI. Can I still invest? One continuous story, after How it works' "Your money reaches them"
      (components/how-it-works/step3-flow.js), with a camera panning down a tall world:
      1. The profile card: a cover that's a flat map zoomed in on the UK with a pin on it, the investor's photo half
         over the cover's bottom edge, "NRI/OCI investor, based in the UK", and the three borrowers they're investing in.
      2. A line draws down from the card to "Payment due towards your investment", whose "Pay Now" is clicked.
      3. Below it, the "NRO account in India" chip (bank icon) where How it works has its second date; curved branches
         run from it to the three borrowers. Only once Pay Now is clicked do the ₹ coins travel down, through the NRO
         account and along each branch, leaving a green trail; each borrower's ring turns green as the money arrives.
      The map is drawn here from rough coastlines (longitude, latitude), not traced from a real map. ── */

// Flat map: x = (lon + 20) × 6, y = (57.5 − lat) × 10, so 34° of longitude by 10° of latitude fills a 204 × 100 box.
const MAP_X = (lon: number) => (lon + 20) * 6;
const MAP_Y = (lat: number) => (57.5 - lat) * 10;
const mapPath = (pts: [number, number][]) => `M${pts.map(([lon, lat]) => `${MAP_X(lon).toFixed(1)} ${MAP_Y(lat).toFixed(1)}`).join("L")}Z`;
const GREAT_BRITAIN: [number, number][] = [
  [-5.7, 50.06], [-5.2, 49.96], [-4.1, 50.37], [-2.45, 50.6], [-1.3, 50.78], [-0.14, 50.82], [1.37, 51.13], [1.44, 51.38], [0.6, 51.5],
  [1.15, 51.79], [1.58, 52.08], [1.75, 52.48], [1.3, 52.93], [0.3, 52.85], [0.34, 53.15], [0.12, 53.58], [-0.08, 54.12], [-0.6, 54.49],
  [-1.2, 54.68], [-1.6, 55.4], [-2.0, 55.77], [-2.5, 56.0], [-3.2, 55.98], [-2.58, 56.28], [-2.97, 56.46], [-2.1, 57.15], [-2.0, 57.69],
  [-3.2, 57.68], [-4.2, 57.5], [-3.77, 57.86], [-3.08, 58.44], [-3.37, 58.67], [-5.0, 58.62], [-5.4, 58.1], [-5.9, 57.5], [-5.6, 57.1],
  [-6.2, 56.7], [-5.6, 56.3], [-5.8, 55.3], [-4.65, 55.46], [-5.15, 54.9], [-4.86, 54.64], [-3.4, 54.95], [-3.55, 54.64], [-3.2, 54.1],
  [-3.0, 53.4], [-3.8, 53.32], [-4.63, 53.3], [-4.78, 52.77], [-4.08, 52.41], [-5.3, 51.88], [-5.05, 51.7], [-3.95, 51.6], [-3.17, 51.48],
  [-2.7, 51.5], [-3.48, 51.2], [-4.53, 51.02], [-4.94, 50.54],
];
const IRELAND: [number, number][] = [
  [-7.37, 55.38], [-6.15, 55.22], [-5.9, 54.6], [-5.5, 54.4], [-6.3, 54.0], [-6.1, 53.35], [-6.0, 52.98], [-6.36, 52.17], [-7.0, 52.13],
  [-8.3, 51.8], [-9.8, 51.45], [-10.4, 52.15], [-9.9, 52.56], [-9.05, 53.27], [-10.2, 53.4], [-10.1, 54.0], [-10.0, 54.25], [-8.6, 54.3],
  [-8.4, 54.65], [-8.3, 55.15],
];
const CONTINENT: [number, number][] = [
  [-2.3, 46.8], [-2.6, 47.3], [-3.3, 47.65], [-4.2, 47.8], [-4.75, 48.3], [-4.6, 48.65], [-3.6, 48.8], [-2.8, 48.55], [-1.6, 48.65],
  [-1.95, 49.7], [-1.3, 49.7], [-1.1, 49.4], [0.1, 49.45], [0.2, 49.7], [1.1, 49.95], [1.6, 50.25], [1.6, 50.9], [1.85, 50.95], [2.5, 51.1],
  [3.4, 51.4], [3.9, 51.45], [4.1, 51.9], [4.5, 52.3], [4.75, 52.95], [5.6, 53.3], [6.9, 53.45], [7.3, 53.7], [8.0, 53.55], [8.7, 53.85],
  [8.9, 54.3], [8.6, 54.9], [8.65, 55.5], [8.15, 56.0], [8.15, 56.6], [8.6, 57.1], [9.6, 57.45], [10.6, 57.75], [10.5, 57.2], [10.3, 56.5],
  [10.9, 56.4], [10.2, 55.85], [9.7, 55.5], [9.8, 54.9], [10.0, 54.6], [10.1, 54.35], [10.9, 53.95], [12.1, 54.15], [13.0, 54.4],
  [13.4, 54.6], [14.25, 53.9], [16, 54.3], [16, 46], [-2.3, 46],
];
const ZEALAND: [number, number][] = [[11.0, 55.7], [11.5, 56.0], [12.6, 56.0], [12.6, 55.6], [12.0, 55.0], [11.2, 55.2]];
const SWEDEN: [number, number][] = [[11.8, 58.5], [11.9, 57.7], [12.4, 56.9], [12.9, 56.4], [12.6, 56.1], [12.9, 55.4], [14.2, 55.4], [14.35, 56.0], [16, 56.1], [16, 58.5]];
const LAND = [GREAT_BRITAIN, IRELAND, CONTINENT, ZEALAND, SWEDEN].map(mapPath);
const LONDON = { x: MAP_X(-0.13), y: MAP_Y(51.5) };

const BORROWERS = ["/how-it-works/s1-av3.webp", "/how-it-works/s1-av7.webp", "/how-it-works/s1-av12.webp"];
const COIN = "#F5C542";
const COIN_INK = "#A4520E";

// The world, in stage px (432 wide, the stage minus its padding). Everything hangs off the centre line.
const CX = INNER_W / 2; // 216
const CARD_W = 320;
const CARD_H = 244;
const PAY_TOP = 316;
const PAY_H = 152;
const PAY_BOT = PAY_TOP + PAY_H; // 468
const CHIP_TOP = 524;
const CHIP_BOT = 564;
const B_TOP = 668; // top of the borrowers' rings
const B_SIZE = 64;
const WORLD_H = 748;
const B_XS = [CX - 136, CX, CX + 136];
const CAM_END = -(WORLD_H - (STAGE_H - 2 * PAD)); // -440: the last frame shows the chip down to the borrowers

/** A branch from the NRO chip to a borrower, curving like How it works' step 3. */
const branchD = (x: number) => {
  if (x === CX) return `M${CX} ${CHIP_BOT}L${CX} ${B_TOP}`;
  const mx = (CX + x) / 2;
  return `M${CX} ${CHIP_BOT}C${CX} ${CHIP_BOT} ${CX} ${CHIP_BOT + 34} ${mx} ${CHIP_BOT + 52}C${x} ${CHIP_BOT + 70} ${x} ${B_TOP} ${x} ${B_TOP}`;
};
const routeD = (x: number) => `M${CX} ${PAY_BOT}L${CX} ${CHIP_BOT}${branchD(x).slice(`M${CX} ${CHIP_BOT}`.length)}`;

// One easing for the coin and the green trail behind it, so the trail stays under the coin.
const ioCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** A coin's route (pay card → NRO chip → branch → borrower) as eased, evenly-timed keyframes. */
function coinRoute(x: number) {
  type P = [number, number];
  const cubic = (a: P, b: P, c: P, d: P, t: number): P => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k]) as P;
  };
  const pts: P[] = [];
  for (let i = 0; i <= 20; i++) pts.push([CX, PAY_BOT + ((CHIP_BOT - PAY_BOT) * i) / 20]);
  if (x === CX) {
    for (let i = 1; i <= 20; i++) pts.push([CX, CHIP_BOT + ((B_TOP - CHIP_BOT) * i) / 20]);
  } else {
    const mx = (CX + x) / 2;
    for (let i = 1; i <= 30; i++) pts.push(cubic([CX, CHIP_BOT], [CX, CHIP_BOT], [CX, CHIP_BOT + 34], [mx, CHIP_BOT + 52], i / 30));
    for (let i = 1; i <= 30; i++) pts.push(cubic([mx, CHIP_BOT + 52], [x, CHIP_BOT + 70], [x, B_TOP], [x, B_TOP], i / 30));
  }
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = len[len.length - 1];
  const xs: number[] = [];
  const ys: number[] = [];
  const N = 28;
  for (let k = 0; k <= N; k++) {
    const s = ioCubic(k / N) * L;
    let j = 1;
    while (j < len.length - 1 && len[j] < s) j++;
    const u = (s - len[j - 1]) / (len[j] - len[j - 1] || 1);
    xs.push(pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * u);
    ys.push(pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * u);
  }
  return { xs, ys };
}
const COIN_ROUTES = B_XS.map(coinRoute);

/** A line that draws itself in, hidden until it starts (so its round end doesn't sit there as a dot). */
function DrawPath({ d, color, at, dur, ease = "easeOut", reduce }: { d: string; color: string; at: number; dur: number; ease?: "easeOut" | ((t: number) => number); reduce: boolean }) {
  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ pathLength: { duration: dur, delay: at, ease }, opacity: { duration: 0.01, delay: at } }}
    />
  );
}

// Timeline (s).
const N_LINE1 = [1.4, 2.0];
const N_PAY_IN = 1.8;
const N_CLICK = 2.9;
const N_PAID = 3.2; // "Pay Now" gives way to "Payment sent"
const N_LINE2 = 3.3; // the light lines below the pay card draw in as the camera moves down
const N_COIN = 3.4; // the coins only leave once Pay Now has been clicked
const N_COIN_DUR = 1.7;
const N_STAGGER = 0.12;
const N_WAVE = 0.55;
const N_CAM = { t: [0, 1.4, 2.3, 3.3, 4.3], y: [0, 0, -196, -196, CAM_END] };
const NRI_T = 7600; // ms per loop

export function NriAnim() {
  const reduce = !!useReducedMotion();
  const [loop, setLoop] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setLoop((l) => l + 1), NRI_T);
    return () => clearTimeout(t);
  }, [loop, reduce]);
  const camDur = N_CAM.t[N_CAM.t.length - 1];

  return (
    <Stage label="An NRI or OCI investor based in the UK is investing in three rural businesses. They pay what’s due from their NRO account in India, and the money goes from that account to the three borrowers.">
      {/* No initial={false} here: it would also switch off every entrance inside the loop. */}
      <AnimatePresence mode="wait">
        <motion.div key={loop} className="absolute inset-0" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <motion.div
            className="absolute"
            style={{ left: PAD, top: PAD, width: INNER_W, height: WORLD_H }}
            initial={reduce ? { y: CAM_END } : { y: 0 }}
            animate={reduce ? { y: CAM_END } : { y: N_CAM.y }}
            transition={{ duration: camDur, times: N_CAM.t.map((t) => t / camDur), ease: ["linear", "easeInOut", "linear", "easeInOut"] }}
          >
            {/* The lines: light green, drawn in; green trails follow the coins after Pay Now. */}
            <svg className="absolute inset-0 overflow-visible" width={INNER_W} height={WORLD_H} viewBox={`0 0 ${INNER_W} ${WORLD_H}`} fill="none">
              <DrawPath d={`M${CX} ${CARD_H}V${PAY_TOP}`} color={RING} at={N_LINE1[0]} dur={N_LINE1[1] - N_LINE1[0]} reduce={reduce} />
              <DrawPath d={`M${CX} ${PAY_BOT}V${CHIP_TOP}`} color={RING} at={N_LINE2} dur={0.4} reduce={reduce} />
              {B_XS.map((x, i) => (
                <DrawPath key={x} d={branchD(x)} color={RING} at={N_LINE2 + 0.4 + i * 0.05} dur={0.5} reduce={reduce} />
              ))}
              {B_XS.map((x, i) => (
                <DrawPath key={`trail-${x}`} d={routeD(x)} color={GREEN} at={N_COIN + i * N_STAGGER} dur={N_COIN_DUR} ease={ioCubic} reduce={reduce} />
              ))}
            </svg>

            {/* 1 · The profile card, as before (without its button). */}
            <motion.div
              className="absolute overflow-hidden rounded-[16px] bg-white shadow-[0_8px_24px_rgba(41,45,54,0.08)]"
              style={{ left: CX - CARD_W / 2, top: 0, width: CARD_W, height: CARD_H }}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* The cover: a flat map zoomed in on the UK, with a pin on it. */}
              <div className="relative h-[96px] w-full" style={{ backgroundColor: "#CFE8F5" }}>
                <svg viewBox="0 0 204 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
                  {LAND.map((d, i) => (
                    <path key={i} d={d} fill="#F4F1E8" stroke="#BFD9E6" strokeWidth="0.6" strokeLinejoin="round" />
                  ))}
                  <motion.g initial={reduce ? false : { y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 380, damping: 16, delay: 0.35 }}>
                    <ellipse cx={LONDON.x} cy={LONDON.y + 0.5} rx="2.6" ry="1" fill="rgba(41,45,54,0.25)" />
                    <path d={`M${LONDON.x} ${LONDON.y}c-1.2-2.2-4.6-5.4-4.6-8.6a4.6 4.6 0 0 1 9.2 0c0 3.2-3.4 6.4-4.6 8.6z`} fill={RED} />
                    <circle cx={LONDON.x} cy={LONDON.y - 8.6} r="1.7" fill="#fff" />
                  </motion.g>
                </svg>
              </div>
              <div className="flex flex-col gap-3 px-5 pb-5">
                {/* The photo, half over the cover's bottom edge. */}
                <span className="-mt-8">
                  <Face size={64}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar */}
                    <img src="/images/why2-faq/nri-investor.webp" alt="" className="absolute inset-0 size-full object-cover" />
                  </Face>
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="font-display text-[18px] font-bold leading-[24px]" style={{ color: INK }}>
                    NRI/OCI investor
                  </p>
                  <span className="font-display text-[13px] font-medium leading-[18px]" style={{ color: INK_2 }}>
                    Based in the UK
                  </span>
                </div>
                {/* The three borrowers they're investing in, small and overlapping. */}
                <motion.div className="flex items-center gap-2" initial={reduce ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.7, ease: EASE }}>
                  <span className="flex">
                    {BORROWERS.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element -- small static avatar
                      <img key={src} src={src} alt="" className="size-7 rounded-full object-cover shadow-[0_0_0_2px_#fff]" style={{ backgroundColor: AV_BG, marginLeft: i ? -7 : 0 }} />
                    ))}
                  </span>
                  <span className="font-display text-[13px] font-bold" style={{ color: INK_2 }}>
                    Investing in 3 rural businesses
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* 2 · What's due, and Pay Now. */}
            <motion.div
              className="absolute flex flex-col items-center rounded-[12px] bg-white px-4 pb-4 pt-5 shadow-[0_8px_24px_rgba(41,45,54,0.08)]"
              style={{ left: CX - CARD_W / 2, top: PAY_TOP, width: CARD_W, height: PAY_H }}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: N_PAY_IN, ease: EASE }}
            >
              <span className="font-display text-[24px] font-bold leading-[32px] tabular-nums" style={{ color: INK }}>
                ₹7,677
              </span>
              <span className="mt-1 font-display text-[11px] font-medium uppercase leading-[16px] tracking-[0.08em]" style={{ color: INK }}>
                Payment due towards your investment
              </span>
              <ClickButton at={N_CLICK} reduce={reduce} className="mt-auto h-12 w-full text-[15px] leading-[20px]">
                <span className="grid">
                  <motion.span className="col-start-1 row-start-1 text-center" initial={false} animate={{ opacity: reduce ? 0 : [1, 1, 0] }} transition={{ duration: N_PAID + 0.2, times: [0, N_PAID / (N_PAID + 0.2), 1] }}>
                    Pay Now
                  </motion.span>
                  <motion.span className="col-start-1 row-start-1 flex items-center justify-center gap-1.5" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, delay: N_PAID + 0.1 }}>
                    <svg viewBox="0 0 24 24" className="size-[16px]" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Payment sent
                  </motion.span>
                </span>
              </ClickButton>
            </motion.div>

            {/* 3 · The NRO account in India, where How it works has its second date. */}
            <div className="absolute inset-x-0 flex justify-center" style={{ top: CHIP_TOP }}>
              <motion.span
                className="flex h-10 items-center gap-2 rounded-full bg-white px-4"
                style={{ boxShadow: `0 0 0 8px ${PANEL}` }}
                initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, delay: N_LINE2 + 0.3, ease: EASE }}
              >
                <Icon name="bank" size={20} />
                <span className="font-display text-[12px] font-bold uppercase leading-[16px] tracking-[0.08em]" style={{ color: INK }}>
                  NRO account in India
                </span>
              </motion.span>
            </div>

            {/* The three borrowers; each ring turns green as their money arrives. */}
            {B_XS.map((x, i) => (
              <span key={x} className="absolute" style={{ left: x - B_SIZE / 2, top: B_TOP, width: B_SIZE, height: B_SIZE }}>
                <motion.span
                  className="absolute -inset-[5px] rounded-full border-[3.5px]"
                  initial={false}
                  animate={{ borderColor: reduce ? GREEN : [RING, RING, GREEN] }}
                  transition={{ duration: N_COIN + i * N_STAGGER + N_COIN_DUR + 0.2, times: [0, 0.94, 1] }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar */}
                <img src={BORROWERS[i]} alt="" className="absolute inset-0 size-full rounded-full object-cover shadow-[0_0_0_2px_#fff]" style={{ backgroundColor: AV_BG }} />
              </span>
            ))}

            {/* ₹ coins: yellow, with a dark orange ₹; two waves down each route, only after Pay Now. */}
            {!reduce &&
              COIN_ROUTES.flatMap((r, i) =>
                [0, 1].map((wave) => {
                  const delay = N_COIN + wave * N_WAVE + i * N_STAGGER;
                  return (
                    <motion.span
                      key={`${i}-${wave}`}
                      className="absolute left-0 top-0 -ml-[11px] -mt-[11px] flex size-[22px] items-center justify-center rounded-full border-[1.5px] border-white font-display text-[12px] font-extrabold"
                      style={{ backgroundColor: COIN, color: COIN_INK }}
                      initial={{ x: r.xs[0], y: r.ys[0], opacity: 0 }}
                      animate={{ x: r.xs, y: r.ys, opacity: [0, 1, 1, 0] }}
                      transition={{
                        x: { duration: N_COIN_DUR, delay, ease: "linear" },
                        y: { duration: N_COIN_DUR, delay, ease: "linear" },
                        opacity: { duration: N_COIN_DUR, delay, times: [0, 0.08, 0.88, 1] },
                      }}
                    >
                      ₹
                    </motion.span>
                  );
                }),
              )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Stage>
  );
}
