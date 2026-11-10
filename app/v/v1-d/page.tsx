import type { Metadata } from "next";
import { V1Home } from "@/components/versions/V1Home";

export const metadata: Metadata = {
  title: "Version 1.1 D · The other Startup India | Rang De",
  description: "Homepage test version: Version 1.1 with the problem section as six cards: the problems stay, each answered by a card under it.",
  robots: { index: false, follow: false },
};

// Version 1.1 with the problem section as six cards: the three problems stay along the top, each struck through on
// scroll and answered by a card that rises in under it.
export default function V1D() {
  return <V1Home problem="grid" />;
}
