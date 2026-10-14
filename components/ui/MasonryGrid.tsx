"use client";

import { useSyncExternalStore, type ReactNode } from "react";

interface MasonryGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** Gap between and within columns, in px. Also used for the row key. */
  gap?: number;
}

const TWO_COL_QUERY = "(min-width: 640px)";
const THREE_COL_QUERY = "(min-width: 1280px)";
// How much further down each subsequent column starts, in px — this is what makes the
// stagger visible even when every card happens to be a similar height (true per-column
// masonry flow alone only staggers as much as the content's natural height varies, which
// can look like a uniform grid when quotes are all roughly the same length).
const COLUMN_OFFSET_STEP = 40;

function subscribeToMediaQuery(query: string) {
  return (callback: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  };
}

function getMediaQuerySnapshot(query: string) {
  return () => window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * A staggered masonry grid: each column is its own independent flex flow (so a card
 * starts immediately after the previous card in that column, never sharing a forced row
 * height with the other columns), plus a deliberate per-column vertical offset so the
 * stagger reads clearly regardless of how similar the items' natural heights are.
 * Column count is responsive (1 / 2 / 3) via matchMedia, same pattern as StoryCarousel.
 */
export function MasonryGrid<T>({ items, renderItem, gap = 16 }: MasonryGridProps<T>) {
  const isTwoCol = useSyncExternalStore(
    subscribeToMediaQuery(TWO_COL_QUERY),
    getMediaQuerySnapshot(TWO_COL_QUERY),
    getServerSnapshot,
  );
  const isThreeCol = useSyncExternalStore(
    subscribeToMediaQuery(THREE_COL_QUERY),
    getMediaQuerySnapshot(THREE_COL_QUERY),
    getServerSnapshot,
  );
  const columnCount = isThreeCol ? 3 : isTwoCol ? 2 : 1;

  const columns: { item: T; index: number }[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, i) => columns[i % columnCount].push({ item, index: i }));

  return (
    <div className="flex w-full items-start" style={{ gap }}>
      {columns.map((column, colIndex) => (
        <div
          key={colIndex}
          className="flex min-w-0 flex-1 flex-col"
          style={{ gap, marginTop: columnCount > 1 ? colIndex * COLUMN_OFFSET_STEP : 0 }}
        >
          {column.map(({ item, index }) => renderItem(item, index))}
        </div>
      ))}
    </div>
  );
}
