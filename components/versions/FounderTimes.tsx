"use client";

import { useSyncExternalStore } from "react";

// The founders' Q&A is "Every Saturday, 11 AM IST" (05:30 UTC). For NRIs, show what that is
// where they live. Computed in the browser (time zones and daylight saving change through the
// year), so nothing renders on the server and the first paint stays stable.
const CITIES = [
  { city: "Dubai", tz: "Asia/Dubai" },
  { city: "London", tz: "Europe/London" },
  { city: "New York", tz: "America/New_York" },
  { city: "San Francisco", tz: "America/Los_Angeles" },
  { city: "Singapore", tz: "Asia/Singapore" },
  { city: "Sydney", tz: "Australia/Sydney" },
];

function nextSessionUtc(now: Date) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 30));
  const daysToSaturday = (6 - d.getUTCDay() + 7) % 7;
  d.setUTCDate(d.getUTCDate() + daysToSaturday);
  if (d.getTime() < now.getTime()) d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

type CityTime = { city: string; time: string };
let cached: CityTime[] | null = null;
// Computed once per page load and cached, so the snapshot stays referentially stable.
function getTimes(): CityTime[] {
  if (!cached) {
    const session = nextSessionUtc(new Date());
    cached = CITIES.map(({ city, tz }) => ({
      city,
      time: new Intl.DateTimeFormat("en-IN", { timeZone: tz, weekday: "short", hour: "numeric", minute: "2-digit" }).format(session),
    }));
  }
  return cached;
}
const subscribe = () => () => {};

export function FounderTimes() {
  // null on the server and during hydration, the visitor's local times in the browser.
  const times = useSyncExternalStore(subscribe, getTimes, () => null);

  if (!times) return null;
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" aria-label="Founders' Q&A in your time zone">
      {times.map((t) => (
        <li key={t.city} className="flex flex-col gap-1 rounded-[8px] bg-white p-4">
          <span className="font-eyebrow text-h6 font-semibold uppercase tracking-[1.2px] text-ink/72">{t.city}</span>
          <span className="font-display text-p2 font-bold text-ink">{t.time}</span>
        </li>
      ))}
    </ul>
  );
}
