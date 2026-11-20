import { cn } from "./cn";

/** SVGs live in public/icons. Add a name here only after exporting the SVG from Figma. */
export type IconName =
  | "chevron-down"
  | "accordion-chevron-down"
  | "accordion-chevron-up"
  | "close"
  | "info"
  | "flag"
  | "money-rupee-circle"
  | "cart-arrow"
  | "menu"
  | "chevron-right-small"
  // FAQ card coins (Figma "FAQ assets", Rang De Master Design III, node 2917:86)
  | "faq-returns"
  | "faq-secure"
  | "faq-nri"
  | "faq-warning"
  | "faq-plus"
  // Where borrowers turn for a loan (/v/why2 "What are their options?"), solid, in text grey 80
  | "bank"
  | "money-bag"
  | "avatars-group"
  | "house-avatar";

/** Native size of each exported SVG, in px. [width, height] for non-square SVGs. */
const NATIVE_SIZE: Record<IconName, number | [number, number]> = {
  "chevron-down": 20,
  "accordion-chevron-down": 20,
  "accordion-chevron-up": 20,
  close: 9.06066,
  info: 20,
  flag: 24,
  "money-rupee-circle": 40,
  "cart-arrow": 20,
  menu: [16, 12],
  "chevron-right-small": [4, 6],
  "faq-returns": 33.7529,
  "faq-secure": 33.7529,
  "faq-nri": 33.7529,
  "faq-warning": 33.7529,
  "faq-plus": 33.7529,
  bank: 24,
  "money-bag": 24,
  "avatars-group": 24,
  "house-avatar": 24,
};

type IconProps = {
  name: IconName;
  /** Overrides the native size (px). Prefer a size-* class via className when responsive. */
  size?: number;
  className?: string;
};

export function Icon({ name, size, className }: IconProps) {
  const native = NATIVE_SIZE[name];
  const [w, h] = size !== undefined ? [size, size] : typeof native === "number" ? [native, native] : native;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG, next/image adds nothing
    <img
      src={`/icons/ds/${name}.svg`}
      width={w}
      height={h}
      alt=""
      aria-hidden="true"
      className={cn("block max-w-none shrink-0", className)}
    />
  );
}
