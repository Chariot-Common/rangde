# Rang De — WhatsApp campaign kit (new users → website)

**Goal:** bring people who don't know Rang De yet to the website. WhatsApp only lets a business
message people who opted in, so reach comes from people who already trust Rang De (investors,
team, followers) and from people who message *us* first (ads, links, QR codes).

```
REACH   investors forward · WhatsApp Status · Rang De Channel · "Message us" ads
  ↓
CHAT    they message us → auto-reply → one real entrepreneur (or the 3-tap Flow)
  ↓
WEBSITE link straight to a person, or to "Investment opportunities live now"
  ↓
SIGN UP eKYC → first ₹500
```

## What's in this folder

| Asset | File | Use |
|---|---|---|
| Story card · Rekha (4:5) | `cards/story-rekha.png` | Weekly "Entrepreneur of the week" forward + Channel post |
| Story card · Durga (4:5) | `cards/story-durga.png` | Same, week 2 |
| "86%" fact card (1:1) | `cards/fact-86.png` | Fact forward, Channel |
| Status card · Rekha (9:16) | `cards/status-rekha.png` | WhatsApp Status for investors & team |
| Video · Meet Rekha (12s, 9:16) | `videos/meet-rekha.mp4` | Status, Channel, Reels |
| Video · How Rang De works (15s, 9:16) | `videos/how-rang-de-works.mp4` | Status, ads, new-lead auto-reply |
| Fund her by Friday · feed (4:5) | `cards/friday.png` | Weekly funding push, built from live data (`src/make_friday.py`) |
| Fund her by Friday · Status (9:16) | `cards/friday-status.png` | Same, for Status |
| Friends pool card (4:5) | `cards/pool.png` | Invite groups to back someone together |
| Games page | `quiz/index.html` → https://rangde-play.vercel.app | **Jyoti Ben’s journey** (lead) · Guess the gap · Find your entrepreneur · Swipe to support · See your ripple · Back someone together |
| In-chat matcher (WhatsApp Flow) | `flow/find-your-entrepreneur.flow.json` | Import into your WhatsApp provider |

Every figure is from rangde.in (7 Oct 2026).

**Tone (from the awareness meeting):** top of funnel = make people care about the problem, not
explain the product. Lead with stories and the credit gap; keep rupee amounts out of headlines
(they can sit in smaller text); it should feel like a journey, not a tutorial. Photos and names are real live listings, already
public on rangde.in — **confirm consent covers marketing use before sending.**

---

## 1. Messages (copy-paste ready)

Games page: https://rangde-play.vercel.app

### A · Entrepreneur of the week (every Thursday) — attach `story-rekha.png`
> 🌾 *Meet Rekha Bai, Udaipur*
> Rekha runs a grocery store and needs funds to keep it well stocked.
>
> On Rang De you can back her from just ₹500, and get repaid every month with returns up to 8.25% p.a.
>
> 👉 Meet Rekha: https://rangde.in/i/rekha-465?utm_source=whatsapp&utm_medium=forward&utm_campaign=story_rekha
>
> _RBI-registered · 31,667 entrepreneurs backed_
>
> 💚 Know someone who'd love this? Forward it to one friend.

**Week 2 — attach `story-durga.png`**
> 🌱 *Meet Durga Chouhan, Dhar*
> Durga runs a grocery shop and is adding a tent and decoration rental business. It's her first credit.
>
> Back her from just ₹500, and get repaid every month with returns up to 8.25% p.a.
>
> 👉 Meet Durga: https://rangde.in/i/durga-294?utm_source=whatsapp&utm_medium=forward&utm_campaign=story_durga
>
> _RBI-registered · Investments carry risk_

> Listings close once they're fully funded. Before each send, check the person is still live on
> rangde.in/invest/individuals and pick the next one if not.

### C · One surprising fact — attach `fact-86.png`
> Did you know? *86% of India's eligible population has no access to formal credit.*
> 11,839 social investors are changing that, ₹500 at a time. 👇
> https://rangde.in?utm_source=whatsapp&utm_medium=forward&utm_campaign=fact86

### D · Status captions (with `status-rekha.png` or any video)
- "Help Rekha keep her store stocked. rangde.in"
- "Have you heard of social investing? 2 minutes, worth it 👉 rangde.in"
- "Jyoti Ben needed a loan. Every door closed. Follow her journey 👉 https://rangde-play.vercel.app"

### E · Rang De WhatsApp Channel (1–2 posts a week)
1. **Story post** — card A + "Meet Rekha →" link.
2. **Video post** — `how-rang-de-works.mp4` + "How Rang De works, in 15 seconds → rangde.in?utm_source=whatsapp&utm_medium=channel&utm_campaign=how"
3. **Quiz post** — "How many rural households in India still borrow from moneylenders, friends and family? Guess 👉 https://rangde-play.vercel.app"

### F · Games page share
> Nearly half of rural households in India still borrow from informal sources. I didn't know that either 🌾 Take the 4-question quiz:
> https://rangde-play.vercel.app

(The games page writes this message itself.)

### H · Fund her by Friday (Mon · Wed · Fri) — attach `friday.png` / `friday-status.png`
Pick whoever is closest to fully funded, refresh the card on each send day:
`python3 src/make_friday.py` (or `python3 src/make_friday.py durga-294`), then render (see section 6).

