import { wordRevealLength } from "@/components/ui/WordReveal";

// The hero's entrance, shared by the homepage and the /v test versions, in the order of
// rangde.org's programme pages: the headline fills in word by word (pale → full, like
// Swabhimaan), then the sub-heading appears word by word (like the About page), then the
// button, then the stats.
export const TITLE_STAGGER = 0.05;
export const TITLE_DURATION = 0.4;
export const BODY_STAGGER = 0.02;
export const BODY_DURATION = 0.3;
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** When each step starts, in seconds after the page is ready. */
export function heroSequence(title: string, body: string) {
  // Each step starts just before the previous one finishes, so it reads as one movement.
  const body0 = wordRevealLength(title, TITLE_STAGGER, TITLE_DURATION) - 0.15;
  const button = body0 + wordRevealLength(body, BODY_STAGGER, BODY_DURATION) - 0.1;
  return { body: body0, button, stats: button + 0.15 };
}
