"""Build the "Fund her by Friday" cards from LIVE rangde.in data.

Usage:  python3 src/make_friday.py [borrower-key] [days-left]
Defaults to whoever is closest to fully funded. Writes src/friday.html; render it with
cards.js (ids: friday, friday-status). Re-run daily so the progress bar is current.
"""
import json, sys, urllib.request, datetime, html

FEED = "https://rangde.in/invest-j?partial=true&category=all&page=0&size=40"
req = urllib.request.Request(FEED, headers={"User-Agent": "Mozilla/5.0 (RangDe campaign kit)", "Accept": "application/json"})
loans = json.load(urllib.request.urlopen(req))["loans"]
key = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] != "auto" else None
L = next(l for l in loans if l["borrowerFriendlyKey"] == key) if key else max(loans, key=lambda l: l["amountRaised"] / l["totalAmount"])
today = datetime.date.today()
days = int(sys.argv[2]) if len(sys.argv) > 2 else (4 - today.weekday()) % 7 or 7   # days until Friday

name, first = L["borrowerName"], L["borrowerName"].split()[0]
goal, raised = L["totalAmount"], L["amountRaised"]
left, pct = goal - raised, round(raised / goal * 100)
def inr(n):  # Indian digit grouping: 1,00,000
    s = str(n)
    if len(s) <= 3: return "₹" + s
    head, tail = s[:-3], s[-3:]
    parts = []
    while len(head) > 2: parts.insert(0, head[-2:]); head = head[:-2]
    if head: parts.insert(0, head)
    return "₹" + ",".join(parts) + "," + tail
pron = "her" if any(w in L["loanPurpose"].lower() for w in [" her ", "she "]) or first in ("Durga", "Rekha", "Monika", "Chunni") else "him"
# A few live listings have clipped purpose text; use a clean line from the full profile.
NEEDS = {"durga-294": "Durga is adding an event decoration and tent rental business to her grocery shop"}
purpose = html.escape(NEEDS.get(L["borrowerFriendlyKey"], L["loanPurpose"]).rstrip("."))
photo = L["avatar"]["uri"]
place = f'{L["borrowerDistrict"]}, {L["regionName"]}'
url = f'rangde.in/i/{L["borrowerFriendlyKey"]}'
daylabel = "Last day!" if days <= 1 else f"{days} days left"

page = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&family=Parkinsans:wght@600&display=swap" rel="stylesheet">
<style>
*{{box-sizing:border-box;margin:0;padding:0}} body{{background:#ddd;font-family:Inter,sans-serif;color:#292D36;padding:40px;display:flex;flex-direction:column;gap:40px;align-items:flex-start}} section{{flex:none}}
.eyebrow{{font-family:Parkinsans,Inter,sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:.12em}}
.card{{position:relative;overflow:hidden;background:#F7F3ED}}
.badge{{display:inline-flex;align-items:center;gap:12px;border-radius:999px;font-weight:800;background:#292D36;color:#fff}}
.bar{{height:28px;border-radius:999px;background:rgba(41,45,54,.1);overflow:hidden}} .bar i{{display:block;height:100%;width:{pct}%;border-radius:999px;background:linear-gradient(90deg,#62AF1D,#8FD14F)}}
.cta{{display:flex;align-items:center;justify-content:space-between;border-radius:28px;background:#0DAADE;color:#fff;font-weight:800}}
#friday{{width:1080px;height:1350px;padding:64px;display:flex;flex-direction:column;gap:34px}}
#friday .top{{display:flex;justify-content:space-between;align-items:center}} #friday .top img{{height:62px;width:auto}}
#friday .badge{{font-size:28px;padding:16px 28px}}
#friday .who{{display:flex;gap:36px;align-items:center}}
#friday .who img{{width:300px;height:300px;border-radius:40px;object-fit:cover;flex:none}}
#friday h1{{font-size:68px;line-height:74px;font-weight:800;letter-spacing:-.02em}}
#friday .where{{font-size:30px;font-weight:600;color:rgba(41,45,54,.56);margin-top:8px}}
#friday .need{{font-size:38px;line-height:50px;font-weight:600;color:rgba(41,45,54,.8)}}
#friday .prog{{background:#fff;border-radius:32px;padding:36px;display:flex;flex-direction:column;gap:20px;box-shadow:0 6px 20px rgba(41,45,54,.08)}}
#friday .row{{display:flex;justify-content:space-between;align-items:baseline}}
#friday .pct{{font-size:72px;font-weight:800;color:#3A6E0C;letter-spacing:-.03em}} #friday .pct small{{font-size:32px;color:rgba(41,45,54,.56);font-weight:700;margin-left:8px;letter-spacing:0}}
#friday .left{{font-size:34px;font-weight:700}} #friday .left span{{color:rgba(41,45,54,.56);font-weight:600}}
#friday .cta{{margin-top:auto;height:108px;padding:0 44px;font-size:38px}}
#friday .fine{{font-size:20px;color:rgba(41,45,54,.5);font-weight:500;margin-top:-14px}}
#friday-status{{width:1080px;height:1920px;background:#111;color:#fff}}
#friday-status .bg{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}}
#friday-status .shade{{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,.2) 46%,rgba(0,0,0,.9) 76%)}}
#friday-status .in{{position:absolute;inset:0;padding:120px 72px 140px;display:flex;flex-direction:column}}
#friday-status .badge{{align-self:flex-start;font-size:32px;padding:18px 32px;background:#fff;color:#292D36}}
#friday-status h1{{margin-top:auto;font-size:100px;line-height:106px;font-weight:800;letter-spacing:-.03em}} #friday-status h1 em{{font-style:normal;color:#9BDD5A}}
#friday-status .bar{{height:34px;background:rgba(255,255,255,.2);margin-top:48px}}
#friday-status .row{{display:flex;justify-content:space-between;margin-top:20px;font-size:38px;font-weight:700}} #friday-status .row span{{color:rgba(255,255,255,.75);font-weight:600}}
#friday-status .cta{{margin-top:52px;height:124px;padding:0 48px;font-size:44px}}
#friday-status .meta{{font-size:26px;color:rgba(255,255,255,.7);margin-top:22px}}
</style></head><body>
<svg width="0" height="0" style="position:absolute"><symbol id="arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol></svg>
<section class="card" id="friday">
  <div class="top"><img src="logo.svg" alt="Rang De"><span class="badge">⏰ Fund {pron} by Friday · {daylabel}</span></div>
  <div class="who"><img src="{photo}?auto=compress,format&w=600&h=600&fit=facearea&facepad=2.2" alt="">
    <div><h1>{html.escape(name)}</h1><p class="where">{html.escape(place)}</p></div></div>
  <p class="need">{purpose}.</p>
  <div class="prog">
    <div class="row"><span class="pct">{pct}%<small>funded</small></span><span class="left">{inr(left)} <span>to go</span></span></div>
    <div class="bar"><i></i></div>
    <div class="row" style="font-size:26px;font-weight:600;color:rgba(41,45,54,.56)"><span>Goal {inr(goal)}</span><span>Back {pron} from ₹500</span></div>
  </div>
  <div class="cta">Help fund {html.escape(first)} · {url} <svg width="44" height="44"><use href="#arrow"/></svg></div>
  <p class="fine">Live on rangde.in as of {today.strftime('%d %b %Y')}. RBI-registered NBFC-P2P · Investments carry risk; returns are not guaranteed.</p>
</section>
<section class="card" id="friday-status">
  <img class="bg" src="{photo}?auto=compress,format&w=1080&h=1920&fit=crop&crop=faces" alt="">
  <div class="shade"></div>
  <div class="in">
    <span class="badge">⏰ Fund {pron} by Friday</span>
    <h1>{html.escape(first)} is <em>{pct}% there.</em></h1>
    <div class="bar"><i></i></div>
    <div class="row">{inr(left)} to go<span>{daylabel}</span></div>
    <div class="cta">Help fund {html.escape(first)} · rangde.in <svg width="50" height="50"><use href="#arrow"/></svg></div>
    <p class="meta">Live on rangde.in as of {today.strftime('%d %b')} · Investments carry risk.</p>
  </div>
</section>
</body></html>"""
open("src/friday.html", "w", encoding="utf-8").write(page)
print(json.dumps({"name": name, "pct": pct, "left": left, "goal": goal, "days": days, "url": url}))
