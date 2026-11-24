"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { INDIA_REACH } from "./indiaReach";

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
      1. Sign up: First name | Last name, Phone number, Email address, each field typing in a sample value (John,
         Appleseed, (XXX) XXX-XXXX, user@example.com) one character at a time, one field after another; then
         "Proceed to KYC →" is clicked.
      2. KYC: "KYC uploads, per RBI regulation", an address proof and a PAN card that load and are ticked; then
         "Sign up" is clicked.
      3. A big tick and "You’re ready to invest". ── */

const GS_SCENES = [3400, 2900, 2600]; // ms per screen
const CHAR = 0.035; // s per X
const FIELD_GAP = 0.12; // s between one field finishing and the next starting
const TYPE_AT = 0.5;
const GS_FIELDS = [
  { label: "First name", text: "John" },
  { label: "Last name", text: "Appleseed" },
  { label: "Phone number", text: "(XXX) XXX-XXXX" },
  { label: "Email address", text: "user@example.com" },
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
        {/* The sample values sit at 64% and appear one character at a time, left to right. */}
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
    <Stage label="A borrower repays month by month. She misses the fifth repayment and it turns red. The on-ground partner steps in, that repayment is given more time, and she completes the loan. Most delays are worked out with the impact partner. Repayments aren’t guaranteed.">
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
            Most delays are worked out with the impact partner.
            <br />
            Repayments aren’t guaranteed.
          </motion.p>
        )}
      </AnimatePresence>
    </Stage>
  );
}

/* ── 2 · I'm an NRI/OCI. Can I still invest? One continuous story, after How it works' "Your money reaches them"
      (components/how-it-works/step3-flow.js), with a camera panning down a tall world:
      1. The profile card: a cover that's a simple map of the whole of Europe with a pin on the UK, the investor's
         photo half over the cover's bottom edge, "NRI/OCI investor, based in the UK", and the three borrowers they're
         investing in.
      2. A line draws down from the card to "Payment due towards your investment", whose "Pay Now" is clicked and
         turns to "Payment processing" (not a completed state).
      3. Below it, the "NRO account in India" chip (bank icon) where How it works has its second date; curved branches
         run from it to the three borrowers. Once Pay Now is clicked the ₹ coins leave from the NRO account and travel
         along each branch, leaving a green trail; each borrower's ring turns green as the money arrives.
      The map is drawn here from rough coastlines (longitude, latitude), not traced from a real map. ── */

