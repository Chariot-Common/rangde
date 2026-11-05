"use client";

import Image from "next/image";
import { useRefreshedNav } from "@/lib/nav-intro";

export function AnnouncementBar() {
  // The newer versions (v5, v6) open straight onto the nav, without the bar.
  const refreshed = useRefreshedNav();
  if (refreshed) return null;
  return (
    <div className="relative z-50 flex w-full items-center justify-center gap-[5px] bg-primary/16 px-[12px] py-[8px] text-center">
      <p className="font-display text-[10px] font-bold uppercase leading-[14px] tracking-[0.5px] text-primary sm:leading-[16px]">
        Live Q&amp;A with our founders · Saturdays, 11 AM IST
      </p>
      <Image src="/icons/chevron-right.svg" alt="" width={5} height={8} className="shrink-0" />
    </div>
  );
}
