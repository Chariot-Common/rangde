"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ARJUN_CHEER,
  ARJUN_PHONE,
  ARJUN_POSE_REF,
  AVATARS,
  CALENDAR,
  COIN_FLY,
  FX,
  GIFT_MACHINE,
  OFFICER,
  REKHA,
  REKHA_FACE,
  SHOP_SEW,
  SPARKLE,
  Sprite,
  type Spr,
} from "@/components/versions/CharacterHowItWorks";
import { FLAT_BG, FlatFar, FlatFurniture, FlatWalls, VILLAGE_BG, VillageBuildings, VillageFar, VillageGround } from "@/components/versions/storyWorlds";

/**
 * The FAQ pop-up illustrations (Version B), in the How it works story's style: a still from
 * Rekha's village or Arjun's flat (the same line-art worlds, storyWorlds.tsx), the same people
 * and props (the Figma asset sheets), and a few labels that sum up the answer. The world is
 * framed by height, so a wider panel (phones) simply shows more of it either side.
 */

// From the objects sheet (Figma 2470:2288), exported at 2×.
const COIN_STACK: Spr = ["objects", 2472, 808, 456, 448];
// The FAQ sheets (GPT, keyed out of their grey ground: faq-*.png, arjun-faq.png).
const PAY = {
  phone: ["faqPay", 52, 104, 300, 372],
  card: ["faqPay", 433, 192, 312, 217],
  laptop: ["faqPay", 754, 157, 383, 290],
  wallet: ["faqPay", 1208, 152, 268, 268],
  qr: ["faqPay", 53, 556, 291, 290],
  bank: ["faqPay", 366, 534, 415, 300],
  passbook: ["faqPay", 812, 555, 342, 300],
  cardNo: ["faqPay", 1162, 574, 340, 235],
} satisfies Record<string, Spr>;
const KYC = {
  id: ["faqKyc", 112, 128, 412, 300],
  lens: ["faqKyc", 616, 112, 352, 328],
  selfie: ["faqKyc", 1024, 56, 400, 460],
  seal: ["faqKyc", 136, 512, 396, 408],
  shield: ["faqKyc", 644, 532, 316, 368],
  print: ["faqKyc", 1088, 556, 280, 356],
} satisfies Record<string, Spr>;
const CUR = {
  globe: ["faqCur", 68, 136, 316, 388],
  passport: ["faqCur", 452, 164, 260, 324],
  plane: ["faqCur", 748, 196, 460, 248],
  rupee: ["faqCur", 1240, 184, 240, 248],
  notes: ["faqCur", 40, 576, 364, 268],
  dollar: ["faqCur", 444, 612, 204, 212],
  euro: ["faqCur", 683, 617, 203, 215],
  pound: ["faqCur", 902, 619, 209, 220],
  suitcase: ["faqCur", 1152, 524, 340, 336],
} satisfies Record<string, Spr>;
const PLAT = {
  office: ["faqPlat", 44, 128, 468, 332],
  handshake: ["faqPlat", 540, 200, 504, 236],
  dashboard: ["faqPlat", 1040, 136, 440, 320],
  donation: ["faqPlat", 56, 528, 320, 340],
  contract: ["faqPlat", 456, 536, 300, 340],
  calendar: ["faqPlat", 816, 560, 312, 304],
  plant: ["faqPlat", 1212, 488, 256, 404],
} satisfies Record<string, Spr>;
// Arjun's FAQ poses, a full figure about 728 px tall: puzzled with a passport, showing his phone,
// pointing something out, shrugging, thumbs up with a mug.
const ARJUN_FAQ = {
  passport: ["arjunFaq", 44, 84, 264, 724],
  show: ["arjunFaq", 376, 76, 252, 732],
  point: ["arjunFaq", 740, 76, 264, 732],
  shrug: ["arjunFaq", 1048, 84, 392, 724],
  thumbs: ["arjunFaq", 1472, 80, 272, 728],
} satisfies Record<string, Spr>;
const ARJUN_FAQ_REF = (728 * ARJUN_POSE_REF) / 700;

// Each world as the story draws it: `ground` is where feet go, `person` a grown-up's height, and
// `view` the height of the slice shown (from just under the ground up), all in world units.
const WORLDS = {
  village: { ground: 521, person: 140, view: 380, bg: VILLAGE_BG, layers: <><VillageFar /><VillageBuildings shutter={{ pos: 0, dust: -1, shake: 0 }} garments={5} /><VillageGround /></> },
  flat: { ground: 566, person: 250, view: 470, bg: FLAT_BG, layers: <><FlatFar /><FlatWalls /><FlatFurniture /></> },
} as const;
type WorldName = keyof typeof WORLDS;
const BELOW = 45; // ground shown under the feet