// Flat map of Europe in a 333 × 100 box (the cover's 320 × 96 shape): 39° of latitude (72.5°N to 33.5°N) fills the
// height, longitude is squeezed by cos 53° so the shapes aren't stretched, and 10°E sits at the centre.
const MAP_K = 100 / 39;
const MAP_X = (lon: number) => 166.5 + (lon - 10) * 0.6 * MAP_K;
const MAP_Y = (lat: number) => (72.5 - lat) * MAP_K;
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
// Mainland Europe with Scandinavia, clockwise from Gibraltar; the east edge is cut at 45°E.
const MAINLAND: [number, number][] = [
  // Iberia and France's Atlantic coast
  [-5.6, 36.0], [-6.3, 36.8], [-7.4, 37.2], [-8.9, 37.0], [-8.8, 38.7], [-9.5, 39.4], [-8.7, 41.2], [-8.9, 42.6], [-9.3, 43.0],
  [-7.7, 43.7], [-5.0, 43.5], [-1.8, 43.4], [-1.2, 44.6], [-1.2, 46.2], [-2.2, 47.1], [-4.5, 47.9], [-4.7, 48.5], [-3.0, 48.8],
  [-1.6, 48.7], [-1.9, 49.7], [-1.2, 49.4], [0.2, 49.5], [1.6, 50.2], [1.8, 50.9],
  // The Low Countries, Jutland and the southern Baltic
  [3.2, 51.3], [4.2, 52.0], [4.8, 53.0], [6.9, 53.4], [8.5, 53.6], [8.7, 54.9], [8.2, 56.6], [10.4, 57.7], [10.5, 56.5], [10.0, 55.0],
  [10.9, 54.0], [12.5, 54.4], [14.3, 53.9], [16.5, 54.5], [18.6, 54.6], [19.9, 54.4], [21.1, 55.3], [21.0, 56.5], [22.1, 57.5],
  [24.3, 57.2], [23.6, 58.5], [24.4, 59.4], [28.0, 59.5],
  // Finland, round the Gulf of Bothnia, and down Sweden
  [29.5, 60.1], [26.5, 60.4], [22.9, 59.9], [21.4, 60.9], [21.4, 62.6], [25.4, 65.1], [22.2, 65.8], [21.2, 64.8], [19.0, 63.4],
  [17.4, 62.3], [17.3, 60.6], [18.9, 59.9], [18.0, 59.0], [16.6, 57.0], [16.0, 56.2], [14.2, 55.4], [12.9, 55.4], [12.6, 56.2],
  [11.8, 57.7], [11.0, 58.9],
  // Norway up to the North Cape, then Russia's north coast
  [10.5, 59.5], [9.5, 58.9], [8.0, 58.1], [6.0, 58.1], [5.2, 59.3], [5.0, 61.0], [5.3, 62.0], [7.0, 62.8], [8.5, 63.5], [10.5, 64.5],
  [12.5, 66.0], [14.0, 67.5], [15.5, 68.5], [18.0, 69.8], [21.0, 70.3], [25.0, 71.1], [28.0, 71.0], [31.0, 70.3], [30.0, 69.7],
  [33.0, 69.3], [36.5, 69.1], [41.0, 67.5], [40.0, 66.2], [37.0, 66.0], [34.8, 64.5], [37.2, 63.8], [40.5, 64.6], [44.0, 66.0],
  [45.0, 66.5],
  // The east edge, the Black Sea's north coast and the Balkans
  [45.0, 45.0], [39.0, 44.3], [37.8, 44.7], [36.5, 45.3], [35.5, 45.1], [33.5, 44.5], [32.5, 45.4], [33.5, 46.0], [30.7, 46.5],
  [29.7, 45.2], [28.6, 43.7], [27.9, 42.0], [29.0, 41.2], [28.0, 41.0], [26.2, 40.3], [24.0, 40.8], [23.4, 39.9], [22.6, 40.4],
  [22.9, 39.3], [23.3, 38.2], [24.0, 38.0], [22.9, 37.5], [23.1, 36.5], [22.4, 36.4], [21.7, 36.8], [21.1, 37.8], [21.6, 38.4],
  [20.7, 39.0], [20.0, 39.7], [19.4, 40.4], [19.4, 41.9], [18.5, 42.5], [17.0, 43.4], [15.2, 44.3], [14.0, 44.9], [13.6, 45.6],
  // Italy, the Riviera and Spain's Mediterranean coast
  [12.3, 45.3], [12.4, 44.2], [13.6, 43.5], [14.7, 42.1], [16.1, 41.4], [18.5, 40.2], [18.0, 39.9], [17.0, 40.5], [16.5, 39.7],
  [17.1, 39.0], [16.1, 38.0], [15.6, 38.0], [15.8, 39.5], [14.9, 40.2], [14.0, 40.8], [12.4, 41.6], [11.1, 42.4], [10.1, 44.0],
  [8.7, 44.4], [7.5, 43.8], [6.2, 43.1], [4.6, 43.4], [3.1, 43.1], [3.2, 41.9], [0.9, 41.0], [-0.3, 39.5], [0.2, 38.7], [-0.7, 37.6],
  [-2.1, 36.7], [-4.4, 36.7],
];
const ZEALAND: [number, number][] = [[11.0, 55.7], [11.5, 56.0], [12.6, 56.0], [12.6, 55.6], [12.0, 55.0], [11.2, 55.2]];
const ICELAND: [number, number][] = [[-22.0, 63.9], [-24.0, 65.5], [-22.5, 66.4], [-16.0, 66.5], [-13.6, 65.1], [-15.0, 64.2], [-18.0, 63.4]];
const SICILY: [number, number][] = [[12.4, 37.8], [13.3, 38.2], [15.6, 38.3], [15.1, 36.7]];
const SARDINIA: [number, number][] = [[8.4, 39.0], [8.2, 40.9], [9.2, 41.2], [9.8, 40.5], [9.6, 39.1]];
const CORSICA: [number, number][] = [[8.6, 41.4], [8.6, 42.6], [9.4, 43.0], [9.5, 42.0]];
const CRETE: [number, number][] = [[23.5, 35.6], [26.3, 35.3], [26.0, 35.0], [24.0, 35.1]];
const LAND = [MAINLAND, GREAT_BRITAIN, IRELAND, ICELAND, ZEALAND, SICILY, SARDINIA, CORSICA, CRETE].map(mapPath);
const LONDON = { x: MAP_X(-0.13), y: MAP_Y(51.5) };

