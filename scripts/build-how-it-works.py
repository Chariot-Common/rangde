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
EXTRA = sorted(os.listdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'how-it-works-assets')))
for f in EXTRA:
    os.system(f'cp "{os.path.join(os.path.dirname(os.path.abspath(__file__)), "how-it-works-assets", f)}" "{outdir}/{f}"')
mf = [re.sub(r'data-img="([^"]+)"', lambda m: f'src="/how-it-works/{fname[m.group(1)]}" decoding="async"', m) for m in mf]
mf = [re.sub(r'\s*\n\s*', ' ', m) for m in mf]
# "ring" is also a Tailwind utility (a 1px box-shadow) — rename so the site's CSS can't touch it
mf = [m.replace('class="ring"', 'class="hring"') for m in mf]
# Step 2 (Figma 1644:8984): Rekha Bai's Invest button turns into "Investment Scheduled".
BTN_OLD = '<div class="invest" data-a="btn">Invest</div>'
assert mf[1].count(BTN_OLD) == 9
k = mf[1].index('data-card="rekha"'); kb = mf[1].index(BTN_OLD, k)
mf[1] = mf[1][:kb] + ('<div class="invest" data-a="btn" style="position:relative"><span data-a="btxt">Invest</span>'
  '<span data-a="bsch" style="position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;opacity:0">Investment Scheduled</span></div>') + mf[1][kb + len(BTN_OLD):]
# ---- Step 3 = the revised Figma frame "1651:25742" (Oct 15) ----
# The camera pans down one column: the payment card (01 May) -> "Payment received" -> the pool of
# investments collected (yours highlighted) -> the disbursal date (02 May) -> the split to Rekha,
# Vijay and Monika -> "Transfer successful". Layout from get_design_context; the disbursal part
# reuses the export's markup (moved to the frame's new position). Investor portraits are cut from
# the frame's avatar sheet (scripts/how-it-works-assets).
def _end_of_div(html, start):
    d = 0
    for mt in re.finditer(r'<(/?)div\b', html[start:]):
        d += -1 if mt.group(1) else 1
        if d == 0:
            return html.index('>', start + mt.start()) + 1
_i = mf[2].index('<div class="a" id="s3-disb"'); disb = mf[2][_i:_end_of_div(mf[2], _i)]
disb = disb.replace('id="s3-disb" style="left:-120px;top:58px;', 'id="s3-disb" style="left:1px;top:654px;', 1)
# no white fade over the connector top, no "+₹" amount pills (hidden in the frame), no date on the success line
disb = re.sub(r'<div class="a" style="left:0;top:16px;width:374px;height:53px;background:linear-gradient\(to bottom[^"]*"></div>', '', disb)
disb = disb.replace('class="amt"', 'class="amt" style="display:none"')
disb = re.sub(r'<span class="t11">·</span><span class="t11 gd">[^<]*</span>', '', disb)
# "Transfer successful" rebuilt to the frame (node 1651:28210): a 173x16 row centred under the
# avatars, the green badge (14x14, white check) at its left, the text centred over the row and
# sliding 12px right as the badge pops in.
_t = disb.index('id="s3-tsucc"'); _t0 = disb.rfind('<div', 0, _t); _t1 = _end_of_div(disb, _t0)
TS = ('<div class="a" id="s3-tsucc" style="left:101px;top:430px;width:173px;height:16px">'
      '<span class="a" id="s3-tick" style="left:0;top:1px;width:15px;height:14px">'
      '<img src="/how-it-works/s3-ts-star.svg" alt="" style="position:absolute;left:.32px;top:.24px;width:14.05px;height:13.89px">'
      '<img src="/how-it-works/s3-ts-check.svg" alt="" style="position:absolute;left:3.55px;top:5.04px;width:7.25px;height:5.14px"></span>'
      '<span class="a" id="s3-ts-txt" style="left:86.5px;top:0;transform:translateX(-50%);font:700 11px/16px var(--font-inter),sans-serif;'
      'letter-spacing:.88px;text-transform:uppercase;color:rgba(41,45,54,.8);white-space:nowrap">Transfer Successful</span></div>')
