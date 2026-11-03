"use client";

import type { ReactNode } from "react";

interface MasonryGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** Gap between and within columns, in px. Also used for the row key. */
  gap?: number;
}

// How much further down each subsequent column starts, in px — this is what makes the
// stagger visible even when every card happens to be a similar height (true per-column
// masonry flow alone only staggers as much as the content's natural height varies, which
// can look like a uniform grid when quotes are all roughly the same length).
const COLUMN_OFFSET_STEP = 40;

// One layout per column count, shown by CSS breakpoint (1 below 640px, 2 up to 1280px, 3 above).
// Picking the count in CSS rather than with matchMedia means the server's HTML already has the
// right number of columns, so nothing jumps when the page hydrates.
const LAYOUTS = [
  { columns: 1, className: "flex sm:hidden" },
  { columns: 2, className: "hidden sm:flex xl:hidden" },
  { columns: 3, className: "hidden xl:flex" },
];

/**
 * A staggered masonry grid: each column is its own independent flex flow (so a card
 * starts immediately after the previous card in that column, never sharing a forced row
 * height with the other columns), plus a deliberate per-column vertical offset so the
 * stagger reads clearly regardless of how similar the items' natural heights are.
 * Column count is responsive (1 / 2 / 3).
 */
export function MasonryGrid<T>({ items, renderItem, gap = 16 }: MasonryGridProps<T>) {
  return (
    <>
      {LAYOUTS.map(({ columns: columnCount, className }) => {
        const columns: { item: T; index: number }[][] = Array.from({ length: columnCount }, () => []);
        items.forEach((item, i) => columns[i % columnCount].push({ item, index: i }));
        return (
          <div key={columnCount} className={`w-full items-start ${className}`} style={{ gap }}>
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
      })}
    </>
  );
}
