// Static content pulled directly from the Figma file (node 212:10083, "home page").

export const heroStats: Array<
  | { kind: "number"; target: number; format: (n: number) => string; label: string }
  | { kind: "icon"; icon: string; label: string }
> = [
  {
    kind: "number",
    target: 29_283,
    format: (n) => Math.round(n).toLocaleString("en-IN"),
    label: "Entrepreneurs funded",
  },
  {
    kind: "number",
    target: 108.08,
    format: (n) => `₹ ${n.toFixed(2)} Cr`,
    label: "Total Invested",
  },
  { kind: "icon", icon: "/icons/rbi-seal.webp", label: "RBI Regulated" },
  {
    kind: "number",
    target: 11_596,
    format: (n) => Math.round(n).toLocaleString("en-IN"),
    label: "Investors aboard",
  },
  {
    kind: "number",
    target: 99.7,
    format: (n) => `${n.toFixed(1)}%`,
    label: "Principle Repaid",
  },
];

export interface Story {
  image: string;
  avatar: string;
  highlight: string;
  rest: string;
  totalFunded: string;
  returns: string;
}

// The four success stories from rangde.in's "Some of our success stories" (Oct 2026):
// copy, amount raised, investor count and returns as published there. Photos are still the
// Figma placeholders — swap in real photos of each entrepreneur when available.

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
  role: string;
  since: string;
  avatar: string;
  flag: string;
}

export const testimonialsRow1: Testimonial[] = [
  {
    quote: [
      { text: "For all of us who benefited financially thanks to a liberalised and growing Indian economy, " },
      { text: "this is a fantastic opportunity to help others who need small capital to grow", emphasized: true },
      { text: " - not via donations but through contributing to affordable loans." },
    ],
    name: "Chaitanya Nadkarny",
    role: "Chartered Accountant, India",
    since: "Social Investor since Jun 2021",
    avatar: "/images/testimonials/chaitanya-nadkarny.webp",
    flag: "\u{1F1E9}\u{1F1EA}",
  },
  {
    quote: [
      { text: "So, after 3 years of investing in rural India via Rang De, I just crossed a small milestone, " },
      { text: "just crossed 3,000 rural Indian entrepreneurs that I’ve provided microloans to!", emphasized: true },
      { text: " This translated to ~30,420 days of livelihood in rural India." },
    ],
    name: "Kishor Nayar, PhD, PE",
    role: "Texas, USA",
    since: "Social Investor since Jun 2021",
    avatar: "/images/testimonials/kishor-nayar.webp",
    flag: "\u{1F1EE}\u{1F1F3}",
  },
  {
    quote: [
      { text: "It’s humbling to know that " },
      { text: "my investments have help made an impact", emphasized: true },
      { text: " on the lives of farmers and rural entrepreneurs across India. Thank you, RangDe , for letting me be a small part of this big change" },
    ],
    name: "Ritika Ojha",
    role: "Chartered Accountant, India",
    since: "Social Investor since Jun 2021",
    avatar: "/images/testimonials/ritika-ojha.webp",
    flag: "\u{1F1FA}\u{1F1F8}",
  },
  {
    quote: [
      { text: "I've enabled over 30 individuals, each one contributing to their own dignity and livelihood. " },
      { text: "You don't need crores to be a social investor.", emphasized: true },
      { text: " You just need the urge to give back — consistently & consciously." },
    ],
    name: "S. Balasubramanian",
    role: "Chartered Accountant, India",
    since: "Social Investor since Jun 2021",
    avatar: "/images/testimonials/s-balasubramanian.webp",
    flag: "\u{1F1EE}\u{1F1F3}",
  },
];

export const testimonialsRow2: Testimonial[] = [
  {
    quote: [
      { text: "First… it’s not a donation, it’s social investment, you get repaid with interest.  Rang De organises and manages micro loans for people. " },
      { text: "Great way to support people who need these loans the most.", emphasized: true },
    ],
    name: "Ajay Jain",
    role: "Chartered Accountant, India",
    since: "Social Investor since Jun 2021",
    avatar: "/images/testimonials/ajay-jain.webp",
    flag: "\u{1F1EF}\u{1F1F5}",
  },
  {
    quote: [
      { text: "The biggest factor that kept me going is their " },
      { text: "diligence and their impact partners who make sure that our capital remains safe.", emphasized: true },
      { text: " I have received every single rupee I have given and more (the interest where applicable)." },
    ],
    name: "Amrudesh Santhanam",
    role: "Engineer, India",
    since: "Social Investor since Jun 2021",
    avatar: "/images/testimonials/amrudesh-santhanam.webp",
    flag: "\u{1F1EE}\u{1F1F3}",
  },
  {
    quote: [
      { text: "Best investment so far! And that too without ever knowing the IRR - for both equity and debt. Rang De has let me live both my ideological sides together happily - " },
      { text: "\"socialist by heart and capitalist by brain\".", emphasized: true },
    ],
    name: "Mahesh Avasare",
    role: "Chartered Accountant, India",
    since: "Social Investor since Jun 2021",
    avatar: "/images/testimonials/mahesh-avasare.webp",
    flag: "\u{1F1EE}\u{1F1F3}",
  },
  {
    quote: [
      { text: "I am a new investor at Rang De. " },
      { text: "I have been looking for such a platform for a while.", emphasized: true },
      { text: " Their cause resonates with me and I am happy to be a part of this journey." },
    ],
    name: "Shiri Baghar",
    role: "Founder and Director, India",
    since: "Social Investor since Jun 2021",
    avatar: "/images/testimonials/shiri-baghar.webp",
    flag: "\u{1F1E6}\u{1F1FA}",
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
