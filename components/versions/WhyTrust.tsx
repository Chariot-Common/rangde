"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { useRangDeStats } from "@/components/providers/StatsProvider";
import { LinkButton, SIGNUP_URL } from "./ui";
import { QUESTION_CARDS, type QuestionCard } from "./approaches";
import { BlurChar, byWord, DEEP, DOES, FillWord, GREEN, H2, HEAD, HowStrip, INK, LIME, Lines, PAPER, ProofCard, SECTION, STICKY, SUB, WIDE, span, usePin } from "./WhyThread";

/*
 * /v/why-trust (23 Nov 2026): Version 4 ("One thread") with ten pieces of lender feedback (Mar 2024 to Apr 2026) worked
 * into the sections that are already there, not added as sections of their own:
 *   how borrowers are found and how the loan is sized (Mar 2024, Sep 2024, Nov 2024)  → the turn, step 1, a question card
 *   borrowers are part of impact partners' larger programs (Sep 2024)                  → the turn, step 1
 *   the money's path through escrow and back (Sep 2024 diagram, Dec 2024)              → steps 3 and 4 (a three-stop path), proof
 *   why KYC is required for both sides (Aug 2025)                                       → step 2, proof
 *   what happens when a repayment is late (Oct 2025)                                    → step 4, the risk note, a question card
 *   credit-score reporting (Apr 2026)                                                    → step 5
 *   T-Day and the disbursal cycle (Apr 2026)                                             → step 3, a question card
 * Facts are from rangde.in (FAQs, know-the-partner, loan terms and conditions, business-model; read 23 Nov 2026):
 *   partners "identify entrepreneurs from their community", run training, capacity building and market access, and
 *   check "income sources, repayment capacity"; disbursal through a "Lender Escrow Account, operated by the trustee
 *   promoted by the Bank", repayments through a "Borrower Escrow Account"; withdrawals reach the bank "within 1 day";
 *   KYC is required by the RBI before any disbursal; extension, moratorium or one-time settlement for "genuine
 *   hardship"; no guarantee.
 * TO CONFIRM with the team (not on rangde.in's public pages): T-Day as the 1st and 15th (it's in Version 4's copy
 * already), that the loan size is set by the partner from repayment capacity, and how often repayments go to the
 * bureaus (the copy avoids "monthly" until confirmed).
 */

/* ── The turn: the same line and sentence, with who brings each borrower to Rang De. ── */

const TURN = "This is why Rang De exists.";
const TURN_TEXT =
  "Rang De connects rural businesses that need a loan with people who want to lend. Every borrower comes through a local partner already working with their community. Each repayment builds their credit history, so the next loan is easier to get.";

