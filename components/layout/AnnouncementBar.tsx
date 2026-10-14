import Image from "next/image";

export function AnnouncementBar() {
  return (
    <div className="relative z-50 flex w-full items-center justify-center gap-[5px] bg-primary/16 px-[12px] py-[8px] text-center">
      <p className="font-display text-[10px] font-bold uppercase leading-[14px] tracking-[0.5px] text-primary sm:leading-[16px]">
        Join a live Q&amp;A with our founders at 6 PM IST
      </p>
      <Image src="/icons/chevron-right.svg" alt="" width={5} height={8} className="shrink-0" />
    </div>
  );
}
