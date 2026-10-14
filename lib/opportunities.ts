import { INDIVIDUALS_SNAPSHOT } from "@/data/opportunities-snapshot";

export interface IndividualOpportunity {
  /** rangde.in profile slug — the card links to rangde.in/i/{key}. */
  key: string;
  name: string;
  district: string;
  state: string;
  purpose: string;
  raised: number;
  goal: number;
  /** Investor return, % p.a. */
  returnRate: number;
  tenureMonths: number;
  ratingLabel: string;
  /** 0–5, as published with the listing. */
  ratingStars: number;
  photo: string;
}

export interface StateOpportunity {
  name: string;
  slug: string;
  sectors: string;
  investors: string;
  invested: string;
  investees: string;
  image: string;
}

export interface FundOpportunity {
  name: string;
  slug: string;
  description: string;
  /** Upper bound shown as "up to … p.a." */
  returnsUpTo: string;
  tenureMonths: string;
  /** Short line under the name on the card photo. */
  focus: string;
  image: string;
}

const LISTINGS_URL = "https://rangde.in/invest-j?partial=true&category=all&page=0&size=40";

interface RawLoan {
  borrowerFriendlyKey: string;
  borrowerName: string;
  borrowerDistrict: string;
  regionName: string;
  loanPurpose: string;
  amountRaised: number;
  totalAmount: number;
  investorInterestRate: number;
  tenure: number;
  investeeRating?: { label?: string; starRating?: number } | null;
  avatar?: { uri?: string } | null;
}

/**
 * Live "in need" listings from the same public feed rangde.in/invest/individuals uses.
 * Revalidated every 10 minutes (ISR), so the page stays static and fast while the cards
 * track fundraising progress; falls back to a captured snapshot if the feed is down.
 */
export async function getIndividualOpportunities(): Promise<IndividualOpportunity[]> {
  try {
    const res = await fetch(LISTINGS_URL, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`listings feed responded ${res.status}`);
    const json = (await res.json()) as { loans?: RawLoan[] };
    const items = (json.loans ?? [])
      .filter((l) => l.avatar?.uri && l.totalAmount > 0)
      .map<IndividualOpportunity>((l) => ({
        key: l.borrowerFriendlyKey,
        name: l.borrowerName.replace(/\s+/g, " ").trim(),
        district: l.borrowerDistrict,
        state: l.regionName,
        purpose: l.loanPurpose,
        raised: l.amountRaised,
        goal: l.totalAmount,
        returnRate: l.investorInterestRate,
        tenureMonths: l.tenure,
        ratingLabel: l.investeeRating?.label ?? "",
        ratingStars: l.investeeRating?.starRating ?? 0,
        photo: l.avatar!.uri!,
      }));
    return items.length > 0 ? items : INDIVIDUALS_SNAPSHOT;
  } catch {
    return INDIVIDUALS_SNAPSHOT;
  }
}

/**
 * One card per borrower: the feed lists every open loan, and some borrowers (e.g. a producer
 * company) have several at once, which made the row repeat the same photo and name. Keeps
 * each borrower's first listing in feed order. The headline still counts every live loan.
 */
export function uniqueBorrowers(items: IndividualOpportunity[]): IndividualOpportunity[] {
  const seen = new Set<string>();
  return items.filter((o) => {
    const id = `${o.name}|${o.district}`.toLowerCase();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/** rangde.in/invest/state, captured 6 Oct 2026 (no public feed for these). */
export const STATE_OPPORTUNITIES: StateOpportunity[] = [
  {
    name: "Assam",
    slug: "assam",
    sectors: "Farming, Animal husbandry, Fisheries",
    investors: "6.1K",
    invested: "₹16.48 Cr",
    investees: "5.1K",
    image: "https://rangde.imgix.net/images/state-bg/assam.jpg",
  },
  {
    name: "Madhya Pradesh",
    slug: "madhya-pradesh",
    sectors: "Animal husbandry, Retail store, Farming",
    investors: "6.0K",
    invested: "₹14.46 Cr",
    investees: "3.3K",
    image: "https://rangde.imgix.net/images/state-bg/madhya-pradesh.jpg",
  },
  {
    name: "Maharashtra",
    slug: "maharashtra",
    sectors: "Farming, Animal husbandry",
    investors: "4.2K",
    invested: "₹7.63 Cr",
    investees: "1.9K",
    image: "https://rangde.imgix.net/images/state-bg/maharastra.jpg",
  },
  {
    name: "Rajasthan",
    slug: "rajasthan",
    sectors: "Farming, Animal husbandry, Retail store",
    investors: "6.3K",
    invested: "₹20.56 Cr",
    investees: "4.7K",
    image: "https://rangde.imgix.net/images/state-bg/rajasthan.jpg",
  },
];

/** Every state listing shares these terms on rangde.in. */
export const STATE_TERMS = { returnsUpTo: "8.5%", tenureMonths: "1–24" };

/** rangde.in/invest/fund, captured 6 Oct 2026. */
export const FUND_OPPORTUNITIES: FundOpportunity[] = [
  {
    name: "Rang De Fund",
    slug: "rang-de-fund",
    description:
      "Affordable credit for farm-based enterprises, women entrepreneurs and students pursuing education and skilling.",
    returnsUpTo: "8–8.5%",
    tenureMonths: "3–24",
    focus: "Farm enterprises · Women · Students",
    image: "https://rangde.imgix.net/images/funds/rangde-fund/rangde-fund-img-1.jpg",
  },
];

/** imgix sizing for card photos — the source images are large phone photos. */
export function imgix(url: string, w: number, h: number) {
  return `${url}?auto=compress,format&w=${w}&h=${h}&fit=crop&crop=faces`;
}