// The cover zooms from the whole of Europe into the UK. Both views keep the map's cut east edge (45°E) on the cover's
// right edge, and the zoomed view puts London in the middle, so its width is twice London's distance from that edge.
// Animating the viewBox linearly keeps the right edge fixed all the way through.
const MAP_EAST = MAP_X(45);
const ZOOM_W = 2 * (MAP_EAST - LONDON.x);
const ZOOM_H = (ZOOM_W * 100) / 333;
const MAP_VIEW_FROM = `${MAP_EAST - 333} 0 333 100`;
const MAP_VIEW_TO = `${MAP_EAST - ZOOM_W} ${LONDON.y - ZOOM_H / 2} ${ZOOM_W} ${ZOOM_H}`;
const N_ZOOM = [0.5, 1.6]; // s: the zoom; the pin drops once it's done

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
// One easing for the coin and the green trail behind it, so the trail stays under the coin.
const ioCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The green trail: from the middle of the NRO chip (hidden behind it) down a branch to a borrower. */
const CHIP_MID = (CHIP_TOP + CHIP_BOT) / 2;
const trailD = (x: number) => `M${CX} ${CHIP_MID}L${CX} ${CHIP_BOT}${branchD(x).slice(`M${CX} ${CHIP_BOT}`.length)}`;

/** A coin's route (middle of the NRO chip → branch → borrower) as eased, evenly-timed keyframes. */
function coinRoute(x: number) {
  type P = [number, number];
  const cubic = (a: P, b: P, c: P, d: P, t: number): P => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k]) as P;
  };
  const pts: P[] = [];
  for (let i = 0; i <= 6; i++) pts.push([CX, CHIP_MID + ((CHIP_BOT - CHIP_MID) * i) / 6]);
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

