export const STAGE_W: number;
export const STAGE_H: number;
/** Every image the four stages use, for preloading. */
export const ASSETS: string[];
/** Mount step `n` (0-based) into `root` and start its loop; returns a cleanup. */
export function mountFigmaStep(root: HTMLElement, n: number, reduced: boolean, segment?: [number, number]): () => void;
