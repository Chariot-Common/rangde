import Image from "next/image";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import type { Story } from "@/lib/content";

/** "recent11" (Version 1.1): "recent", with the name and purpose at 18/24 (no letter spacing) and the
 * photo's 2px white stroke drawn inside its edge. */
export type StoryCardLayout = "default" | "recent" | "recent11";

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
  /** Shown under the story, above the figures (Version 2.1: the strip of investors' faces, Figma 2989:48). */
  faces?: ReactNode;
  /** The photo's white stroke drawn inside its edge (as "recent11" has it), so the photo fills the full 80px. */
  insetAvatar?: boolean;
  /** No grow on hover (Version 3's drifting rows, where hovering pauses the row instead). */
  still?: boolean;
}

const CARD_WIDTH_CLASSES = {
  carousel: "w-[calc(100vw-32px)] shrink-0 snap-center sm:w-[340px] lg:w-[440px]",
  grid: "h-full w-full",
};

const IMAGE_HEIGHT_CLASSES = {
  carousel: "aspect-[16/9] sm:aspect-auto sm:h-[210px] lg:h-[248px]",
  grid: "aspect-[16/9]",
};

export function StoryCard({ story, hiddenFromAT, variant = "carousel", loading = "eager", layout = "default", stretch = false, faces, insetAvatar = false, still = false }: StoryCardProps) {
  const recent = (layout === "recent" || layout === "recent11") && !!story.name;
  const v11 = layout === "recent11";
  return (
    <div
      aria-hidden={hiddenFromAT || undefined}
      className={`flex flex-col items-center overflow-hidden rounded-[8px] bg-[#084a2f] p-[4px] ${still ? "" : "transition-transform duration-300 ease-out hover:scale-[1.015]"} ${CARD_WIDTH_CLASSES[variant]} ${stretch ? "self-stretch" : ""}`}
    >
      <div className={`relative mb-[-48px] w-full shrink-0 rounded-[4px] ${IMAGE_HEIGHT_CLASSES[variant]}`}>
        {/*
          The carousel moves this card via a GSAP transform, not real scroll, so the
          browser's lazy-load IntersectionObserver doesn't reliably fire for it — cards
          could sit blank until manually scrolled past. Loading eagerly avoids that.
        */}
        <Image src={story.image} alt="" fill sizes="440px" loading={loading} className="rounded-[4px] object-cover" />
      </div>

      {/* Version 1 on phones: Version 2's tighter card (18px in from the edges, 16px between the parts). */}
      <div className={`flex w-full flex-col items-center gap-[24px] px-[28px] pb-[28px] ${v11 ? "max-sm:gap-4 max-sm:px-[18px] max-sm:pb-[18px]" : ""} ${stretch ? "flex-1" : ""}`}>
        <Avatar
          src={story.avatar}
          alt=""
          size={80}
          radius={8}
          borderClassName={
            v11 || insetAvatar
              ? "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border-2 after:border-white after:content-['']"
              : "border-2 border-white"
          }
          className="z-10"
          eager={loading === "eager"}
        />

        {recent ? (
          <div className="flex w-full flex-col items-center gap-3 text-center">
            <p className={`font-display ${v11 ? "text-p1 tracking-normal md:text-p2" : "text-p2 leading-[24px]"}`}>
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

        {faces}

        <div className={`h-px w-full shrink-0 bg-white/16 ${stretch ? "mt-auto" : ""}`} />

        {recent ? (
          <div className={`flex w-full items-center gap-3 sm:gap-sp5 ${v11 ? "max-sm:gap-2" : ""}`}>
            {[
              [story.totalFunded, "Funded"],
              [String(story.investors), "investors"],
              [story.returns, "Interest"],
            ].map(([value, label], k) => (
              <div key={label} className="contents">
                {k > 0 && <div className="h-[48px] w-px shrink-0 bg-white/16" />}
                {/* Version 1 on phones: each column takes its figure's width first (equal thirds were too narrow for
                    "8.00% p.a.", which ran past the card's edge), the figures at 15/21 as on Version 2's cards, and the
                    labels a little tighter. On the narrowest phones (360px) the interest figure may wrap its "p.a." under
                    the number rather than run past the padding (the other two figures never wrap). */}
                <div className={`flex flex-1 flex-col items-center gap-[4px] ${v11 ? `max-sm:flex-auto ${k === 2 ? "max-sm:min-w-0" : ""}` : ""}`}>
                  <p className={`w-full whitespace-nowrap text-center font-display text-p2 font-bold text-white ${v11 ? `max-sm:text-[15px] max-sm:leading-[21px] ${k === 2 ? "max-sm:whitespace-normal" : ""}` : ""}`}>{value}</p>
                  <p className={`w-full whitespace-nowrap text-center font-display text-h5 font-bold uppercase tracking-[0.88px] text-white/64 ${v11 ? "max-sm:tracking-[0.5px]" : ""}`}>{label}</p>
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
