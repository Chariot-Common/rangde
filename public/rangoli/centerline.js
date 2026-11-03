// Converts the filled-outline icons in ICONS into single centre-line stroke paths.
// Render outline -> threshold -> Zhang-Suen thinning -> trace skeleton -> smooth -> cubic Bezier path.
window.centerline = async function (name, opts = {}) {
  const TARGET = opts.target || 500, SS = 2, pad = 12;
  const NS = "http://www.w3.org/2000/svg";
  const ds = ICONS[name];

  const probe = document.createElementNS(NS, "svg");
  probe.style.cssText = "position:absolute;visibility:hidden";
  document.body.appendChild(probe);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const d of ds) {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d); probe.appendChild(p);
    const b = p.getBBox();
    x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
  }
  probe.remove();

  const w = x1 - x0, h = y1 - y0, sc = (TARGET / Math.max(w, h)) * SS;
  const W = Math.ceil(w * sc) + pad * 2, H = Math.ceil(h * sc) + pad * 2;
  const svg = `<svg xmlns="${NS}" width="${W}" height="${H}" viewBox="${x0 - pad / sc} ${y0 - pad / sc} ${W / sc} ${H / sc}"><path d="${ds.join(" ")}" fill="#000"/></svg>`;
  const img = new Image();
  img.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  await img.decode();
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const cx = cv.getContext("2d"); cx.drawImage(img, 0, 0);
  const px = cx.getImageData(0, 0, W, H).data;
  const g = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) g[i] = px[i * 4 + 3] > 110 ? 1 : 0;

  // Zhang-Suen thinning
  const at = (x, y) => g[y * W + x];
  let changed = true;
  while (changed) {
    changed = false;
    for (const step of [0, 1]) {
      const del = [];
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        if (!at(x, y)) continue;
        const p2 = at(x, y - 1), p3 = at(x + 1, y - 1), p4 = at(x + 1, y), p5 = at(x + 1, y + 1),
          p6 = at(x, y + 1), p7 = at(x - 1, y + 1), p8 = at(x - 1, y), p9 = at(x - 1, y - 1);
        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (B < 2 || B > 6) continue;
        const s = [p2, p3, p4, p5, p6, p7, p8, p9, p2];
        let A = 0; for (let k = 0; k < 8; k++) if (!s[k] && s[k + 1]) A++;
        if (A !== 1) continue;
        if (step === 0 ? (p2 * p4 * p6 || p4 * p6 * p8) : (p2 * p4 * p8 || p2 * p6 * p8)) continue;
        del.push(y * W + x);
      }
      if (del.length) { changed = true; for (const i of del) g[i] = 0; }
    }
  }

  // Trace the skeleton graph into polylines between end/junction points
  const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  const nb = i => { const x = i % W, y = (i / W) | 0, r = []; for (const [dx, dy] of N8) { const j = (y + dy) * W + x + dx; if (g[j]) r.push(j); } return r; };
  // Crossing number: how many separate branches leave a pixel (1 = line end, 2 = on a line, 3+ = junction).
  // Counting raw neighbours instead marks every pixel staircase as a junction.
  const RING = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
  const cn = i => {
    const x = i % W, y = (i / W) | 0;
    const v = RING.map(([dx, dy]) => g[(y + dy) * W + x + dx]);
    let c = 0;
    for (let k = 0; k < 8; k++) if (!v[k] && v[(k + 1) % 8]) c++;
    if (c === 0 && v.some(Boolean)) c = 1;
    return c;
  };
  const kind = new Map();
  for (let i = 0; i < W * H; i++) if (g[i]) kind.set(i, cn(i));
  const isNode = i => kind.get(i) !== 2;
  const visited = new Set();
  const step = (cur, prev) => {
    const n = nb(cur).filter(j => j !== prev && !visited.has(j));
    if (!n.length) return null;
    const x = cur % W, y = (cur / W) | 0;
    const four = n.filter(j => Math.abs((j % W) - x) + Math.abs(((j / W) | 0) - y) === 1);
    return (four.length ? four : n)[0];
  };
  const walk = (start, first) => {
    const pts = [start, first]; visited.add(first);
    let prev = start, cur = first;
    while (!isNode(cur)) {
      const nx = step(cur, prev);
      if (nx === null) { if (nb(cur).includes(start) && pts.length > 3) pts.push(start); break; }
      visited.add(nx); pts.push(nx); prev = cur; cur = nx;
    }
    return pts;
  };
  const paths = [];
  for (const [i] of kind) if (isNode(i)) { visited.add(i); }
  for (const [i] of kind) if (isNode(i)) for (const j of nb(i)) if (!visited.has(j)) paths.push(walk(i, j));
  for (const [i] of kind) if (!visited.has(i)) { visited.add(i); const j = step(i, -1); if (j !== null) paths.push(walk(i, j)); }

  // Drop only true spurs: short branches that end in a free end and hang off a junction.
  const minLen = opts.minLen || 10;
  const kept = paths.filter(p => {
    if (p.length >= minLen) return true;
    const a = kind.get(p[0]), b = kind.get(p[p.length - 1]);
    return !((a === 1 && b >= 3) || (b === 1 && a >= 3) || p.length < 3);
  });

  const f = v => Math.round(v * 10) / 10, S = 1 / SS;

  // 1. Pixel chains -> point lists; drop specks.
  let chains = kept.map(p => p.map(i => [i % W, (i / W) | 0])).filter(c => c.length >= 4);

  // 2. Join chains that carry on in the same direction through a junction, so strokes flow
  //    instead of breaking at every crossing (the way a pen line would pass straight through).
  const dirAt = (c, atStart) => {
    const n = Math.min(10, c.length - 1);
    const a = atStart ? c[0] : c[c.length - 1], b = atStart ? c[n] : c[c.length - 1 - n];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; // points inward, away from the end
  };
  const JOIN_DIST = opts.joinDist || 6, JOIN_DOT = opts.joinDot ?? -0.8;
  let merged = true;
  while (merged) {
    merged = false;
    let best = null;
    for (let i = 0; i < chains.length; i++) for (const ai of [true, false]) {
      if (chains[i].loopJoined) continue;
      const A = chains[i], pa = ai ? A[0] : A[A.length - 1], da = dirAt(A, ai);
      for (let j = i; j < chains.length; j++) for (const bj of [true, false]) {
        if (i === j && ai === bj) continue;
        if (chains[j].loopJoined) continue;
        const B = chains[j], pb = bj ? B[0] : B[B.length - 1];
        if (Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) > JOIN_DIST) continue;
        const db = dirAt(B, bj), dot = da[0] * db[0] + da[1] * db[1];
        if (dot < JOIN_DOT && (!best || dot < best.dot)) best = { i, ai, j, bj, dot };
      }
    }
    if (best) {
      const { i, ai, j, bj } = best;
      let A = chains[i];
      if (i === j) { A.push(A[0]); A.loopJoined = true; }
      else {
        let B = chains[j];
        if (ai) A = A.slice().reverse();          // A must end at the join
        if (!bj) B = B.slice().reverse();         // B must start at the join
        chains[i] = A.concat(B.slice(1));
        chains.splice(j, 1);
      }
      merged = true;
    }
  }

  // 3. Smooth away pixel wobble, then 4. fit long Bezier curves with few anchors (Paper.js simplify).
  const win = opts.smooth || 4, tol = opts.tolerance || 5;
  const out = [];
  let anchors = 0;
  for (let c of chains) {
    const closed = c.length > 8 && Math.hypot(c[0][0] - c[c.length - 1][0], c[0][1] - c[c.length - 1][1]) < 3;
    if (c.length > 2 * win + 2) {
      const n = c.length;
      c = c.map((q, k) => {
        if (!closed && (k < win || k >= n - win)) return q;
        let sx = 0, sy = 0, cnt = 0;
        for (let t = -win; t <= win; t++) { const r = c[(k + t + n) % n]; sx += r[0]; sy += r[1]; cnt++; }
        return [sx / cnt, sy / cnt];
      });
    }
    const path = new paper.Path({ segments: c.map(([x, y]) => [(x - pad) * S, (y - pad) * S]), insert: false });
    if (closed) path.closed = true;
    path.simplify(tol * S);
    if (path.length < 4) continue;
    anchors += path.segments.length;
    out.push(path.pathData);
  }
  const result = { name, w: f((W - 2 * pad) * S), h: f((H - 2 * pad) * S), d: out.join(" "), strokes: out.length, anchors };
  if (opts.debug) {
    const covered = new Set(); kept.forEach(p => p.forEach(i => covered.add(i)));
    const lost = [...kind.keys()].filter(i => !covered.has(i));
    result.debug = { skeleton: kind.size, paths: paths.length, kept: kept.length, lost: lost.length,
      lostSample: lost.slice(0, 5).map(i => [i % W, (i / W) | 0, kind.get(i), visited.has(i)]),
      dropped: paths.filter(p => !kept.includes(p)).map(p => p.length).slice(0, 20) };
  }
  return result;
};

// Preview helper: draws stroke results on a grid for visual checking.
window.previewStrokes = function (results) {
  let box = document.getElementById("cl-preview");
  if (!box) { box = document.createElement("div"); box.id = "cl-preview"; document.body.prepend(box); }
  box.style.cssText = "display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:12px;background:#fff";
  box.innerHTML = results.map(r => `<div style="text-align:center;font:11px sans-serif;color:#333"><svg viewBox="-10 -10 ${r.w + 20} ${r.h + 20}" style="width:100%;aspect-ratio:1"><path d="${r.d}" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>${r.name}</div>`).join("");
  scrollTo(0, 0);
};
