interface FlagBadgeProps {
  /** A flag emoji (e.g. "🇮🇳") or a two-letter country code ("IN"). */
  flag: string;
  className?: string;
}

/** "🇮🇳" → "in". Flag emoji are two regional-indicator letters. */
export function flagCode(flag: string) {
  const letters = [...flag].map((ch) => {
    const cp = ch.codePointAt(0) ?? 0;
    return cp >= 0x1f1e6 && cp <= 0x1f1ff ? String.fromCharCode(cp - 0x1f1e6 + 97) : ch.toLowerCase();
  });
  return letters.join("");
}

// Flags render as SVG images (flag-icons, MIT, in /public/flags) rather than emoji text:
// Windows has no flag emoji, so "🇮🇳" showed up as the bare letters "IN" there.
export function FlagBadge({ flag, className = "" }: FlagBadgeProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${flagCode(flag)}.svg`}
      alt=""
      aria-hidden
      width={24}
      height={18}
      className={`h-[18px] w-[24px] rounded-[3px] object-cover ring-2 ring-white ${className}`}
    />
  );
}
