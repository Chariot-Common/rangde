# Usage: python3 scripts/build-how-it-works.py <rangde-how-it-works-motion.html> <india-map.webp> <project root>

# Turns the Figma "How it works" motion export into: public/how-it-works/* assets,
# a scoped stylesheet, and an ES module with the markup + Web Animations timelines.
import re, base64, os, sys, json
SRC, MAP, PROJ = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(SRC).read(); L = s.split('\n'); sc = L[216]
h = dict(re.findall(r'"?([0-9a-f]{10})"?:"(data:image/[a-z+]+;base64,[^"]+)"', sc))
a = dict(re.findall(r'([a-zA-Z0-9_]+):"([0-9a-f]{10})"', sc.split(',a:{', 1)[1]))

# ---------- markup ----------
mf = [L[18], '\n'.join(L[32:178]), L[191], L[205]]
mf = [m.strip() for m in mf]
m4 = mf[3]; i = m4.index('<div class="mapin">'); d = 0
for mt in re.finditer(r'<(/?)div\b', m4[i:]):
    d += -1 if mt.group(1) else 1
    if d == 0: j = m4.index('>', i + mt.end()) + 1; break
mf[3] = m4[:i] + '<div class="mapin"><img src="/how-it-works/india-map.webp" alt="" decoding="async" style="display:block;width:100%;height:100%"></div>' + m4[j:]

outdir = os.path.join(PROJ, 'public/how-it-works'); os.makedirs(outdir, exist_ok=True)
used = sorted(set(n for m in mf for n in re.findall(r'data-img="([^"]+)"', m)))
fname = {}
for n in used:
    k = a[n]
    if k in fname.values(): pass
    uri = h[k]; ext = 'svg' if uri.startswith('data:image/svg') else 'webp'
    # one file per distinct image, named after its first alias
    first = sorted(x for x in a if a[x] == k and x in used)[0]
    f = f'{first.replace("_", "-").lower()}.{ext}'
    data = base64.b64decode(uri.split(',', 1)[1])
    if ext == 'svg':
        # iOS Safari shows an <svg> whose width or height is under 1px as a broken image ("?").
        # The hairlines are drawn from their viewBox anyway, so give them a 1px minimum.
        txt = data.decode('utf-8')
        root = txt[:txt.index('>') + 1]
        fixed = re.sub(r'\b(width|height)="(\.\d+|0\.\d+)"', r'\1="1"', root)
        data = (fixed + txt[len(root):]).encode('utf-8')
    open(os.path.join(outdir, f), 'wb').write(data)
    fname[n] = f
os.system(f'cp "{MAP}" "{outdir}/india-map.webp"')
mf = [re.sub(r'data-img="([^"]+)"', lambda m: f'src="/how-it-works/{fname[m.group(1)]}" decoding="async"', m) for m in mf]
mf = [re.sub(r'\s*\n\s*', ' ', m) for m in mf]
# "ring" is also a Tailwind utility (a 1px box-shadow) — rename so the site's CSS can't touch it
mf = [m.replace('class="ring"', 'class="hring"') for m in mf]
# Step 4: the empty slot between "Credit rating:" and "Very good" gets the rating gauge from the design
GAUGE = ('<svg viewBox="0 0 20 11" style="width:10.4px;height:5.7px;margin:0 1px;flex:none" aria-hidden="true">'
         '<path d="M2 10a8 8 0 0 1 4-6.9" stroke="#ef5350" stroke-width="3" fill="none"/>'
         '<path d="M6.6 2.8a8 8 0 0 1 6.8 0" stroke="#f2c94c" stroke-width="3" fill="none"/>'
         '<path d="M14 3.1a8 8 0 0 1 4 6.9" stroke="#62af1d" stroke-width="3" fill="none"/>'
         '<path d="M10 10L15 4.6" stroke="#292d36" stroke-width="1.4" stroke-linecap="round"/><circle cx="10" cy="10" r="1.4" fill="#292d36"/></svg>')
mf[3] = mf[3].replace('<span style="width:10.4px"></span>', GAUGE)
def _rep_on(m):
    return re.sub(r'(<div class="ni) on("><img src="/how-it-works/s4-brief.svg"[^>]*><span>Investments</span></div><div class="ni)(")', r'\1\2 on\3', m, count=1)
for rid in ('s4-rep1', 's4-rep2'):
    k = mf[3].index('id="%s"' % rid); mf[3] = mf[3][:k] + _rep_on(mf[3][k:])
assets = sorted(set(fname.values())) + ['india-map.webp']

