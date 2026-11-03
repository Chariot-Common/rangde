import { HeroIntro } from "./HeroIntro";
import { StoryCarousel } from "./StoryCarousel";

export function Hero() {
  return (
    <div id="hero" className="relative isolate flex w-full flex-col items-center gap-12 px-4 pt-[100px] sm:px-2 sm:pt-12 md:pt-16 lg:pt-[64px]">
      {/* Decorative background glow ("Ellipse 308" in Figma): a solid white shape with
          a soft golden drop-shadow (blur 250px, rgba(254,199,0,0.64)) behind it. Drawn
          as a box-shadow rather than filter: drop-shadow — identical on an opaque circle,
          but far cheaper to paint on mobile GPUs than a 250px filter blur. Position
          matches Figma exactly at lg+ (1024px), where it's a circle — it starts above the
          hero, behind the nav. Below sm (640px), per the official mobile frame (Figma node
          405-12410), it's a much LARGER circle than the desktop one, positioned with its
          TOP (its vertex) sitting just below the hero's top edge rather than above it — the
          opposite orientation from a scaled-down circle. This makes the white area shallow
          at the horizontal center (closest to the nav) and deepen toward the left/right
          edges, i.e. the visible cream glow is a band that's deep at the sides and thin in
          the middle, not a dome that's deepest in the middle. Values (1040px circle, +33px
          top) were derived by sampling the reference frame's pixel boundary: the cream-to-
          white transition sits ~33px below the nav at center and ~70px at the viewport
          edges — which is why the section's own top padding is bumped to 100px on mobile
          (vs. 32px elsewhere): the headline needs to clear the curve's full ~70px depth at
          the edges, not just its shallower ~33px center point, or its letters visually
          collide with the arc. Horizontal overflow from this and the carousel bleed below
          is clipped at the page root (see app/layout.tsx), not here — clipping it locally
          on this axis would force the vertical axis to `auto` too and cut off this negative
          top offset. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[33px] h-[1040px] w-[1040px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_250px_rgba(254,199,0,0.64)] sm:top-[-95px] sm:h-[650px] sm:w-[650px] md:top-[-125px] md:h-[850px] md:w-[850px] lg:top-[-174px] lg:h-[1250px] lg:w-[1250px]"
      />

      {/* Title → body → link + stats, played in sequence once the page loader has gone. */}
      <HeroIntro />

      {/* Breaks out of the section's side padding so the carousel can bleed edge-to-edge. */}
      <div className="relative -mx-4 w-[calc(100%+32px)] sm:-mx-2 sm:w-[calc(100%+16px)]">
        <StoryCarousel />
      </div>
    </div>
  );
}
