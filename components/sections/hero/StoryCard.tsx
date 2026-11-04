import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import type { Story } from "@/lib/content";

export type StoryCardLayout = "default" | "recent";

interface StoryCardProps {
  /** "recent" (Figma 2689:37640): name + purpose, when it was funded, then Funded / investors / Interest. */
  layout?: StoryCardLayout;
  /** Fill the parent's height (a row of mixed cards), with the figures pinned to the bottom. */
  stretch?: boolean;
  story: Story;
  /** Hides the card from assistive tech — used for the duplicated set in the auto-scroll loop. */
  hiddenFromAT?: boolean;
  /**
   * "carousel" (default): fixed per-breakpoint widths tuned for the homepage
   * auto-scroll strip. "grid": fluid width for use as a CSS grid item (e.g. the
   * all-stories page), with the image kept at a constant aspect ratio instead of the
   * carousel's fixed pixel heights (which assume the carousel's own fixed card widths).
   */
  variant?: "carousel" | "grid";
  /**
   * Defaults to eager (see the note on the image below). The homepage passes "lazy"
   * where a card can't be seen yet — e.g. the desktop marquee while it's display:none
   * on phones — so those images aren't downloaded (or preloaded) on first load.
   */
  loading?: "eager" | "lazy";
}

const CARD_WIDTH_CLASSES = {
  carousel: "w-[calc(100vw-32px)] shrink-0 snap-center sm:w-[340px] lg:w-[440px]",
  grid: "h-full w-full",
};

const IMAGE_HEIGHT_CLASSES = {
  carousel: "aspect-[16/9] sm:aspect-auto sm:h-[210px] lg:h-[248px]",
  grid: "aspect-[16/9]",
};

export function StoryCard({ story, hiddenFromAT, variant = "carousel", loading = "eager", layout = "default", stretch = false }: StoryCardProps) {
  const recent = layout === "recent" && !!story.name;
  return (
    <div
      aria-hidden={hiddenFromAT || undefined}
      className={`flex flex-col items-center overflow-hidden rounded-[8px] bg-[#084a2f] p-[4px] transition-transform duration-300 ease-out hover:scale-[1.015] ${CARD_WIDTH_CLASSES[variant]} ${stretch ? "self-stretch" : ""}`}
    >
      <div className={`relative mb-[-48px] w-full shrink-0 rounded-[4px] ${IMAGE_HEIGHT_CLASSES[variant]}`}>
        {/*
          The carousel moves this card via a GSAP transform, not real scroll, so the
          browser's lazy-load IntersectionObserver doesn't reliably fire for it — cards
          could sit blank until manually scrolled past. Loading eagerly avoids that.
        */}
        <Image src={story.image} alt="" fill sizes="440px" loading={loading} className="rounded-[4px] object-cover" />
      </div>

      <div className={`flex w-full flex-col items-center gap-[24px] px-[28px] pb-[28px] ${stretch ? "flex-1" : ""}`}>
        <Avatar
          src={story.avatar}
          alt=""
          size={80}
          radius={8}
          borderClassName="border-2 border-white"
          className="z-10"
          eager={loading === "eager"}
        />

        {recent ? (
          <div className="flex w-full flex-col items-center gap-3 text-center">
            <p className="font-display text-p2 leading-[24px]">
              <span className="block font-bold text-white">{story.name}</span>
              <span className="block font-normal text-white/80">{story.purpose}</span>
            </p>
            <p className="font-display text-h5 font-bold uppercase tracking-[0.88px] text-[#62af1d]">{story.when}</p>
          </div>
        ) : (
          <p className="w-full text-center text-p2 leading-[24px] text-white/64">
            <span className="font-display font-bold text-white">{story.highlight}</span>
            <span className="font-display font-normal">{story.rest}</span>
          </p>
        )}

        <div className={`h-px w-full shrink-0 bg-white/16 ${stretch ? "mt-auto" : ""}`} />

        {recent ? (
          <div className="flex w-full items-center gap-3 sm:gap-sp5">
            {[
              [story.totalFunded, "Funded"],
              [String(story.investors), "investors"],
              [story.returns, "Interest"],
            ].map(([value, label], k) => (
              <div key={label} className="contents">
                {k > 0 && <div className="h-[48px] w-px shrink-0 bg-white/16" />}
                <div className="flex flex-1 flex-col items-center gap-[4px]">
                  <p className="w-full whitespace-nowrap text-center font-display text-p2 font-bold text-white">{value}</p>
                  <p className="w-full whitespace-nowrap text-center font-display text-h5 font-bold uppercase tracking-[0.88px] text-white/64">{label}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex w-full items-center gap-3 sm:gap-sp5">
            <div className="flex flex-1 flex-col items-center gap-[4px]">
              <p className="w-full text-center font-display text-p2 font-bold text-white">{story.totalFunded}</p>
              <p className="w-full whitespace-nowrap text-center font-display text-p4 font-medium text-white/64">Total Funded</p>
            </div>
            <div className="h-[48px] w-px shrink-0 bg-white/16" />
            <div className="flex flex-1 flex-col items-center gap-[4px]">
              <p className="w-full text-center font-display text-p2 font-bold text-white">{story.returns}</p>
              <p className="w-full whitespace-nowrap text-center font-display text-p4 font-medium text-white/64">Returns Provided</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