# ---------- css ----------
css = L[10]
rules = re.findall(r'([^{}]+)\{([^{}]*)\}', css)
DROP = re.compile(r'^(html|body|:root|\.deck|header\.top.*|\.slide|\.cap.*|\.phone|\.card|\.copy.*|\.step|\.nav|\.btn-next|\.btn-back|\.ctl.*)$')
out = ['.hfm{--blue:#0daade;--ink:#292d36;--ink64:rgba(41,45,54,.64);font-family:var(--font-inter),sans-serif;color:#292d36;font-feature-settings:"lnum" 1,"pnum" 1;-webkit-font-smoothing:antialiased}']
for sel, body in rules:
    sels = [x.strip() for x in sel.split(',') if not DROP.match(x.strip())]
    if not sels: continue
    sels = ['.hfm *' if x == '*' else '.hfm ' + x for x in sels]
    body = body.replace('"Alan Sans",Inter,sans-serif', ' var(--font-parkinsans),sans-serif')
    body = re.sub(r'\bInter\b', 'var(--font-inter),sans-serif', body)
    sels = [x.replace('.ring', '.hring') for x in sels]
    out.append(','.join(sels) + '{' + body + '}')
out.append('''/* --- refinements on top of the export --- */
/* step 4: the 0.5px hairlines vanished at phone scale; draw them at 1px like the design */
.hfm .sp img,.hfm .tlgap img{height:1px}
/* step 4: every timeline row the same height, so one- and two-line rows space evenly */
.hfm .tlr{min-height:19.852px;align-items:center}
/* step 4: both repayments screens share one height, so switching tabs doesn't drop the panel 18px */
.hfm .repm{height:284px}
/* step 1: ticks follow the faces 6px down inside the grown green band */
.hfm #s1-ticks{margin-top:6px}''')
css_out = '/* Generated from the Figma "How it works" motion export — regenerate with scripts/build-how-it-works.py */\n' + '\n'.join(out) + '\n'

# ---------- js ----------
start = sc.index('L=[{n:1'); end = sc.index('const x=document.timeline.currentTime;')
code = 'const ' + sc[start:end]
code = code.replace('j(".ring circle",M)', 'j(".hring circle",M)')
# Step 2: the export pans the card wall in four diagonal hops. One calm move to the
# final framing instead, then the focus on Rekha plays as designed.
old2 = 'N(2,L,"translate",[[0,S(0,125.98)],[.517,S(0,125.98),"io"],[14.742,S(859.123,220.98),"io"],[20.963,S(942.94,94.98),"io"],[30.356,S(309.94,378.98),"io"],[42.201,S(930.94,388.98)],[48.814,S(930.94,367.98)],[100,S(930.94,367.98)]])'
assert old2 in code
# pan across the wall: diagonal, back, then one glide to Rekha (the export's extra hop removed)
code = code.replace(old2, 'N(2,L,"translate",[[0,S(0,125.98)],[.517,S(0,125.98),"io"],[14.742,S(859.123,220.98),"io"],[26,S(309.94,378.98),"io"],[38.5,S(930.94,367.98)],[100,S(930.94,367.98)]])')
oldt = 'N(2,w,"translate",[[0,S(0,0)],[61.142,S(0,0)],[63.508,S(302,0),[.622,.151,.173,.894]],[73.41,S(18,0),[0,0,.047,1.004]],[75.107,S(302,0),[.83,.01,.28,.94]],[82.559,S(-30,0),[.83,.01,.28,.94]],[89.409,S(-376,0)],[92.221,S(0,0)],[100,S(0,0)]]),'
olds = 'N(2,w,"scale",[[0,"1"],[42.637,"1",[.53,.81,.41,1]],[51.417,"1.2"],[61.142,"1.2"],[63.508,"2.88"],[89.413,"2.88"],[92.221,"1.2"],[100,"1.2"]])'
assert oldt in code and olds in code
# keep the zoom into her details, but drop the extra back-and-forth (the 18px return hop)
# step 4: Received -> Expected. Both screens share the same header, bar and tabs, so don't
# fade the panel (it blinked): the old rows fade out, the panels swap in one frame, and the
# new rows fade in. Only the table changes.
for a_, b_ in (('N(4,L("#s4-rep1"),"opacity",[[0,0],[65.379,0,"ez"],[67.553,1,"se"],[82.866,0],[100,0]])',
                'N(4,L("#s4-rep1"),"opacity",[[0,0],[65.379,0,"ez"],[67.553,1],[79.6,1,"se"],[81.2,0],[100,0]]),'
                'N(4,L("#s4-rep1 .tbl"),"opacity",[[0,1],[79.6,1,"ez"],[81.2,0],[100,0]])'),
               ('N(4,L("#s4-rep2"),"opacity",[[0,0],[80.312,0,"ez"],[82.866,1],[100,1]])',
                'N(4,L("#s4-rep2"),"opacity",[[0,0],[79.6,0,"se"],[81.2,1],[100,1]]),'
                'N(4,L("#s4-rep2 .tbl"),"opacity",[[0,0],[81.2,0,"ez"],[83.4,1],[100,1]])')):
    assert a_ in code
    code = code.replace(a_, b_)
