export interface HeadingPart {
  text: string;
  /** The emphasised phrase in each heading (green-dark), like the rest of the site. */
  className?: string;
}

export interface HowItWorksStep {
  eyebrow: string;
  headingParts: HeadingPart[];
  description: string;
  /** Optional reassurance line under the description (step 3). */
  note?: string;
  /** Screen-reader description of that step's animation. */
  illustrationLabel: string;
}

const BLUE = "text-primary";

/**
 * Copy for the four steps — the "how it works rework" design (Oct 2026): find / select /
 * verify, choose who to back, collection on the 1st or 15th, and tracking repayments.
 * Must stay in step order with the illustrations in engine.js.
 */
export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    eyebrow: "Step 1",
    headingParts: [{ text: "We find, select and verify rural entrepreneurs in need", className: BLUE }],
    description:
      "Rang De curates businesses based in rural areas, in need of a loan due to limited credit access. All our borrowers' identities and credibility are checked and vetted by us.",
    illustrationLabel:
      "A group of entrepreneurs passes through five checks — community identification, business assessment, credit evaluation, identity verification, and profile review — with fewer remaining at each, until the verified few are published.",
  },
  {
    eyebrow: "Step 2",
    headingParts: [{ text: "Choose entrepreneurs whom you'd like to support", className: BLUE }],
    description:
      "Every profile shares who they are, why they need the loan, and info on how they plan to repay it. Choose to invest in the businesses that align with you.",
    illustrationLabel:
      "A feed of entrepreneur cards scrolls past and settles on Rekha Bai; her key details open — Rajasthan, credit rating good, up to 8.25% p.a., 12 months, monthly repayments — and she is selected.",
  },
  {
    eyebrow: "Step 3",
    headingParts: [{ text: "Payments are collected on the 1st or 15th of the month", className: BLUE }],
    description:
      "The payment towards your investments will be collected on the next 1st or 15th, whichever's closer, and is transferred to the borrower within 24 hours as per RBI policy.",
    illustrationLabel:
      "Three investments totalling ₹7,677 with fees are paid on 1 September; the payment splits three ways and reaches Rekha Bai, Vijay Muwel and Monika the next day.",
  },
  {
    eyebrow: "Step 4",
    headingParts: [{ text: "Track all investments, plus past and future repayments", className: BLUE }],
    description:
      "See the details of every investment you've made on Rang De, along with your total earnings, expected repayments, and the repayment timelines of individual borrowers.",
    illustrationLabel:
      "An investor dashboard shows active investments, repayments expected and investees backed; it opens the list of investments, Rekha Bai's repayment timeline, and the repayments summary.",
  },
];
