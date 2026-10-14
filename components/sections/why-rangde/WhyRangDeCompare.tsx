"use client";

import { useState } from "react";
import { WhyRangDeSection } from "./WhyRangDeSection";
import { WhyRangDeStory } from "./WhyRangDeStory";
import { WhyRangDeSteps } from "./WhyRangDeSteps";

/**
 * TEMPORARY — lets the team flip between the "Why Rang De?" versions on the real page.
 * Once one is chosen, render that component directly in app/page.tsx and delete this file
 * (and the versions that weren't picked).
 */
const VERSIONS = [
  { key: "current", label: "Current" },
  { key: "c", label: "C · Durga" },
  { key: "steps", label: "3 steps" },
] as const;

type VersionKey = (typeof VERSIONS)[number]["key"];

export function WhyRangDeCompare() {
  const [version, setVersion] = useState<VersionKey>("current");

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="mx-2 flex flex-wrap items-center self-center justify-center gap-1 whitespace-nowrap rounded-[16px] border border-dashed border-ink/24 bg-white p-1">
        <span className="px-2 font-display text-[10px] font-bold uppercase tracking-[0.88px] text-ink/48">Preview</span>
        {VERSIONS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setVersion(v.key)}
            className={`rounded-full px-3 py-1 font-display text-[11px] font-bold transition-colors ${
              version === v.key ? "bg-ink text-white" : "text-ink/64 hover:bg-ink/8"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      {version === "c" && <WhyRangDeStory />}
      {version === "steps" && <WhyRangDeSteps />}
      {version === "current" && <WhyRangDeSection />}
    </div>
  );
}
