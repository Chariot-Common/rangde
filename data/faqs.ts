// A short selection from https://rangde.in/faqs (answers verbatim, as of 2026-10-07), grouped
// under the same headings as the live page; "See all FAQs" links to the full list.
// Do not alter the meaning of these answers — particularly "we cannot guarantee any
// repayments" and "Upto 8.5% … returns vary": these are RBI-mandated / factual disclosures.

export interface Faq {
  question: string;
  answer: string;
  /** An illustration that explains the answer, shown in the FAQ pop-up (Version B). */
  illustration?: string;
}

export interface FaqGroup {
  category: string;
  faqs: Faq[];
}

export const FAQS_URL = "https://rangde.in/faqs";

export const faqGroups: FaqGroup[] = [
  {
    category: "About Rang De",
    faqs: [
      {
        question: "What is Rang De's mission?",
        answer:
          "Rang De is on a mission to revolutionize credit access and enable financial inclusion for every individual in India. We are focused on providing affordable and timely credit access to unbanked individuals in the country.",
      },
      {
        question: "What is unique about Rang De?",
        answer:
          "Rang De is India's pioneering and only peer to peer lending platform focused on providing timely and affordable credit to unbanked communities.",
      },
      {
        question: "Is Rang De a crowdfunding platform?",
        answer:
          "Rang De is not a crowdfunding platform. Rang De is an RBI regulated peer to peer lending platform. Individuals lend money towards livelihood and education needs of communities. Individuals who receive the loans repay it as per a predefined repayment schedule. This can be either withdrawn or reinvested.\n\nA crowdfunding platform on the other hand primarily raises donations and enables users to do the same for specific causes. Crowdfunding of donations is unregulated and does not come under the purview of any regulator.",
      },
    ],
  },
  {
    category: "How does Rang De work",
    faqs: [
      {
        question: "How does the Rang De model work?",
        answer:
          "Social investors invest in an investee or fund of their choice. Each social investor invests an amount of their choice, starting with Rs. 500. Once a loan is fully funded through these investments, the funds are transferred directly to the investee's bank account. The investee repays the loan according to a repayment schedule, and the social investors receive these repayments in the form of Rang De credit in their dashboard. This credit can be reinvested or withdrawn to the social investor's bank account.",
      },
      {
        question: "How does Rang De curate investees?",
        answer:
          "Rang De works with a network of impact partners across the country. These organizations identify individuals who need credit within the communities they work with.",
      },
    ],
  },
  {
    category: "Investing on Rang De",
    faqs: [
      {
        question: "How do I make an investment?",
        answer:
          "You can make an investment in 3 simple steps:\n• Choose an investee or fund to invest in\n• Enter an amount to invest\n• Make the payment\n\nYou can find all investees and funds on rangde.in/invest",
      },
      {
        question: "What are the payment options to make an investment?",
        answer:
          "You can pay using debit card, net banking, UPI, or any wallet such as Mobikwik, Phone Pe, etc.\n\nYou can also make a payment using a credit card. However, this cannot be done directly- you have to use your credit card through any of your existing wallets such as Mobikwik, Phone Pe, etc.",
      },
      {
        question: "What is KYC? Why is it needed?",
        answer:
          "KYC (Know Your Customer) is the mandatory process of verifying your identity. RBI prohibits us to disburse your investment to any investee unless your KYC is complete. This helps us ensure that only verified social investors use our platform.",
      },
    ],
  },
  {
    category: "Repayments & interest rates",
    faqs: [
      {
        question: "How does Rang De ensure that I get my money back?",
        answer:
          "Rang De works with a set of credible and ethical community organizations or social enterprises called impact partners. These organizations identify communities engaged in sustainable livelihoods, but do not have access to institutional credit. They mentor these communities in effectively utilizing and repaying this credit, leading to an excellent repayment rate on Rang De. However, as per RBI regulations, we cannot guarantee any repayments on the platform.",
      },
      {
        question: "How much interest will I earn if I invest?",
        answer:
          "You can earn Upto 8.5% per annum through your investments. Your returns vary across different investees and funds that you invest in- these are visible upfront in the investee or fund details before and during investment.",
      },
    ],
  },
  {
    category: "NRIs and OCI holders",
    faqs: [
      {
        question: "What are the payment options for NRIs and OCI card holders?",
        answer:
          "We accept payments in Indian currency from Non Resident Rupee accounts maintained with Banks in India. RBI regulations do not permit us to accept payments from overseas Bank accounts or international cards issued overseas.",
      },
      {
        question: "I am a foreign national. Can I invest on Rang De?",
        answer:
          "No. As per the RBI (Reserve Bank of India) guidelines, only Resident Indians, Non-Resident Indians, and Overseas Citizens of India/Persons of Indian Origin having valid KYC documents and Indian bank accounts can invest on Rang De.",
      },
      {
        question: "Can I invest in foreign currency?",
        answer:
          "No. According to the guidelines set by the Reserve Bank of India (RBI), investing in foreign currencies is not permissible on our platform.",
      },
    ],
  },
];

const find = (question: string) => {
  const faq = faqGroups.flatMap((g) => g.faqs).find((f) => f.question === question);
  if (!faq) throw new Error(`FAQ not found: ${question}`);
  return faq;
};

/**
 * Version B's FAQ: twelve questions, in the order asked for in the Figma notes (node 2479:897). Two of them reword a question for the strip but keep rangde.in's
 * answer verbatim: "Are returns guaranteed?" uses the answer to "How does Rang De ensure that I
 * get my money back?" (it carries the RBI line that repayments cannot be guaranteed), and "What
 * is Rang De's revenue model?" uses the answer to "How does Rang De sustain itself?" (copied from
 * rangde.in/faqs on 2026-10-28).
 */
export const ideaFaqs: Faq[] = [
  { question: "Are returns guaranteed?", answer: find("How does Rang De ensure that I get my money back?").answer },
  {
    question: "What is Rang De's revenue model?",
    answer:
      "Rang De has adopted a platform as a service business model. We earn our revenues through platform access fees paid by our impact partners. The impact partners pay a one time setup fee at the time of their onboarding and an annual recurring fee. The impact partners pay this fee to gain access to Rang De’s regulated credit platform for their communities.",
  },
  find("What is Rang De's mission?"),
  find("What is unique about Rang De?"),
  find("Is Rang De a crowdfunding platform?"),
  find("What are the payment options to make an investment?"),
  find("What is KYC? Why is it needed?"),
  find("How much interest will I earn if I invest?"),
  find("What are the payment options for NRIs and OCI card holders?"),
  find("I am a foreign national. Can I invest on Rang De?"),
  find("Can I invest in foreign currency?"),
  find("How does the Rang De model work?"),
];
