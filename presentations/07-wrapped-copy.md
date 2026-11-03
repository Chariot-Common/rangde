# Rang De Wrapped — Flow, Voices & Copy (v3)

Figma: Rang De Master Design III → Section 3 (node 2150:280)
Interactive preview (flow + side by side): https://claude.ai/artifact/A8NyiVFFRGW2GhWEhKtdbf

The whole thing is a love story between the investor and the people they backed. The question we keep teasing: *"Does Assam love you, or do you love Assam?"* Each user type plays a different character in that love story.

**House rules for every voice:** the number first, then the joke. Headline ≤ 8 words, sub ≤ 22 words. Always "invest", never "donate". No jokes on the rough-year Returns screen or the family note.

---

## User styles

| | Type | Who | Character | Signature line | Emoji | Rangoli title |
|---|---|---|---|---|---|---|
| A | **First Date** | New in 2026, 1–2 investments | The shy crush | Every love story starts with a first date. | 🌱 💛 | The First Spark |
| B | **Going Steady** | 3–9 investments, rarely reinvests | The comfy couple | You two are cute together. | ☕ 💛 | The Steady Flame |
| C | **The Boomerang** | Reinvested ≥ 50% of repayments | The loyal one | Not a habit. A relationship. | 🔁 💍 | The Boomerang |
| D | **Big Heart** | 10+ people or 3+ states | The filmy romantic | Roll credits? Not yet. There's a sequel. | 🎬 🌹 | The Big Heart |
| E | **The One That Got Away** *(new)* | Invested before, not in 2026 | The ex who's still missed | Assam still thinks about you. | 🌙 🥺 | The One That Got Away |
| F | **The Matchmaker** *(new)* | Gifted an investment in someone's name | The matchmaker aunty | You don't just fall in love. You set people up. | 💌 🎁 | The Matchmaker |

**How each one sounds**

- **A · The shy crush:** sweet, a little nervous, encouraging. Celebrate that they showed up at all. *Words:* first, start, little, grow. *Avoid:* bragging about small numbers, pressure to invest more.
- **B · The comfy couple:** cosy and teasing, like an old friend who knows your habits. Nudges, never pushes. *Words:* your people, again, quietly, together. *Avoid:* drama, guilt about money left in the wallet.
- **C · The loyal one:** devoted and ride-or-die, with lots of commitment jokes. Loyalty is a flex. *Words:* again, back, round two, commit. *Avoid:* making them sound predictable.
- **D · The filmy romantic:** dramatic and cinematic. Their year is a blockbuster with a huge cast. *Words:* cast, blockbuster, scene, sequel. *Avoid:* making it about the money size; the drama is about the people. English only, with the filmy feel coming from cinema words, not Hindi lines.
- **E · The ex who's still missed:** wistful and warm. Leave the door open, never guilt-trip. A short story with one clear way back. *Words:* remember, still, waiting, come back. *Avoid:* shame, "you forgot us", fake urgency.
- **F · The matchmaker aunty:** proud and playful, a little meddling. Celebrate that they brought others into the love story. *Words:* set up, Cupid, match, in their name. *Avoid:* making gifting sound like a referral scheme.

## Flow

```
ACT 1  The first date        00 Intro → 01 Peak month
ACT 2  Your type             02 Top category → 03 Variety
ACT 3  Who stole your heart  04 Women → 05 States (hero)
ACT 4  Love that pays back   06 Returns → 07 Reinvestment
ACT 5  They feel it too      08 Family note → 09 Cupid stats (F only) → 10 Your people
ACT 6  Your Rangoli          11 Rangoli share card
```
Skips: Variety for A (1 category) and E. Women if 0 women backed. Cupid stats for everyone except F.

---

## Copy by screen

Format: **Headline** / sub · *CTA*

### 00 Intro
- **A** **Psst, {name}. You caught feelings this year.** / Your first year on Rang De. Let's see who you fell for. 🌱 · *Show me*
- **B** **{name}, 2026 was a love story.** / {people} people, {states} states, and a lot of quiet devotion. Let's look back. · *Let's go*
- **C** **{name}, you keep coming back.** / Same people. Same places. Honestly? We're touched. 🔁 · *Run it back*
- **D** **{name}, your year was a blockbuster.** / {people} people. {states} states. Grab the popcorn. 🎬 · *Roll the film*
- **E** **{name}, it's been a while.** / Your last investment was in {last_year}. Assam still thinks about you. 🌙 · *Take a look*
- **F** **{name}, you've been playing Cupid.** / You fell for {people} people and set up {gifts} more. Let's see. 💌 · *Let's see*