// Timeline (s). Everything after the card waits N_HOLD for the map's zoom and pin.
const N_HOLD = 1.0;
const N_LINE1 = [1.4 + N_HOLD, 2.0 + N_HOLD];
const N_PAY_IN = 1.8 + N_HOLD;
const N_CLICK = 2.9 + N_HOLD;
const N_PAID = 3.2 + N_HOLD; // "Pay Now" gives way to "Payment processing"
const N_LINE2 = 3.3 + N_HOLD; // the light lines below the pay card draw in as the camera moves down
const N_COIN = 4.2 + N_HOLD; // the coins leave the NRO account once it's in view (after Pay Now has been clicked)
const N_COIN_DUR = 1.5;
const N_STAGGER = 0.12;
const N_WAVE = 0.55;
const N_CAM = { t: [0, 1.4, 2.3, 3.3, 4.3].map((t) => (t ? t + N_HOLD : 0)), y: [0, 0, -196, -196, CAM_END] };
const NRI_T = 7800 + N_HOLD * 1000; // ms per loop

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
                <DrawPath key={`trail-${x}`} d={trailD(x)} color={GREEN} at={N_COIN + i * N_STAGGER} dur={N_COIN_DUR} ease={ioCubic} reduce={reduce} />
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
              {/* The cover: a simple map of Europe, its cut east edge on the cover's right edge, that zooms in until the
                  UK sits in the middle; then a pin drops on it. */}
              <div className="relative h-[96px] w-full" style={{ backgroundColor: "#CFE8F5" }}>
                <motion.svg
                  viewBox={reduce ? MAP_VIEW_TO : MAP_VIEW_FROM}
                  preserveAspectRatio="xMidYMid slice"
                  className="absolute inset-0 size-full"
                  initial={false}
                  animate={reduce ? undefined : { viewBox: MAP_VIEW_TO }}
                  transition={{ duration: N_ZOOM[1] - N_ZOOM[0], delay: N_ZOOM[0], ease: "easeInOut" }}
                >
                  {LAND.map((d, i) => (
                    <path key={i} d={d} fill="#F4F1E8" stroke="#BFD9E6" strokeWidth="0.8" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  ))}
                </motion.svg>
                {/* The pin, in cover px, at the centre (where London ends up). */}
                <svg viewBox="0 0 320 96" className="absolute inset-0 size-full overflow-visible">
                  <g transform="translate(160 48) scale(1.5)">
                    <motion.g initial={reduce ? false : { y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 380, damping: 16, delay: N_ZOOM[1] }}>
                      <ellipse cx={0} cy={0.5} rx="2.6" ry="1" fill="rgba(41,45,54,0.25)" />
                      <path d="M0 0c-1.2-2.2-4.6-5.4-4.6-8.6a4.6 4.6 0 0 1 9.2 0c0 3.2-3.4 6.4-4.6 8.6z" fill={RED} />
                      <circle cx={0} cy={-8.6} r="1.7" fill="#fff" />
                    </motion.g>
                  </g>
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
                  {/* In progress, not done: no tick, and three dots that keep pulsing. */}
                  <motion.span className="col-start-1 row-start-1 flex items-center justify-center" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, delay: N_PAID + 0.1 }}>
                    Payment processing
                    <span className="inline-flex w-[18px]">
                      {[0, 1, 2].map((d) => (
                        <motion.span key={d} initial={false} animate={reduce ? undefined : { opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: N_PAID + 0.1 + d * 0.18 }}>
                          .
                        </motion.span>
                      ))}
                    </span>
                  </motion.span>
                </span>
              </ClickButton>
            </motion.div>

            {/* ₹ coins: yellow, with a dark orange ₹; two waves down each route, only after Pay Now. They're drawn before
                the chip so they start hidden behind its middle, flow out down the branches, and shrink to nothing as
                they reach each borrower. */}
            {!reduce &&
              COIN_ROUTES.flatMap((r, i) =>
                [0, 1].map((wave) => {
                  const delay = N_COIN + wave * N_WAVE + i * N_STAGGER;
                  return (
                    <motion.span
                      key={`${i}-${wave}`}
                      className="absolute left-0 top-0 -ml-[11px] -mt-[11px] flex size-[22px] items-center justify-center rounded-full border-[1.5px] border-white font-display text-[12px] font-extrabold"
                      style={{ backgroundColor: COIN, color: COIN_INK }}
                      initial={{ x: r.xs[0], y: r.ys[0], opacity: 0, scale: 1 }}
                      animate={{ x: r.xs, y: r.ys, opacity: 1, scale: [1, 1, 0] }}
                      transition={{
                        x: { duration: N_COIN_DUR, delay, ease: "linear" },
                        y: { duration: N_COIN_DUR, delay, ease: "linear" },
                        opacity: { duration: 0.01, delay },
                        scale: { duration: N_COIN_DUR, delay, times: [0, 0.8, 1], ease: "easeIn" },
                      }}
                    >
                      ₹
                    </motion.span>
                  );
                }),
              )}

            {/* 3 · The NRO account in India, where How it works has its second date. */}
            <div className="absolute inset-x-0 flex justify-center" style={{ top: CHIP_TOP }}>
              <motion.span
                className="flex h-10 items-center gap-2 rounded-full bg-white px-4"
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
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Stage>
  );
}