**Monday**
> ⏰ *This week, let's fund Durga by Friday.*
> Durga is adding a tent and decoration rental business to her grocery shop in Dhar.
> She's 74% there — ₹26,400 to go. Back her from ₹500 👇
> https://rangde.in/i/durga-294?utm_source=whatsapp&utm_medium=forward&utm_campaign=fund_friday

**Wednesday** (update numbers from the fresh card)
> Update 💚 Durga is now *{{pct}}% funded*, ₹{{left}} to go — 2 days left.
> Every ₹500 counts: https://rangde.in/i/durga-294?utm_source=whatsapp&utm_medium=forward&utm_campaign=fund_friday

**Friday**
> Last day! ⏰ Help Durga cross the line today: https://rangde.in/i/durga-294?utm_source=whatsapp&utm_medium=forward&utm_campaign=fund_friday

**When fully funded**
> 🎉 *Durga is fully funded!* Thank you to everyone who backed her.
> Next week we're helping {{next name}}. Meet them 👉 {{link}}

### I · Friends pool — attach `pool.png`
For offices, housing societies, alumni and family groups.
> 👥 *Back someone together.*
> 5 friends × ₹500 = ₹2,500 towards a rural entrepreneur's next step — and each of you gets repaid monthly.
> Pick who to back and send it to your group in 30 seconds 👉 https://rangde-play.vercel.app?utm_source=whatsapp&utm_medium=forward&utm_campaign=friends_pool

The game writes the group message itself (who, where, what they need, the maths, and the link).

### J · New games (Channel / Status prompts)
- "Swipe through real rural entrepreneurs. Who would you back? 💚 https://rangde-play.vercel.app"
- "Slide and see what your investment could touch 🌱 https://rangde-play.vercel.app"

### G · Ask to investors (once, with the first story)
> Hi {{name}}, thank you for backing {{entrepreneur}} 💚
> This week we're introducing Rekha to more people. Could you forward this to *one* friend who'd care?
> [Story message A below]

---

## 2. When someone messages us (ads, links, QR)

**Entry points:** "Message us on WhatsApp" ads on Instagram/Facebook · `wa.me/<rangde-number>?text=Hi`
links in bio · QR code on posters and event standees.

**Auto-reply**
> Hi 👋 This is Rang De, India's first social investment platform.
> Want to meet someone you could support today?
> [👩 Women entrepreneurs] [🏪 Shopkeepers] [🐔 Farmers]

→ On tap: send the matching **story card** + "Meet {{name}} → link" + "See all 10 live
opportunities → https://rangde.in/invest/individuals?utm_source=whatsapp&utm_medium=chat&utm_campaign=autoreply"

**Optional:** instead of buttons, open the **WhatsApp Flow** (`flow/find-your-entrepreneur.flow.json`, 3 taps). On
completion the payload is `{ who, region, amount }`; reply with the 2–3 matching listings (same
rules as the games page: +2 for a "who" match, +1 for region, top 3).

**Ad copy (Click-to-WhatsApp)**
- Primary text: "Back a rural entrepreneur from ₹500 and get repaid every month. Message us to meet one."
- Headline: "Meet someone you could support"
- Creative: `meet-rekha.mp4` or `how-rang-de-works.mp4` (9:16)

---

## 3. Four-week plan

| Week | Investors (forward) | Channel & Status | Ads |
|---|---|---|---|
| 1 | Story A (Rekha) + ask G | Story post · How-it-works video | Small test: "Message us" ad with Rekha video |
| 2 | Fund her by Friday (H) | Friday Status card · Quiz post | Keep best ad, test How-it-works video |
| 3 | Friends pool (I) + Story A (Durga) | Pool card · Swipe game post | Pool-focused creative |
| 4 | Fund her by Friday (H, next person) | Ripple game post · Story post | Scale what worked |

Frequency: max 1–2 marketing messages a week per person. Always include a way to opt out.

---

## 4. Measuring it

Every link carries `utm_source=whatsapp` plus `utm_medium` (forward / channel / chat / game) and
`utm_campaign` (story_rekha, fund_friday, friends_pool, fact86, rangde_play…). Track:
forwards & clicks → website visits from WhatsApp → sign-ups → first investment → **cost per first investment**.
Give each investor a personal referral code in their forward links to see who brought whom.

## 5. Compliance checklist

- [ ] Only message people who opted in; honour "STOP".
- [ ] Message templates approved by Meta (stories, pools, Fund-by-Friday = marketing; repayment alerts = utility).
- [ ] Returns always "up to x% p.a.", never guaranteed; include "Investments carry risk".
- [ ] "RBI-registered NBFC-P2P"; RBI does not assure repayment of P2P loans.
- [ ] Consent from featured entrepreneurs for marketing use of photos and names.
- [ ] Figures re-checked on rangde.in before each send (they change daily).

## 6. Regenerating the assets

Cards and videos are built from `src/cards.html` and `src/videos.html` (edit the text there).
Renders were made with headless Chrome + ffmpeg: cards are screenshots of each `<section id>`,
videos are 30 fps frames of `render(t)` for `?v=rekha | how`, encoded H.264 1080×1920.
