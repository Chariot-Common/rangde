/**
 * Durga's problem → answer → impact story, shared by the "Why Rang De?" story variants.
 * Every fact is from her public listing (rangde.in/i/durga-294, Oct 2026); the "nearly half"
 * figure is NABARD RECSS Round 12 (July 2026),
 * and the closing "65,000+ / 28 states / since 2008" are the original section's figures.
 */

export const DURGA = {
  name: "Durga Chouhan",
  role: "Grocery shop owner",
  place: "Dhar, Madhya Pradesh",
  partner: "Transform Rural India Foundation",
  url: "https://rangde.in/i/durga-294",
  photo: "https://rangde.imgix.net/bImg/durgamanawar01-img.jpg?auto=compress,format&w=900&h=1100&fit=crop&crop=faces",
  thumb: "https://rangde.imgix.net/bImg/durgamanawar01-img.jpg?auto=compress,format&w=160&h=160&fit=facearea&facepad=3",
};

export type StoryTone = "problem" | "answer" | "impact";

export interface StoryStage {
  tone: StoryTone;
  label: string;
  title: string;
  text: string;
  aside?: string;
  /** Short facts shown on/next to her photo while this stage is in view. */
  tags: string[];
}

export const STORY: StoryStage[] = [
  {
    tone: "problem",
    label: "The problem",
    title: "Formal credit was out of reach",
    text: "Limited credit history, no collateral and an informal income meant Durga couldn't get formal credit.",
    aside: "She isn't alone: nearly half of rural households still borrow from informal sources.",
    tags: ["No credit history", "No collateral"],
  },
  {
    tone: "answer",
    label: "Our answer",
    title: "Vetted on the ground, not on paper",
    text: "Our partner Transform Rural India Foundation referred and vetted her. She's raising ₹1,00,000 at 8.25% p.a. to add a tent and decoration rental business to her grocery shop.",
    tags: ["Verified by TRIF", "₹1,00,000 at 8.25% p.a."],
  },
  {
    tone: "impact",
    label: "The impact",
    title: "Her first credit, and a second business",
    text: "318 days of livelihood and a better life for her family of four.",
    tags: ["First credit", "318 days of livelihood"],
  },
];

/** Colour per stage: warm grey for the problem, Rang De blue for the answer, green for impact. */
export const TONE = {
  problem: { chip: "bg-[#8A5A44]/12 text-[#7A4B36]", dot: "bg-[#8A5A44]", card: "#EFE7DD" },
  answer: { chip: "bg-primary/12 text-[#007AA3]", dot: "bg-primary", card: "#E4F4FB" },
  impact: { chip: "bg-green/16 text-green-dark", dot: "bg-green-dark", card: "#EEF3DE" },
} as const;

export const CLOSING_LINE = { entrepreneurs: "65,000+ entrepreneurs", states: "28 states", since: "2008" };
