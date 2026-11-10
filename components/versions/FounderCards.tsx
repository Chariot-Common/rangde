import Image from "next/image";

/*
 * The two cards that take the place of two prints in Version 4's founders collage (Figma "Rang De Master
 * Design III", section "The reason Rang De exists - cards", node 2976:48): Smita's quote (2973:14191) and
 * Ram's Ashoka Fellowship (2973:14194).
 *
 * They sit inside the collage's stage, which is a size container laid out on a 1200-wide design, so every
 * measurement is the Figma pixel value turned into container units (`u`) and the cards shrink with the stage
 * like the photos do. `scale` sizes a card against the stage in multiples of its Figma size.
 *
 * Two colours have no design-system token yet and are taken from the Figma file as is: the quote card's
 * beige (#F7F3ED) and Ashoka's navy (#004270).
 */

const STAGE = 1200;
const BEIGE = "#f7f3ed";
const ASHOKA_NAVY = "#004270";
/** The collage photos' shadow (FoundersCollage FRAME), so the cards sit on the page the same way. */
const PRINT_SHADOW = "shadow-[0_16px_40px_rgba(0,0,0,0.22)]";

const unit = (scale: number) => (px: number) => `${((px * scale) / STAGE) * 100}cqw`;

/** Figma sizes, so the collage can place the cards. */
export const SMITA_CARD = { w: 406.12, h: 248 };
export const ASHOKA_CARD = { w: 213.14, h: 135.24 };

export function SmitaQuoteCard({ scale = 1 }: { scale?: number }) {
  const u = unit(scale);
  return (
    <figure
      className={`m-0 flex h-full w-full flex-col items-start font-display text-text-grey-100 ${PRINT_SHADOW}`}
      style={{ backgroundColor: BEIGE, padding: u(32), gap: u(40), borderRadius: u(8) }}
    >
      <blockquote className="m-0 font-bold [text-wrap:pretty]" style={{ fontSize: u(18), lineHeight: u(24) }}>
        &ldquo;Our borrowers are not charity cases they are entrepreneurs in their own right. All they need is an ecosystem that believes in them,&rdquo;
      </blockquote>
      <figcaption className="font-bold uppercase" style={{ fontSize: u(11), lineHeight: u(16), letterSpacing: u(0.88) }}>
        <span className="block">Smita Ram</span>
        <span className="block text-text-grey-64">Founder &amp; CEO</span>
        <span className="block text-text-grey-64">Rang De</span>
      </figcaption>
    </figure>
  );
}

export function AshokaFellowCard({ scale = 1 }: { scale?: number }) {
  const u = unit(scale);
  const laurel = { width: u(40.538), height: u(79.81) };
  return (
    <div
      className={`flex h-full w-full items-center justify-center border-solid bg-white font-display ${PRINT_SHADOW}`}
      style={{
        padding: u(13.507),
        gap: u(7.601),
        borderRadius: u(13.507),
        borderWidth: u(1.688),
        borderColor: "rgba(255,209,163,0.24)",
      }}
      aria-label="Ramakrishna NK, Ashoka Fellow 2012"
      role="img"
    >
      <div className="relative shrink-0 -scale-x-100" style={laurel}>
        <Image src="/images/founders-collage/ashoka-laurel-left.svg" alt="" fill unoptimized />
      </div>

      <div className="flex shrink-0 flex-col items-center justify-center" style={{ gap: u(2.225), width: u(86.471) }}>
        <div className="relative" style={{ width: u(79.971), height: u(88.475) }}>
          <div className="absolute left-0 top-0" style={{ width: u(79.971), height: u(71.271) }}>
            <Image src="/images/founders-collage/ashoka-logo.svg" alt="" fill unoptimized />
          </div>
          <p
            className="absolute left-0 m-0 w-full text-center font-normal uppercase"
            style={{ top: u(73.18), fontSize: u(10.182), lineHeight: u(14.809), letterSpacing: u(0.8145), color: ASHOKA_NAVY }}
          >
            Fellow 2012
          </p>
        </div>
        <div
          className="flex w-full items-center justify-center"
          style={{
            height: u(14.152),
            padding: `${u(1.38)} ${u(4.141)}`,
            backgroundColor: ASHOKA_NAVY,
            borderRadius: `${u(1.38)} ${u(1.38)} ${u(1.38)} 0`,
          }}
        >
          <span className="whitespace-nowrap font-bold uppercase text-white" style={{ fontSize: u(7.591), lineHeight: u(11.042), letterSpacing: u(0.6073) }}>
            Ramakrishna NK
          </span>
        </div>
      </div>

      <div className="relative shrink-0" style={laurel}>
        <Image src="/images/founders-collage/ashoka-laurel-right.svg" alt="" fill unoptimized />
      </div>
    </div>
  );
}