disb = disb[:_t0] + TS + disb[_t1:]
_srcs = dict(re.findall(r'data-ring="(\w+)".{0,0}', ''))  # (placeholder; avatar srcs come from the card rows below)
_av = {m.group(1): m.group(2) for m in re.finditer(r'<span class="pav"><img src="([^"]+)"[^>]*></span><span class="nm">([^<]+)</span>', mf[2])}
AV = {v.strip(): k for k, v in _av.items()}   # name -> avatar src
T11 = 'font:700 11px/16px var(--font-inter),sans-serif;letter-spacing:.88px;text-transform:uppercase;color:#292d36;white-space:nowrap'
P3 = 'font:500 16px/24px var(--font-inter),sans-serif;color:#292d36'
def line(top, h, cid):
    return ('<div class="a" style="left:188px;top:%spx;width:4px;height:%spx">'
            '<svg width="4" height="%s" viewBox="0 0 4 %s" preserveAspectRatio="none" style="display:block;overflow:visible"><path d="M2 0V%s" stroke="#cbe0b8" stroke-width="4"/>'
            '<path id="%s" d="M2 0V%s" pathLength="1" stroke="#62af1d" stroke-width="4" stroke-dasharray="0.0005 1"/></svg></div>') % (top, h, h, h, h, cid, h)
def pill(left, top, w, tid, inner):
    return ('<div class="a" style="left:%spx;top:%spx;width:%spx;height:32px;border-radius:8px;overflow:hidden;background:#f1f2f5">'
            '<div class="a" id="%s" style="inset:0;background:rgba(98,175,29,.16);opacity:0"></div>%s</div>') % (left, top, w, tid, inner)
def row(img, name, amt, you=False):
    col = '#3a6e0c' if you else '#292d36'; wt = '700' if you else '500'
    bg = 'linear-gradient(rgba(98,175,29,.16),rgba(98,175,29,.16)),#f1f2f5' if you else '#f1f2f5'
    return ('<div style="display:flex;align-items:center;gap:16px;padding:16px;height:64px;background:%s">'
            '<span style="width:32px;height:32px;border-radius:50%%;overflow:hidden;background:#cbe0b8;flex:none"><img src="%s" alt="" style="width:100%%;height:100%%;object-fit:cover;display:block"></span>'
            '<span style="font:%s 16px/24px var(--font-inter),sans-serif;color:%s;white-space:nowrap">%s</span>'
            '<span style="flex:1;text-align:right;font:%s 16px/24px var(--font-inter),sans-serif;color:%s">%s</span></div>') % (bg, img, wt, col, name, wt, col, amt)
HR_FULL = '<div style="height:1px;background:rgba(41,45,54,.16)"></div>'
HR = '<div style="height:1px;margin:0 16px;background:rgba(41,45,54,.16)"></div>'
INV = [('/how-it-works/inv-ananya.webp', 'Ananya Mehta', '₹20,000', False), ('/how-it-works/inv-you.webp', 'Your Investment', '₹7,000', True),
       ('/how-it-works/inv-rohan.webp', 'Rohan Malhotra', '₹6,000', False), ('/how-it-works/inv-ishita.webp', 'Ishita Shah', '₹8,000', False),
       ('/how-it-works/inv-vikram.webp', 'Vikram Sethi', '₹11,000', False), ('/how-it-works/inv-kiara.webp', 'Kiara Rao', '₹500', False)]
inv_rows = ''.join((HR_FULL if i == 1 else HR if i else '') + row(*r) for i, r in enumerate(INV))
TICK_PR = ('<span class="a" id="s3-pr-tick" style="left:16px;top:8px;width:16px;height:16px">'
           '<img src="/how-it-works/s3-pr-star.svg" alt="" style="position:absolute;inset:0;width:100%;height:100%">'
           '<img src="/how-it-works/s3-pr-check.svg" alt="" style="position:absolute;left:3px;top:3px;width:10px;height:10px;filter:brightness(0) invert(1)"></span>')