### 01 Peak month — big: `{month}`
- **A** **Where it all began.** / ₹{amt}. Your first date with Rang De. 🌱
- **B** **{month} was your month.** / ₹{amt}, more than any other month. Diwali came early for someone.
- **C** **You were on a roll.** / ₹{amt} out the door, and half of it was money coming back for round two.
- **D** **Your big dance number.** / ₹{amt} in one month. Very grand gesture of you. 🌹
- **E** *(last active month, e.g. March 2025)* **Remember this?** / You put in ₹{amt} that month. Good times.
- **F** **Gifting season, sorted.** / ₹{amt} invested, plus gifts for the people you love. 🎁

### 02 Top category — big: emoji + `{category}`
- **A** **Your first crush? Cows.** / Somewhere in {top_state}, there's milk with your name on it.
- **B** **You're a cow person.** / Most of your money went into dairy. Somewhere in {top_state}, there's milk with your name on it.
- **C** **Cows. Again.** / You keep going back to dairy. Loyal to the herd. 🔁
- **D** **Dairy stole the show.** / Cows got the lead role. {n} other categories in the supporting cast.
- **E** **You were a cow person.** / The cows haven't forgotten you.
- **F** **You're a loom person.** / Most of your money went into handloom. You literally helped weave a livelihood.

Category bank for the B-style default:

| Category | Headline | Sub |
|---|---|---|
| Dairy 🐄 | You're a cow person. | Somewhere in {top_state}, there's milk with your name on it. |
| Goats 🐐 | You're a goat person. | Low maintenance, high returns. Like you. |
| Poultry 🐔 | You're a chicken person. | You put your eggs in a lot of baskets. Literally. |
| Piggery 🐖 | You're a pig person. | Not the cutest investment. One of the smartest. |
| Farming 🌾 | You're a farm person. | You helped something grow this year. Several somethings. |
| Fishery 🐟 | You're a fish person. | Plenty of fish in the sea. You backed the ones in the ponds. |
| Handloom / Tailoring 🧵 | You're a loom person. | You literally helped weave a livelihood. |
| Kirana 🏪 | You're a corner-shop person. | The neighbourhood shop stays open late, and you helped stock it. |
| Education 🎓 | You're a future person. | You invested in someone's future. Very main-character of you. |

### 03 Variety — big: `{n_categories}` + chips
- **A** *skipped*
- **B** **{n} kinds of work. You don't play favourites.** / Cows on Monday, sewing machines by Friday.
- **C** **{n} worlds. Same loyal you.** / You spread the love, then backed them all again.
- **D** **{n} categories. Are you building an economy?** / Cows, looms, shops, classrooms. An ensemble cast.
- **E** *skipped*
- **F** **{n} kinds of work. Both beautiful.** / Handloom and dairy. A matchmaker with taste.

### 04 Women — big: `{n_women}` *(skip if 0)*
- **A** **Both people you backed are women.** / 100%. Icon behaviour, right from your first date.
- **B** **{n} women backed by you.** / That's {pct}% of your people. Your portfolio runs on women power. ☕
- **C** **{n} women. You keep showing up for them.** / That's {pct}% of your people. They keep showing up for you too.
- **D** **{n} women in your cast.** / {pct}% of everyone you backed. Every one of them a lead role.
- **E** **{n} women you backed.** / That's {pct}% of your people. They'd love to see you again.
- **F** **{n} of your {people} are women.** / {pct}%. A matchmaker with standards.
- *Under 50% (any type):* / That's {pct}% of your people. Want to tip the scale next year?

### 05 States ❤️ — hero, tap to reveal: Beat 1 → Beat 2 → Reveal
- **A** All your money went to {top_state}. → So… does {top_state} love you, or do you love {top_state}? → **Trick question. It's mutual. 💛**
- **B** {n} states. But {top_state} got most of you. → So… does {top_state} love you, or do you love {top_state}? → **Trick question. It's mutual. 💛**
- **C** All of it went to {top_state}. Again. → At this point… does {top_state} love you, or do you love {top_state}? → **You two should just get married. 💍**
- **D** {n} states. Your heart has a long-distance problem. → But {top_state} got the most. Does {top_state} love you, or do you love {top_state}? → **Cue the violins. It's mutual. 🌹**
- **E** Your money went to {top_state}. → Does {top_state} still love you? → **Yes. Still. Come say hi. 🌙**
- **F** {state_1} and {state_2}. → So… does {top_state} love you, or do you love {top_state}? → **Both. And now your friends are in on it too. 💌**
- Footer: **Dhonyobad from Assam 🙏** (Assamese "thank you"). Other states: **Love from {top_state} 🙏**

