"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { LegacyButton as Button } from "@/components/ui/LegacyButton";
import { ScrollType } from "@/components/versions/ScrollType";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// `position`: which part of the photo stays in the frame when it's cropped to the card.
type Founder = { name: string; src: string; position?: string };
const FOUNDERS: Founder[] = [
  { name: "Ram", src: "/images/cta/video-call/photo-ram.jpg" },
  { name: "Smita", src: "/images/cta/video-call/photo-smita.jpg" },
];
// Version 2 (Version B, /v/idea): the two of them speaking at events.
const FOUNDERS_V2: Founder[] = [
  { name: "Ram", src: "/images/founders/ram-v2.jpg", position: "38% 22%" },
  { name: "Smita", src: "/images/founders/smita-v2.jpg", position: "50% 18%" },
];
// Version 1.1: sharper photos of the two of them speaking (2000px).
const FOUNDERS_V3: Founder[] = [
  { name: "Ram", src: "/images/founders/ram-v3.webp", position: "40% 20%" },
  { name: "Smita", src: "/images/founders/smita-v3.webp", position: "50% 22%" },
];

/**
 * "The reason Rang De exists": who founded Rang De and why, just before the FAQs (Figma
 * 2318:14651). Built mobile first as a set of inset cards, the site's own unit: on phones they
 * stack — the two founders side by side, the story, their quote, the call CTA. From lg up they
 * become two strips: the founders and their quote on top, the story and the CTA below.
 * One photo each rather than one shared photo, so it lands that there are two people behind it.
 */
/** `typed`: the quote and the heading type themselves out as they are scrolled into view (Version 1.1). */
/** `talkFirst` (Version 1.1): the call card leads with "Talk to our founders" (in place of "Interested
 * but unsure?"), the day and time beside it in the Register button's blue. */
export function FoundersSection({ photos = "v1", typed = false, talkFirst = false }: { photos?: "v1" | "v2" | "v3"; typed?: boolean; talkFirst?: boolean } = {}) {
  const founders = photos === "v3" ? FOUNDERS_V3 : photos === "v2" ? FOUNDERS_V2 : FOUNDERS;
  const reduce = useReducedMotion();
  const rise = (delay = 0) => ({
    initial: reduce ? (false as const) : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.6, delay, ease: EASE_OUT },
  });

  return (
    <section id="founders" className="mx-2 rounded-[16px] bg-[#F7F3ED] px-2 py-2 sm:px-2">
      <div className="grid w-full grid-cols-2 gap-2 lg:grid-cols-4">
        {founders.map((f, i) => (
          <motion.figure
            key={f.name}
            className="relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[8px] bg-ink/8 lg:aspect-auto lg:min-h-[360px]"
            {...rise(i * 0.08)}
          >
            <Image
              src={f.src}
              alt={`${f.name}, co-founder of Rang De`}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
              style={f.position ? { objectPosition: f.position } : undefined}
            />
            <figcaption className="relative m-3 self-start rounded-full bg-white/90 px-3 py-1 font-display text-p4 font-bold text-ink backdrop-blur-sm">
              {f.name}
            </figcaption>
          </motion.figure>
        ))}

        <motion.figure
          className="order-last col-span-2 flex flex-col justify-between gap-6 rounded-[8px] bg-white p-6 sm:p-8 lg:order-none lg:col-span-2 lg:p-12"
          {...rise(0.16)}
        >
          <span aria-hidden className="h-[48px] font-display text-[112px] font-bold leading-[96px] text-green/40">
            “
          </span>
          {typed ? (
            <ScrollType as="blockquote" text="We felt a peer-to-peer model would be very powerful and relevant for a country like India." className="font-display text-h4 font-bold text-ink [text-wrap:pretty]" />
          ) : (
            <blockquote className="font-display text-h4 font-bold text-ink [text-wrap:pretty]">
              We felt a peer-to-peer model would be very powerful and relevant for a country like India.
            </blockquote>
          )}
          <figcaption className="font-display text-p3 font-bold text-ink/56">Ram &amp; Smita, founders</figcaption>
        </motion.figure>

        <motion.div
          className="col-span-2 flex flex-col gap-4 rounded-[8px] bg-white p-6 sm:p-8 lg:col-span-3 lg:p-12"
          {...rise(0.08)}
        >
          <p className="font-display text-p4 font-bold uppercase tracking-[1.2px] text-green-dark">
            The reason Rang De exists
          </p>
          {typed ? (
            <ScrollType text="Rang De was born when two people left Oxford for India." className="font-display text-h3 font-bold text-ink [text-wrap:balance]" />
          ) : (
            <h2 className="font-display text-h3 font-bold text-ink [text-wrap:balance]">
              Rang De was born when two people left Oxford for India.
            </h2>
          )}
          <p className="max-w-[720px] font-display text-p2 font-medium text-ink/72">
            At Oxford, Ram and Smita began working on an idea: an alternative financial system,
            built for the people of rural India that formal finance wasn&apos;t designed for. Millions
            of businesses across the country are still left out of it. The idea stayed with them,
            so they came back to India and built Rang De.
          </p>
        </motion.div>

        <motion.div
          className="order-last col-span-2 flex flex-col items-start justify-between gap-6 rounded-[8px] bg-[#cbe8f6] p-6 sm:p-8 lg:order-none lg:col-span-1"
          {...rise(0.16)}
        >
          {talkFirst ? (
            <h3 className="font-display text-h4 font-bold text-ink">
              Talk to our founders{" "}
              <span className="whitespace-nowrap text-p2 font-medium" style={{ color: "var(--color-blue-highlight)" }}>
                · Every Saturday, 11 AM IST
              </span>
            </h3>
          ) : (
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-h4 font-bold text-ink">Interested but unsure?</h3>
              <p className="font-display text-p2 font-medium text-ink/80">
                Talk to our founders · Every Saturday, 11 AM IST
              </p>
            </div>
          )}
          <Button variant="primary" size="lg" className="w-full px-6" style={{ backgroundColor: "var(--color-blue-highlight)" }}>
            Register
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