column = ('<div class="a" style="left:-3px;top:0;width:380px;height:1285px">'
  '<div class="a" style="left:0;top:-110px;width:380px;height:823px;background:#fff"></div>'
  + line(-104.5, 105, 's3-c0') + line(32, 105, 's3-c1') + line(575.5, 105, 's3-c2')
  + pill(99.5, 0, 181, 's3-pr-tint', TICK_PR + '<span class="a" id="s3-pr-txt" style="left:92px;top:8px;transform:translateX(-50%);' + T11 + '">Payment Received</span>')
  + '<div class="a" style="left:0;top:137px;width:380px;border-radius:8px;overflow:hidden;background:#f1f2f5">'
    '<div style="padding:24px 0 8px;text-align:center;' + T11 + '">Investments collected</div>'
    '<div style="padding:0 0 8px">' + inv_rows + '</div></div>'
  + pill(150.5, 681, 79, 's3-dd-tint', '<span class="a" style="left:0;right:0;top:8px;text-align:center;' + T11 + '">02 May</span>')
  + '</div>')
card_rows = (row(AV['Rekha Bai'], 'Rekha Bai', '₹5,000') + HR + row(AV['Vijay Muwel'], 'Vijay Muwel', '₹2,000') + HR + row(AV['Monika'], 'Monika', '₹500'))
BR = 'display:flex;justify-content:space-between;font:500 14px/20px var(--font-inter),sans-serif;color:rgba(41,45,54,.64)'
# The card sits exactly where the frame puts it (translate -718,-405, scale .78), and the column
# below it is scaled .78 too (frame node 1651:25760), so the card's bottom meets the line down to
# "Payment received": the card slides up in the first ~0.4s and holds while the camera drifts.
card = ('<div class="a" id="s3-card" style="left:594px;top:175.5px;width:380px;border-radius:8px;overflow:hidden;background:#f1f2f5;transform:translate(-718px,-405px) scale(.78)">'
  '<div style="padding:24px 0 8px;text-align:center;' + T11 + '">01 May</div>' + card_rows +
  '<div style="background:rgba(140,162,30,.08);padding:16px 24px">'
    '<div style="display:flex;align-items:center;gap:4px;font:700 16px/24px var(--font-inter),sans-serif;color:#292d36"><span>Total Payable</span>'
    '<img src="/how-it-works/s3-caret.svg" alt="" style="width:16px;height:16px;transform:rotate(180deg)"><span style="flex:1;text-align:right">₹7,677</span></div>'
    '<div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">'
      '<div style="' + BR + '"><span>3 Investments</span><span>₹7,500</span></div>'
      '<div style="' + BR + '"><span>Compliance Fee (2%)</span><span>₹150</span></div>'
      '<div style="' + BR + '"><span>GST on Compliance Fee (18%)</span><span>₹27</span></div></div></div></div>')
FADE = ('<div class="a" style="left:0;right:0;bottom:0;height:48px;background:linear-gradient(to top,#fff 0%,rgba(255,255,255,.92) 18%,'
        'rgba(255,255,255,.7) 40%,rgba(255,255,255,.38) 65%,rgba(255,255,255,.12) 85%,rgba(255,255,255,0) 100%);pointer-events:none"></div>')
mf[2] = ('<div class="mf" id="mf3"><div class="a" id="s3-pan" style="left:121px;top:193px;width:974px;height:510.5px">'
         '<div class="a" style="left:-121px;top:31px;width:375px;height:1510px;transform:scale(.78)">' + disb + column + '</div>' + card + '</div></div>')  # no bottom fade: the frame has none, and it hid "Transfer successful"
