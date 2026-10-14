/**
 * A small "on air" signal: a dot with two pairs of arcs that light up in turn, on a loop —
 * says "these listings are live". Pure CSS (keyframes in globals.css), so it costs no JS,
 * and it holds still for people who prefer reduced motion.
 */
export function LiveSignal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`live-signal text-[#e32642] ${className}`} fill="none" aria-hidden>
      <circle cx="16" cy="16" r="4" fill="currentColor" className="live-signal__dot" />
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path className="live-signal__arc live-signal__arc--1" d="M10.3 10.3a8 8 0 0 0 0 11.4M21.7 10.3a8 8 0 0 1 0 11.4" />
        <path className="live-signal__arc live-signal__arc--2" d="M6 6a14 14 0 0 0 0 20M26 6a14 14 0 0 1 0 20" />
      </g>
    </svg>
  );
}
