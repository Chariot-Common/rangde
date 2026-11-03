// Step 3 of "How it works": the payment story, where the same three avatars travel through every
// scene (list -> trio -> branches). Layout follows Figma frame 1725:22648 (625x1624 world);
// a camera pans a 374x342 window over it, like the previous Step 3 did.
// Time-driven (one clock, no per-element keyframes) so every motion stays continuous.
const NS = "http://www.w3.org/2000/svg";
const A = "/how-it-works/";
const T = 12.4; // seconds per loop
const CX = 334;
const SPLIT_Y = 1296;

const PEOPLE = [
  { key: "rekha", name: "Rekha Bai", amt: "₹5,000", img: A + "s1-av7.webp", row: [176, 196.5] },
  { key: "vijay", name: "Vijay Muwel", amt: "₹2,000", img: A + "s1-av12.webp", row: [176, 261] },
  { key: "monika", name: "Monika", amt: "₹500", img: A + "s1-av3.webp", row: [176, 326] },
];
const TRIO = { vijay: [278, 969], rekha: [334, 969], monika: [390, 969] };
const FINAL = { rekha: [235, 1502], vijay: [334, 1502], monika: [433, 1502] };
const ORDER2 = ["vijay", "rekha", "monika"];
const BR = {
  rekha: `M334 ${SPLIT_Y}C334 ${SPLIT_Y} 334 1353.33 284.5 1382C235 1410.67 235 1468 235 1468`,
  vijay: `M334 ${SPLIT_Y}L334 1468`,
  monika: `M334 ${SPLIT_Y}C334 ${SPLIT_Y} 334 1353.33 383.5 1382C433 1410.67 433 1468 433 1468`,
};