assert 's3-caret.svg' in ''.join(fname.values()) or True
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
assets = sorted(set(fname.values())) + ['india-map.webp'] + EXTRA

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
.hfm #s1-ticks{margin-top:6px}
/* step 2: card names keep the title's bold 18px (step 3's .nm rule was reaching them) */
.hfm .c2-title .nm{font:inherit;white-space:normal}''')
css_out = '/* Generated from the Figma "How it works" motion export — regenerate with scripts/build-how-it-works.py */\n' + '\n'.join(out) + '\n'

# ---------- js ----------
start = sc.index('L=[{n:1'); end = sc.index('const x=document.timeline.currentTime;')
code = 'const ' + sc[start:end]
code = code.replace('j(".ring circle",M)', 'j(".hring circle",M)')
# Step 2 = the revised Figma frame "1644:8984" (Oct 15), keyframes as Figma exports them
# (get_motion_context): a 12.364s loop. The whole card wall opens at 0.43, all rows in view;
# pans left to right, then zooms to 0.88 onto Rekha Bai's card; her details reveal, the card
# zooms 2.88x across them and back, "Invest" turns dark and reads "Investment Scheduled".
i2 = code.index('function(){const M=A("#mf2")'); j2 = code.index('}(),function(){const M=A("#mf3")')
CB = '"cb"'
STEP2 = ('function(){const M=A("#mf2"),L=A("#s2-cards",M);'
  'N(2,L,"scale",[[0,"0.43"],[22.37,"0.43","i"],[28.31,"0.88"],[100,"0.88"]]);'
  'N(2,L,"translate",[[0,S(193.94,231.98)],[1.89,S(193.94,231.98),"o"],[22.38,S(780.94,231.98),"i"],[28.31,S(970.94,381.98),"o"],[33.5,S(970.94,420.98)],[100,S(970.94,420.98)]]);'
  'const j={'
  'rekha:{title:[26.96,32.23],trig:[26.96,32.23]},'
  'jagdish:{title:[13.42,17.52],trig:[13.42,17.52],skel:[11.3,15.44],card:[22.77,30.26]},'
  'monika:{title:[6.3,10.36],trig:[6.35,10.32],skel:[4.34,8.38,"i"]},'
  'vijay:{title:[20.28,24.45],trig:[20.26,24.38],skel:[18.22,22.38],card:[22.77,30.26]},'
  'chunni:{title:[13.23,17.35],trig:[13.23,17.31],skel:[11.25,15.31,"i"],card:[23.24,30.65]},'
  'manoj:{title:[6.28,10.28],trig:[6.26,10.28],skel:[4.34,8.31,"i"]},'
  'khandu:{title:[16.17,20.18],trig:[16.15,20.15],skel:[14.37,18.22,"i"]},'
  'durga:{title:[13.68,17.76],trig:[13.23,17.22],skel:[11.27,15.33,"i"]},'
  'swarna:{title:[6.33,9.93],trig:[6.33,9.93],skel:[4.34,7.94,"i"]}};'
  'for(const L in j){const w=A(".c2[data-card="+L+"]",M),u=j[L],D=M=>A("[data-a="+M+"]",w);C(2,D("title"),u.title[0],u.title[1]),C(2,D("trig"),u.trig[0],u.trig[1]),u.skel&&t(2,D("skel"),u.skel[0],u.skel[1],u.skel[2]||"cb"),u.card&&t(2,w,u.card[0],u.card[1])}'
  'const w=A(".c2[data-card=rekha]",M),u=M=>A("[data-a="+M+"]",w);'
  'N(2,w,"opacity",[[0,1],[90.82,1,"cb"],[97.5,0],[100,0]]);'
  'N(2,w,"scale",[[0,"1"],[37.91,"1"],[41.4,"2.88","cb"],[79.51,"2.88"],[83.65,"1"],[100,"1"]]);'
  'N(2,w,"translate",[[0,S(0,0)],[37.91,S(0,0)],[41.4,S(302,-72),[.622,.151,.173,.894]],[55.94,S(18,-72),[0,0,.047,1.004]],[58.47,S(302,-139),[.83,.01,.28,.94]],[69.45,S(-30,-139),[.83,.01,.28,.94]],[79.53,S(-376,-139)],[83.65,S(0,-16)],[100,S(0,-16)]]);'
  'N(2,u("skel"),"opacity",[[0,1],[12.85,1,"cb"],[20.26,.32,"cb"],[24.75,1,"cb"],[28.9,0],[100,0]]);'
  'N(2,u("trig"),"scale",[[0,"1"],[32.23,"1","cb"],[34.48,"1.12","cb"],[36.01,"1"],[100,"1"]]);'
  'N(2,u("dd"),"height",[[0,"12px"],[36.01,"12px"],[37.91,"90px"],[100,"90px"]]);'
  '[["loc",41.25,45.29],["dot",42.44,46.44],["cr",47.46,51.43],["int",55.65,60.05],["div1",59.62,63.55],["ten",63.55,67.56],["div2",66.84,70.91],["rep",73.04,77.1],["bsch",87.67,88.94]].forEach(([M,L,A])=>C(2,u(M),L,A));'
  'N(2,u("more"),"opacity",[[0,0],[35.5,0,"cb"],[40.57,1,"cb"],[49.17,.32,"cb"],[57,1,"cb"],[65.08,.32,"cb"],[73.16,1,"cb"],[82.31,.32,"cb"],[91.56,1],[100,1]]);'
  't(2,u("skstate"),39.26,43.33),t(2,u("skcr"),45.29,49.32),t(2,u("skint"),53.39,57.68),t(2,u("skten"),61.1,65.08),t(2,u("skrep"),70.91,75.04),t(2,u("btxt"),87.05,88.21);'
  'N(2,u("btn"),"scale",[[0,"1"],[83.71,"1","cb"],[86.7,"1.06","cb"],[88.21,"1"],[100,"1"]]);'
  'N(2,u("btn"),"backgroundColor",[[0,"#62af1d"],[87.5,"#62af1d","o"],[88.7,"#3a6e0c"],[100,"#3a6e0c"]])')
code = code[:i2] + STEP2 + code[j2:]
assert 'w={1:12e3,2:18194,' in code
code = code.replace('w={1:12e3,2:18194,', 'w={1:12e3,2:12364,', 1)
remap = ''
anchor_n = '.filter((M,L)=>M[0]<=100.0001||0===L)}'
assert anchor_n in code
# Step 3 timeline = Figma 1651:25742's keyframes (8.881s loop): the pan, then each connector
# drawing in green as the camera reaches it, the pills tinting and ticking, the rings, the tick.
i3 = code.index('function(){const M=A("#mf3")'); j3 = code.index('}(),function(){const M=A("#mf4")')
DRAW = lambda sel, a, b, e='"cb"': 'N(3,L("%s"),"strokeDasharray",[[0,"0.0005 1"],[%s,"0.0005 1",%s],[%s,"1 1"],[100,"1 1"]]);' % (sel, a, e, b)
STEP3 = ('function(){const M=A("#mf3"),L=L=>A(L,M);'
  'N(3,L("#s3-pan"),"translate",[[0,S(0,333.75),[0,0,.706,.968]],[4.8,S(0,62.75),[.306,.194,.635,.794]],[20.99,S(0,-8.25),[.42,0,.19,.994]],[31.09,S(0,-247.25),[.848,-.006,.58,1]],[41.3,S(0,-442.25),[.31,.19,.64,.79]],[59.72,S(0,-542.25),[.42,0,.19,.99]],[68.26,S(0,-772.25),[.85,-.01,.58,1]],[81.81,S(0,-988.25)],[100,S(0,-988.25)]]);'
  'N(3,L("#s3-pan"),"opacity",[[0,1],[88.2,1,"cb"],[100,0]]);'
  + DRAW('#s3-c0', 24.1, 31.1) + DRAW('#s3-c1', 31.7, 37.5) + DRAW('#s3-c2', 61.8, 68.5) +
  'C(3,L("#s3-pr-tint"),30.24,31.79);N(3,L("#s3-pr-tick"),"scale",[[0,"0"],[29.36,"0","cb"],[31.73,"1.23"],[100,"1.23"]]);'
  'N(3,L("#s3-pr-txt"),"translate",[[0,S(0,0)],[28.07,S(0,0)],[30.21,S(10.5,0)],[100,S(10.5,0)]]);'
  'C(3,L("#s3-dd-tint"),68.99,71.74);'
  'N(3,L("#s3-prewipe"),"clipPath",[[0,"inset(0 0 100% 0)"],[71.7,"inset(0 0 100% 0)","cb"],[75.5,"inset(0 0 0% 0)"],[100,"inset(0 0 0% 0)"]]);'
  '["vij","rek","mon"].forEach(M=>{N(3,L("[data-conn="+M+"] path"),"strokeDasharray",[[0,"0.0005 1"],[75.5,"0.0005 1","l"],[79.4,"1 1"],[100,"1 1"]])});'
  'j(".hring circle",M).forEach(M=>N(3,M,"strokeDasharray",[[0,"0 1"],[78.6,"0 1","cb"],[85.9,"1 0"],[100,"1 0"]]));'
  'N(3,L("#s3-tick"),"scale",[[0,"0"],[85.18,"0","o"],[87.3,"1"],[100,"1"]]);'
  'N(3,L("#s3-ts-txt"),"translate",[[0,S(0,0)],[83.99,S(0,0)],[86.22,S(12,0)],[100,S(12,0)]])')
code = code[:i3] + STEP3 + code[j3:]
assert 'w={1:12e3,2:12364,3:9589.022,' in code
code = code.replace('3:9589.022,', '3:8881,', 1)

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
