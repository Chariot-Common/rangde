"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Divider } from "@/components/ui/Divider";
import { useAnimatedNumber } from "@/lib/use-animated-number";
import {
  MAX_AVATARS,
  SLIDER_DEFAULT,
  SLIDER_MAX,
  SLIDER_MIN,
  SLIDER_STEP,
  calculateInvestmentOutcome,
  formatInr,
} from "@/lib/investment-calculator";

// Seven different real entrepreneurs from rangde.in's live listings (Oct 2026), so no face
// repeats as the slider adds avatars. Face-cropped by imgix at 2x the 57px display size.
const AVATAR_PHOTOS = [
  "Rekha-42-img.jpg",
  "Vijay-004-img.jpg",
  "durgamanawar01-img.jpg",
  "dnyaneshwar-mahale--img.jpg",
  "manawrmonika037-img.jpg",
  "nitin-jadhav-img.jpg",
  "Jagdish-sahare--img.jpg",
];
const AVATAR_SOURCES = AVATAR_PHOTOS.slice(0, MAX_AVATARS).map(
  (file) => `https://rangde.imgix.net/bImg/${file}?auto=compress,format&w=120&h=120&fit=facearea&facepad=2.2`,
);

const TWEEN_MS = 220;
const GLIDE_MS = 2600;

/** `refined` (Version 1.1): the amount at H3 under a P2 lead-in, a line under it on typical investment
 * sizes, a smaller slider knob (about 70%), each result's label above its figure, and a stronger divider. */
