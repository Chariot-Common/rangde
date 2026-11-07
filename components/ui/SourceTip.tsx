"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * A stat with a dotted underline that opens a small black tooltip naming its source —
 * same look as the tooltips on rangde.in's borrower pages. Opens on hover and keyboard
 * focus; on touch, a tap opens it and tapping anywhere else closes it. (Not a toggle: a
 * click also fires focus first, so toggling would immediately close it again.)
 */
export function SourceTip({
  children,
  source,
  placement = "top",
  plain = false,
}: {
  children: ReactNode;
  source: string;
  placement?: "top" | "bottom";
  /** Version 1.1: the phrase keeps the sentence's own weight and colour (medium), only the underline marks it. */
  plain?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <span
      ref={ref}
      // Inline (not inline-block), so a long phrase wraps with the sentence and the text after it carries
      // on from the same line.
      className="relative inline"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* A focusable span rather than a <button>: a button can't break across lines, so a long phrase
          would sit as one block and push the rest of the sentence onto the next line. */}
      <span
        role="button"
        tabIndex={0}
        aria-describedby={id}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(true)}
        className={`dot-underline cursor-help ${plain ? "" : "font-semibold text-ink"} outline-none focus-visible:rounded-[2px] focus-visible:ring-2 focus-visible:ring-ink/40`}
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute ${placement === "top" ? "bottom-[calc(100%+10px)]" : "top-[calc(100%+10px)]"} left-1/2 z-20 w-[240px] -translate-x-1/2 rounded-[8px] bg-[#1d1f24] px-3 py-2 text-left font-display text-[12px] font-medium leading-[17px] text-white shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-[opacity,transform] duration-150 ${
          open
            ? "translate-y-0 opacity-100"
            : placement === "top"
              ? "translate-y-1 opacity-0"
              : "-translate-y-1 opacity-0"
        }`}
      >
        {source}
        <span
          className={`absolute left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent ${
            placement === "top"
              ? "top-full border-t-[6px] border-t-[#1d1f24]"
              : "bottom-full border-b-[6px] border-b-[#1d1f24]"
          }`}
        />
      </span>
    </span>
  );
}
