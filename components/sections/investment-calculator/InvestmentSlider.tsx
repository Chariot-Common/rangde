"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
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

export function InvestmentSlider() {
  const [amount, setAmount] = useState(SLIDER_DEFAULT);

  // investmentAmount (the slider) is the single source of truth — every displayed value
  // below is derived from it, not stored independently.
  const outcome = useMemo(() => calculateInvestmentOutcome(amount), [amount]);

  const animatedAmount = useAnimatedNumber(amount, { duration: TWEEN_MS });
  const animatedTotalMin = useAnimatedNumber(outcome.totalMin, { duration: TWEEN_MS });
  const animatedJobsMin = useAnimatedNumber(outcome.jobsMin, { duration: TWEEN_MS });
  const animatedJobsMax = useAnimatedNumber(outcome.jobsMax, { duration: TWEEN_MS });

  const percent = ((amount - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  return (
    <div className="flex w-full flex-col items-center gap-8 px-4 sm:gap-sp9">
      <div className="flex w-full max-w-[370px] flex-col items-center gap-[4px] text-center">
        <p className="w-full font-display text-p1 font-bold text-ink/64">For example, if you invest</p>
        <p className="w-full font-display text-[28px] font-bold leading-[32px] text-blue-highlight md:text-h3 md:leading-[48px]">
          {formatInr(animatedAmount)}
        </p>
      </div>

      <div className="w-full max-w-[970px]">
        <input
          type="range"
          className="rangde-slider"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
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
          <div className="flex flex-col items-center gap-[8px] text-center">
            <p className="w-full font-display text-[24px] font-bold leading-[30px] text-ink sm:text-h4 sm:leading-[40px]">
              {formatInr(animatedTotalMin)}
            </p>
            <p className="w-full font-display text-p2 font-medium text-ink/64">
              Repaid to you, @ upto 8% p.a.
            </p>
          </div>
        </div>

        <Divider orientation="horizontal" className="bg-ink/16 sm:hidden" />
        <Divider orientation="vertical" className="hidden bg-ink/16 sm:block" />

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
          <div className="flex flex-col items-center gap-[8px] text-center">
            <p className="w-full font-display text-[24px] font-bold leading-[30px] text-ink sm:text-h4 sm:leading-[40px]">
              {Math.round(animatedJobsMin)} - {Math.round(animatedJobsMax)}
            </p>
            <p className="w-full font-display text-p2 font-medium text-ink/64">Rural entrepreneurs you&apos;d fund</p>
          </div>
        </div>
      </div>
    </div>
  );
}
