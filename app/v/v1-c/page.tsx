import type { Metadata } from "next";
import { V1Home } from "@/components/versions/V1Home";

export const metadata: Metadata = {
  title: "Version 1.1 C · The other Startup India | Rang De",
  description: "Homepage test version: Version 1.1 with the problem and Rang De's answer as side-by-side before → after pairs.",
  robots: { index: false, follow: false },
};

// Version 1.1 with a second take on the problem section: before → after pairs instead of the stacked, illustrated cards.
export default function V1C() {
  return <V1Home problem="shift" />;
}
