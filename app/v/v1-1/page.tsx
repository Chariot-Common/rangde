import type { Metadata } from "next";
import { V1Home } from "@/components/versions/V1Home";

export const metadata: Metadata = {
  title: "Version 1.1 · The other Startup India | Rang De",
  description: "Homepage test version: Version 1 with the review-call changes: the lead in three lines, How it works after the founders.",
  robots: { index: false, follow: false },
};

// Version 1.1: Version 1 (/v/v1) with the review-call changes: the hero lead in three lines, How it works moved after the
// testimonials and founders, and the founders photo's thinner frame.
export default function V11() {
  return <V1Home refresh />;
}
