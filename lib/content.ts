// Homepage content. Numbers come live from rangde.in (lib/stats.ts); stories and
// testimonials are cross-checked against rangde.in (see the notes on each).

import type { RangDeStats } from "./stats";

export type HeroStat =
  | { kind: "number"; target: number; format: (n: number) => string; label: string }
  | { kind: "icon"; icon: string; label: string };

/** The hero's proof row, from the live rangde.in numbers (see lib/stats.ts). */
export function heroStatsFrom(s: RangDeStats): HeroStat[] {
  return [
    {
      kind: "number",
      target: s.entrepreneurs,
      format: (n) => Math.round(n).toLocaleString("en-IN"),
      label: "Entrepreneurs funded",
    },
    {
      kind: "number",
      target: s.disbursedCr,
      format: (n) => `₹ ${n.toFixed(2)} Cr`,
      label: "Loans disbursed",
    },
    { kind: "icon", icon: "/icons/rbi-seal.webp", label: "RBI Regulated" },
    {
      kind: "number",
      target: s.investors,
      format: (n) => Math.round(n).toLocaleString("en-IN"),
      label: "Investors aboard",
    },
    {
      kind: "number",
      target: s.principalRepaidPct,
      format: (n) => `${n.toFixed(1)}%`,
      label: "Principal repaid",
    },
  ];
}

export interface Story {
  image: string;
  avatar: string;
  highlight: string;
  rest: string;
  totalFunded: string;
  returns: string;
  /** "Recent" card layout (approach versions): who and where, what the loan was for, when. */
  name?: string;
  purpose?: string;
  when?: string;
  investors?: number;
}

// The four success stories from rangde.in's "Some of our success stories" (Oct 2026):
// copy, amount raised, investor count and returns as published there. Portraits are the
// entrepreneurs’ own photos from that section (rangde.imgix.net/images/page-home/*.png,
// published as circles — cropped to the square inside the circle for these cards);
// the wide background photos are scene shots, not of these four people.

export const stories: Story[] = [
  {
    image: "/images/stories/story-1-bg.webp",
    avatar: "/images/stories/story-1-avatar.webp",
    highlight: "57 social investors funded Neilhoupe u Koza’s apparel business",
    rest: ", which is now running well, so she earns more and provides for her sibling.",
    totalFunded: "₹ 1,50,000",
    returns: "5.00% p.a.",
  },
  {
    image: "/images/stories/story-2-bg.webp",
    avatar: "/images/stories/story-2-avatar.webp",
    highlight: "240 social investors funded Sivakumar’s life-sized elephant structures",
    rest: " made from invasive Lantana weeds, giving him working capital for his art and livelihood.",
    totalFunded: "₹ 5,00,000",
    returns: "6.00% p.a.",
  },
  {
    image: "/images/stories/story-3-bg.webp",
    avatar: "/images/stories/story-3-avatar.webp",
    highlight: "4 social investors funded Gita Devi’s fish farm",
    rest: ", so she could buy fish feed and work on multiple ponds, a season that brought her ₹20,000 in profit.",
    totalFunded: "₹ 20,000",
    returns: "8.00% p.a.",
  },
  {
    image: "/images/stories/story-4-bg.webp",
    avatar: "/images/stories/story-4-avatar.webp",
    highlight: "13 social investors helped Sitara Devi open her own cosmetics store",
    rest: ". She now earns ₹12,000 a month and contributes to her family’s wellbeing.",
    totalFunded: "₹ 30,000",
    returns: "8.00% p.a.",
  },
];

export interface QuoteSegment {
  text: string;
  emphasized?: boolean;
}

export interface Testimonial {
  quote: QuoteSegment[];
  name: string;
  /** Title and/or place, as published — omitted when Rang De doesn't show one. */
  role?: string;
  /** "Social Investor since …" from their Rang De profile, when public. */
  since?: string;
  avatar: string;
  /** Country flag, only where the country is on record. */
  flag?: string;
}

// Real social investors, cross-checked Oct 2026 against rangde.in: quotes from the
// Wall of Love (rangde.in/wall-of-love, embed.testimonial.to/w/rangde), titles as shown
// there, places and "since" from their public Rang De profiles (rangde.in/<profile>) or
// the homepage investor cards (rangde.in/si-cards). Photos: the Rang De profile photo
// where public, otherwise the Wall of Love photo. Nothing is filled in that isn't on record.
const IN = "\u{1F1EE}\u{1F1F3}";
const US = "\u{1F1FA}\u{1F1F8}";