/* ── 4 · How does Rang De have such a wide pan-India reach? Three scenes on a loop:
      1. Rang De's logo ("Rang De team") and an impact partner (a dark blue ring with a dot) joined by a grey line that
         fills blue from Rang De to the partner. Light blue radar rings (64%) then spread from the partner, and the tiny
         borrower faces around it light up as each ring passes.
      2. The camera zooms into one borrower: her face grows into the avatar of a simple borrower card (How it works'
         "you choose who you lend to": name, what the loan is for, key details, the goal and Invest).
      3. The card zooms out into a grey map of India, Rang De's logo in the middle and 100 dark blue partner dots, each
         joined to the logo by a hairline that fills blue outward from the logo.
      Built to stay light: the 100 lines are one path, and the blue fill is a copy of it revealed by one growing circle,
      so the whole map is one animated value rather than 100. ── */

const NAVY = "#0A2D72"; // --color-dashboard-community-navy
const BLUE = "#0DAADE"; // --color-primary-100
const BLUE_64 = "#0DAADEA3"; // --color-primary-64
const GREY_24 = "#292D363D"; // --color-text-grey-24
const GREY_64 = "#292D36A3"; // --color-text-grey-64
const LAND_GREY = "#D9DCE2";
const LOGO_RATIO = 44.8819 / 57.3041; // public/brand/rangde-logo.svg

const R_PHASES = [4700, 3200, 5200]; // ms: radar, borrower card, map
const R_ZOOM = 1.0; // s: scene 1 → 2

// Scene 1, in stage px.
const R_LOGO = { x: 96, y: 160, w: 80 };
const R_PART = { x: 300, y: 160, r: 15 };
const R_LINE = [R_LOGO.x + R_LOGO.w / 2 + 12, R_PART.x - R_PART.r - 12];
const R_FILL = [0.6, 1.4]; // s
const R_RINGS = [1.4, 2.2, 3.0]; // s: when each radar ring leaves the partner
const R_RING_DUR = 1.6;
const R_MAX = 190;
const R_DOT = 20;
const R_HIT = (d: number) => ((d - R_PART.r) / (R_MAX - R_PART.r)) * R_RING_DUR; // s after a ring leaves, for distance d
const R_BORROWERS = [
  { dx: 70, dy: -40, src: "/how-it-works/s1-av1.webp" },
  { dx: 110, dy: 25, src: "/how-it-works/s1-av2.webp" },
  { dx: 40, dy: 80, src: "/how-it-works/s1-av4.webp" },
  { dx: -60, dy: -70, src: "/how-it-works/s1-av5.webp" },
  { dx: 10, dy: -105, src: "/how-it-works/s1-av6.webp" },
  { dx: 95, dy: -95, src: "/how-it-works/s1-av7.webp" }, // Rekha Bai, the one the camera zooms into
  { dx: -95, dy: 70, src: "/how-it-works/s1-av8.webp" },
  { dx: 150, dy: -10, src: "/how-it-works/s1-av9.webp" },
  { dx: -25, dy: 130, src: "/how-it-works/s1-av10.webp" },
  { dx: 125, dy: 105, src: "/how-it-works/s1-av11.webp" },
  { dx: -125, dy: -45, src: "/how-it-works/s1-av13.webp" },
  { dx: 70, dy: 150, src: "/how-it-works/s1-av14.webp" },
].map((b) => ({ ...b, x: R_PART.x + b.dx, y: R_PART.y + b.dy, d: Math.hypot(b.dx, b.dy) }));
const REKHA = R_BORROWERS[5];