const ROW_AT = [0.6, 0.9, 1.2];
const BTN1 = [2.7, 3.15];
const FLY1 = 3.35, FLY1_STAG = 0.18, FLY1_DUR = 2.1;
const BTN2 = [6.1, 6.6], TICK = [6.5, 6.95];
const FLY2 = 7.3, FLY2_STAG = 0.18, FLY2_DUR = 2.4;
const CAM = [[0, 96], [2.4, 150], [3.3, 150], [4.3, 506], [5.2, 506], [6.1, 742], [7.0, 742], [9.6, 1176], [T, 1176]];

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, u) => a + (b - a) * u;
const E = {
  io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  o: (t) => 1 - Math.pow(1 - t, 3),
  back: (t) => {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
};
const seg = (t, a, b, e = E.io) => e(clamp((t - a) / (b - a)));
const smooth = (x) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
const sine = (u) => 0.5 - Math.cos(Math.PI * clamp(u)) / 2;
const camY = (t) => {
  for (let i = 0; i < CAM.length - 1; i++) {
    const [a, ya] = CAM[i];
    const [b, yb] = CAM[i + 1];
    if (t <= b) return lerp(ya, yb, E.io(clamp((t - a) / (b - a))));
  }
  return CAM[CAM.length - 1][1];
};
const mixInk = (u) =>
  `rgb(${[41, 45, 54].map((c, i) => Math.round(lerp(c, [58, 110, 12][i], u))).join(",")})`;

function markup() {
  return `<div class="s3f"><div class="s3f-world">
<svg class="s3f-lines" viewBox="0 0 625 1624">
  <path data-r="l1d" d="M334 582V849" stroke="#cbe0b8" stroke-width="4" fill="none"/>
  <path data-r="l1" d="M334 582V849" stroke="#62af1d" stroke-width="4" fill="none"/>
  <path data-r="l2d" d="M334 1085V${SPLIT_Y}" stroke="#cbe0b8" stroke-width="4" fill="none"/>
  <path data-r="l2" d="M334 1085V${SPLIT_Y}" stroke="#62af1d" stroke-width="4" fill="none"/>
  <g data-r="branches"></g>
</svg>
<div class="s3f-card" data-r="card1" style="top:117px">
  <div class="s3f-ttl">You’re investing in</div>
  ${PEOPLE.map((p, i) => `<div class="s3f-row" style="height:${i ? 64 : 63}px"><div class="s3f-slot" data-r="slot-${p.key}"></div><div class="s3f-nm" data-r="nm-${p.key}">${p.name}</div><div class="s3f-am" data-r="am-${p.key}">${p.amt}</div></div>`).join("")}
  <div class="s3f-bd"><div class="s3f-in">
    <div class="s3f-tot" data-r="tot1"><span>Total Investment</span><img src="${A}s3-caret.svg" alt=""><span class="s3f-v">₹7,677</span></div>
    <div class="s3f-sub"><div data-r="sub0"><span>3 Investments</span><span>₹7,500</span></div><div data-r="sub1"><span>Compliance Fee (2%)</span><span>₹150</span></div><div data-r="sub2"><span>GST on Compliance Fee (18%)</span><span>₹27</span></div></div>
  </div></div>
  <div class="s3f-btn" data-r="btn1"><div class="s3f-tint" data-r="tint1"></div><b>Confirm Investment</b><small>Payment on <span data-r="d1" style="display:inline-block">1st May</span></small></div>
</div>
<div class="s3f-chip" data-r="chip1" style="left:294px;top:709px"><div class="s3f-tn" data-r="tn1"></div><span>01 May</span></div>
<div class="s3f-card" data-r="card2" style="top:849px">
  <div class="s3f-amt2"><div class="s3f-big" data-r="total2">₹7,677</div><div class="s3f-lbl">Payment due towards your investment</div></div>
  <div class="s3f-trio"></div>
  <div class="s3f-btn s3f-pay" data-r="btn2"><div class="s3f-tint" data-r="tint2"></div><div class="s3f-paytxt"><span class="s3f-paytick" data-r="paytick"><svg viewBox="0 0 14.0515 13.8875" aria-hidden="true"><path d="M5.69369 0.702031C6.33507 -0.23401 7.71642 -0.23401 8.35779 0.702031V0.702031C8.74829 1.27194 9.4581 1.53029 10.1236 1.34472V1.34472C11.2166 1.03994 12.2747 1.92786 12.1644 3.05717V3.05717C12.0972 3.74476 12.4749 4.39891 13.1039 4.68452V4.68452C14.1371 5.15361 14.377 6.51397 13.5666 7.30814V7.30814C13.0731 7.79168 12.9419 8.53556 13.2403 9.1587V9.1587C13.7302 10.1822 13.0395 11.3785 11.9082 11.4659V11.4659C11.2194 11.5191 10.6408 12.0046 10.4687 12.6737V12.6737C10.1862 13.7727 8.88813 14.2451 7.96529 13.5849V13.5849C7.40342 13.1829 6.64807 13.1829 6.08619 13.5849V13.5849C5.16336 14.2451 3.86531 13.7727 3.58276 12.6737V12.6737C3.41073 12.0046 2.83209 11.5191 2.14329 11.4659V11.4659C1.01196 11.3785 0.321287 10.1822 0.811236 9.1587V9.1587C1.10954 8.53556 0.978377 7.79168 0.484934 7.30814V7.30814C-0.325514 6.51397 -0.0856438 5.15361 0.94755 4.68452V4.68452C1.57661 4.39891 1.95429 3.74476 1.8871 3.05717V3.05717C1.77674 1.92786 2.83492 1.03994 3.92792 1.34472V1.34472C4.59339 1.53029 5.30319 1.27194 5.69369 0.702031V0.702031Z" fill="#fff"/><path transform="translate(3.23 4.8)" d="M2.71893 3.92757L6.64607 0L7.25061 0.604111L2.71893 5.1358L0 2.41687L0.604111 1.81276L2.71893 3.92757Z" fill="#3a6e0c"/></svg></span><span class="s3f-paylbl"><b data-r="paynow">Pay Now</b><b data-r="paid">Payment sent</b></span></div></div>
</div>
<div class="s3f-chip" data-r="chip2" style="left:294px;top:1244px"><div class="s3f-tn" data-r="tn2"></div><span>02 May</span></div>
<div data-r="favs"></div>
<div data-r="rings"></div>
<div class="s3f-succ"><span class="s3f-badge" data-r="badge"><svg viewBox="0 0 14.0515 13.8875" aria-hidden="true"><path d="M5.69369 0.702031C6.33507 -0.23401 7.71642 -0.23401 8.35779 0.702031V0.702031C8.74829 1.27194 9.4581 1.53029 10.1236 1.34472V1.34472C11.2166 1.03994 12.2747 1.92786 12.1644 3.05717V3.05717C12.0972 3.74476 12.4749 4.39891 13.1039 4.68452V4.68452C14.1371 5.15361 14.377 6.51397 13.5666 7.30814V7.30814C13.0731 7.79168 12.9419 8.53556 13.2403 9.1587V9.1587C13.7302 10.1822 13.0395 11.3785 11.9082 11.4659V11.4659C11.2194 11.5191 10.6408 12.0046 10.4687 12.6737V12.6737C10.1862 13.7727 8.88813 14.2451 7.96529 13.5849V13.5849C7.40342 13.1829 6.64807 13.1829 6.08619 13.5849V13.5849C5.16336 14.2451 3.86531 13.7727 3.58276 12.6737V12.6737C3.41073 12.0046 2.83209 11.5191 2.14329 11.4659V11.4659C1.01196 11.3785 0.321287 10.1822 0.811236 9.1587V9.1587C1.10954 8.53556 0.978377 7.79168 0.484934 7.30814V7.30814C-0.325514 6.51397 -0.0856438 5.15361 0.94755 4.68452V4.68452C1.57661 4.39891 1.95429 3.74476 1.8871 3.05717V3.05717C1.77674 1.92786 2.83492 1.03994 3.92792 1.34472V1.34472C4.59339 1.53029 5.30319 1.27194 5.69369 0.702031V0.702031Z" fill="#62af1d"/><path transform="translate(3.23 4.8)" d="M2.71893 3.92757L6.64607 0L7.25061 0.604111L2.71893 5.1358L0 2.41687L0.604111 1.81276L2.71893 3.92757Z" fill="#fff"/></svg></span><span class="s3f-tx" data-r="sx">Transfer Successful</span></div>
</div></div>`;
}

export function mountStep3(root, reduced) {
  root.innerHTML = markup();
  const ref = {};
  root.querySelectorAll("[data-r]").forEach((el) => {
    ref[el.dataset.r] = el;
  });
  const world = root.querySelector(".s3f-world");

  // branch connectors: light base line + dark line that draws as the avatar travels it
  const branch = {};
  for (const k in BR) {
    const base = document.createElementNS(NS, "path");
    base.setAttribute("d", BR[k]);
    base.setAttribute("stroke", "#cbe0b8");
    base.setAttribute("stroke-width", "4");
    base.setAttribute("fill", "none");
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", BR[k]);
    p.setAttribute("stroke", "#62af1d");
    p.setAttribute("stroke-width", "4");
    p.setAttribute("fill", "none");
    ref.branches.append(base, p);
    const lineLen = p.getTotalLength();
    p.style.strokeDasharray = lineLen;
    p.style.strokeDashoffset = lineLen;
    branch[k] = { base, p, lineLen };
  }
  const L1 = 267;
  const L2 = SPLIT_Y - 1085;
  ref.l1.style.strokeDasharray = L1;
  ref.l2.style.strokeDasharray = L2;

  // every flight is ONE continuous curve (tangent-continuous at each join) with ONE easing
  const mkPath = (d) => {
    const el = document.createElementNS(NS, "path");
    el.setAttribute("d", d);
    el.setAttribute("fill", "none");
    el.setAttribute("stroke", "none");
    ref.branches.append(el);
    return { el, len: el.getTotalLength() };
  };
  const FL1 = {};
  const FL2 = {};
  const favs = {};
  const rings = {};
  PEOPLE.forEach((p) => {
    const row = p.row;
    const tr = TRIO[p.key];
    const fin = FINAL[p.key];
    const d1a = `M${row[0]} ${row[1]}C${row[0] + 130} ${row[1]} ${CX} 520 ${CX} 640`;
    const d1b = `${d1a}L${CX} 880`;
    FL1[p.key] = { path: mkPath(`${d1b}C${CX} 930 ${tr[0]} 915 ${tr[0]} ${tr[1]}`), join: mkPath(d1a).len, line: mkPath(d1b).len };
    const e2a = `M${tr[0]} ${tr[1]}C${tr[0]} 1030 ${CX} 1040 ${CX} 1110`;
    const e2b = `${e2a}L${CX} ${SPLIT_Y}`;
    const br = BR[p.key].slice(`M${CX} ${SPLIT_Y}`.length);
    FL2[p.key] = { path: mkPath(`${e2b}${br}L${fin[0]} ${fin[1]}`), join: mkPath(e2a).len, split: mkPath(e2b).len };

    const f = document.createElement("div");
    f.className = "s3f-fav";
    f.innerHTML = `<img src="${p.img}" alt="">`;
    ref.favs.append(f);
    favs[p.key] = f;

    const r = document.createElementNS(NS, "svg");
    r.setAttribute("class", "s3f-fring");
    r.setAttribute("width", "72");
    r.setAttribute("height", "72");
    r.setAttribute("viewBox", "0 0 72 72");
    r.style.left = `${fin[0] - 36}px`;
    r.style.top = `${fin[1] - 36}px`;
    r.innerHTML =
      '<circle cx="36" cy="36" r="34" fill="none" stroke="#cbe0b8" stroke-width="4"/><circle class="pr" cx="36" cy="36" r="34" fill="none" stroke="#62af1d" stroke-width="4" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" transform="rotate(-90 36 36)"/>';
    r.style.opacity = 0;
    ref.rings.append(r);
    rings[p.key] = { svg: r, pr: r.querySelector(".pr") };
  });

  function avatarState(p, i, t) {
    const row = p.row;
    const trio = TRIO[p.key];
    const k2 = ORDER2.indexOf(p.key);
    const s1 = FLY1 + FLY1_STAG * i;
    const s2 = FLY2 + FLY2_STAG * k2;
    let x = row[0];
    let y = row[1];
    let size = 32;
    let lift = 0;
    let ring = 0;
    if (t < ROW_AT[i]) return { x, y, size, o: 0, sc: 0.6, lift, ring, u1: 0, u2: 0 };
    const o = seg(t, ROW_AT[i], ROW_AT[i] + 0.35, E.o);
    const sc = lerp(0.6, 1, seg(t, ROW_AT[i], ROW_AT[i] + 0.4, E.back));
    const u1 = clamp((t - s1) / FLY1_DUR);
    const u2 = clamp((t - s2) / FLY2_DUR);
    if (u1 > 0 && u2 <= 0) {
      const f = FL1[p.key];
      const dist = f.path.len * sine(u1);
      const pt = f.path.el.getPointAtLength(dist);
      x = pt.x;
      y = pt.y;
      size = 32 + 10 * smooth(dist / f.join) + 22 * smooth((dist - f.line) / (f.path.len - f.line));
      lift = Math.sin(Math.PI * Math.min(1, u1 * 1.12));
      ring = smooth((dist - f.line) / (f.path.len - f.line));
    }
    if (u2 > 0) {
      const f = FL2[p.key];
      const dist = f.path.len * sine(u2);
      const pt = f.path.el.getPointAtLength(dist);
      x = pt.x;
      y = pt.y;
      size = 64 - 24 * smooth(dist / f.join) + 24 * smooth((dist - f.split) / (f.path.len - f.split));
      lift = Math.sin(Math.PI * Math.min(1, u2 * 1.08));
      ring = 1 - smooth(dist / f.join);
      return { x, y, size, o, sc, lift, ring, u1, u2, dist, split: f.split };
    }
    if (u1 >= 1) {
      x = trio[0];
      y = trio[1];
      size = 64;
      ring = 1;
      lift = 0;
    }
    return { x, y, size, o, sc, lift, ring, u1, u2 };
  }

  function render(t) {
    world.style.opacity = 1 - seg(t, T - 0.5, T, E.io);
    const sc = 0.78;
    world.style.transform = `translate(${187 - CX * sc}px,${-camY(t) * sc}px) scale(${sc})`;

    // card 1
    const c1 = seg(t, 0, 0.6, E.o);
    // once the avatars lift off, the card recedes so they glide over a quiet card, not over solid text
    const recede = seg(t, FLY1 - 0.1, FLY1 + 0.7, E.io);
    ref.card1.style.opacity = c1 * (1 - 0.72 * recede);
    ref.card1.style.transform = `translateY(${(1 - c1) * 14}px)`;
    const av = PEOPLE.map((p, i) => ({ p, i, s: avatarState(p, i, t) }));
    PEOPLE.forEach((p, i) => {
      const u = seg(t, ROW_AT[i], ROW_AT[i] + 0.4, E.o);
      ref["nm-" + p.key].style.opacity = u;
      ref["am-" + p.key].style.opacity = u;
      ref["nm-" + p.key].style.transform = `translateX(${(1 - u) * 8}px)`;
      const s1 = FLY1 + FLY1_STAG * i;
      ref["slot-" + p.key].style.opacity = av[i].s.u1 > 0 ? seg(t, s1, s1 + 0.3, E.o) : 0;
    });
    ref.tot1.style.opacity = seg(t, 1.7, 2.0, E.o);
    [0, 1, 2].forEach((i) => {
      const u = seg(t, 1.95 + 0.14 * i, 2.3 + 0.14 * i, E.o);
      ref["sub" + i].style.opacity = u;
      ref["sub" + i].style.transform = `translateY(${(1 - u) * 6}px)`;
    });
    ref.btn1.style.opacity = seg(t, 1.7, 2.1, E.o);
    const press1 = seg(t, BTN1[0], BTN1[0] + 0.14, E.o) - seg(t, BTN1[0] + 0.14, BTN1[1], E.o);
    ref.d1.style.fontWeight = press1 > 0.05 ? 700 : 500;
    ref.d1.style.color = `rgba(255,255,255,${0.78 + 0.22 * press1})`;
    ref.d1.style.transform = `scale(${1 + 0.18 * press1})`;
    ref.btn1.style.transform = `scale(${1 - 0.035 * press1})`;
    ref.tint1.style.opacity = press1 * 0.9;

    // line 1 follows the lead avatar; chip 1 sits in front of the avatars so the date stays readable
    const lead1 = Math.max(...av.map((a) => (a.s.u1 > 0 && a.s.u1 < 1 ? a.s.y : a.s.u1 >= 1 ? 849 : 0)));
    ref.l1d.style.opacity = seg(t, 3.0, 3.5, E.o);
    ref.l1.style.strokeDashoffset = L1 * (1 - clamp((lead1 - 582) / (849 - 582)));
    const ch1 = seg(t, 3.7, 4.3, E.back);
    const pulse1 = Math.sin(Math.PI * clamp((lead1 - 690) / 120));
    const tint1 = seg(lead1, 700, 735, E.o);
    ref.chip1.style.opacity = clamp(ch1 * 2);
    ref.chip1.style.transform = `scale(${lerp(0.85, 1, clamp(ch1)) * (1 + 0.16 * pulse1)})`;
    ref.tn1.style.opacity = tint1;
    ref.chip1.style.color = mixInk(tint1);

    // card 2
    const c2 = seg(t, 3.6, 4.3, E.o);
    ref.card2.style.opacity = c2;
    ref.card2.style.transform = `translateY(${(1 - c2) * 16}px)`;
    ref.total2.textContent = "₹" + Math.round(7677 * seg(t, 4.4, 5.2, E.o)).toLocaleString("en-IN");
    const press2 = seg(t, BTN2[0], BTN2[0] + 0.16, E.o) - seg(t, BTN2[0] + 0.16, BTN2[1], E.o);
    ref.btn2.style.transform = `scale(${1 - 0.035 * press2})`;
    ref.tint2.style.opacity = press2 * 0.9;
    const tk = seg(t, TICK[0], TICK[1], E.back);
    ref.paytick.style.transform = `scale(${tk})`;
    ref.paytick.style.marginLeft = `${-26 * (1 - clamp(tk))}px`;
    ref.paynow.style.opacity = 1 - seg(t, TICK[0], TICK[0] + 0.3, E.o);
    ref.paid.style.opacity = seg(t, TICK[0] + 0.1, TICK[0] + 0.45, E.o);

    // line 2, chip 2 and the three branches
    const lead2 = Math.max(...av.map((a) => (a.s.u2 > 0 ? a.s.y : 0)));
    ref.l2d.style.opacity = seg(t, 6.9, 7.4, E.o);
    ref.l2.style.strokeDashoffset = L2 * (1 - clamp((Math.min(lead2, SPLIT_Y) - 1085) / L2));
    const ch2 = seg(t, 6.8, 7.3, E.back);
    const pulse2 = Math.sin(Math.PI * clamp((lead2 - 1215) / 120));
    const tint2 = seg(lead2, 1225, 1262, E.o);
    ref.chip2.style.opacity = clamp(ch2 * 2);
    ref.chip2.style.transform = `scale(${lerp(0.85, 1, clamp(ch2)) * (1 + 0.16 * pulse2)})`;
    ref.tn2.style.opacity = tint2;
    ref.chip2.style.color = mixInk(tint2);
    for (const k in branch) {
      const b = branch[k];
      const s = av.find((a) => a.p.key === k).s;
      const drawn = s.u2 > 0 ? clamp(s.dist - s.split, 0, b.lineLen) : 0;
      b.p.style.strokeDashoffset = b.lineLen - drawn;
      b.base.style.opacity = seg(t, 6.95, 7.45, E.o);
    }

    // the shared avatars
    av.forEach(({ p, s }) => {
      const f = favs[p.key];
      f.style.left = `${s.x - s.size / 2}px`;
      f.style.top = `${s.y - s.size / 2}px`;
      f.style.width = f.style.height = `${s.size}px`;
      f.style.opacity = s.o;
      f.style.transform = `scale(${s.sc})`;
      f.style.boxShadow = `0 0 0 3px rgba(241,242,245,${s.ring.toFixed(3)}),0 ${(2 + 6 * s.lift).toFixed(1)}px ${(4 + 14 * s.lift).toFixed(1)}px rgba(41,45,54,${(0.04 + 0.2 * s.lift).toFixed(3)})`;
      f.style.zIndex = 20 + ORDER2.indexOf(p.key);
    });
    // rings draw once each avatar has landed
    PEOPLE.forEach((p) => {
      const landedAt = FLY2 + FLY2_STAG * ORDER2.indexOf(p.key) + FLY2_DUR - 0.05;
      rings[p.key].svg.style.opacity = t >= landedAt - 0.05 ? 1 : 0;
      rings[p.key].pr.style.strokeDashoffset = 1 - seg(t, landedAt, landedAt + 0.7, E.io);
    });
    // "Transfer successful"
    const last = FLY2 + FLY2_STAG * 2 + FLY2_DUR + 0.7;
    ref.badge.style.transform = `scale(${1.23 * seg(t, last - 0.1, last + 0.35, E.back)})`;
    ref.sx.style.transform = `translateX(${12 * seg(t, last - 0.1, last + 0.25, E.o)}px)`;
    ref.sx.style.opacity = seg(t, last - 0.2, last + 0.15, E.o);
  }

  let raf = 0;
  let alive = true;
  if (reduced) {
    render(10.9);
  } else {
    const start = performance.now();
    const loop = (now) => {
      if (!alive) return;
      render(((now - start) / 1000) % T);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    root.innerHTML = "";
  };
}
