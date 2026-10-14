import type { Metadata } from "next";
import Link from "next/link";
import { StoryCard } from "@/components/sections/hero/StoryCard";
import { stories } from "@/lib/content";

export const metadata: Metadata = {
  title: "Social Investors | Rang De",
  description: "Browse the rural entrepreneurs Rang De's community of social investors have funded.",
};

export default function StoriesPage() {
  return (
    // The shared root layout itself caps at 1560px now, so this page's own content just
    // fills that — no need to break out of an ancestor here.
    <div className="w-full px-4 py-16 sm:px-8 lg:px-[80px]">
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="font-display text-p3 font-bold text-primary transition-opacity hover:opacity-70">
            ← Back to home
          </Link>
          <h1 className="font-display text-h2 font-bold text-ink">
            Social investors, real impact
          </h1>
          <p className="max-w-[640px] font-display text-p2 font-medium text-ink/64">
            Every card below is a rural entrepreneur funded by everyday people just like you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stories.map((story, i) => (
            <StoryCard key={i} story={story} variant="grid" />
          ))}
        </div>
      </div>
    </div>
  );
}
