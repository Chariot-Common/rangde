/** Version 4 ("Why we exist"): illustrations still to be made (prompts in docs/why-v4-asset-prompts.md). Each lives in
 * public/images/why-v4/; until it's there, its card shows a dashed slot with the file name. */
export const NEW_ASSETS = ["where__family.webp", "where__shg.webp", "where__scheme.webp"] as const;
export type NewAsset = (typeof NEW_ASSETS)[number];
