import type { Metadata } from "next";
import { V1Home } from "@/components/versions/V1Home";

export const metadata: Metadata = {
  title: "Version 1 · The other Startup India | Rang De",
  description: "Homepage test version: why it matters first, then the people, the founders and how it works.",
  robots: { index: false, follow: false },
};

// Version 1 (10 Nov 2026: Version 1.1 became Version 1): the hero lead in three lines, How it works after the
// testimonials and founders, the founders photo's thinner frame. The page itself is components/versions/V1Home.tsx.
export default function V1() {
  return <V1Home refresh />;
}
