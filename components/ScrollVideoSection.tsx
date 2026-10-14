"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

interface ScrollVideoSectionProps {
  /** Video sources, best first. `media` limits one to matching screens (e.g. a lighter file for phones). */
  sources: { src: string; type: string; media?: string }[];
  /** Shown while the video loads, and as the fallback frame if it fails to load. */
  poster?: string;
  /** Line overlaid on the video (over a soft black tint) once it's revealed. Pass "" to omit it. */
  caption?: string;
}

const MOBILE_BREAKPOINT = 768;
// The scale-up finishes at 75% of the section's scroll distance, leaving the
// remaining 25% as "hold at full size" scroll before the section releases.
const GROWTH_END = 0.75;

export function ScrollVideoSection({
  sources,
  poster,
  caption = "Real people. Real businesses. Real livelihoods.",
}: ScrollVideoSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // With <source> children, a failed source fires "error" on that <source>, not the video;
  // only when the last one fails has every format been tried, so listen there.
  const lastSrc = sources[sources.length - 1]?.src;
  useEffect(() => {
    const last = videoRef.current?.querySelector("source:last-of-type");
    if (!last) return;
    const handleError = () => setVideoFailed(true);
    last.addEventListener("error", handleError);
    return () => last.removeEventListener("error", handleError);
  }, [lastSrc]);

  // iPhones only autoplay a video they know is muted, and React doesn't reliably put the
  // `muted` attribute into the server HTML — so mute it here, and play/pause it as it
  // comes on and off screen (play() is also what kicks it off when autoplay was skipped).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.1 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [videoFailed]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Mobile starts closer to full size than desktop — a desktop-sized fraction of a narrow
  // viewport would read as a tiny, awkward thumbnail — but still well short of it, so the
  // grow is noticeable there too.
  const minScale = isMobile ? 0.68 : 0.32;
  const scale = useTransform(scrollYProgress, [0, GROWTH_END], [minScale, 1], { clamp: true });
  // Ends as a full-width card like the other sections (mx-2 = 8px each side, 16px corners).
  const radius = useTransform(scrollYProgress, [0, GROWTH_END], [24, 16], { clamp: true });
  const borderRadius = useTransform(radius, (r) => `${r}px`);
  // Function form on purpose: motion hands range-mapped scroll→opacity off to a native
  // ScrollTimeline, which mis-maps this sticky "end end" range (the caption faded back out
  // over the hold). A function transform stays on the JS side and holds at 1 as intended.
  const captionOpacity = useTransform(scrollYProgress, (p) => Math.min(1, Math.max(0, (p - 0.55) / (GROWTH_END - 0.55))));

  return (
    <section ref={sectionRef} className="relative h-[200vh] w-full">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        <motion.div
          className="relative h-[calc(100svh-16px)] w-[calc(100%-16px)] overflow-hidden bg-ink"
          style={{
            scale: reduceMotion ? 1 : scale,
            borderRadius: reduceMotion ? "16px" : borderRadius,
          }}
        >
          {videoFailed ? (
            <div
              className="flex h-full w-full items-center justify-center bg-ink"
              style={poster ? { backgroundImage: `url(${poster})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              {!poster && (
                <p className="font-display text-p4 font-medium uppercase tracking-[0.88px] text-white/48">
                  Video coming soon
                </p>
              )}
            </div>
          ) : (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              poster={poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              {sources.map((s) => (
                <source key={s.src} src={s.src} type={s.type} media={s.media} />
              ))}
            </video>
          )}

          {caption && (
            <motion.div
              style={{ opacity: reduceMotion ? 1 : captionOpacity }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 px-6"
            >
              <p className="text-center font-display text-[12px] font-bold uppercase tracking-[2px] text-white sm:text-[14px] md:text-[16px] md:tracking-[3px]">
                {caption}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
