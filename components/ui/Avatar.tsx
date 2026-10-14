import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  size: number;
  radius?: number | "full";
  borderClassName?: string;
  className?: string;
  /** Set for avatars inside a transform-animated carousel/marquee — the default
   *  lazy-load IntersectionObserver doesn't reliably fire for elements moved via
   *  transform rather than real scroll, which can leave them blank. */
  eager?: boolean;
}

export function Avatar({ src, alt, size, radius = 4, borderClassName = "", className = "", eager = false }: AvatarProps) {
  const borderRadius = radius === "full" ? 9999 : radius;
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-white ${borderClassName} ${className}`}
      style={{ width: size, height: size, borderRadius }}
    >
      {/*
        unoptimized: these source photos are already small (~300px) and shown at 57-80px,
        so on-the-fly optimization buys nothing — and serving them raw sidesteps a
        reproducible Next.js dev-server image-optimizer hang under concurrent load
        (confirmed via direct requests: the raw file and every optimized variant fetch
        correctly in isolation, but the same request occasionally never resolves when
        issued alongside every other image on the page at once).
      */}
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        loading={eager ? "eager" : undefined}
        className="object-cover"
      />
    </div>
  );
}
