import type { Metadata } from "next";
import { V1Home } from "@/components/versions/V1Home";

export const metadata: Metadata = {
  title: "Version 1 · The other Startup India | Rang De",
  description: "Homepage test version: why it matters first, then how it works and the returns.",
  robots: { index: false, follow: false },
};

// The page itself is components/versions/V1Home.tsx, shared with Version 1.1 B (/v/v1-b).
export default function V1() {
  return <V1Home />;
}