// Scene 2: the borrower card, centred; its avatar's centre is where Rekha's face ends up.
const BCARD_W = 340;
const CARD_LEFT = (STAGE_W - BCARD_W) / 2;
const CARD_TOP = 84;
const CARD_AV = 60;
const CARD_AV_LOCAL = { x: BCARD_W - 20 - CARD_AV / 2, y: 20 + CARD_AV / 2 };
const CARD_AV_AT = { x: CARD_LEFT + CARD_AV_LOCAL.x, y: CARD_TOP + CARD_AV_LOCAL.y };
const R_SCALE = CARD_AV / R_DOT;

// Scene 3: the map, 300px tall and centred; the logo is a fifth of its width.
const MAP_H = 300;
const MAP_S = MAP_H / INDIA_REACH.h; // stage px per map unit
const MAP_W = INDIA_REACH.w * MAP_S;
const [MC_X, MC_Y] = INDIA_REACH.centre;
const MAP_LOGO_W = MAP_W * 0.2;
const MAP_LINES = INDIA_REACH.points.map(([x, y]) => `M${MC_X} ${MC_Y}L${x} ${y}`).join("");
const MAP_REACH = Math.max(...INDIA_REACH.points.map(([x, y]) => Math.hypot(x - MC_X, y - MC_Y))) + 12;
const MAP_DOT_R = 2.2 / MAP_S; // 2.2 stage px

/** The impact partner: a dark blue ring with a dark blue dot inside. */
function PartnerMark() {
  return (
    <svg width={2 * R_PART.r + 4} height={2 * R_PART.r + 4} viewBox="-17 -17 34 34" className="block">
      <circle r={R_PART.r - 1.5} fill="#fff" stroke={NAVY} strokeWidth="3" />
      <circle r="5.5" fill={NAVY} />
    </svg>
  );
}