### 06 Returns — big: `₹{invested} → ₹{value_now}`
- **A** **Small number. Big start.** / Your first ₹{gain} in returns. It grows as your people repay. 🌱
- **B** **Turns out love pays.** / Your money went out, worked hard, and came home with ₹{gain} extra.
- **C** **Love, compounded.** / ₹{gain} extra, and you sent most of it back out to work again.
- **D** **Box office hit.** / ₹{gain} extra. Love, and a decent return. 🎬
- **E** *(since {last_year})* **It kept working, even without you.** / Your people kept repaying. The relationship was still paying off.
- **F** **Good karma, good returns.** / ₹{gain} extra. Even Cupid gets paid.
- **Rough year (all types, value < invested):** **Not every story went to plan.** / Some of your borrowers hit a hard season: floods, failed harvests, illness. Recovery is ongoing, and we'll keep you posted. · *See what happened*

### 07 Reinvestment
- **A** **Your money is still out working.** / Repayments start landing soon. When they do, you can send them right back out. 🌱
- **B** **₹{repaid} came back to you.** / It's sitting in your wallet. Your people are waiting. ☕ · *Reinvest ₹{repaid}*
- **C** **Your money came home. You sent it right back.** / ₹{repaid} repaid. ₹{reinvested} reinvested. Not a habit. A relationship. 💍
- **D** *(eyebrow: The sequel)* **₹{reinvested} went straight back out.** / Of ₹{repaid} that came home. Part two is already in production. · *Reinvest ₹{left}*
- **E** *(eyebrow: Still waiting)* **₹{repaid} is waiting for you.** / It came back, and it's been sitting in your wallet ever since. 🥺 · *Send it back out*
- **F** **₹{repaid} came back. You sent it out again.** / And you gifted ₹{gift_amt} more on top. Generous much?

### 08 A note from {borrower}'s family
- Pre-line by type: **A** Your very first thank-you note. · **B / F** They asked us to pass this on. · **C** From a family you've backed twice. · **D** Fan mail. · **E** They still remember you.
- Body: their real message, lightly edited, in quotes (with consent).
- **No note (fallback):** **{borrower} repaid in full in {month}.** / One loan, one family, one very good year. You were part of it.

### 09 Cupid stats *(F only, new)* — big: `{gifts}`
- **F** **{gifts} people backed in your friends' names.** / You gifted ₹{gift_amt}. {gifts} friends, {gifts} livelihoods, all set up by you. 💌 · *Gift another*

### 10 Your people — avatar grid
- **A** **Meet the first people who trusted your money.** / {people} people, one place: {top_state}. This is how it starts.
- **B** **Meet your people.** / {people} faces. {people} stories. One investor they have in common.
- **C** **Meet your people.** / {people} people. Plenty of them backed with money that came back to you.
- **D** **Meet your cast.** / {people} people across {states} states. Scroll slowly. Every one is real.
- **E** **Remember them?** / {people} people you backed. Their stories kept going. Want to be in the next chapter?
- **F** **Meet your people. And your friends'.** / {people} people you backed, plus {gifts} more your gifts reached.

### 11 Rangoli — share card
- Eyebrow: **Your 2026, in colour**. Visual: one petal per person backed. Title: the type's Rangoli title.
- Stats: {people} people · {states} states · {women} women · ₹{invested} invested
- **A–D** Every colour is a person you backed. · *Share your Rangoli* · secondary: *Add a colour for 2027*
- **E** *(faded rangoli)* It's missing a colour this year. Add one? · *Add a colour* · secondary: *See your past Rangoli*
- **F** Every colour is a person you backed, or set up. 💌 · *Share your Rangoli*
- Share caption: My 2026 on Rang De: {people} people, {states} states, and {top_state} definitely loves me back. 💛 What colour are you?

---

## Checks before Figma

1. **English only across all voices.** Big Heart stays filmy through cinema words (cast, sequel, violins), not Hindi lines.
2. **₹1 → ₹1.3 has been dropped** (a 30% gain is above the ~8.5% p.a. max). If it was meant to show impact, bring it back as "Every ₹1 did the work of ₹1.3".
3. **₹13,000 → ₹11,222** is the rough-year version of Returns, the same for every type.
4. **A type rule for overlaps:** someone can be both Big Heart and a gifter. Suggested priority: E (lapsed) → F (gifted) → C → D → B → A.
5. Family notes should only use real messages, shared with consent.