export function TrustTurn() {
  const reduce = useReducedMotion();
  const { ref, p: scroll } = usePin();
  const still = useTransform(scroll, () => 1);
  const p = reduce ? still : scroll;
  const words = TURN_TEXT.split(" ");
  const paraIn = useTransform(p, (v) => span(v, 0.3, 0.38));
  const paraY = useTransform(p, (v) => 24 * (1 - span(v, 0.3, 0.38)));
  return (
    <section id="c-turn" className="mx-2 overflow-clip rounded-[24px]" style={{ backgroundColor: DEEP }}>
      <div ref={ref} className={reduce ? "" : "relative h-[220svh]"}>
        <div className={`${reduce ? "flex flex-col py-20" : STICKY} items-center justify-center gap-8 px-4 text-center md:gap-12`}>
          <h2 className={`${HEAD} max-w-[1100px] text-[40px] md:text-[72px] lg:text-[88px]`} style={{ color: LIME }} aria-label={TURN}>
            {byWord(TURN, (ch, i) => <BlurChar key={i} ch={ch} p={p} at={0.04 + i * 0.008} />)}
          </h2>
          <motion.p className="max-w-[920px] font-display text-[20px] font-bold leading-[1.35] text-white md:text-[30px] lg:text-[34px] [text-wrap:balance]" aria-label={TURN_TEXT} style={{ opacity: paraIn, y: paraY }}>
            {words.map((w, i) => (
              <FillWord key={i} w={w} p={p} at={0.4 + (i / words.length) * 0.5} />
            ))}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/* ── How it works: the same five steps and animations. Each open step now carries a second, quieter line (the "how do
      you know?" answer) and, for the two money steps, the path the money takes, as three stops. ── */

type Step = { t: string; s: string; more: string; path?: [string, string, string] };

const STEPS: Step[] = [
  {
    t: "A local partner finds every borrower",
    s: "Borrowers come from livelihood programs run by Rang De’s impact partners: local organisations already training and mentoring them, and helping them reach markets.",
    more: "The partner visits the business, checks what it earns and what it can repay, and sizes the loan to that. Five checks before a profile goes live: community, business, credit, identity, profile review.",
  },
  {
    t: "You choose who to lend to",
    s: "Each profile says who they are, what the loan is for and how they plan to repay it.",
    more: "You and every borrower complete KYC first. The RBI requires it for peer-to-peer lending, so every rupee is tied to a verified person on both sides.",
  },
  {
    t: "Your money goes straight to them",
    s: "Rang De sends out loans on T-Day, the 1st and 15th of each month. Within 24 hours, the money is in the borrower’s bank account.",
    more: "It never passes through Rang De’s or the partner’s accounts. Until T-Day it waits in an escrow account run by a bank-appointed trustee.",
    path: ["Your bank", "Escrow", "Their bank"],
  },
  {
    t: "Repayments come back to you",
    s: "They repay every month, and you see each repayment and what you’ve earned in one place.",
    more: "If a payment runs late, the partner follows up in person, and can reschedule it for a business going through a hard month.",
    path: ["Their repayment", "Escrow", "Your bank"],
  },
  {
    t: "Their credit history grows",
    s: "Each repayment is reported to the credit bureaus that banks check.",
    more: "On time or late, every repayment goes on their record, so the history a bank sees later is the real one.",
  },
];

/** The money's path in three stops, the middle one marked as the escrow account. */
function Path({ stops }: { stops: [string, string, string] }) {
  return (
    <p className="flex flex-wrap items-center gap-1.5 font-display text-[12px] font-bold leading-none text-ink lg:text-[13px]" aria-label={`Money moves: ${stops.join(", then ")}`}>
      {stops.map((s, i) => (
        <span key={s} className="flex items-center gap-1.5" aria-hidden>
          <span className="rounded-full px-2.5 py-1.5" style={i === 1 ? { backgroundColor: LIME, color: DEEP } : { backgroundColor: "rgba(41,45,54,0.06)" }}>
            {s}
          </span>
          {i < 2 && <span className="text-ink/40">→</span>}
        </span>
      ))}
    </p>
  );
}

/** `phone`: the quieter second line is left off, so the animation under it stays on screen (the question cards cover it). */
function Detail({ step, phone = false }: { step: Step; phone?: boolean }) {
  return (
    <span className="flex max-w-[440px] flex-col gap-2.5 pt-1.5">
      <span className="block">{step.s}</span>
      {!phone && <span className="block text-[13px] leading-[19px] text-ink/48 lg:text-[14px] lg:leading-[21px]">{step.more}</span>}
      {step.path && <Path stops={step.path} />}
    </span>
  );
}

export function TrustHow() {
  const reduce = useReducedMotion();
  const { ref, p } = usePin();
  const [at, setAt] = useState(0);
  useMotionValueEvent(p, "change", (v) => setAt(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length))));
  const rail = useTransform(p, (v) => (reduce ? 1 : v));
  const go = (i: number) => {
    const el = ref.current;
    if (reduce || !el) return setAt(i);
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((i + 0.5) / STEPS.length) * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
  };

  return (
    <section id="c-how" className="mx-2 overflow-clip rounded-[24px]" style={{ backgroundColor: PAPER }}>
      <div ref={ref} className={reduce ? "" : "relative h-[380svh]"}>
        <div className={`${reduce ? "py-10" : STICKY} grid w-full gap-4 p-3 md:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] md:gap-3`}>
          <div className="flex min-h-0 flex-col justify-between gap-4 px-2 pt-4 md:px-6 md:py-8">
            <Lines className={`${H2} text-ink`} a="How it works." b={"You choose. Rang De does the rest."} grey="text-ink/48" />

            <ol className="relative hidden flex-col pl-7 md:flex">
              <span className="absolute bottom-3 left-[5px] top-3 w-[2px] rounded-full bg-ink/10" aria-hidden />
              <motion.span className="absolute left-[5px] top-3 w-[2px] origin-top rounded-full" style={{ height: "calc(100% - 24px)", scaleY: rail, backgroundColor: GREEN }} aria-hidden />
              {STEPS.map((h, i) => (
                <li key={h.t} className="relative py-2">
                  <span className="absolute -left-7 top-[15px] size-3 rounded-full border-2 transition-colors duration-300" style={{ borderColor: i <= at ? GREEN : "rgba(41,45,54,0.2)", backgroundColor: i <= at ? GREEN : PAPER }} aria-hidden />
                  <button type="button" onClick={() => go(i)} aria-current={i === at ? "step" : undefined} className="text-left font-display text-[18px] font-bold leading-[1.25] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-dark lg:text-[21px]" style={{ color: i === at ? INK : "rgba(41,45,54,0.36)" }}>
                    {h.t}
                  </button>
                  <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${i === at ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden font-display text-[15px] font-medium leading-[22px] text-ink/64 lg:text-[16px] lg:leading-[24px]">
                      <Detail step={h} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="flex flex-col gap-3 md:hidden">
              <div className="flex gap-1.5">
                {STEPS.map((h, i) => (
                  <button key={h.t} type="button" onClick={() => go(i)} aria-label={`Step ${i + 1}: ${h.t}`} className="h-[4px] flex-1 rounded-full transition-colors duration-300" style={{ backgroundColor: i <= at ? GREEN : "rgba(41,45,54,0.12)" }} />
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={at} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                  <p className="font-display text-[18px] font-bold leading-[1.25] text-ink">
                    <span style={{ color: GREEN }}>{at + 1}</span> {STEPS[at].t}
                  </p>
                  <div className="font-display text-[14px] font-medium leading-[20px] text-ink/64">
                    <Detail step={STEPS[at]} phone />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <HowStrip at={at} />
        </div>
      </div>
    </section>
  );
}

/* ── One loan, three good things: unchanged, except the risk note now says what happens before a loss. ── */

export function TrustMoney() {
  return (
    <section id="c-compare" className={SECTION} style={{ backgroundColor: DEEP }}>
      <div className={`${WIDE} flex flex-col gap-8 md:gap-12`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <Lines className={`${H2} text-white`} a="One loan, three good things." grey="" />
          <p className={`${SUB} max-w-[520px] text-white/64`}>Rang De calls this social investment: lending that does good and can earn you interest.</p>
        </div>
        <ul className="flex flex-col">
          {DOES.map((d, i) => (
            <li key={d.t} className="sticky mb-3 grid overflow-hidden rounded-[24px] bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.25)] md:mb-4 md:grid-cols-[5fr_7fr]" style={{ top: `calc(var(--navbar-bottom,0px) + ${32 + i * 20}px)` }}>
              <div className="flex flex-col justify-center gap-4 p-6 md:p-14">
                <span className="font-display text-[14px] font-bold tabular-nums" style={{ color: GREEN }}>
                  {i + 1} of {DOES.length}
                </span>
                <p className={`${HEAD} text-[28px] text-ink md:text-[48px]`}>{d.t}</p>
                <p className={`${SUB} max-w-[380px] text-ink/64`}>{d.s}</p>
              </div>
              <div className="relative h-[200px] md:h-auto md:min-h-[min(540px,62svh)]">
                <Image src={d.img} alt="" fill sizes="(min-width: 768px) 520px, 100vw" className="object-cover" />
                <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-display text-[13px] font-bold text-ink shadow-[0_6px_16px_rgba(41,45,54,0.16)]">
                  <span className="flex size-[18px] items-center justify-center rounded-full text-[10px]" style={{ backgroundColor: LIME, color: DEEP }}>
                    ✓
                  </span>
                  {d.chip}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3">
          <p className="font-display text-[15px] font-bold text-white/72 md:text-[17px]">What to expect</p>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { big: "Up to 8.5%", line: "a year in interest, depending on the loan" },
              { big: "6–18 months", line: "how long today’s loans run, repaid monthly" },
              { big: "From ₹500", line: "to start; up to ₹50,000 with any one borrower" },
              { big: "Up to 4%", line: "fee on loans you choose yourself. Yearly plans: up to ₹999." },
            ].map((t) => (
              <li key={t.big} className="flex flex-col gap-1 rounded-[16px] p-4 md:p-5" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                <p className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-[28px]">{t.big}</p>
                <p className="font-display text-[13px] font-medium leading-[19px] text-white/64 md:text-[14px]">{t.line}</p>
              </li>
            ))}
          </ul>
          <a href="https://rangde.in/pricing-structure-policy" target="_blank" rel="noreferrer" className="w-fit font-display text-[13px] font-bold text-white/72 underline decoration-white/32 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            See the full pricing policy<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <div className="flex items-start gap-3 rounded-[16px] bg-white px-5 py-4">
          <Icon name="info" size={20} className="mt-0.5" />
          <p className={`${SUB} text-ink/72`}>
            Like any loan, repayment isn’t guaranteed. When a payment is late, the local partner follows up and can reschedule it. If a borrower still can’t repay, you could lose part of what you lent.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Proof: the same cards; the facts on the left now answer "where is my money?" and "who is on the other side?". ── */

export function TrustProof() {
  const s = useRangDeStats();
  return (
    <section id="c-proof" className={`${SECTION} bg-white`}>
      <div className={`${WIDE} grid gap-8 md:grid-cols-[5fr_7fr] md:gap-12`}>
        <div className="flex flex-col items-start gap-4 self-start md:sticky md:top-[calc(var(--navbar-bottom,0px)+48px)]">
          <Lines className={`${H2} text-ink`} a="It’s already working." b="You wouldn’t be lending alone." grey="text-ink/48" />
          <ul className="flex w-full max-w-[460px] flex-col">
            {[
              "Registered with the RBI as a peer-to-peer lending platform",
              "Your money moves through escrow, never through Rang De’s own accounts",
              "Every lender and borrower is KYC-verified",
              `₹${Math.round(s.repaidCr)} Cr repaid to lenders, of ₹${Math.round(s.disbursedCr)} Cr lent since 2019`,
            ].map((fact) => (
              <li key={fact} className="border-t border-ink/10 py-3 font-display text-[16px] font-bold leading-[23px] text-ink last:border-b md:text-[17px] md:leading-[25px]">
                {fact}
              </li>
            ))}
          </ul>
          <div className="mt-2 max-sm:hidden">
            <LinkButton href={SIGNUP_URL}>Start lending</LinkButton>
          </div>
        </div>
        <ul className="flex flex-col gap-3">
          <ProofCard to={Math.round(s.disbursedCr)} prefix="₹" suffix=" Cr" line="lent through Rang De since 2019" bg={DEEP} fg="#fff" />
          <ProofCard to={s.entrepreneurs} line="loans to rural businesses" bg={LIME} fg={DEEP} />
          <ProofCard to={s.investors} line={`people lending, ${s.investorsAbroad.toLocaleString("en-IN")} of them from outside India`} bg={PAPER} fg={INK} />
        </ul>
      </div>
    </section>
  );
}

/* ── Before you lend: the four questions, now the ones lenders asked in the feedback sessions. "How secure is my money"
      and the NRI question make way; their answers live in the steps, the proof list and the full FAQ. ── */

const returns = QUESTION_CARDS.find((q) => q.question.startsWith("Why aren"))!;

export const TRUST_QUESTIONS: QuestionCard[] = [
  {
    question: "How does Rang De choose who gets a loan?",
    image: "/images/how-it-works/opp-1.webp",
    facts: [
      { text: "Part of a local partner’s livelihood program", tone: "ok" },
      { text: "Loan sized to what the business can repay", tone: "ok" },
      { text: "Five checks before a profile goes live", tone: "ok" },
    ],
    answer:
      "Rang De doesn’t find borrowers through ads. They come through impact partners: local organisations that already work with a community, running training, mentoring and market access for small businesses. Credit is one more part of that program, not the whole of it.\n\nThe partner visits each business, looks at what it earns, what it needs the money for and what it can repay each month, and sizes the loan to that. Then come five checks: community identification, business assessment, credit evaluation, identity verification and a profile review. Only borrowers who pass every one are listed.",
  },
  {
    question: "Where does my money go, and when?",
    image: "/images/stories/story-3-bg.webp",
    facts: [
      { text: "Held in escrow by a bank-appointed trustee", tone: "ok" },
      { text: "Sent out on T-Day: the 1st and 15th", tone: "ok" },
      { text: "Never through Rang De’s own accounts", tone: "ok" },
    ],
    answer:
      "When you lend, your money goes into an escrow account run by a trustee appointed by a bank, as the RBI requires for peer-to-peer lending. It never sits in Rang De’s or the partner’s accounts.\n\nLoans go out on T-Day, the 1st and 15th of each month. Money you commit between T-Days waits in escrow until the next one, then reaches the borrower’s own bank account within 24 hours.\n\nRepayments come back the other way, through a second escrow account, into your Rang De balance. Withdraw it and it’s in your bank within a day.",
  },
  {
    question: "What happens if a borrower pays late?",
    image: "/images/stories/story-4-bg.webp",
    facts: [
      { text: "The local partner follows up in person", tone: "ok" },
      { text: "Hard months can be rescheduled", tone: "ok" },
      { text: "No guarantee: RBI rules", tone: "no" },
    ],
    answer:
      "The partner who brought the borrower to Rang De stays with them through the loan. When a payment is late, they’re the first to follow up, in person, and find out why.\n\nIf the business is going through a genuine hard time (a failed crop, an illness), the loan can be given more time or a short pause. If a borrower stops paying, late fees apply, dues can be collected, and the default is reported to the credit bureaus.\n\nEven so, as per RBI rules, no repayment on Rang De is guaranteed, and you could lose part of what you lent. Spreading your money across many borrowers lowers the effect of any one of them.",
  },
  returns,
];
