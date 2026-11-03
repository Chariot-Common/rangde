import type { ReactNode } from "react";

// Shared building blocks for the homepage test versions (app/v/*). They only reuse the
// existing design tokens (globals.css @theme) and the Button styles, so every version
// looks like the same site.

export const SIGNUP_URL = "https://rangde.in/account/signup";

const LINK_BUTTON = {
  primary: "bg-primary text-white hover:brightness-95 active:brightness-90",
  // Ink rather than the button's usual blue text: blue on this tint is 2.3:1, below WCAG AA.
  secondary: "bg-primary/16 text-ink hover:bg-primary/24",
};

/** An <a> styled exactly like components/ui/Button (size "lg"). */
export function LinkButton({ href, variant = "primary", children }: { href: string; variant?: "primary" | "secondary"; children: ReactNode }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-dark px-[32px] py-[16px] font-display text-p2 font-bold transition-[filter,background-color] duration-150 sm:px-[48px] ${LINK_BUTTON[variant]}`}
    >
      {children}
    </a>
  );
}

export function Eyebrow({ children, className = "text-ink/72" }: { children: ReactNode; className?: string }) {
  return <p className={`font-eyebrow text-h6 font-semibold uppercase tracking-[1.44px] ${className}`}>{children}</p>;
}

