/* eslint-disable */
// Durga Chouhan, a live listing on rangde.in (rangde.in/i/durga-294, Oct 2026), from picking her to
// being repaid, drawn in the site's own UI inside a browser window. Each beat also sets a caption
// (capEl) that says what the beat shows, so the animation reads without the copy around it. Queries
// are scoped to one mount point. Scenes, by key:
//   vet        — her profile goes through five checks, then goes live
//   choose     — real listing cards scroll, the Women filter is tapped, Durga's card opens into her page
//   understand — her page scrolls: gallery, About the Business, Potential Impact, Key facts, partner
//   lend       — ₹2,000 picked and lent, other investors fill the goal, the money reaches her shop
//   follow     — a repayment notification, then the log: each month arrives as a row, the ring fills
//   earn       — repaid in full: your money and returns, Reinvest, and the next entrepreneur
export const FRAME_W = 420, FRAME_H = 500;

export function mountJourney(root, scene, reducedMotion, capEl) {
  const $ = s => root.querySelector(s);
  const $$ = s => Array.from(root.querySelectorAll(s));
  const REDUCED = !!reducedMotion;
  const sched = [], intervals = [], rafs = new Set();
  function after(ms, fn){ sched.push(setTimeout(fn, REDUCED ? 0 : ms)); }
  function clearSched(){
    while(sched.length) clearTimeout(sched.pop());
    while(intervals.length) clearInterval(intervals.pop());
    rafs.forEach(id => cancelAnimationFrame(id)); rafs.clear();
  }
  // The frame may be scaled to fit its box: convert screen distances back to frame pixels.
  const k = () => { const r = root.getBoundingClientRect(); return root.offsetWidth ? r.width / root.offsetWidth : 1; };
  const inr = (n, dec) => n.toLocaleString('en-IN', { minimumFractionDigits:dec, maximumFractionDigits:dec });
  function tween(el, from, to, ms, f){
    if(REDUCED){ el.textContent = f(to); return; }
    const t0 = performance.now();
    (function step(now){
      if(!el.isConnected) return;
      const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = f(from + (to - from) * e);
      if(k < 1) rafs.add(requestAnimationFrame(step));
    })(t0);
  }
  function restart(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  /* Crossfade an element's content through a short blur. */
  function swapHTML(el, html, ms = 230){
    if(REDUCED){ el.innerHTML = html; return; }
    el.classList.add('swap', 'out');
    sched.push(setTimeout(() => { el.innerHTML = html; el.classList.remove('out'); }, ms));
  }
  function odoHTML(tpl){
    const body = tpl.replace(/^₹/, '');
    return `<span class="odo" data-tpl="${body}" aria-hidden="true"><span class="os" data-sym="1" style="--w:.62em">₹</span>` + Array.from(body).map(ch => /\d/.test(ch)
      ? `<span class="od blank"><span class="odc"><i>&nbsp;</i>${[0,1,2,3,4,5,6,7,8,9].map(d => `<i>${d}</i>`).join('')}</span></span>`
      : `<span class="os hide" data-ch="${ch}">${ch}</span>`).join('') + '</span>';
  }
  function odoSet(el, val, dec, ms){
    const tpl = Array.from(el.dataset.tpl), str = Array.from(inr(val, dec)), off = tpl.length - str.length;
    Array.from(el.children).slice(1).forEach((c, i) => {
      const j = i - off, ch = j >= 0 ? str[j] : null;
      if(c.classList.contains('od')){
        const isD = ch != null && /\d/.test(ch);
        c.classList.toggle('blank', !isD);
        const col = c.firstChild; col.style.transitionDuration = (ms || 900) + 'ms, 300ms';
        col.style.transform = `translateY(${isD ? -(Number(ch) + 1) * 1.1 : 0}em)`;
        if(isD){ c.classList.add('mv'); setTimeout(() => c.classList.remove('mv'), (ms || 900) * .7); }
      } else { c.classList.toggle('hide', ch !== c.dataset.ch); }
    });
  }
  /* Tap indicator: move to an element (fractional point inside it), optionally press. */
  function tapTo(el, fx, fy, ms){
    const c = $('#tap'), v = (c.offsetParent || root).getBoundingClientRect(), r = el.getBoundingClientRect(), s = k();
    c.style.transitionDuration = ms + 'ms, 300ms';
    c.style.transform = `translate(${(r.left - v.left + r.width * fx) / s}px, ${(r.top - v.top + r.height * fy) / s}px)`;
  }
  function tapFrom(fx, fy){
    const c = $('#tap'), p = c.offsetParent || root;
    c.style.transitionDuration = '0ms'; c.style.transform = `translate(${p.offsetWidth * fx}px, ${p.offsetHeight * fy}px)`;
    void c.offsetWidth; c.classList.add('show');
  }
  function tapPress(){ const c = $('#tap'); c.classList.remove('press'); void c.offsetWidth; c.classList.add('press'); }
  const ICON_PATHS = {
    "adjustments-horizontal": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0M4 6h8m4 0h4M6 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0m-2 0h2m4 0h10m-5 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0M4 18h11m4 0h1\"/>",
    "heart-filled": "<path fill=\"currentColor\" d=\"M6.979 3.074a6 6 0 0 1 4.988 1.425l.037.033l.034-.03a6 6 0 0 1 4.733-1.44l.246.036a6 6 0 0 1 3.364 10.008l-.18.185l-.048.041l-7.45 7.379a1 1 0 0 1-1.313.082l-.094-.082l-7.493-7.422A6 6 0 0 1 6.979 3.074\"/>",
    "heart": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19.5 12.572L12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572\"/>",
    "search": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0m18 11l-6-6\"/>",
    "users": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m1-17.87a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85\"/>",
    "arrow-up-right": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M17 7L7 17M8 7h9v9\"/>",
    "building-store": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4\"/>",
    "calendar-event": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm12-4v4M8 3v4m-4 4h16\"/><path d=\"M8 15h2v2H8z\"/></g>",
    "chart-line": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 19h16M4 15l4-6l4 2l4-5l4 4\"/>",
    "check": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"m5 12l5 5L20 7\"/>",
    "clock": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0\"/><path d=\"M12 7v5l3 3\"/></g>",
    "coins": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M9 14c0 1.657 2.686 3 6 3s6-1.343 6-3s-2.686-3-6-3s-6 1.343-6 3\"/><path d=\"M9 14v4c0 1.656 2.686 3 6 3s6-1.344 6-3v-4M3 6c0 1.072 1.144 2.062 3 2.598s4.144.536 6 0S15 7.072 15 6s-1.144-2.062-3-2.598s-4.144-.536-6 0S3 4.928 3 6\"/><path d=\"M3 6v10c0 .888.772 1.45 2 2\"/><path d=\"M3 11c0 .888.772 1.45 2 2\"/></g>",
    "currency-rupee": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M18 5H7h3a4 4 0 0 1 0 8H7l6 6M7 9h11\"/>",
    "file-analytics": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M14 3v4a1 1 0 0 0 1 1h4\"/><path d=\"M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2m-8-4v-5m3 5v-1m3 1v-3\"/></g>",
    "gauge": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0\"/><path d=\"M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0m2.41-1.41L16 8m-9 4a5 5 0 0 1 5-5\"/></g>",
    "heart-handshake": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M19.5 12.572L12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572\"/><path d=\"M12 6L8.707 9.293a1 1 0 0 0 0 1.414l.543.543c.69.69 1.81.69 2.5 0l1-1a3.18 3.18 0 0 1 4.5 0l2.25 2.25m-7 3l2 2M15 13l2 2\"/></g>",
    "home": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M5 12H3l9-9l9 9h-2M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7\"/><path d=\"M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6\"/></g>",
    "id": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z\"/><path d=\"M7 10a2 2 0 1 0 4 0a2 2 0 1 0-4 0m8-2h2m-2 4h2M7 16h10\"/></g>",
    "loader-2": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 3a9 9 0 1 0 9 9\"/>",
    "map-pin": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M9 11a3 3 0 1 0 6 0a3 3 0 0 0-6 0\"/><path d=\"M17.657 16.657L13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0\"/></g>",
    "pig": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 11v.01M16 3v3.803A6.02 6.02 0 0 1 18.658 10h1.341a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1.342a6 6 0 0 1-1.658 2.473V18.5a1.5 1.5 0 0 1-3 0v-.583a6 6 0 0 1-1 .083h-4a6 6 0 0 1-1-.083v.583a1.5 1.5 0 0 1-3 0v-2.027A6 6 0 0 1 8.999 6h2.5z\"/>",
    "plant-2": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M2 9a10 10 0 1 0 20 0\"/><path d=\"M12 19A10 10 0 0 1 22 9M2 9a10 10 0 0 1 10 10\"/><path d=\"M12 4a9.7 9.7 0 0 1 2.99 7.5m-5.98 0A9.7 9.7 0 0 1 12 4\"/></g>",
    "rosette-discount-check": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M5 7.2A2.2 2.2 0 0 1 7.2 5h1a2.2 2.2 0 0 0 1.55-.64l.7-.7a2.2 2.2 0 0 1 3.12 0l.7.7c.412.41.97.64 1.55.64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58.23 1.138.64 1.55l.7.7a2.2 2.2 0 0 1 0 3.12l-.7.7a2.2 2.2 0 0 0-.64 1.55v1a2.2 2.2 0 0 1-2.2 2.2h-1a2.2 2.2 0 0 0-1.55.64l-.7.7a2.2 2.2 0 0 1-3.12 0l-.7-.7a2.2 2.2 0 0 0-1.55-.64h-1a2.2 2.2 0 0 1-2.2-2.2v-1a2.2 2.2 0 0 0-.64-1.55l-.7-.7a2.2 2.2 0 0 1 0-3.12l.7-.7A2.2 2.2 0 0 0 5 8.2z\"/><path d=\"m9 12l2 2l4-4\"/></g>",
    "shield-check": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M11.46 20.846A12 12 0 0 1 3.5 6A12 12 0 0 0 12 3a12 12 0 0 0 8.5 3a12 12 0 0 1-.09 7.06M15 19l2 2l4-4\"/>",
    "sparkles": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2-2a2 2 0 0 1-2-2a2 2 0 0 1-2 2m0-12a2 2 0 0 1 2 2a2 2 0 0 1 2-2a2 2 0 0 1-2-2a2 2 0 0 1-2 2M9 18a6 6 0 0 1 6-6a6 6 0 0 1-6-6a6 6 0 0 1-6 6a6 6 0 0 1 6 6\"/>",
    "users-group": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M10 13a2 2 0 1 0 4 0a2 2 0 0 0-4 0m-2 8v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1M15 5a2 2 0 1 0 4 0a2 2 0 0 0-4 0m2 5h2a2 2 0 0 1 2 2v1M5 5a2 2 0 1 0 4 0a2 2 0 0 0-4 0m-2 8v-1a2 2 0 0 1 2-2h2\"/>",
    "vaccine": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"m17 3l4 4m-2-2l-4.5 4.5m-3-3l6 6m-1-1L10 18H6v-4l6.5-6.5m-5 5L9 14m1.5-4.5L12 11M3 21l3-3\"/>",
    "wheat": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M12.014 21.514v-3.75M5.93 9.504l-.43 1.604a4.986 4.986 0 0 0 3.524 6.105q1.495.402 2.99.801v-3.44a4.98 4.98 0 0 0-3.676-4.426z\"/><path d=\"M13.744 11.164a4.9 4.9 0 0 0 1.433-3.46a4.88 4.88 0 0 0-1.433-3.46l-1.73-1.73l-1.73 1.73a4.9 4.9 0 0 0-1.433 3.46a4.9 4.9 0 0 0 1.433 3.46\"/><path d=\"m18.099 9.504l.43 1.604a4.986 4.986 0 0 1-3.525 6.105l-2.99.801v-3.44a4.98 4.98 0 0 1 3.677-4.426z\"/></g>",
    "layout-grid": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z\"/>",
    "user": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2\"/>",
    "x": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M18 6L6 18M6 6l12 12\"/>"
    };
  const ic = (n, cls='') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS[n]}</svg>`;

  const CHECK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2l2.3 2.3L9.5 3.8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const OK = `<span class="okdot">${CHECK}</span>`;
  const SPIN = '<span class="spin"></span>';

  /* ---- Durga Chouhan: live listing, rangde.in/i/durga-294 (Oct 2026) ---- */
  const IMG = f => `https://rangde.imgix.net/bImg/${f}?auto=compress,format&h=150&w=150&fit=facearea&facepad=4.0`;
  const photo = (url, alt = '') => `<img src="${url}" alt="${alt}" loading="eager" decoding="async">`;
  const DURGA = IMG('durgamanawar01-img.jpg');
  const ph = (cls = '') => `<div class="${cls} av ph">${photo(DURGA)}</div>`;

  /* =========================== STEP 1 : checks as a flow =========================== */
  const STAGES = [
    { icon:'users-group',            n:'Met in her community' },
    { icon:'building-store',         n:'Business visited' },
    { icon:'gauge',                  n:'Can she repay?' },
    { icon:'id',                     n:'Documents checked' },
    { icon:'rosette-discount-check', n:'Approved' }
  ];
  function vis1(){
    const nodes = STAGES.map((s, i) => `<div class="node" data-i="${i}">${ic(s.icon)}<span class="nb">${CHECK}</span></div>`).join('');
    return `<div class="stage v1" id="v1">
      <svg class="tree" id="tree" aria-hidden="true"></svg>
      <div class="fpill" id="fpill">${ph('pav')}<span class="pt" id="fpt">Checking Durga's profile</span><span class="tail" id="ftail">${SPIN}</span></div>
      <div class="nodes" id="nodes">${nodes}</div>
      <div class="fcard wcard"><div class="fc-top swap" id="fbody"></div></div>
    </div>`;
  }
  const fcardHTML = (title, status) => `<span class="fc-st">${status}</span><span class="fc-t">${title}</span>`;
  /* Build one S-curve per node, from the pill's bottom edge to the node's top edge. */
  function buildTree(){
    // Layout offsets (not getBoundingClientRect) so the stage's entrance scale can't skew them.
    const v = $('#v1'), tree = $('#tree'), p = $('#fpill'), row = $('#nodes');
    const x0 = p.offsetLeft + p.offsetWidth / 2, y0 = p.offsetTop + p.offsetHeight;
    tree.setAttribute('viewBox', `0 0 ${v.clientWidth} ${v.clientHeight}`);
    let html = '';
    $$('#nodes .node').forEach((n, i) => {
      const sx = x0 + (i - 2) * 5, x1 = row.offsetLeft + n.offsetLeft + n.offsetWidth / 2, y1 = row.offsetTop + n.offsetTop, h = y1 - y0;
      const d = `M${sx} ${y0} C${sx} ${y0 + h * .62} ${x1} ${y1 - h * .62} ${x1} ${y1}`;
      html += `<path class="base" d="${d}"/><path class="live" id="lv${i}" d="${d}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`;
    });
    html += `<circle class="head" id="head" r="3.5" cx="-10" cy="-10" opacity="0"/>`;
    tree.innerHTML = html;
  }
  /* Draw path i with a dot riding its tip (the "packet" in the reference). */
  function travel(i, ms, done){
    const path = $('#lv' + i), head = $('#head');
    if(!path) return;
    const len = path.getTotalLength();
    if(REDUCED){ path.setAttribute('stroke-dashoffset', 0); done && done(); return; }
    head.setAttribute('opacity', 1);
    const t0 = performance.now();
    (function step(now){
      if(!path.isConnected) return;
      const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3) / 2;
      path.setAttribute('stroke-dashoffset', 1 - e);
      const pt = path.getPointAtLength(len * e);
      head.setAttribute('cx', pt.x); head.setAttribute('cy', pt.y);
      if(k < 1) rafs.add(requestAnimationFrame(step));
      else { head.setAttribute('opacity', 0); done && done(); }
    })(t0);
  }
  /* Morph the pill's width to fit new content (FLIP-style: pin current width, swap, animate to new). */
  function morphPill(html, tail){
    const pill = $('#fpill'), pt = $('#fpt'), w0 = pill.offsetWidth;
    pill.style.width = w0 + 'px';
    pt.classList.add('swap', 'out');
    after(220, () => {
      pt.innerHTML = html; $('#ftail').innerHTML = tail;
      pill.style.transition = 'none'; pill.style.width = 'auto';
      const w1 = pill.offsetWidth;
      pill.style.width = w0 + 'px'; void pill.offsetWidth; pill.style.transition = '';
      pill.style.width = w1 + 'px'; pt.classList.remove('out');
    });
  }
  function play1(){
    const D = 1000, nodes = $$('#nodes .node');
    $('#fbody').innerHTML = fcardHTML(STAGES[0].n, SPIN);
    buildTree();   // after the card has content — its height sets where the node row sits
    STAGES.forEach((s, i) => {
      const t = 250 + i * D;
      after(t, () => {
        if(i > 0) swapHTML($('#fbody'), fcardHTML(s.n, SPIN));
        travel(i, 450, () => nodes[i].classList.add('act'));
      });
      after(t + 750, () => {
        nodes[i].classList.remove('act'); nodes[i].classList.add('done');
        $('#lv' + i).classList.add('done');
        const st = $('#fbody .fc-st'); if(st) st.innerHTML = OK;
      });
    });
    after(250 + STAGES.length * D, () => {
      morphPill(`<b>Profile live</b> for investors`, OK);
      swapHTML($('#fbody'), fcardHTML("Durga's profile is live", OK));
    });
  }

  /* =========================== shared: caption, listings, Durga's page =========================== */
  /* The caption beside (or under) the window says what each beat shows, so the animation reads on its own. */
  function cap(h, s){
    if(!capEl) return;
    const html = `<b>${h}</b><span>${s}</span>`;
    if(!capEl.innerHTML.trim() || REDUCED){ capEl.innerHTML = html; return; }
    swapHTML(capEl, html, 260);
  }
  /* Live listings from rangde.in/invest/individuals (Oct 2026): name, need, state, amount
     left and photo exactly as published. `w`: shown under the Women filter. */
  const LISTINGS = [
    { name:'Vijay Muwel',              need:'Needs furniture and grocery items to maintain his store',        state:'Madhya Pradesh', left:82000, img:IMG('Vijay-004-img.jpg') },
    { name:'Rekha Bai',                need:'Needs funds to keep her grocery store well stocked',             state:'Rajasthan',      left:94200, img:IMG('Rekha-42-img.jpg'), w:true },
    { name:'Khandu Ganga Chavhan',     need:'Loan will fund the construction of his poultry shed',            state:'Maharashtra',    left:96400, img:IMG('51603-017-633-01-5111-img.jpg') },
    { name:'Nitin Vishvnath Jadhav',   need:'Needs credit to get his repair business underway',               state:'Maharashtra',    left:99000, img:IMG('nitin-jadhav-img.jpg') },
    { name:'Monika Bhatodra',          need:'Needs credit to purchase cosmetics and improve her store setup', state:'Madhya Pradesh', left:72500, img:IMG('manawrmonika037-img.jpg'), w:true },
    { name:'Manoj Kumar Mandal',       need:'Needs credit to equip his professional services setup',          state:'Assam',          left:48500, img:IMG('10020497-img.jpg') },
    { name:'Durga Chouhan',            need:'Needs credit to start an event decoration and tent business',    state:'Madhya Pradesh', left:55900, img:DURGA, pick:true, w:true },
    { name:'Jagdish Kashinath Sahare', need:'Plans to strengthen his repair setup with a garage',             state:'Maharashtra',    left:95800, img:IMG('Jagdish-sahare--img.jpg') },
    { name:'Dnyaneshwar Nandu Mahale', need:'Needs credit to replenish clothing inventory for his store',     state:'Maharashtra',    left:98900, img:IMG('dnyaneshwar-mahale--img.jpg') }
  ];
  const GOAL = 100000, LEFT = 55900, RAISED = GOAL - LEFT;
  const pctOf = n => Math.round(n / GOAL * 100);
  /* Durga's gallery on rangde.in/i/durga-294: her portrait, her in her grocery shop, her family at home. */
  const GPH = f => `https://rangde.imgix.net/bImg/${f}?auto=compress,format&w=640&h=640&fit=crop`;
  const GAL = ['durgamanawar01-img.jpg', '3uH58QFdaE-img-3.jpg', '3uH58QFdaE-img-2.jpg'].map(GPH);
  /* The listing card as rangde.in draws it: name, need, square photo, state and rating, amount left, Lend. */
  function rcHTML(L, extra = ''){
    const pct = Math.max(pctOf(GOAL - L.left), 3);
    return `<div class="rc${L.pick ? ' jon' : ''}${L.w ? ' w' : ''} ${extra}">
      <div class="rc-top"><div class="rc-t"><b>${L.name}</b><p>${L.need} <span class="chev">›</span></p></div><div class="rc-ph">${photo(L.img)}</div></div>
      <div class="rc-st">${L.state}${L.pick ? ' · Credit rating: <em>Good</em>' : ''}</div>
      <div class="rc-ft"><div class="rc-l"><b>₹${inr(L.left, 0)} left to invest</b><div class="rc-bar"><i style="width:${pct}%"></i></div></div><span class="rc-lend">Lend</span></div>
    </div>`;
  }

  /* =========================== CHOOSE : browse, filter, pick Durga =========================== */
  const CATS = [['layout-grid', 'All'], ['user', 'Women'], ['sparkles', 'First Time Borrowers'], ['wheat', 'Farmers'], ['building-store', 'Shopkeepers']];
  function visChoose(){
    return `<div class="stage vc" id="vc">
      <div class="cats" id="cats"><i class="cind" id="cind"></i>${CATS.map(([n, l], i) => `<div class="cat${i === 0 ? ' on' : ''}">${ic(n)}<span>${l}</span></div>`).join('')}</div>
      <div class="feed" id="feed"><div class="flist" id="flist">${LISTINGS.map(L => rcHTML(L)).join('')}</div></div>
      <div class="tap" id="tap"></div>
    </div>`;
  }
  function playChoose(){
    const stage = $('#vc'), feed = $('#feed'), list = $('#flist'), cards = $$('#flist .rc'), pick = list.querySelector('.rc.jon'), cats = $$('#cats .cat');
    const setCat = i => {
      cats.forEach((c, j) => c.classList.toggle('on', j === i));
      const c = cats[i], ind = $('#cind');
      ind.style.width = c.offsetWidth + 'px'; ind.style.transform = `translateX(${c.offsetLeft}px)`;
    };
    const scrollTo = (y, ms) => { list.style.transition = `transform ${ms}ms cubic-bezier(.1,.75,.2,1)`; list.style.transform = `translateY(${-y}px)`; };
    function flick(y, ms, at){
      after(at, () => { tapFrom(.5, .9); tapTo(feed, .5, .2, 340); scrollTo(y, ms); list.classList.add('fast'); });
      after(at + ms * .4, () => { list.classList.remove('fast'); $('#tap').classList.remove('show'); });
    }
    setCat(0);
    cap('Hundreds of entrepreneurs, verified on the ground', 'Every listing is a real person with a real business plan.');
    flick(320, 900, 500);
    flick(760, 900, 1500);
    after(2600, () => scrollTo(0, 700));
    after(3000, () => {
      cap('Filter by who you want to back', 'Women, first-time borrowers, farmers, shopkeepers, regions…');
      tapFrom(.62, .55); tapTo(cats[1], .5, .45, 600);
    });
    after(3700, () => tapPress());
    after(3850, () => {
      setCat(1); $('#tap').classList.remove('show');
      cards.forEach(c => { if(!c.classList.contains('w')){ c.style.height = c.offsetHeight + 'px'; void c.offsetWidth; c.classList.add('gone'); } });
    });
    after(4900, () => {
      cap('Pick someone whose story speaks to you', 'Durga Chouhan, Dhar, Madhya Pradesh');
      // Centre her card, but never scroll past the end of the (now short) list.
      const shown = cards.filter(c => !c.classList.contains('gone')), last = shown[shown.length - 1];
      const end = last.offsetTop + last.offsetHeight + 12 - feed.clientHeight;
      scrollTo(Math.max(0, Math.min(end, pick.offsetTop + pick.offsetHeight / 2 - feed.clientHeight / 2)), 800);
    });
    after(5600, () => { feed.classList.add('choosing'); pick.classList.add('pick'); tapFrom(.8, .95); tapTo(pick.querySelector('.rc-lend'), .5, .5, 600); });
    after(6300, () => { tapPress(); pick.querySelector('.rc-lend').classList.add('press'); });
    after(6500, () => {
      $('#tap').classList.remove('show');
      const sr = stage.getBoundingClientRect(), r = pick.getBoundingClientRect(), s = k();
      const pk = document.createElement('div');
      pk.className = 'pk';
      Object.assign(pk.style, { left: (r.left - sr.left) / s + 'px', top: (r.top - sr.top) / s + 'px', width: r.width / s + 'px', height: r.height / s + 'px' });
      pk.innerHTML = `<div class="pk-row">${rcHTML(LISTINGS.find(L => L.pick))}</div><div class="pk-in">
        <div class="pk-ph">${photo(GAL[0])}</div>
        <div class="pk-b">
          <div class="pg-h"><b>Durga Chouhan</b> · Durga needs credit to start an event decoration and tent business</div>
          <div class="pg-m">Dhar, Madhya Pradesh · Credit rating: <em>Good</em></div>
          <div class="sf-top"><span><b>₹${inr(RAISED, 0)}</b> raised</span><span>of ₹${inr(GOAL, 0)}</span></div>
          <div class="sf-bar"><i style="width:${pctOf(RAISED)}%"></i></div>
        </div>
      </div>`;
      stage.appendChild(pk);
      void pk.offsetWidth;
      Object.assign(pk.style, { left: '12px', top: '12px', width: (stage.offsetWidth - 24) + 'px', height: (stage.offsetHeight - 24) + 'px' });
      pk.classList.add('full');
    });
  }

  /* =========================== UNDERSTAND : her page on rangde.in =========================== */
  /* rangde.in/i/durga-294 (Oct 2026): her title, rating, gallery, About the Business, Potential
     Impact, Key facts and the impact partner who referred her, as published. */
  function visUnderstand(){
    return `<div class="stage vu" id="vu"><div class="pg" id="pg">
      <div class="pg-back">‹ Back to Individual Listings</div>
      <div class="pg-h"><b>Durga Chouhan</b> · Durga needs credit to start an event decoration and tent business</div>
      <div class="pg-m">Dhar, Madhya Pradesh · Credit rating: <em>Good</em></div>
      <div class="gal" id="gal"><div class="g0">${photo(GAL[0])}</div><div class="g1">${photo(GAL[1])}<span class="gtag">Her grocery shop</span></div><div class="g2">${photo(GAL[2])}<span class="gtag">Her family</span></div></div>
      <section class="ps" id="s-about"><h5>About the Business</h5>
        <p>Durga already runs a retail grocery shop and now plans to start <mark>an event decoration and tent rental business alongside it</mark>, serving weddings, celebrations and other gatherings.</p>
        <div class="pstats"><div><b>6 years</b><span>In operation</span></div><div><b>1</b><span>Employee</span></div><div><b>4</b><span>Family members</span></div></div></section>
      <section class="ps" id="s-impact"><h5>Potential Impact</h5>
        <ul><li>${OK}<span>Avail her <b>first credit</b>, kickstarting her credit journey.</span></li><li>${OK}<span>Gain <b>318 potential days</b> of livelihood for her and her team.</span></li><li>${OK}<span>A better life for her <b>family of 4</b>.</span></li></ul></section>
      <section class="ps" id="s-facts"><h5>Key facts</h5>
        <div class="kf"><div><span>Loan amount</span><b>₹1,00,000</b></div><div><span>Repayment</span><b>Monthly</b></div><div><span>Moratorium</span><b>2 months</b></div><div><span>Interest</span><b>8.25%</b></div></div>
        <div class="vby"><span class="okdot">${CHECK}</span><div><b>Verified by our Impact Partner</b><span>Transform Rural India Foundation – MP</span></div></div></section>
    </div></div>`;
  }
  function playUnderstand(){
    const stage = $('#vu'), pg = $('#pg'), secs = $$('#pg .ps');
    const go = id => {
      const el = $(id), max = Math.max(0, pg.offsetHeight - stage.clientHeight);
      pg.style.transform = `translateY(${-Math.min(max, Math.max(0, el.offsetTop - 16))}px)`;
      secs.forEach(s => s.classList.toggle('hl', s === el));
    };
    cap('Meet the person behind the listing', 'Durga has run a grocery shop in Dhar, Madhya Pradesh, for six years.');
    after(1100, () => $('#gal').classList.add('g-shop'));
    after(1900, () => $('#gal').classList.replace('g-shop', 'g-fam'));
    after(2700, () => {
      $('#gal').classList.remove('g-fam'); go('#s-about');
      cap('See exactly what the money is for', 'Tents and decoration to rent out for weddings and celebrations: a second income beside her shop.');
    });
    after(3400, () => $('#s-about mark').classList.add('on'));
    after(5000, () => { go('#s-impact'); cap('Know what it changes for her', 'Her first formal loan, and the start of her credit history.'); });
    after(7000, () => { go('#s-facts'); cap('Every number, up front', '₹1 lakh at 8.25% a year, repaid monthly. Vetted by a partner on the ground.'); });
  }

  /* =========================== LEND : ₹2,000 → fully funded → reaches her =========================== */
  const YOURS = 2000;
  /* Her page shows 31 investors and a disbursal date of 16 Oct 2026, so collection is the 15th. */
  const INVESTORS = 31;
  const TIMELINE = [['Today', 'You lend', 'check'], ['15 Oct', 'Collected', 'calendar-event'], ['16 Oct', 'Reaches Durga', 'heart-handshake']];
  const AV_COLORS = ['#F2C14E', '#7FB8E6', '#E58F65', '#9BC27A', '#B79CE0', '#6CC4B6', '#E6A0B8'];
  const avHTML = (t, i, cls = '') => `<span class="av2 ${cls}" style="background:${cls ? 'var(--primary)' : AV_COLORS[i % AV_COLORS.length]}">${t}</span>`;
  function visLend(){
    return `<div class="stage vl" id="vl">
      <div class="lw wcard" id="lw">
        <div class="lw-h">${ph('pav')}<div class="sh-t"><b>Durga Chouhan</b><span>Event decoration and tent rental</span></div><span class="chip ok swap" id="lchip">Raising</span></div>
        <div class="lw-r"><span class="lw-amt">${odoHTML('₹0,00,000')}</span><span class="lw-of">raised of ₹${inr(GOAL, 0)}</span></div>
        <div class="lw-bar"><i class="o" id="lbo"></i><i class="y" id="lby"></i><i class="o2" id="lbo2"></i></div>
        <div class="lw-lab">Choose an amount<span>Min. ₹500</span></div>
        <div class="amts" id="amts">${[500, 1000, 2000, 5000].map(a => `<span data-a="${a}">₹${inr(a, 0)}</span>`).join('')}</div>
        <div class="morph" id="morph">
          <div class="m-btn on" id="mbtn">Lend ₹500</div>
          <div class="m-load"><span class="spin"></span></div>
          <div class="m-ok"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div class="m-pill">${OK}<b>₹${inr(YOURS, 0)} lent to Durga</b></div>
        </div>
        <div class="invs"><div class="avs" id="avs">${['AK', 'RS', 'PM', 'NV'].map((t, i) => avHTML(t, i)).join('')}</div><span class="swap" id="invt">Investors so far</span></div>
      </div>
      <div class="arr wcard" id="arr">
        <div class="arr-ph">${photo(GAL[1])}<span class="arr-tag">${OK}₹${inr(GOAL, 0)} reaches Durga</span></div>
        <div class="tl"><div class="tl-track"><i id="tlfill"></i></div>
          ${TIMELINE.map(([d, c, n], i) => `<div class="tl-pt" id="tp${i}"><span class="tl-dot">${ic(n)}</span><b>${d}</b><span>${c}</span></div>`).join('')}</div>
      </div>
      <div class="tap" id="tap"></div>
    </div>`;
  }
  function playLend(){
    const amt = $('.lw-amt .odo'), m = $('#morph'), chips = $$('#amts span'), avs = $('#avs');
    const setMorph = st => {
      m.className = 'morph st-' + st;
      const map = { btn:'.m-btn', load:'.m-load', ok:'.m-ok', pill:'.m-pill' };
      m.querySelectorAll(':scope > div').forEach(d => d.classList.toggle('on', d.matches(map[st])));
    };
    const sel = a => { chips.forEach(c => c.classList.toggle('on', +c.dataset.a === a)); $('#mbtn').textContent = `Lend ₹${inr(a, 0)}`; };
    let n = 4;
    const addAv = (t, cls = '') => { const w = document.createElement('div'); w.innerHTML = avHTML(t, n++, cls); const a = w.firstChild; avs.insertBefore(a, avs.firstChild); };
    sel(500);
    odoSet(amt, RAISED, 0, 10);
    cap('Lend from ₹500', 'Pick an amount. Spread it across as many entrepreneurs as you like.');
    after(150, () => { $('#lbo').style.width = pctOf(RAISED) + '%'; });
    after(700,  () => { tapFrom(.5, .98); tapTo(chips[2], .5, .5, 600); });
    after(1400, () => { tapPress(); sel(2000); });
    after(1800, () => tapTo(m, .5, .5, 500));
    after(2400, () => { tapPress(); m.classList.add('press'); });
    after(2550, () => { m.classList.remove('press'); setMorph('load'); $('#tap').classList.remove('show'); });
    after(3100, () => setMorph('ok'));
    after(3500, () => {
      setMorph('pill'); $('#lby').style.width = pctOf(YOURS) + '%'; odoSet(amt, RAISED + YOURS, 0, 700);
      addAv('You', 'me'); swapHTML($('#invt'), '<b>You’re in</b>');
    });
    after(4400, () => {
      cap('Others join you', `Together, ${INVESTORS} investors fill her ₹1 lakh goal.`);
      $('#lbo2').style.width = (100 - pctOf(RAISED) - pctOf(YOURS)) + '%'; odoSet(amt, GOAL, 0, 1500);
      ['DM', 'LK', 'RH'].forEach((t, i) => after(i * 300, () => addAv(t)));
    });
    after(5600, () => { swapHTML($('#lchip'), 'Fully funded'); swapHTML($('#invt'), `<b>${INVESTORS} investors</b> have invested`); });
    after(6400, () => { cap('The money reaches Durga', 'Collected on the 15th, in her account the next day.'); $('#vl').classList.add('arrive'); });
    after(7000, () => { $('#tp0').classList.add('done'); $('#tlfill').style.transform = 'scaleX(.5)'; });
    after(7500, () => { $('#tp1').classList.add('done'); $('#tlfill').style.transform = 'scaleX(1)'; });
    after(8000, () => { $('#tp2').classList.add('done'); $('#arr').classList.add('done'); });
  }

  /* =========================== FOLLOW : the repayment log =========================== */
  /* ₹2,000 at Durga's 8.25% a year over her 18-month tenure ≈ ₹119 a month, ₹2,133 in all.
     Illustrative: ignores her 2-month moratorium and investor fees — check against the
     real repayment schedule before this ships. */
  const EMI = 119, TOTAL = 2133, MONTHS = 18;
  function visFollow(){
    const R = 22, C = 2 * Math.PI * R;
    return `<div class="stage vf">
      <div class="ntf" id="ntf"><img class="ntf-l" src="https://rangde.imgix.net/rangde-logo.svg?auto=compress,format&w=64&h=50" alt=""><div><b>Rang De · now</b><span>Durga repaid ₹${EMI} on your loan, on time.</span></div>${ph('ntf-a')}</div>
      <div class="lg wcard">
      <div class="lg-h"><div class="ring"><svg viewBox="0 0 52 52" aria-hidden="true"><circle class="bg" cx="26" cy="26" r="${R}"/><circle class="fg" id="ringfg" cx="26" cy="26" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><b id="ringn">0/${MONTHS}</b></div>
        <div class="lg-t"><b>Repayments from Durga</b><span>Your ₹${inr(YOURS, 0)}, every month</span></div>
        <span class="chip ok" style="margin-left:auto">On time</span></div>
      <div class="rows"><div class="rlist" id="rlist"></div></div>
    </div></div>`;
  }
  function playFollow(){
    const list = $('#rlist'), fg = $('#ringfg'), n = $('#ringn'), C = 2 * Math.PI * 22, SHOWN = 6;
    cap('She repays you every month', 'Each repayment lands in your Rang De account.');
    after(300, () => $('#ntf').classList.add('show'));
    after(2300, () => $('#ntf').classList.remove('show'));
    const next = document.createElement('div');
    next.className = 'row next in'; next.innerHTML = `<span class="nd"></span><div class="rt">Month 1<span>Next repayment</span></div><span class="ra">₹${EMI}</span>`;
    list.appendChild(next);
    for(let k = 0; k < SHOWN; k++){
      after(900 + k * 700, () => {
        list.querySelectorAll('.row.new').forEach(r => r.classList.remove('new'));
        const row = document.createElement('div');
        row.className = 'row new';
        row.innerHTML = `${OK}<div class="rt">Month ${k + 1}<span>Repayment received, on time</span></div><span class="ra">+₹${EMI}</span>`;
        list.insertBefore(row, list.firstChild);
        void row.offsetWidth; row.classList.add('in');
        next.querySelector('.rt').innerHTML = `Month ${k + 2}<span>Next repayment</span>`;
        fg.style.strokeDashoffset = C * (1 - (k + 1) / MONTHS);
        n.textContent = `${k + 1}/${MONTHS}`;
      });
    }
    after(3200, () => cap('Track every loan, month by month', 'See what has come back and what is next, until she repays in full.'));
  }

  /* =========================== EARN : principal + returns, then lend again =========================== */
  function visEarn(){
    return `<div class="stage ve"><div class="er wcard" id="er">
      <div class="rp-h">${ph('pav')}<div class="sh-t"><b>Durga has repaid in full</b><span>18 of 18 months, on time</span></div><span class="chip ok">Repaid</span></div>
      <div class="er-amt">${odoHTML('₹0,000')}</div>
      <div class="er-sub">back to you</div>
      <div class="split"><i class="p" id="sp"></i><i class="r" id="sr"></i></div>
      <div class="legend"><span><span class="dot" style="background:var(--green-bright)"></span>Your ₹<b>${inr(YOURS, 0)}</b></span><span><span class="dot" style="background:var(--primary)"></span><b>+₹${inr(TOTAL - YOURS, 0)}</b> returns</span></div>
      <div class="choose2" id="ch2"><div class="c-re" id="cre">Reinvest</div><div class="c-wd">Withdraw</div></div>
    </div>
    <div class="nx" id="nx"><div class="nx-l">${ic('sparkles')}Up next</div>${rcHTML(LISTINGS[1])}</div>
    <div class="tap" id="tap"></div></div>`;
  }
  function playEarn(){
    const amt = $('.er-amt .odo');
    cap('Your money comes back, with returns', `₹${inr(YOURS, 0)} lent, ₹${inr(TOTAL, 0)} back, at up to 8.25% a year.`);
    after(250, () => odoSet(amt, TOTAL, 0, 1400));
    after(400, () => { $('#sp').style.width = (YOURS / TOTAL * 100) + '%'; });
    after(1100, () => { $('#sr').style.width = ((TOTAL - YOURS) / TOTAL * 100 - 1) + '%'; });
    after(1900, () => $('#ch2').classList.add('show'));
    after(2500, () => { tapFrom(.3, .98); tapTo($('#cre'), .5, .5, 600); });
    after(3200, () => { tapPress(); $('#cre').classList.add('press'); });
    after(3350, () => { const b = $('#cre'); b.classList.remove('press'); b.classList.add('done'); b.innerHTML = `${OK}Reinvesting`; $('#tap').classList.remove('show'); });
    after(3700, () => { cap('Then do it again', 'Reinvest in the next entrepreneur, or withdraw to your bank.'); $('.ve').classList.add('next'); });
  }

  const SCENES = {
    vet: [vis1, play1, 'i/durga-294'],
    choose: [visChoose, playChoose, 'invest/individuals'],
    understand: [visUnderstand, playUnderstand, 'i/durga-294'],
    lend: [visLend, playLend, 'i/durga-294'],
    follow: [visFollow, playFollow, 'dashboard'],
    earn: [visEarn, playEarn, 'dashboard'],
  };
  const [vis, play, url] = SCENES[scene] || SCENES.choose;
  /* A browser window on rangde.in around each scene, so it reads as the real site. */
  root.innerHTML = `<div class="win"><div class="wbar"><i></i><i></i><i></i><span class="url">rangde.in/${url}</span></div><div class="vp">${vis()}</div></div>`;
  play();
  return () => { clearSched(); root.replaceChildren(); };
}
