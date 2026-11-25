import type { Metadata } from "next";
import { V1UpdatesHome } from "@/components/versions/v1-updates/V1UpdatesHome";
import { getRangDeStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Version 1 updates · The other Startup India | Rang De",
  description: "Version 1, reworked: a copy of /v/v1 to change while Version 1 stays as it was.",
  robots: { index: false, follow: false },
};

// Version 1 updates (25 Nov 2026): starts as an exact copy of Version 1 (app/v/v1). The page itself is
// components/versions/v1-updates/V1UpdatesHome.tsx.
export default async function V1Updates() {
  const stats = await getRangDeStats();
  return <V1UpdatesHome refresh problem="gap" stats={stats} />;
}
