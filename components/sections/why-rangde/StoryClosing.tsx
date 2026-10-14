import { CLOSING_LINE, DURGA } from "./durgaStory";

/** "Durga is one of 31,700+…" bar with the two CTAs — shared by the story variants. */
export function StoryClosing({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex w-full flex-col items-center gap-5 rounded-[16px] bg-white px-6 py-6 text-center shadow-[0_4px_16px_rgba(41,45,54,0.08)] sm:flex-row sm:justify-between sm:text-left ${className}`}
    >
      <p className="font-display text-p2 font-medium text-ink/80">
        Durga is one of <b className="font-bold text-ink">{CLOSING_LINE.entrepreneurs}</b> across{" "}
        <b className="font-bold text-ink">{CLOSING_LINE.states}</b> Rang De has backed.
      </p>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
        <a
          href={DURGA.url}
          className="inline-flex h-[44px] items-center justify-center rounded-[4px] bg-primary px-5 font-display text-p3 font-bold text-white transition-[filter] hover:brightness-95"
        >
          Support Durga
        </a>
        <a
          href="#opportunities"
          className="inline-flex h-[44px] items-center justify-center rounded-[4px] bg-primary/16 px-5 font-display text-p3 font-bold text-primary transition-colors hover:bg-primary/24"
        >
          Meet more entrepreneurs
        </a>
      </div>
    </div>
  );
}