function Stage({ world, cx, children, labels }: { world: WorldName; cx: number; children: ReactNode; labels: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const W = WORLDS[world];
  const k = box.h / W.view;
  const viewW = k ? box.w / k : W.view;
  const x0 = cx - viewW / 2;
  const y0 = W.ground + BELOW - W.view;
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" style={{ backgroundColor: W.bg }}>
      {box.h > 0 && (
        <>
          <svg aria-hidden className="absolute inset-0" width={box.w} height={box.h} viewBox={`${x0} ${y0} ${viewW} ${W.view}`} preserveAspectRatio="none">
            {W.layers}
          </svg>
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: viewW, height: W.view, transform: `scale(${k})` }}>
            <div className="absolute" style={{ left: -x0, top: -y0 }}>
              {children}
            </div>
          </div>
        </>
      )}
      {/* Right padding below lg keeps the labels clear of the pop-up's close icon, which sits
          over this corner when the illustration is stacked on top. */}
      <div className="absolute inset-x-0 top-0 flex flex-col items-start gap-2 p-5 pr-[64px] sm:p-7 sm:pr-[68px] lg:pr-7">{labels}</div>
    </div>
  );
}

/** A sprite stood on the ground (or `lift` above it) at world x, sized as the story sizes it. */
function Put({ world, s, x, refH, h, lift = 0, flip, shadow, bob, delay = 0 }: { world: WorldName; s: Spr; x: number; refH?: number; h?: number; lift?: number; flip?: boolean; shadow?: boolean; bob?: number; delay?: number }) {
  const reduce = useReducedMotion();
  const W = WORLDS[world];
  // Sized like the story's people (`refH`: the sheet's px for a grown-up), or to a height `h`.
  const k = h ? h / s[4] : W.person / (refH ?? s[4]);
  const sw = s[3] * k;
  const sh = s[4] * k;
  const feet = W.ground - lift;
  return (
    <>
      {shadow && <div aria-hidden className="absolute rounded-[50%] bg-ink/12 blur-[2px]" style={{ left: x - sw * 0.3, top: feet - 4, width: sw * 0.6, height: 8 }} />}
      <motion.div
        className="absolute"
        style={{ left: x - sw / 2, top: feet - sh, width: sw, height: sh }}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={reduce || !bob ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -bob, 0] }}
        transition={
          reduce || !bob
            ? { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }
            : { opacity: { duration: 0.5, delay }, y: { duration: 2.6, delay, repeat: Infinity, ease: "easeInOut" } }
        }
      >
        <Sprite s={s} k={k} style={{ left: 0, top: 0, transform: flip ? "scaleX(-1)" : undefined }} />
      </motion.div>
    </>
  );
}

