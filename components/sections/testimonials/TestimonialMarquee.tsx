import type { Testimonial } from "@/lib/content";
import { TestimonialCard } from "./TestimonialCard";

interface TestimonialMarqueeProps {
  items: Testimonial[];
  align: "left" | "right";
  direction: "forward" | "reverse";
}

// Direction/speed aren't specified by the static Figma frame — alternating directions
// per row is a reasonable default for a two-row marquee, noted as an assumption.
export function TestimonialMarquee({ items, align, direction }: TestimonialMarqueeProps) {
  // Eight copies (not two): the loop moves -50%, so half the track must still be wider than
  // the screen. With only two, very wide or zoomed-out screens (down to ~25%) ran out of
  // cards and the row sat left-aligned with a gap on the right.
  const looped = Array.from({ length: 8 }, () => items).flat();

  return (
    <div className="group w-full overflow-hidden">
      {/* Default `items-stretch` so every card in the row matches the tallest card's
          height — TestimonialCard's own `justify-between` (see that file) is what
          keeps this looking intentional: the extra space goes between the quote and
          the footer instead of stacking up as dead space below the footer. */}
      <div
        className={`flex w-max gap-sp3 ${
          direction === "reverse" ? "animate-marquee-reverse" : "animate-marquee"
        } group-hover:[animation-play-state:paused]`}
      >
        {looped.map((testimonial, i) => (
          <TestimonialCard key={i} testimonial={testimonial} align={align} />
        ))}
      </div>
    </div>
  );
}