# step 4: screen hand-offs. The export cut the overview out before the investments screen
# had faded in (a white flash), and faded investments out while repayments faded in (a
# washed-out frame). Now the old screen holds underneath until the new one is fully on top.
for a_, b_ in (('N(4,L("#s4-ov"),"opacity",[[0,1,"se"],[28.502,0],[100,0]])',
                'N(4,L("#s4-ov"),"opacity",[[0,1],[30.951,1,"se"],[31.2,0],[100,0]])'),
               ('N(4,L("#s4-inv"),"opacity",[[0,0],[28.83,0,"ez"],[30.951,1],[65.822,1,"cb"],[68.653,0],[100,0]])',
                'N(4,L("#s4-inv"),"opacity",[[0,0],[28.83,0,"ez"],[30.951,1],[67.553,1,"se"],[67.8,0],[100,0]])')):
    assert a_ in code, a_
    code = code.replace(a_, b_)
code = code.replace(oldt, 'N(2,w,"translate",[[0,S(0,0)],[61.142,S(0,0)],[63.508,S(302,0),[.622,.151,.173,.894]],[75.107,S(302,0),[.83,.01,.28,.94]],[82.559,S(-30,0),[.83,.01,.28,.94]],[89.409,S(-376,0)],[92.221,S(0,0)],[100,S(0,0)]]),')
# Step 1: the last (green) band hugged its two rows of faces (~2px above, ticks spilling out
# below). Keep the band exactly where the design puts it (same gaps between bands) and grow it
# downward only, to 78px; the six faces that reach it, and their ticks, sit 6px lower inside it.
anchor = 'const t={purple:'
assert anchor in code
# (their final positions in the export are y=227 and y=257.813 — nudge those by 6px)
for y0, y1 in (('px 227px"', 'px 233px"'), ('px 257.813px"', 'px 263.813px"')):
    assert y0 in code
    code = code.replace(y0, y1)
code = code.replace(anchor, 'N(1,w("green"),"height",[[0,"36px"],[30.893,"36px","io"],[32.857,"78px"],[38.75,"78px","io"],[41.429,"36px"],[100,"36px"]]);' + anchor, 1)
code = code.replace('j("img[data-img]").forEach(L=>{L.src=M.h[M.a[L.dataset.img]]});', '')
code = code.replace('!function(){const M=A("#mf1")', 'const BUILD={1:function(){const M=A("#mf1")', 1)
for n in (2, 3, 4):
    old = '}(),function(){const M=A("#mf%d")' % n
    assert old in code, n
    code = code.replace(old, '},%d:function(){const M=A("#mf%d")' % (n, n), 1)
assert code.rstrip().endswith('}();'), code[-40:]
code = code.rstrip()[:-4] + '}};'
js = '''/* eslint-disable */
// GENERATED from the Figma "How it works" motion export (Rang De Master Design III, "Final").
// Markup, keyframes, durations and easings are Figma's own; only the image sources were
// moved to /public/how-it-works and the India map flattened into one image. Each stage is a
// fixed 374x342 frame; HowItWorksStage scales it to fit.
export const STAGE_W = 374, STAGE_H = 342;
export const ASSETS = %s;
const MARKUP = %s;
%s
/** Mount step n (0-based) into root and start its looping timeline. */
export function mountFigmaStep(root, n, reduced) {
  const k = n + 1;
  root.innerHTML = MARKUP[n];
  D[k] = [];
  BUILD[k]();
  const anims = D[k], t0 = document.timeline.currentTime;
  anims.forEach(x => { x.startTime = t0; });
  if (reduced) anims.forEach(x => { x.pause(); x.currentTime = w[k] * STILL[k]; });
  return () => { anims.forEach(x => x.cancel()); root.innerHTML = ''; };
}
// A representative frame for each step when motion is reduced.
const STILL = { 1: .8, 2: .86, 3: .9, 4: .45 };
''' % (json.dumps(['/how-it-works/' + x for x in assets]), json.dumps(mf, ensure_ascii=False), code)
d = os.path.join(PROJ, 'components/how-it-works')
open(os.path.join(d, 'figma-motion.js'), 'w').write(js)
open(os.path.join(d, 'figma-motion.css'), 'w').write(css_out)
print('assets', len(assets), 'js', len(js), 'css', len(css_out))