export const testimonialsRow1: Testimonial[] = [
  {
    quote: [
      { text: "For all of us who benefited financially thanks to a liberalised and growing Indian economy, " },
      { text: "this is a fantastic opportunity to help others who need small capital to grow", emphasized: true },
      { text: " - not through donations but through contributing to affordable loans." },
    ],
    name: "Chaitanya Nadkarny",
    role: "Chairman, STARS Forum",
    since: "Social Investor since Sep 2019",
    avatar: "/images/testimonials/chaitanya-nadkarny.webp",
  },
  {
    quote: [
      { text: "So, after 3 years of investing in rural India via Rang De, I just crossed a small milestone, " },
      { text: "just crossed 3,000 rural Indian entrepreneurs that I’ve provided microloans to!", emphasized: true },
      { text: " This translated to ~30,420 days of livelihood in rural India." },
    ],
    name: "Kishor Nayar, PhD, PE",
    role: "Business Director, Xylem · Texas, USA",
    since: "Social Investor since 2023",
    avatar: "/images/testimonials/kishor-nayar.webp",
    flag: US,
  },
  {
    quote: [
      { text: "It’s humbling to know that " },
      { text: "my investments have helped make an impact", emphasized: true },
      { text: " in the lives of farmers and rural entrepreneurs across India. Thank you, Rang De, for letting me be a small part of this big change." },
    ],
    name: "Ritika Ojha",
    role: "Senior Business Project Manager",
    avatar: "/images/testimonials/ritika-ojha.webp",
  },
  {
    quote: [
      { text: "Am extremely impressed with the impact that team Rang De have done over the years championing lending for the weakest section of rural India. " },
      { text: "I feel good that I am able to support women in rural India who are micro entrepreneurs.", emphasized: true },
    ],
    name: "Hari Balasubramanian",
    role: "Angel Investor & Mentor · Karnataka, India",
    since: "Social Investor since Sep 2019",
    avatar: "/images/testimonials/hari-balasubramanian.webp",
    flag: IN,
  },
];

export const testimonialsRow2: Testimonial[] = [
  {
    quote: [
      { text: "First… it’s not a donation, it’s social investment, you get repaid with interest. Rang De organises and manages micro loans for people. " },
      { text: "Great way to support people who need these loans the most.", emphasized: true },
    ],
    name: "Ajay Jain",
    role: "Social Investor",
    avatar: "/images/testimonials/ajay-jain.webp",
  },
  {
    quote: [
      { text: "Your efforts are empowering rural people get the credit that they deserve with dignity. " },
      { text: "I am honoured to be one of your contributors", emphasized: true },
      { text: " and it gives immense satisfaction to see how it is impacting the lives of others." },
    ],
    name: "Amrudesh Santhanam",
    role: "Engineer, India",
    since: "Social Investor since Sep 2019",
    avatar: "/images/testimonials/amrudesh-santhanam.webp",
    flag: IN,
  },
  {
    quote: [
      { text: "Best investment so far! And that too without ever knowing the IRR - for both equity and debt. Rang De has let me live both my ideological sides together happily - " },
      { text: "\"socialist by heart and capitalist by brain\".", emphasized: true },
    ],
    name: "Mahesh Avasare",
    role: "Maharashtra, India",
    since: "Social Investor since Oct 2023",
    avatar: "/images/testimonials/mahesh-avasare.webp",
    flag: IN,
  },
  {
    quote: [
      { text: "I am a new investor at Rang De. " },
      { text: "I have been looking for such a platform for a while.", emphasized: true },
      { text: " Their cause resonates with me and I am happy to be a part of this journey." },
    ],
    name: "Shiri Baghar",
    role: "Founder & Director, Proteus Technologies",
    avatar: "/images/testimonials/shiri-baghar.webp",
  },
];

export const footerNavLinks = [
  "FAQs",
  "About",
  "Social Investors",
  "Track Record",
  "Blog",
  "Contact",
  "Partner with Us",
];

export const footerLegalLinks = [
  "Terms",
  "Loan Terms & Conditions",
  "Pricing Structure Policy",
  "Privacy Policy",
  "Data Usage and Protection",
  "Grievance Redressal Policy",
  "Fair Practices Code",
  "Annual Returns",
];

// Recent stories for the approach versions (app/v/v1, v1-2, v3; Figma 2743:14706): the card puts
// the borrower and what the loan was for first, when they were funded, and the investor count as
// its own figure instead of inside the sentence. Names, amounts, investor counts and rates are the
// four rangde.in success stories above; `when` is a PLACEHOLDER until these come from the live
// "recently funded" feed (the point of the card is that the stories are recent).
export const recentStories: Story[] = [
  { ...stories[2], name: "Gita Devi", purpose: "Funded for fish feed, so she could work on multiple ponds.", when: "2 weeks ago", investors: 4 },
  { ...stories[3], name: "Sitara Devi", purpose: "Funded to open her own cosmetics store.", when: "3 weeks ago", investors: 13 },
  { ...stories[0], name: "Neilhoupe u Koza", purpose: "Funded to run and grow her apparel business.", when: "1 month ago", investors: 57 },
  { ...stories[1], name: "Sivakumar", purpose: "Funded for working capital for his Lantana-weed elephant sculptures.", when: "1 month ago", investors: 240 },
];
