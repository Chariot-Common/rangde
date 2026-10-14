import Image from "next/image";
import { FlagBadge } from "@/components/ui/FlagBadge";
import type { Testimonial } from "@/lib/content";

interface TestimonialCardProps {
  testimonial: Testimonial;
  align: "left" | "right";
  /** "marquee" (default): fixed per-breakpoint widths for the homepage scroll row.
   * "grid": fluid width for use as a grid item (e.g. the all-investors page). */
  variant?: "marquee" | "grid";
}

const WIDTH_CLASSES = {
  marquee: "w-[300px] shrink-0 sm:w-[400px] lg:w-[480px]",
  grid: "h-full w-full",
};

export function TestimonialCard({ testimonial, align, variant = "marquee" }: TestimonialCardProps) {
  const isRight = align === "right";

  return (
    <div
      className={`flex flex-col items-center justify-between gap-6 rounded-[8px] bg-bg-grey p-6 sm:gap-sp7 sm:p-sp7 ${WIDTH_CLASSES[variant]}`}
    >
      <p className={`w-full text-p2 leading-[24px] text-ink/64 ${isRight ? "text-right" : "text-left"}`}>
        {testimonial.quote.map((segment, i) => (
          <span key={i} className={segment.emphasized ? "text-ink" : undefined}>
            {segment.text}
          </span>
        ))}
      </p>

      <div className="flex w-full items-end gap-sp7">
        <div
          className={`flex flex-1 flex-col gap-sp1 font-eyebrow text-h6 font-semibold uppercase tracking-[0.8px] ${
            isRight ? "items-end text-right" : "items-start text-left"
          }`}
        >
          <p className="text-ink">{testimonial.name}</p>
          {testimonial.role && <p className="text-ink/64">{testimonial.role}</p>}
          {testimonial.since && <p className="text-ink/64">{testimonial.since}</p>}
        </div>

        <div className="relative h-[64px] w-[64px] shrink-0 overflow-visible rounded-[8px] bg-white">
          {/* unoptimized: same reasoning as Avatar.tsx — small source photo, sidesteps a
              reproducible Next.js dev image-optimizer hang under concurrent load.
              fetchPriority low: still eager (marquee-safe), but keeps these far-down
              photos out of the <head> preloads that compete with the hero on load. */}
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            fill
            unoptimized
            loading="eager"
            fetchPriority="low"
            className="rounded-[8px] object-cover"
          />
          {testimonial.flag && <FlagBadge flag={testimonial.flag} className="absolute -bottom-[6px] -left-[8px] shadow-[0_1px_3px_rgba(41,45,54,0.2)]" />}
        </div>
      </div>
    </div>
  );
}
