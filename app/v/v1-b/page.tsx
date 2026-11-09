import type { Metadata } from "next";
import { V1Home } from "@/components/versions/V1Home";

export const metadata: Metadata = {
  title: "Version 1.1 B · The other Startup India | Rang De",
  description: "Homepage test version: Version 1.1 with the problem and Rang De's answer as three tabs, each pair side by side.",
  robots: { index: false, follow: false },
};

// Version 1.1 with the problem section as three tabs, the problem and Rang De's answer side by side in each.
export default function V1B() {
  return <V1Home problem="tabs" />;
}
