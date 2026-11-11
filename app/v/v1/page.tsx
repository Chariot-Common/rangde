import type { Metadata } from "next";
import { V1Home } from "@/components/versions/V1Home";
import { getRangDeStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Version 1 · The other Startup India | Rang De",
  description: "Homepage test version: why it matters first, then the people, the founders and how it works.",
  robots: { index: false, follow: false },
};

// Version 1 (10 Nov 2026: Version 1.1 became Version 1): the hero lead in three lines, How it works after the
// testimonials and founders, the founders photo's thinner frame. The page itself is components/versions/V1Home.tsx.
// 11 Nov 2026: the problem and solution as one pinned section (Figma 3020:62) in place of the before → after pairs.
export default async function V1() {
  const stats = await getRangDeStats();
  return <V1Home refresh problem="gap" stats={stats} />;
}
