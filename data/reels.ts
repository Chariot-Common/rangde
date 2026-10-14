/**
 * Rang De's best-performing Instagram reels (@wearerangde), most viewed first — view
 * counts as shown on the profile in October 2026. Titles are shortened from each reel's
 * own caption. Covers are the reels' own preview images, saved in public/images/reels.
 */
export interface Reel {
  code: string;
  title: string;
  views: string;
}

export const INSTAGRAM_URL = "https://www.instagram.com/wearerangde/";
export const reelUrl = (code: string) => `https://www.instagram.com/reel/${code}/`;
export const reelCover = (code: string) => `/images/reels/${code}.jpg`;
/** Hover preview. Drop a reel's MP4 here (named by its code) and its card plays it on
 * hover; until then the card just shows the cover. */
export const reelVideo = (code: string) => `/videos/reels/${code}.mp4`;

export const reels: Reel[] = [
  { code: "DZb43WMJGUk", title: "Gayatri, Kukhol and Mamta: one common challenge, fair credit", views: "176K" },
  { code: "DKl90LkTp2_", title: "You've heard of investing in stocks. What about investing in people?", views: "150K" },
  { code: "DaC1ZZNp7gc", title: "Pulled out of school as a girl, on a stage in London at 23", views: "40.6K" },
  { code: "DHsWunxNohj", title: "17 years of Rang De, and it's just the start", views: "14.2K" },
  { code: "DJ8m_66TYR1", title: "10 reasons to invest with Rang De, and none of them are about profit", views: "9.5K" },
  { code: "DdObR7qNxXJ", title: "Strangers who don't stay strangers for long", views: "8.8K" },
  { code: "DaVC13Wporz", title: "Building Bihar's women entrepreneurs", views: "7.8K" },
  { code: "DZpDB01p6Lo", title: "Mamta Didi now runs 4 looms and employs 5 women", views: "6.8K" },
  { code: "Dd3cW7nzdIr", title: "Credit can help someone build, not just buy", views: "6.6K" },
  { code: "Db5Qn0bpHwS", title: "One park in London, one story from Assam", views: "5.9K" },
];