export function InvestmentSlider({ refined = false }: { refined?: boolean } = {}) {
  // Starts at the minimum and glides up to the default the first time the section scrolls into
  // view, so the numbers visibly come alive. Touching the slider hands control to the visitor.
  const [amount, setAmount] = useState(SLIDER_MIN);
  const wrapRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const [gliding, setGliding] = useState(false);
  const inView = useInView(wrapRef, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView || touched.current) return;
    let raf = 0;
    if (reduceMotion) {
      raf = requestAnimationFrame(() => setAmount(SLIDER_DEFAULT));
      return () => cancelAnimationFrame(raf);
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      if (touched.current) {
        setGliding(false);
        return;
      }
      const u = Math.min(1, (now - t0) / GLIDE_MS);
      const eased = 1 - Math.pow(1 - u, 3);
      setAmount(Math.round((SLIDER_MIN + (SLIDER_DEFAULT - SLIDER_MIN) * eased) / SLIDER_STEP) * SLIDER_STEP);
      setGliding(u < 1);
      if (u < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion]);

  // investmentAmount (the slider) is the single source of truth — every displayed value
  // below is derived from it, not stored independently.
  const outcome = useMemo(() => calculateInvestmentOutcome(amount), [amount]);

  const animatedAmountTween = useAnimatedNumber(amount, { duration: TWEEN_MS });
  const animatedTotalMinTween = useAnimatedNumber(outcome.totalMin, { duration: TWEEN_MS });
  const animatedJobsMinTween = useAnimatedNumber(outcome.jobsMin, { duration: TWEEN_MS });
  const animatedJobsMaxTween = useAnimatedNumber(outcome.jobsMax, { duration: TWEEN_MS });

  // While the glide runs, show the live values directly; the 220ms tween would trail the slider.
  const animatedAmount = gliding ? amount : animatedAmountTween;
  const animatedTotalMin = gliding ? outcome.totalMin : animatedTotalMinTween;
  const animatedJobsMin = gliding ? outcome.jobsMin : animatedJobsMinTween;
  const animatedJobsMax = gliding ? outcome.jobsMax : animatedJobsMaxTween;

  const percent = ((amount - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  return (
    <div ref={wrapRef} className="flex w-full flex-col items-center gap-8 px-4 sm:gap-sp9">
      <div className="flex w-full max-w-[370px] flex-col items-center gap-[4px] text-center">
        <p className={`w-full font-display font-medium text-ink/80 ${refined ? "text-p2" : "text-p1"}`}>For example, if you invest</p>
        <p
          className={`w-full font-display font-bold text-green-dark ${
            refined ? "text-h3" :"text-[28px] leading-[32px] md:text-h3 md:leading-[48px]"
          }`}
        >
          {formatInr(animatedAmount)}
        </p>
        {refined && (
          <p className="mt-2 w-full font-display text-h5 font-medium uppercase tracking-[0.88px] text-ink/64">
            Typical investments range from ₹15,000 to ₹40,000
          </p>
        )}
      </div>

      <div className="-mb-[31px] -mt-6 w-full max-w-[970px] max-sm:mb-0 max-sm:mt-0">
        <input
          type="range"
          className={`rangde-slider ${refined ? "rangde-slider--compact" : ""}`}
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={amount}
          onPointerDown={() => (touched.current = true)}
          onKeyDown={() => (touched.current = true)}
          onChange={(e) => {
            touched.current = true;
            setAmount(Number(e.target.value));
          }}
          style={{ ["--fill" as string]: `${percent}%` }}
          aria-label="Investment amount"
          aria-valuetext={formatInr(amount)}
        />
      </div>

      <div className="flex w-full max-w-[970px] flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-[15px]">
        <div className="flex w-full flex-col items-center gap-[16px] sm:w-[470px]">
          <div className="relative h-[64px] w-[64px] sm:h-[80px] sm:w-[80px]">
            {/*
              Figma's cash icon isn't a row of repeated icons — it's one icon drawn as a
              thicker stack of bills at each of the 4 reference amounts. The stage
              (1-4) swaps the source image with a crossfade as the slider crosses each
              reference amount's midpoint.
            */}
            <AnimatePresence>
              <motion.div
                key={outcome.cashIconStage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={`/images/calculator/cash-icon-${outcome.cashIconStage}.svg`}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className={`flex items-center gap-[8px] text-center ${refined ? "flex-col-reverse" : "flex-col"}`}>
            <p className="w-full font-display text-[24px] font-bold leading-[30px] text-ink sm:text-h3 sm:leading-[48px]">
              {formatInr(animatedTotalMin)}
            </p>
            <p className={`w-full font-display text-p2 font-medium text-ink/80 ${refined ? "" : "md:text-p1"}`}>
              {refined ? "You’ll be repaid (at 8.5% p.a.)" : "Repaid to you, @ upto 8.5% p.a."}
            </p>
          </div>
        </div>

        <Divider orientation="horizontal" className={`sm:hidden ${refined ? "bg-ink/32" : "bg-ink/16"}`} />
        <Divider orientation="vertical" className={`hidden sm:block ${refined ? "bg-ink/32" : "bg-ink/16"}`} />

        <div className="flex w-full flex-col items-center gap-[16px] sm:w-[470px]">
          <div className="flex h-[64px] items-center sm:h-[80px]">
            <AnimatePresence initial={false}>
              {AVATAR_SOURCES.filter((_, i) => i < outcome.avatarCount).map((src, i) => (
                <motion.div
                  key={src + i}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative h-[57px] w-[57px] shrink-0 rounded-full border-2 border-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)]"
                  style={{ marginLeft: i === 0 ? 0 : -22 }}
                >
                  <Image src={src} alt="" fill unoptimized className="rounded-full object-cover" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className={`flex items-center gap-[8px] text-center ${refined ? "flex-col-reverse" : "flex-col"}`}>
            <p className="w-full font-display text-[24px] font-bold leading-[30px] text-ink sm:text-h3 sm:leading-[48px]">
              {Math.round(animatedJobsMin)} - {Math.round(animatedJobsMax)}
            </p>
            <p className={`w-full font-display text-p2 font-medium text-ink/80 ${refined ? "" : "md:text-p1"}`}>
              {refined ? "No. of entrepreneurs you’ll fund" : "Rural entrepreneurs you’d fund"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
