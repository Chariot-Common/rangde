import type { Metadata } from "next";
import { Storyboard } from "@/components/versions/Storyboard";

export const metadata: Metadata = {
  title: "Version 1.1 storyboard | Rang De",
  description: "Rough storyboard of the six problem / solution panels for Version 1.1.",
  robots: { index: false, follow: false },
};

export default function StoryboardPage() {
  return <Storyboard />;
}
