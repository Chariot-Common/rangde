"use client";

import { useMotionValue } from "motion/react";
import { PROBLEM_SCENES, SOLUTION_SCENES, type SceneDef } from "./story-scenes";

/** One-page storyboard of the six panels: each problem panel directly above its solution panel, drawn at a
 * still frame near the end of its animation. */
export function Storyboard() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-ink/48">Version 1.1 · rough storyboard</p>
        <h1 className="font-display text-p1 font-bold text-ink sm:text-h4">The financial system vs Rang De, side by side</h1>
        <p className="font-display text-p3 font-medium text-ink/64">Art cut from the ChatGPT sheets. Each column is one scroll step; the problem on top, what Rang De built below, same positions so the pairing reads.</p>
      </header>
      <div className="grid grid-cols-1 gap-x-2 gap-y-6 md:grid-cols-3">
        {PROBLEM_SCENES.map((p, i) => (
          <div key={p.name} className="flex flex-col gap-2">
            <Panel scene={p} label={`Problem ${i + 1}`} tone="problem" />
            <Panel scene={SOLUTION_SCENES[i]} label={`Solution ${i + 1}`} tone="solution" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Panel({ scene, label, tone }: { scene: SceneDef; label: string; tone: "problem" | "solution" }) {
  const t = useMotionValue(scene.still);
  const { Scene } = scene;
  return (
    <figure className={`flex flex-col gap-2 rounded-[16px] p-4 ${tone === "solution" ? "bg-[#cbe0b8]" : "bg-bg-grey"}`}>
      <div className="aspect-[400/280] w-full">
        <Scene t={t} />
      </div>
      <figcaption className="font-display">
        <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/48">{label}</span>
        <span className="block text-p2 font-bold text-ink">{scene.name}</span>
      </figcaption>
    </figure>
  );
}
