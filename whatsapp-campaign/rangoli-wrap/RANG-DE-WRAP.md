# Rang De Wrap: your 2026 on Rang De

A Spotify Wrapped–style year-end story for Rang De investors. Every investor gets a short, swipeable story of what their money did this year, in Rang De’s colours with one continuous line, ending in a rangoli tile mosaic of everything they backed and a card they want to share.

- **Live:** https://rangde-wrap.vercel.app (three sample investors; deploy copy in `deploy/rangde-wrap/`)
- **Prototype source:** `whatsapp-campaign/rangoli-wrap/index.html` (run the campaign server, open `localhost:4100/rangoli-wrap/`; add `?pause` to stop auto-advance, or `?still` to skip animations while reviewing)
- **Figma frames (editable, current):** [Rang De Wrap v5](https://www.figma.com/design/OOGgv2xrymOeuLapDwdZMV/Rang-De-Master-Design-III?node-id=2124-13977), page *Rang De Wrap*: 10 frames at 390×693 (9:16). Artwork is editable vectors, all copy is live text in Alan Sans, Geist and Kalam. The older v3 frames sit above, marked ARCHIVE.
- **References:** Rang De palette and type from rangdeorg.framer.website · Nusantara tile grid (Figma node 2090-14056) · one-line illustration · Limor Golan × Velvart ribbon · Spotify for Artists card
- **Earlier references:** [Wrapped moodboard](https://www.figma.com/design/OOGgv2xrymOeuLapDwdZMV/Rang-De-Master-Design-III?node-id=2056-95) · [Rangoli example](https://www.figma.com/design/8fhDbxFViWyikvBklFlix3/Rang-De--Other-Flows?node-id=4697-1783) · Strava Year in Sport 2024 (pinned on Pinterest)
- **Older versions:** `v4-thread.html` (circular rangoli, festive colours) · `v3-rangoli.html` (13 slides, personality card) · `v2-tiles.html`

---

## 1. Why

- **Turn investors into promoters.** Every share shows Rang De to a new circle (from the Awareness Ideas deck).
- **Make impact feel personal and visible.** Today, borrowers disappear from view after investment. The Wrap brings them back as things, places and faces.
- **Merge two ideas from the meeting:** *Rang De Wrapped* (story slides) and *Rang De ka Rangoli* (a rangoli that grows with each investment).

## 2. Principles

1. **Never ask for what we already know.** No forms. Everything comes from the investor's Rang De account.
2. **Tell them something new, not a recap.** Their dashboard already shows amounts; the Wrap shows meaning: what the money became, how far it went, how it came back.
3. **The rangoli must mean something.** Every ring maps to real data (see §4). Nothing is decoration only.
4. **Tease → reveal → share.** Each theme builds a little suspense, lands one big number, and is shareable.
5. **Data drives the motion.** The animation acts out the data (coins boomerang, lines travel to villages, tiles drop into the rangoli), like Spotify's Audio Aura or Sound Town.
6. **Restraint.** One or two colours per slide, flat backgrounds behind text, motion only where it reveals something.
7. **Honest.** Investors fund *part* of each loan; copy says "helped buy". Sample or modelled numbers are labelled.

## 3. The story (10 slides, ~70 seconds)

**Visual style:** Rang De’s colours, clean filled icons, and one thick line that runs through every slide and draws a small icon on each, like a single-stroke illustration.

**Rangoli is the visual language, not the name.** The Wrap is “Your 2026 on Rang De”. The rangoli is how we picture what someone invested in (slide 09).

| # | Slide | Big line | What it shows | Motion | Data needed |
|---|---|---|---|---|---|
| 00 | Loading | “Following your rupee… Counting the cows… Meeting the families…” | A kolam drawn with one line (spirograph) over a rani-pink rose, ring of powder dots | Dots pop, the line draws, colour pours in, it slowly turns; messages change every 1.3s | Top thing bought |
| 01 | Title | “Ananya, your money had a busy year.” | Saffron poster | Type rises | First name |
| 02 | How your money travels | “Lent 4 times. Still going.” | India map: one line from home → each person the same money reached, year by year | A ₹ coin rides the line; pins pop as it arrives | The reinvestment chain: which loans the repaid money went to next |
| 03 | Women | “13 of your 18 were women.” | Ring of faces around a rose; bindi = woman | Circle draws, faces pop one by one, count lands in the centre | Borrower gender |
| 04 | What they got | “3 cows, 3 sewing machines and more.” | Tiles in category colours with line-art icons | Tiles pop, icons draw | What each loan bought |
| 05 | People and families | “18 people. 83 lives.” | One flower per person: centre = them, petals = their family | Centres pop, rings draw, petals bloom | Household size per borrower |
| 06 | A note from a family | — | Handwritten note in their language (Hindi, Tamil…) with translation, doodle of what they bought | Words appear one by one, as if being written | One thank-you note (with consent) |
| 07 | What came back | “₹1 → ₹1.30. So far, you’ve earned ₹3,000.” | Coin grows at the centre of a single-line spiral | Counter ticks up, coin swells, spiral draws | Money put in, current value, earnings |
| 08 | All of it, in one picture | “Your 2026, drawn like a rangoli.” | Tile mosaic with place callouts + legend | Tiles drop in on a wave (see §5) | Everything above |
| 09 | Share | — | 9:16 card + Save / WhatsApp / Replay / Who’s next | — | All of the above |

Dropped from the previous version (kept in `v3-rangoli.html`): early-bird %, year rings, drumroll, “Me in 2026” personality card, real-people polaroids.

**Copy tone:** warm, a little cheeky. Earnings are shown honestly with “Returns depend on repayments and are not guaranteed.”

## 4. The rangoli system (a tile mosaic, not a circle)

Inspired by the Nusantara tile grid (Figma node 2090-14056): the rangoli is a floor of square tiles, with a slightly irregular edge.

| Tile | Means |
|---|---|
| Icon tile | One person you backed. Tile colour = kind of work; icon = what they bought; red dot = a woman |
| Pattern tile | The rangoli in between: kolam dots, lotus, diamonds, scallops, ring, quarter, star, leaf, flower, chevrons |
| Red disc | One bold disc where four tiles meet, for rhythm |
| Callouts | Up to 2 places above and 2 below, Nusantara-style leader lines (never overlapping) |

**Category colours (Rang De palette):** Animals `#FFBE07` · Farming `#3A6E0C` · Craft `#7033CC` · Fisheries `#00517A` · Shops `#20B67A`. Icons sit on top in the paired light/deep tone.

**Icons:** clean, filled, flat (cow, goat, hens, sewing machine, handloom, seeds, wheat, fish, boat, kirana shop), drawn on a 24px grid. The same icons appear on the map pins, the “what they got” tiles, the note and the mosaic.

**Uniqueness:** the mix of people, what they bought, the share of women and the pattern tiles (seeded by the investor) make every mosaic different.

## 5. Animation

- **The single line:** one thick thread runs along the bottom of every slide. It picks up where the last slide left off and, without lifting, draws that slide’s icon: a loop (loading), heart (title, women), map pin (travel), sprout (what they got), house (families), speech bubble (note), rising arrow (earnings), four-petal rangoli (the mosaic).
- **Loading:** a kolam drawn in one line (spirograph) over a purple lotus, inside a ring of diamonds; messages change every 1.3s.
- **Mosaic:** tiles drop in on a diagonal wave (scale + small turn), then the callouts rise in.
- **Everything else:** lines draw first, then colour fills; numbers count up; notes appear word by word.
- Respect reduced-motion settings: show the finished state. `?still` does the same for review.

## 6. Visual direction

- **Colours:** Rang De’s own palette from rangde.org: cream `#F7F3ED`, ink `#292D36`, yellow `#FFBE07`, and four families light → deep: green `#CBE0B8 / #62AF1D / #3A6E0C`, teal `#C6E6D9 / #20B67A / #084A2F`, blue `#CBE8F6 / #3EAAE0 / #00517A`, purple `#DDD1F0 / #7033CC / #330C6E`. Red `#E5322D` (from the logo) is used only for the bindi dot, the disc and the closing thread.
- **Type:** Alan Sans (headlines) and Geist (body), as on rangde.org. Kalam for handwritten notes.
- **References:** one-line icon illustration (single stroke through colour bands), Limor Golan × Velvart (thick red ribbon), Nusantara tile grid, Spotify for Artists card (burst frame + name + 2×2 stats).

## 7. Share card

- 1080×1920 PNG for Instagram Stories and WhatsApp status, in the Spotify for Artists layout: a rangoli burst (rotated squares + ring of diamonds) framing the investor’s mosaic, their name large, and four numbers in a 2×2 grid (times lent, women backed, lives reached, ₹1 → ₹x), with rangde.in and #RANGDEWRAP.
- **Hide amounts** swaps the rupee earnings for “what my ₹1 became”.
- WhatsApp share text is pre-written with a link back to the Wrap (with UTM tags).

## 8. Data Rang De needs to provide

Per investor:
- First name, home city (or country for NRIs), first investment year
- Money put in, current value, and earnings to date (for ₹1 → ₹x)
- The reinvestment chain: for their first repayments, which loan the money was re-lent to next, year by year

Per loan backed:
- Borrower first name, district and state
- What the loan bought (purpose → motif)
- Borrower gender
- Household size (from the loan application)
- Amount invested

Per investor, optional:
- One thank-you note from a borrower family they backed, in the original language plus a translation, collected with consent

Platform-wide:
- Share of women borrowers (for “You’re ahead at 72%”)

## 9. Before this goes live

- **Sample data:** the three investors, their borrowers, household sizes, reinvestment chains, earnings and the notes in the prototype are made up and labelled as samples.
- **Notes:** collect real notes with consent; translate faithfully; never write them on a family’s behalf.
- **Earnings:** show real figures only, with “Returns depend on repayments and are not guaranteed.”
- **Compliance line** on cards and links: “Investments carry risk. Rang De is an RBI-registered NBFC-P2P; RBI does not guarantee repayment.”
- **Amounts:** the “Hide amounts” toggle replaces rupee figures with percentages before sharing.

## 10. Open questions

- Who is it for first: investors (pride and sharing) or their friends who see the card (curiosity)?
- Length: ~70 seconds over 10 slides. If it needs to be closer to 30, the women and families slides could merge (“13 of 18 were women, and 83 lives”).
- Music or sound: a short tabla or shehnai sting, or silent?
- Can investors pick which family note appears, or is it always their first loan?
- Earnings: show exact rupees by default, or start with “Hide amounts” on?
- Community Wrap for non-investors (Rang De’s whole year as one big mosaic)?
- Where it lives: in the Rang De app/site after login, or a personal link emailed to each investor?

## 11. Next steps

1. Review the story and copy in the v5 Figma frames; edit there and the prototype follows.
2. Confirm which data fields Rang De can export (§8), especially the reinvestment chain and household size.
3. Start collecting real family notes, with consent, in the borrower’s own language plus a translation.
4. Decide the build: web code (as in the prototype) for the data-driven parts, Lottie or Rive only for the loading animation if needed.
5. Test the share card on Instagram Stories and WhatsApp with a few real investors.
