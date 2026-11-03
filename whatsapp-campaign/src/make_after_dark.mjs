// Builds india-after-dark/data.js: India's state outlines, one light per Rang De loan, the
// year-by-year totals, real borrower stories and who is still waiting for funds.
// Run: node whatsapp-campaign/src/make_after_dark.mjs   (needs network; re-run to refresh)
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPO = fileURLToPath(new URL('../..', import.meta.url));
const OUT = ROOT + 'india-after-dark/data.js';
const TOPO_URL = 'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/topojson/india.json';
const STATS_URL = 'https://rangde.in/stats/v2';
const FEED_URL = 'https://rangde.in/invest-j?partial=true&category=all&page=0&size=100';

/* ── Data that isn't in a public feed. Replace with Rang De's own export when available. ── */

// Loans fulfilled (cumulative) at each year end. P2P lending launched Sep 2019.
// "real" points come from archived copies of rangde.in/stats on web.archive.org:
// 13,669 (Jul 2022) · 14,891 (Nov 2022) · 16,300 (Apr 2023) · 20,098 (Dec 2023) · 26,343 (Jul 2025).
// Others are straight-line estimates between those points.
const YEARS = [
  { year: 2019, loans: 1200, est: true },
  { year: 2020, loans: 5500, est: true },
  { year: 2021, loans: 11000, est: true },
  { year: 2022, loans: 15200, est: false },
  { year: 2023, loans: 20200, est: false },
  { year: 2024, loans: 24050, est: true },
  { year: 2025, loans: 28170, est: true },
  // 2026 = today's live total, filled in below.
];

// Entrepreneurs backed per state, from rangde.in/invest/state (14 Oct 2026). Exact.
const KNOWN = {
  'Assam': { backed: 5100, sectors: 'Farming, animal husbandry, fisheries', invested: '₹16.52 Cr', slug: 'assam' },
  'Rajasthan': { backed: 4700, sectors: 'Farming, animal husbandry, retail stores', invested: '₹20.56 Cr', slug: 'rajasthan' },
  'Madhya Pradesh': { backed: 3300, sectors: 'Animal husbandry, retail stores, farming', invested: '₹14.46 Cr', slug: 'madhya-pradesh' },
  'Maharashtra': { backed: 1900, sectors: 'Farming, animal husbandry, other trades', invested: '₹7.63 Cr', slug: 'maharashtra' },
};
// APPROXIMATE: how the remaining lights spread across the other 25 states (relative weights).
// Rang De lends in 29 states; this list and these weights are placeholders, not Rang De data.
const OTHER_WEIGHTS = {
  'Odisha': 8, 'Tamil Nadu': 7, 'Karnataka': 7, 'West Bengal': 6, 'Bihar': 6, 'Uttar Pradesh': 6,
  'Jharkhand': 5, 'Gujarat': 4, 'Manipur': 4, 'Telangana': 3, 'Andhra Pradesh': 3, 'Chhattisgarh': 3,
  'Kerala': 2, 'Meghalaya': 2, 'Tripura': 2, 'Uttarakhand': 2, 'Haryana': 1.5, 'Delhi': 1.5,
  'Nagaland': 1, 'Mizoram': 1, 'Arunachal Pradesh': 1, 'Himachal Pradesh': 1, 'Punjab': 1,
  'Jammu and Kashmir': 1, 'Sikkim': 0.5,
};

/* ── helpers ── */
const num = v => Number(String(v).replace(/,/g, ''));
let seed = 20190901;
const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const norm = s => s.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
const lev = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};

/* ── geometry: decode TopoJSON and project ── */
const topo = await (await fetch(TOPO_URL)).json();
const [sx, sy] = topo.transform.scale, [ox, oy] = topo.transform.translate;
const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => [(x += dx) * sx + ox, (y += dy) * sy + oy]); });
const arc = i => (i < 0 ? arcs[~i].slice().reverse() : arcs[i]);
const ring = ids => ids.flatMap((id, k) => (k ? arc(id).slice(1) : arc(id)));
const polys = g => (g.type === 'Polygon' ? [g.arcs.map(ring)] : g.type === 'MultiPolygon' ? g.arcs.map(p => p.map(ring)) : []);

// Equirectangular, corrected for latitude; fitted to a 1000-unit-wide box.
const K = Math.cos((22 * Math.PI) / 180);
const LON0 = 68, LAT1 = 37.6, W = 1000, SCALE = W / ((97.5 - LON0) * K);
const P = ([lon, lat]) => [(lon - LON0) * K * SCALE, (LAT1 - lat) * SCALE];
const H = Math.ceil((LAT1 - 6.5) * SCALE);