export function ReachAnim() {
  const reduce = !!useReducedMotion();
  const maskId = `reach-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const [{ loop, phase }, setStep] = useState({ loop: 0, phase: 0 });
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setStep((s) => (s.phase === 2 ? { loop: s.loop + 1, phase: 0 } : { loop: s.loop, phase: s.phase + 1 })), R_PHASES[phase]);
    return () => clearTimeout(t);
  }, [loop, phase, reduce]);
  const p = reduce ? 2 : phase;
  const zoom = { duration: R_ZOOM, ease: EASE };

  return (
    <Stage label="Rang De works through impact partners. A partner’s reach spreads out to the borrowers in its community, like a radar; one of them, Rekha Bai, needs funds to keep her grocery store stocked. Across India, Rang De is connected to over 100 such partners.">
      <AnimatePresence mode="wait">
        <motion.div key={loop} className="absolute inset-0" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {/* 1 · Rang De → impact partner → radar over the borrowers. On to scene 2 it zooms in on Rekha, so her face
              tracks the card's avatar exactly, and fades. */}
          {p < 2 && (
            <motion.div
              className="absolute inset-0"
              style={{ transformOrigin: `${REKHA.x}px ${REKHA.y}px` }}
              initial={false}
              animate={p === 1 ? { x: CARD_AV_AT.x - REKHA.x, y: CARD_AV_AT.y - REKHA.y, scale: R_SCALE, opacity: 0 } : { x: 0, y: 0, scale: 1, opacity: 1 }}
              transition={{ ...zoom, opacity: { duration: R_ZOOM * 0.5, delay: R_ZOOM * 0.45 } }}
            >
              <svg className="absolute inset-0 overflow-visible" width={STAGE_W} height={STAGE_H} fill="none">
                <path d={`M${R_LINE[0]} ${R_LOGO.y}H${R_LINE[1]}`} stroke={TRACK} strokeWidth="4" strokeLinecap="round" />
                <DrawPath d={`M${R_LINE[0]} ${R_LOGO.y}H${R_LINE[1]}`} color={BLUE} at={R_FILL[0]} dur={R_FILL[1] - R_FILL[0]} reduce={reduce} />
                {R_RINGS.map((at) => (
                  <motion.circle
                    key={at}
                    cx={R_PART.x}
                    cy={R_PART.y}
                    stroke={BLUE_64}
                    strokeWidth="2"
                    initial={{ r: R_PART.r, opacity: 0 }}
                    animate={{ r: R_MAX, opacity: [1, 1, 0] }}
                    transition={{ r: { duration: R_RING_DUR, delay: at, ease: "linear" }, opacity: { duration: R_RING_DUR, delay: at, times: [0, 0.6, 1] } }}
                  />
                ))}
              </svg>

              {/* Rang De's logo and "Rang De team". */}
              <div className="absolute flex flex-col items-center gap-2.5" style={{ left: R_LOGO.x - 50, top: R_LOGO.y - (R_LOGO.w * LOGO_RATIO) / 2, width: 100 }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
                <img src="/brand/rangde-logo.svg" alt="" style={{ width: R_LOGO.w, height: R_LOGO.w * LOGO_RATIO }} />
                <H6 className="text-center">
                  Rang De
                  <br />
                  team
                </H6>
              </div>

              {/* The borrowers, faint until the first radar ring reaches them; Rekha is ringed by the last one. */}
              {R_BORROWERS.map((b) => (
                <motion.span
                  key={b.src}
                  className="absolute"
                  style={{ left: b.x - R_DOT / 2, top: b.y - R_DOT / 2, width: R_DOT, height: R_DOT }}
                  initial={reduce ? false : { opacity: 0.3, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 16, delay: R_RINGS[0] + R_HIT(b.d) }}
                >
                  {b === REKHA && (
                    <motion.span
                      className="absolute -inset-[4px] rounded-full border-2"
                      style={{ borderColor: BLUE }}
                      initial={reduce ? false : { opacity: 0, scale: 1.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: R_RINGS[2] + R_HIT(b.d), ease: EASE }}
                    />
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar */}
                  <img src={b.src} alt="" className="absolute inset-0 size-full rounded-full object-cover shadow-[0_0_0_1.5px_#fff]" style={{ backgroundColor: AV_BG }} />
                </motion.span>
              ))}

              {/* The impact partner, over the rings, with "Impact partner" below. */}
              <div className="absolute flex flex-col items-center gap-2" style={{ left: R_PART.x - 50, top: R_PART.y - R_PART.r - 2, width: 100 }}>
                <PartnerMark />
                <H6 className="text-center">
                  Impact
                  <br />
                  partner
                </H6>
              </div>
            </motion.div>
          )}

          {/* 2 · The borrower card. It starts as Rekha's face (a third of its size, where her dot is) and grows into
              place as the rest of the card fades in; on to scene 3 it zooms out and fades. */}
          <motion.div
            className="absolute"
            style={{ left: CARD_LEFT, top: CARD_TOP, width: BCARD_W, transformOrigin: `${CARD_AV_LOCAL.x}px ${CARD_AV_LOCAL.y}px` }}
            initial={false}
            animate={
              p === 0
                ? { x: REKHA.x - CARD_AV_AT.x, y: REKHA.y - CARD_AV_AT.y, scale: 1 / R_SCALE, opacity: 0 }
                : p === 1
                  ? { x: 0, y: 0, scale: 1, opacity: 1 }
                  : { x: 0, y: 0, scale: 0.55, opacity: 0 }
            }
            transition={p === 1 ? { ...zoom, opacity: { duration: 0 } } : p === 2 && !reduce ? { duration: 0.6, ease: EASE } : { duration: 0 }}
          >
            <motion.div
              className="rounded-[16px] border bg-white"
              style={{ borderColor: LINE }}
              initial={false}
              animate={{ opacity: p >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5, delay: p === 1 ? R_ZOOM * 0.45 : 0 }}
            >
              <div className="flex flex-col gap-3 px-5 pb-2 pt-5">
                <p className="font-display text-[18px] font-bold leading-[24px]" style={{ width: BCARD_W - 40 - CARD_AV - 16, color: INK }}>
                  Rekha Bai <span style={{ color: GREY_64 }}>· Needs funds to keep her grocery store well stocked</span>
                </p>
                <span className="flex items-center gap-1 font-display text-[12px] font-bold uppercase leading-[16px] tracking-[0.08em]" style={{ color: GREY_64 }}>
                  Key details
                  <Icon name="chevron-down" size={14} />
                </span>
              </div>
              <div className="m-2 mt-3 flex items-center gap-4 rounded-[12px] p-2 pl-4" style={{ backgroundColor: "#F4F6EC" }}>
                <span className="font-display text-[15px] font-bold leading-[20px] tabular-nums" style={{ color: INK }}>
                  ₹1,00,000 Goal
                </span>
                <span className="flex h-11 flex-1 items-center justify-center rounded-[8px] font-display text-[16px] font-bold text-white" style={{ backgroundColor: GREEN }}>
                  Invest
                </span>
              </div>
            </motion.div>
            {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar */}
            <img src={REKHA.src} alt="" className="absolute rounded-full object-cover" style={{ left: CARD_AV_LOCAL.x - CARD_AV / 2, top: CARD_AV_LOCAL.y - CARD_AV / 2, width: CARD_AV, height: CARD_AV, backgroundColor: AV_BG }} />
          </motion.div>

          {/* 3 · India: grey land, 100 partner dots, hairlines from the logo that fill blue outward. */}
          <motion.div
            className="absolute"
            style={{ left: (STAGE_W - MAP_W) / 2, top: (STAGE_H - MAP_H) / 2, width: MAP_W, height: MAP_H }}
            initial={false}
            animate={p === 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.25 }}
            transition={p === 2 && !reduce ? { duration: 0.8, delay: 0.25, ease: EASE } : { duration: 0 }}
          >
            <svg className="absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${INDIA_REACH.w} ${INDIA_REACH.h}`} fill="none">
              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={INDIA_REACH.w} height={INDIA_REACH.h}>
                <motion.circle
                  cx={MC_X}
                  cy={MC_Y}
                  fill="#fff"
                  initial={false}
                  animate={{ r: p === 2 ? MAP_REACH : 0 }}
                  transition={p === 2 && !reduce ? { duration: 1.8, delay: 1.1, ease: "easeInOut" } : { duration: 0 }}
                />
              </mask>
              <path d={INDIA_REACH.path} fill={LAND_GREY} stroke={LAND_GREY} strokeWidth="2" strokeLinejoin="round" />
              <path d={MAP_LINES} stroke={GREY_24} strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
              <path d={MAP_LINES} stroke={BLUE} strokeWidth="0.4" vectorEffect="non-scaling-stroke" mask={`url(#${maskId})`} />
              {INDIA_REACH.points.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={MAP_DOT_R} fill={NAVY} />
              ))}
            </svg>
            {/* Rang De's logo in the middle, on a white disc so the lines start from under it. */}
            <span
              className="absolute flex items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(41,45,54,0.10)]"
              style={{ left: MC_X * MAP_S - MAP_LOGO_W * 0.65, top: MC_Y * MAP_S - MAP_LOGO_W * 0.65, width: MAP_LOGO_W * 1.3, height: MAP_LOGO_W * 1.3 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
              <img src="/brand/rangde-logo.svg" alt="" style={{ width: MAP_LOGO_W, height: MAP_LOGO_W * LOGO_RATIO }} />
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Stage>
  );
}
