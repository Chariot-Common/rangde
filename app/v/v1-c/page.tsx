import type { Metadata } from "next";
import { V1Home } from "@/components/versions/V1Home";

export const metadata: Metadata = {
  title: "Version 1.1 C · The other Startup India | Rang De",
  description: "Homepage test version: Version 1.1 with the problem section as three cards side by side with the animated icons; on scroll each is struck through and turns into Rang De’s answer, its icon handing over too.",
  robots: { index: false, follow: false },
};

// Version 1.1 with the problem section as three cards side by side with the animated icons; on scroll each is struck through and turns into Rang De’s answer, its icon handing over too.
export default function V1C() {
  return <V1Home problem="motion" />;
}
