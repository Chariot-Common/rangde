import Image from "next/image";

const AVATARS: { letter: string; className: string }[] = [
  { letter: "M", className: "bg-[#7c5cbf]" },
  { letter: "K", className: "bg-[#c0392b]" },
  { letter: "S", className: "bg-[#4f6d3a]" },
  { letter: "U", className: "bg-[#3f7cc9]" },
  { letter: "L", className: "bg-[#8b3a3a]" },
  { letter: "P", className: "bg-[#b83280]" },
];

const TOOLBAR_ICONS: { icon: string; chevron?: string }[] = [
  { icon: "/images/cta/video-call/tb-mic.svg", chevron: "/images/cta/video-call/tb-mic-chevron.svg" },
  { icon: "/images/cta/video-call/tb-video.svg", chevron: "/images/cta/video-call/tb-video-chevron.svg" },
  { icon: "/images/cta/video-call/tb-screenshare.svg" },
  { icon: "/images/cta/video-call/tb-reactions.svg", chevron: "/images/cta/video-call/tb-reactions-chevron.svg" },
  { icon: "/images/cta/video-call/tb-more.svg" },
];

function ParticipantTile({ photo, name, camIcon }: { photo: string; name: string; camIcon: string }) {
  return (
    <div className="relative h-[160.845px] flex-1 overflow-hidden rounded-[2.442px] bg-[rgba(217,217,217,0.35)] p-[2.442px]">
      <Image src={photo} alt="" fill sizes="270px" className="object-cover" />
      <div className="absolute bottom-[2.442px] left-[2.442px] flex items-center gap-[2.442px] rounded-[2.442px] bg-[rgba(0,0,0,0.24)] px-[2.442px] py-[1px]">
        <div className="relative size-[6.104px] shrink-0">
          <Image src={camIcon} alt="" fill />
        </div>
        <p className="whitespace-nowrap font-display text-[6.104px] font-medium text-white">{name}</p>
      </div>
    </div>
  );
}

/**
 * A faithful recreation of the Figma "Video Call (Dark Mode)" mock (node 521:12396) —
 * built as real DOM rather than a flat screenshot so it can scale cleanly across
 * breakpoints. Sized at Figma's native ~526px-wide spec; the parent applies a CSS
 * `scale` transform per breakpoint (see FounderCallCta) to fit the target box, rather
 * than this component owning breakpoint-specific sizes itself.
 */
export function VideoCallMock() {
  return (
    <div className="flex w-[526px] flex-col gap-[8.915px] overflow-hidden rounded-[12px] border-[6px] border-solid border-[#3a3e48] bg-[#292d36] shadow-[0_0_0_1.5px_rgba(255,255,255,0.9),0_0_0_3px_rgba(41,45,54,0.14),0px_8px_24px_0px_rgba(0,0,0,0.22)]">
      <div className="flex w-full flex-col items-start">
        <div className="flex w-full items-center gap-[2.442px] bg-gradient-to-r from-[#373a43] to-[#434650] px-[7.325px] py-[2.442px]">
          <div className="relative h-[9.022px] w-[23.806px] shrink-0">
            <Image src="/images/cta/video-call/topbar-logo.svg" alt="" fill />
          </div>
        </div>
        <div className="flex w-full flex-col items-center">
          <div className="flex w-full items-center gap-[12.208px] px-[13.373px] pb-[17.83px] pt-[13.373px]">
            <ParticipantTile
              photo="/images/cta/video-call/photo-ram.jpg"
              name="Ram"
              camIcon="/images/cta/video-call/cam-icon-1.svg"
            />
            <ParticipantTile
              photo="/images/cta/video-call/photo-smita.jpg"
              name="Smita"
              camIcon="/images/cta/video-call/cam-icon-2.svg"
            />
          </div>
          <div className="flex items-center gap-[2.442px]">
            {AVATARS.map(({ letter, className }) => (
              <div
                key={letter}
                className="flex h-[41.814px] w-[73.861px] items-end justify-center overflow-hidden rounded-[2.442px] bg-gradient-to-b from-[#373a43] to-[#3c4049] p-[2.442px]"
              >
                <div
                  className={`flex size-[29.105px] shrink-0 items-center justify-center rounded-full ${className}`}
                >
                  <p className="font-display text-[10.616px] font-medium text-white">{letter}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full items-center gap-[4.883px] bg-gradient-to-r from-[#373a43] to-[#434650] p-[6.054px]">
        <div className="flex items-center gap-[2.442px]">
          {TOOLBAR_ICONS.map(({ icon, chevron }, i) => (
            <div
              key={i}
              className="flex h-[20.144px] items-center justify-center gap-[0.83px] rounded-[6.054px] px-[7.567px]"
            >
              <div className="relative size-[12.208px] shrink-0">
                <Image src={icon} alt="" fill />
              </div>
              {chevron && (
                <div className="relative size-[10.377px] shrink-0">
                  <Image src={chevron} alt="" fill />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col items-end">
          <div className="flex h-[20.144px] w-[55.853px] items-center justify-center gap-[0.83px] rounded-[5.222px] bg-[#ff4949] px-[12.208px] py-[0.61px]">
            <p className="whitespace-nowrap font-display text-[6.104px] font-medium text-white">End</p>
          </div>
        </div>
      </div>
    </div>
  );
}