/** A label summing up part of the answer; `ok` / `no` adds a tick or a cross. */
function Label({ children, tone, i = 0, big }: { children: ReactNode; tone?: "ok" | "no"; i?: number; big?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.p
      className={`flex items-center gap-2 rounded-[10px] bg-white/92 font-display font-bold text-ink shadow-[0_4px_14px_rgba(27,42,74,0.12)] ${big ? "px-3.5 py-2.5 text-[15px] leading-[20px] sm:text-[17px] sm:leading-[24px]" : "px-3 py-2 text-[13px] leading-[18px] sm:text-[14px]"}`}
      initial={reduce ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {tone && (
        <span aria-hidden className={`grid size-[18px] shrink-0 place-items-center rounded-full text-[11px] leading-none text-white ${tone === "ok" ? "bg-[#3A8E6A]" : "bg-[#E2715F]"}`}>
          {tone === "ok" ? "✓" : "✕"}
        </span>
      )}
      <span>{children}</span>
    </motion.p>
  );
}

const R = 388; // Rekha's poses, as the story sizes them
const OFF = 430 * 1.06;

const SCENES: Record<string, () => ReactNode> = {
  // Mentored by impact partners, repaid month by month, but RBI rules forbid any guarantee.
  "Are returns guaranteed?": () => (
    <Stage
      world="village"
      cx={1840}
      labels={
        <>
          <Label big>Impact partners mentor every borrower</Label>
          <Label tone="ok" i={1}>Excellent repayment record</Label>
          <Label tone="no" i={2}>No guarantee: RBI rules</Label>
        </>
      }
    >
      <Put world="village" s={OFFICER.thumbs} x={1975} refH={OFF} shadow delay={0.1} />
      <Put world="village" s={REKHA.proud} x={1860} refH={R} shadow />
      <Put world="village" s={CALENDAR} x={1918} refH={R * 3.6} lift={128} bob={4} delay={0.3} />
    </Stage>
  ),
  // Impact partners pay a setup fee and a yearly fee to use the platform.
  "What is Rang De's revenue model?": () => (
    <Stage
      world="village"
      cx={1000}
      labels={
        <>
          <Label big>Impact partners pay to use the platform</Label>
          <Label tone="ok" i={1}>A one-time setup fee</Label>
          <Label tone="ok" i={2}>An annual fee</Label>
        </>
      }
    >
      <Put world="village" s={PLAT.office} x={935} h={92} delay={0.1} />
      <Put world="village" s={OFFICER.write} x={1060} refH={OFF} shadow />
      <Put world="village" s={PLAT.handshake} x={1000} h={40} lift={150} bob={4} delay={0.3} />
      <Put world="village" s={PLAT.dashboard} x={1135} h={52} lift={120} bob={4} delay={0.45} />
    </Stage>
  ),
  // Affordable, timely credit for everyone: Rekha with her new machine.
  "What is Rang De's mission?": () => (
    <Stage world="village" cx={200} labels={<><Label big>Affordable, timely credit for every Indian</Label><Label tone="ok" i={1}>Especially the unbanked</Label></>}>
      <Put world="village" s={GIFT_MACHINE} x={150} refH={757} lift={1.4} />
      <Put world="village" s={REKHA.proud} x={262} refH={R} shadow delay={0.1} />
      <Put world="village" s={SPARKLE} x={165} refH={R * 1.9} lift={92} bob={4} delay={0.35} />
      <Put world="village" s={PLAT.plant} x={330} h={48} delay={0.25} />
    </Stage>
  ),
  // Peer to peer: Arjun, on his phone, lends to Rekha herself.
  "What is unique about Rang De?": () => (
    <Stage world="flat" cx={250} labels={<><Label big>India&rsquo;s only peer to peer lending for the unbanked</Label><Label tone="ok" i={1}>You lend to a person, not a product</Label></>}>
      <Put world="flat" s={ARJUN_PHONE} x={300} refH={455} shadow />
      <Put world="flat" s={FX.thought} x={385} refH={455 * 1.1} lift={250 * 0.92} delay={0.3} />
      <Put world="flat" s={REKHA_FACE} x={393} refH={135 * 2.6} lift={250 * 1.13} bob={3} delay={0.45} />
      <Put world="flat" s={PLAT.handshake} x={185} h={44} lift={200} bob={4} delay={0.6} />
    </Stage>
  ),
  // A loan that comes back, not a donation.
  "Is Rang De a crowdfunding platform?": () => (
    <Stage
      world="flat"
      cx={1300}
      labels={
        <>
          <Label big>A regulated loan, not a donation</Label>
          <Label tone="ok" i={1}>Repaid on a fixed schedule</Label>
          <Label tone="no" i={2}>Crowdfunded donations</Label>
        </>
      }
    >
      <Put world="flat" s={ARJUN_FAQ.point} x={1320} refH={ARJUN_FAQ_REF} shadow />
      <Put world="flat" s={PLAT.contract} x={1450} h={78} lift={175} bob={4} delay={0.3} />
      <Put world="flat" s={PLAT.calendar} x={1200} h={66} lift={200} bob={4} delay={0.45} />
      <Put world="flat" s={PLAT.donation} x={1500} h={62} delay={0.6} />
    </Stage>
  ),
  "What are the payment options to make an investment?": () => (
    <Stage
      world="flat"
      cx={250}
      labels={
        <>
          <Label big>Pay the way you already do</Label>
          <Label tone="ok" i={1}>UPI · Net banking · Debit card</Label>
          <Label tone="ok" i={2}>Wallets (and credit cards through them)</Label>
        </>
      }
    >
      <Put world="flat" s={ARJUN_FAQ.show} x={300} refH={ARJUN_FAQ_REF} shadow />
      <Put world="flat" s={PAY.qr} x={440} h={70} lift={205} bob={4} delay={0.3} />
      <Put world="flat" s={PAY.card} x={160} h={50} lift={215} bob={4} delay={0.42} />
      <Put world="flat" s={PAY.wallet} x={445} h={58} lift={110} bob={4} delay={0.54} />
    </Stage>
  ),
  "What is KYC? Why is it needed?": () => (
    <Stage world="flat" cx={1300} labels={<><Label big>KYC: proving who you are, once</Label><Label tone="ok" i={1}>Required by the RBI before any loan goes out</Label></>}>
      <Put world="flat" s={ARJUN_FAQ.show} x={1330} refH={ARJUN_FAQ_REF} shadow />
      <Put world="flat" s={KYC.id} x={1470} h={64} lift={200} bob={4} delay={0.3} />
      <Put world="flat" s={KYC.shield} x={1480} h={62} lift={110} bob={4} delay={0.5} />
    </Stage>
  ),
  "How much interest will I earn if I invest?": () => (
    <Stage world="flat" cx={1810} labels={<><Label big>Up to 8.5% a year</Label><Label tone="ok" i={1}>Each loan shows its rate before you invest</Label></>}>
      <Put world="flat" s={ARJUN_CHEER} x={1800} refH={ARJUN_POSE_REF} shadow />
      <Put world="flat" s={COIN_STACK} x={1690} refH={250 * 4.4} lift={0} delay={0.2} />
      <Put world="flat" s={PLAT.calendar} x={1925} h={70} lift={205} bob={4} delay={0.4} />
    </Stage>
  ),
  "What are the payment options for NRIs and OCI card holders?": () => (
    <Stage
      world="flat"
      cx={1810}
      labels={
        <>
          <Label big>Rupees, from an account in India</Label>
          <Label tone="ok" i={1}>Your NRO account with an Indian bank</Label>
          <Label tone="no" i={2}>Overseas bank accounts or cards</Label>
        </>
      }
    >
      <Put world="flat" s={ARJUN_PHONE} x={1830} refH={455} shadow />
      <Put world="flat" s={PAY.bank} x={1700} h={66} lift={170} bob={4} delay={0.3} />
      <Put world="flat" s={PAY.cardNo} x={1950} h={50} lift={190} bob={4} delay={0.45} />
    </Stage>
  ),
  "I am a foreign national. Can I invest on Rang De?": () => (
    <Stage
      world="flat"
      cx={300}
      labels={
        <>
          <Label big>Who can invest, under RBI rules</Label>
          <Label tone="ok" i={1}>Resident Indians · NRIs · OCI / PIO</Label>
          <Label tone="no" i={2}>Foreign nationals</Label>
        </>
      }
    >
      <Put world="flat" s={ARJUN_FAQ.passport} x={340} refH={ARJUN_FAQ_REF} shadow />
      <Put world="flat" s={CUR.globe} x={480} h={84} lift={150} bob={3} delay={0.3} />
    </Stage>
  ),
  "Can I invest in foreign currency?": () => (
    <Stage world="flat" cx={1300} labels={<><Label big>Investments are in rupees only</Label><Label tone="ok" i={1}>₹ Indian rupees</Label><Label tone="no" i={2}>$ € £ and other currencies</Label></>}>
      <Put world="flat" s={ARJUN_FAQ.shrug} x={1320} refH={ARJUN_FAQ_REF} shadow />
      <Put world="flat" s={CUR.rupee} x={1180} h={52} lift={205} bob={4} delay={0.3} />
      {([CUR.dollar, CUR.euro, CUR.pound] as const).map((c, i) => (
        <Put key={i} world="flat" s={c} x={1395 + i * 42} h={40} lift={215 - (i % 2) * 22} bob={3} delay={0.42 + i * 0.1} />
      ))}
    </Stage>
  ),
  // The whole loop, at Rekha's shop: many investors, one loan, repaid month by month.
  "How does the Rang De model work?": () => (
    <Stage
      world="village"
      cx={1850}
      labels={
        <>
          <Label big>Many investors fund one loan</Label>
          <Label tone="ok" i={1}>From ₹500 each</Label>
          <Label tone="ok" i={2}>Repaid monthly, to reinvest or withdraw</Label>
        </>
      }
    >
      <Put world="village" s={SHOP_SEW} x={1867} refH={848} lift={1.4} />
      {/* the investors, stacked by the shop door, their coins heading her way */}
      {([[1700, 30], [1752, 82], [1700, 134]] as const).map(([x, lift], i) => (
        <Put key={i} world="village" s={AVATARS[i]} x={x} refH={R * 3.1} lift={lift} bob={3} delay={0.3 + i * 0.12} />
      ))}
      <Put world="village" s={COIN_FLY[0]} x={1790} refH={R * 3.6} lift={150} bob={5} delay={0.65} />
    </Stage>
  ),
};

/** The drawn scene for a question, or null where none is drawn yet. */
export function FaqScene({ question }: { question: string }) {
  const scene = SCENES[question];
  return scene ? scene() : null;
}

export const hasFaqScene = (question: string) => question in SCENES;
