// Screen geometry shared by the pinned sections and the scroll steps on /v/fourth-wall-approach.
// "The middle of the screen" here is the middle of what's left below the sticky nav.

/** Height of the sticky nav (the bar the page scrolls under). */
export function navHeight() {
  return document.querySelector("header")?.getBoundingClientRect().height ?? 0;
}

/** Y (in the viewport) of the middle of the area below the nav. */
export function screenMiddle() {
  const nav = navHeight();
  return nav + (window.innerHeight - nav) / 2;
}

/** Sticky top for a pinned panel: centred below the nav, but never under it. */
export function pinTop(panel: HTMLElement) {
  const nav = navHeight();
  return Math.max(nav + 8, nav + (window.innerHeight - nav - panel.offsetHeight) / 2);
}

/** A pin container's first child is its panel; the container is taller by the pinned stretch. */
function pinParts(pin: HTMLElement) {
  const panel = pin.firstElementChild as HTMLElement;
  return { panel, run: Math.max(1, pin.offsetHeight - panel.offsetHeight), top: pinTop(panel) };
}

/** 0 as the panel settles in its pinned spot, 1 as it starts to leave. */
export function pinProgress(pin: HTMLElement) {
  const { run, top } = pinParts(pin);
  return Math.min(1, Math.max(0, (top - pin.getBoundingClientRect().top) / run));
}

/** The page scroll at which a pin is at progress `p`. */
export function pinScrollAt(pin: HTMLElement, p: number) {
  const { run, top } = pinParts(pin);
  return pin.getBoundingClientRect().top + window.scrollY - top + run * p;
}

/** The page scroll that puts an element's middle in the middle of the screen. */
export function centreScrollFor(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.top + window.scrollY + r.height / 2 - screenMiddle();
}
