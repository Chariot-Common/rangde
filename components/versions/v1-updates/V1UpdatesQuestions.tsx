"use client";

import { PlainQuestionCards } from "../PlainQuestionCards";
import { GetStartedAnim, NoRepayAnim, NriAnim, ReachAnim } from "../FaqAnimations";
import { TRUST_QUESTIONS } from "../WhyTrust";
import { QUESTION_CARDS, type QuestionCard } from "../approaches";

/*
 * Version 1 updates (26 Nov 2026): the question cards from Version 4 (/v/v4, `Why2Questions compact` in WhyThread2.tsx),
 * copied here so this page keeps them as they are even if Version 4's change. Same four questions, same answers, the same
 * pop-up (PlainQuestionCards) with its animations (FaqAnimations), shared with Version 4 rather than duplicated.
 *
 * On phones the cards are only as tall as their questions (icon beside the question, 24px type), and "pan‑India" never
 * breaks across two lines (a non-breaking hyphen).
 */

// Version 4's section heading size (WhyThread2's H2).
const H2 = "font-display font-bold tracking-[-0.02em] leading-[1.06] [text-wrap:balance] text-[32px] md:text-[48px] lg:text-[56px]";

const GET_STARTED: QuestionCard = {
  question: "How do I get started with investing on Rang De?",
  image: "/images/how-it-works/opp-1.webp",
  facts: [
    { text: "Sign up and complete your KYC", tone: "ok" },
    { text: "Choose who to lend to", tone: "ok" },
    { text: "Your money goes out on the 1st or 15th", tone: "ok" },
  ],
  answer:
    "Sign up on Rang De and complete your KYC. The RBI requires it before any of your money can reach a borrower, and it’s how the platform makes sure every lender is verified. Resident Indians, NRIs and OCI/PIO holders with an Indian bank account can invest.\n\nThen browse the borrowers. Each profile says who they are, what the loan is for and how they plan to repay it, and every one has passed five checks before it’s listed. Pick one, or several, and choose how much to lend.",
};

const PAN_INDIA: QuestionCard = {
  question: "How does Rang De have such a wide pan‑India reach?",
  image: "/images/how-it-works/opp-1.webp",
  facts: [
    { text: "Over 100 impact partners", tone: "ok" },
    { text: "Partnering since 2008", tone: "ok" },
    { text: "Borrowers across India", tone: "ok" },
  ],
  answer:
    "Rang De works with impact partners: local grassroots organisations already running livelihood programmes in their own communities, across many states. Rang De and the partner identify the borrowers, mentor them and stay with them through repayment.\n\nEach new partner brings a new region and a new community onto the platform, so the reach keeps growing. Since 2008, Rang De has partnered with organisations across India, and today works with over 100 of them. Through them, as a pan-India organisation, we can connect you with people who need funds to grow their business.",
};

const QUESTIONS: QuestionCard[] = [
  GET_STARTED,
  QUESTION_CARDS.find((q) => q.question.startsWith("I’m an NRI"))!,
  { ...TRUST_QUESTIONS[2], question: "What happens if a borrower doesn’t repay?" },
  PAN_INDIA,
];

export function V1UpdatesQuestions() {
  return (
    <PlainQuestionCards
      heading="Before you invest."
      headingClass={H2}
      inkHeading
      questionClass="text-[24px] leading-[30px] sm:text-[28px] sm:leading-[34px] md:text-h4 xl:text-[34px] xl:leading-[42px]"
      cards={QUESTIONS}
      icons={["faq-plus", "faq-nri", "faq-warning", "avatars-group"]}
      visuals={[<GetStartedAnim key="start" />, <NriAnim key="nri" />, <NoRepayAnim key="norepay" />, <ReachAnim key="reach" />]}
      flip
      navyLink
      large
      foundersCall
      phoneRow
      navButtons
    />
  );
}