const r1 = n => Math.round(n * 10) / 10;
function pathOf(polygons) {
  let d = '';
  for (const poly of polygons) for (const rg of poly) {
    let last = null, s = '';
    for (const pt of rg.map(P)) {
      if (last && Math.hypot(pt[0] - last[0], pt[1] - last[1]) < 0.7) continue;
      s += (s ? 'L' : 'M') + r1(pt[0]) + ' ' + r1(pt[1]); last = pt;
    }
    d += s + 'Z';
  }
  return d;
}
const inRing = (x, y, rg) => {
  let c = false;
  for (let i = 0, j = rg.length - 1; i < rg.length; j = i++) {
    const [xi, yi] = rg[i], [xj, yj] = rg[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const inPolys = (x, y, pp) => pp.some(poly => inRing(x, y, poly[0]) && !poly.slice(1).some(h => inRing(x, y, h)));

const states = topo.objects.states.geometries.map(g => ({ name: g.properties.st_nm, path: pathOf(polys(g)) }));
const stateIdx = Object.fromEntries(states.map((s, i) => [s.name, i]));

const districts = topo.objects.districts.geometries.map(g => {
  const pp = polys(g).map(poly => poly.map(rg => rg.map(P)));
  const all = pp.flat(2);
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  // Centroid of the largest ring's vertices is good enough for labels and distance.
  const big = pp.map(p => p[0]).sort((a, b) => b.length - a.length)[0];
  const cx = big.reduce((s, p) => s + p[0], 0) / big.length, cy = big.reduce((s, p) => s + p[1], 0) / big.length;
  return { name: g.properties.district, state: g.properties.st_nm, pp, box, cx, cy, lights: 0 };
});

// Listing names the map's (older) district list spells differently or doesn't have yet.
// Alluri Sitharama Raju was carved out of Visakhapatnam in 2022.
const DISTRICT_ALIASES = { medinipureast: 'Purba Medinipur', medinipurwest: 'Paschim Medinipur', allurisitharamaraju: 'Visakhapatnam', eastnimar: 'Khandwa', westnimar: 'Khargone' };

function findDistrict(name, state) {
  const inState = districts.filter(d => norm(d.state) === norm(state));
  const pool = inState.length ? inState : districts;
  const n = norm(DISTRICT_ALIASES[norm(name)] || name);
  return pool.find(d => norm(d.name) === n)
    || pool.find(d => norm(d.name).startsWith(n) || n.startsWith(norm(d.name)))
    || pool.map(d => [d, lev(norm(d.name), n)]).sort((a, b) => a[1] - b[1]).filter(([, s]) => s <= 3).map(([d]) => d)[0]
    || null;
}

/* ── live numbers ── */
const stats = await (await fetch(STATS_URL)).json();
const LOANS = num(stats.loansFulfilled);
YEARS.push({ year: 2026, loans: LOANS, est: false });
const feed = await (await fetch(FEED_URL)).json();
const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/* ── where the lights go ── */
const BORROWERS = num(stats.noOfBorrowers);
const knownShare = Object.fromEntries(Object.entries(KNOWN).map(([s, v]) => [s, v.backed / BORROWERS]));
const restShare = 1 - Object.values(knownShare).reduce((a, b) => a + b, 0);
const wSum = Object.values(OTHER_WEIGHTS).reduce((a, b) => a + b, 0);
const share = { ...knownShare, ...Object.fromEntries(Object.entries(OTHER_WEIGHTS).map(([s, w]) => [s, (restShare * w) / wSum])) };

// People we can name: listings from the 6 Oct snapshot and today's live feed.
const snapSrc = await readFile(REPO + 'data/opportunities-snapshot.ts', 'utf8');
const snapshot = [...snapSrc.matchAll(/^\s*(\{"key".*\}),?\s*$/gm)].map(m => JSON.parse(m[1]));
const live = (feed.loans || []).filter(l => l.avatar?.uri && l.totalAmount > 0);
const liveKeys = new Set(live.map(l => l.borrowerFriendlyKey));

const place = (district, state) => {
  const d = findDistrict(district, state);
  if (!d) console.warn('No district match for', district, state);
  return d;
};
const seenPeople = new Set();
const waiting = live.filter(l => {
  const id = norm(l.borrowerName + l.borrowerDistrict);
  if (seenPeople.has(id)) return false; seenPeople.add(id); return true;
}).map(l => {
  const d = place(l.borrowerDistrict, l.regionName);
  return {
    key: l.borrowerFriendlyKey, name: l.borrowerName.replace(/\s+/g, ' ').trim(), district: l.borrowerDistrict, state: l.regionName,
    need: l.loanPurpose, raised: l.amountRaised, goal: l.totalAmount, rate: l.investorInterestRate, photo: l.avatar.uri,
    x: r1(d?.cx ?? 500), y: r1(d?.cy ?? 500),
  };
});
const stories = snapshot.filter(p => !liveKeys.has(p.key)).map(p => {
  const d = place(p.district, p.state);
  return { key: p.key, name: p.name, district: p.district, state: p.state, need: p.purpose, photo: p.photo, x: r1(d?.cx ?? 500), y: r1(d?.cy ?? 500) };
});
// What happened next, from each loan's public page (rangde.in/j/loan-info/<key>): how many
// investors backed it, how much was raised, whether it's repaying. Listings that were cut
// short (no full stop) fall back to the first sentence of the loan description.
const firstSentence = t => (String(t || '').replace(/\s+/g, ' ').trim().match(/^.*?[.!?](?=\s|$)/) || [''])[0];
const fullStop = t => /[.!?]$/.test(t.trim());
for (const p of stories) {
  try {
    const j = await (await fetch(`https://rangde.in/j/loan-info/${p.key}`)).json();
    Object.assign(p, { investors: j.noOfInvestorsInCurrentLoan || 0, raised: j.amountRaised || 0, goal: j.totalAmount || 0, status: j.loanStatus || '' });
    if (!fullStop(p.need)) p.need = firstSentence(j.loanDescription) || p.need + '.';
  } catch { console.warn('No loan info for', p.key); }
}

// Slight offsets so people from the same district don't sit on one pixel.
{
  const byPos = {};
  for (const p of [...stories, ...waiting]) { const k = p.x + ',' + p.y; const n = (byPos[k] = (byPos[k] || 0) + 1) - 1; if (n) { p.x = r1(p.x + Math.cos(n * 2.4) * 7 * Math.sqrt(n)); p.y = r1(p.y + Math.sin(n * 2.4) * 7 * Math.sqrt(n)); } }
}
const storyDistricts = new Set([...stories, ...waiting].map(p => norm(p.district)));

const points = [];
for (const [state, sh] of Object.entries(share)) {
  const ds = districts.filter(d => d.state === state);
  if (!ds.length) { console.warn('No districts for', state); continue; }
  // Lending clusters around partner districts, so weights are skewed, with a boost where we know someone.
  const w = ds.map(d => Math.exp(rand() * 2.6) * (storyDistricts.has(norm(d.name)) ? 2 : 1));
  const wt = w.reduce((a, b) => a + b, 0);
  let left = Math.round(LOANS * sh);
  ds.forEach((d, i) => {
    const n = i === ds.length - 1 ? left : Math.min(left, Math.round((LOANS * sh * w[i]) / wt));
    left -= n; d.lights += n;
    // A few village clusters per district, lights scattered around them.
    const hubs = Array.from({ length: 4 + Math.floor(rand() * 8) }, () => {
      for (let t = 0; t < 60; t++) { const x = d.box[0] + rand() * (d.box[2] - d.box[0]), y = d.box[1] + rand() * (d.box[3] - d.box[1]); if (inPolys(x, y, d.pp)) return [x, y]; }
      return [d.cx, d.cy];
    });
    const spread = Math.max(1.5, Math.min(d.box[2] - d.box[0], d.box[3] - d.box[1]) / 9);
    for (let k = 0; k < n; k++) {
      let p = null;
      for (let t = 0; t < 30 && !p; t++) {
        // Most lights sit near a village cluster; some are scattered across the district.
        let x, y;
        if (rand() < 0.25) { x = d.box[0] + rand() * (d.box[2] - d.box[0]); y = d.box[1] + rand() * (d.box[3] - d.box[1]); }
        else { const h = hubs[Math.floor(rand() * hubs.length)], a = rand() * Math.PI * 2, r = spread * Math.sqrt(-2 * Math.log(rand() + 1e-9)); x = h[0] + Math.cos(a) * r; y = h[1] + Math.sin(a) * r; }
        if (inPolys(x, y, d.pp)) p = [x, y];
      }
      p ||= hubs[0];
      points.push(p);
    }
  });
}
points.length = Math.min(points.length, LOANS);
// Shuffle so each year's lights spread across the map rather than state by state.
for (let i = points.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [points[i], points[j]] = [points[j], points[i]]; }
const buf = Buffer.alloc(points.length * 4);
points.forEach(([x, y], i) => { buf.writeUInt16LE(Math.round(x * 20), i * 4); buf.writeUInt16LE(Math.round(y * 20), i * 4 + 2); });

const lit = new Set(Object.keys(share));
const data = {
  asOf: today, W, H, kmPerUnit: Math.round((111.2 / SCALE) * 1e4) / 1e4,
  stats: {
    loans: LOANS, borrowers: BORROWERS, states: num(stats.activeLoanStatesCount), women: Math.round(num(stats.femaleBorrowerPercentage)),
    jobs: num(stats.noOfJobCreated), investors: num(stats.noOfSocialInvestorsInt ?? stats.noOfSocialInvestors), abroad: num(stats.totalNoOfNRIandOCIs),
    countries: num(stats.totalNumberOfCountriesForNRIsAndOCIs), repaid: Math.round((100 - num(stats.writtenOffPrincipalPct)) * 100) / 100,
  },
  years: YEARS,
  states: states.map(s => ({ name: s.name, path: s.path, lit: lit.has(s.name), ...(KNOWN[s.name] || {}) })),
  districts: districts.map(d => [d.name, stateIdx[d.state], r1(d.cx), r1(d.cy), d.lights]),
  stories, waiting,
  points: buf.toString('base64'),
};
await writeFile(OUT, `// Generated by src/make_after_dark.mjs on ${today}. Do not edit by hand.\nwindow.AFTER_DARK = ${JSON.stringify(data)};\n`);
console.log(`Wrote ${OUT}: ${points.length} lights, ${stories.length} stories, ${waiting.length} waiting, ${(JSON.stringify(data).length / 1024).toFixed(0)} KB`);
