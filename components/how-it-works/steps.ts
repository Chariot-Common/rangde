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
      "Before listing any profile on our site, we, along with our partners on the ground, facilitate an in-depth vetting process to ensure that the listed borrower is genuine.",
    illustrationLabel:
      "A group of entrepreneurs passes through five checks — community identification, business assessment, credit evaluation, identity verification, and profile review — with fewer remaining at each, until the verified few are published.",
  },
  {
    eyebrow: "Step 2",
    headingParts: [{ text: "Choose entrepreneurs whom you’d like to support", className: BLUE }],
    description:
      "Every profile shares who they are, why they need the loan, and info on how they plan to repay it. Select from a pool of individuals, each of whom has specific needs and goals.",
    illustrationLabel:
      "A feed of entrepreneur cards scrolls past and settles on Rekha Bai; her key details open — Rajasthan, credit rating good, up to 8.25% p.a., 12 months, monthly repayments — and she is selected. An invest card then opens where the amount is chosen, ₹500, then ₹2,000, then ₹5,000, and Continue is pressed.",
  },
  {
    eyebrow: "Step 3",
    headingParts: [{ text: "Payments are collected on the 1st or 15th of the month.", className: BLUE }],
    description:
      "We collect on whichever of these dates comes next. Within 24 hours of collection, the money reaches the borrower’s bank account, as required by RBI regulations.",
    illustrationLabel:
      "A confirm card lists investments in Rekha Bai (₹5,000), Vijay Muwel (₹2,000) and Monika (₹500), ₹7,677 in total with fees, payable on 1 May. The three entrepreneurs’ avatars travel down a green line past the 01 May date into a Pay Now card, then down past 02 May and split along three branches, each reaching its entrepreneur with a Transfer successful message.",
  },
  {
    eyebrow: "Step 4",
    headingParts: [{ text: "Track all investments, plus past and future repayments", className: BLUE }],
    description:
      "See the details of every investment you’ve made on Rang De, along with your total earnings, expected repayments, and the repayment timelines of individual borrowers.",
    illustrationLabel:
      "An investor dashboard shows active investments, repayments expected and investees backed; it opens the list of investments, Rekha Bai's repayment timeline, and the repayments summary.",
  },
];
