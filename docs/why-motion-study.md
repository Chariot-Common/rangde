# /v/why · motion study of the reference sites, and what Rang De takes from them

Studied 22 Nov 2026 in a 1440 × 900 browser, scrolling in small steps and reading what each site runs under the hood.

## The one thing they all share

| Site | Scrolling | What it means |
|---|---|---|
| deltacafes.com | **Lenis** smooth scroll | The page glides with a little inertia, so every scroll-driven animation moves smoothly instead of in wheel-sized steps. |
| realfood.gov | **Lenis** smooth scroll | Same. |
| dwell.au, vendredi-society.com | Their own virtual scroller (the page itself doesn't scroll; a layer moves) | Same effect, built differently. |
| sereinwealth.com | Native scroll, with a site-wide "enter from blur" on elements | Things don't just appear; they sharpen into place. |
| **/v/why today** | Native scroll | Our scroll-driven pieces (the hero photo, the shop drawing, the steps) jump with each wheel tick. This is the biggest single reason the page feels less fluid than the references. |

## deltacafes.com, section by section

1. **Hero.** Full-bleed video inside a card inset from the edges; the headline sits bottom left; small cards (a product, a journal story) float on the right. Calm: only the video moves.
2. **Product strip.** A row of colourful tiles rises under the hero as you leave it, half overlapping it, so the two sections are stitched together rather than stacked.
3. **"Since 1961, coffee that awakens stories."** Centred headline on dark brown, surrounded by archive photos and objects (a tin, an old TV, a cup) placed at different sizes. **Each drifts at its own speed** (parallax layers), so the scene has depth and the objects slide off at different moments as you scroll on.
4. **"The Journey of Coffee."** Full-bleed photo. The title moves slower than the photo under it (parallax), so the photo seems to slide up behind the words. A **single thin pale-lime line** loops across the photo through four circles (Origins, Roast, Blend, Tasting), each holding a tiny drawing and a label. Under it, two lines of text and one button.
5. **Portrait strip.** A row of people's portraits acts as a divider into the next section (D de Delta).
6. **"The Culture of Coffee."** Heading fixed on the left; the items (Coffee Science Centre, Barista Academy) scroll up on the right.
7. **Sustainability.** Deep green; a symmetrical folk-style frame of thin cream lines around the centred headline; tilted black-and-white photos drift at the edges.

### The coffee-cycle page (deltacafes.com/en/coffee-cycle)

- **One SVG path, about 6,500px long, stroke #C9ED97**, revealed with `stroke-dashoffset` as you scroll. It starts dashed next to "The Coffee Cycle", then runs down the whole page, weaving in and out of the stage cards.
- **Each stage is a large rounded photo card.** As it arrives: the card rises and brightens, a small "Chapter II" appears, then the huge condensed title (ROAST), then the two lines of text and a Discover button. The line passes the stage's tiny drawing (a bean with steam), which is fully drawn by the time the card settles.
- **Rhythm:** one stage per screen of scrolling; nothing pins; the line is what carries you from one card to the next.

## The others, in one line each

- **realfood.gov:** Lenis scroll; bars rise from a baseline as the section scrolls in; a key line comes in letter by letter from a blur; a long sentence fills grey to white word by word; the solution arrives as a light sheet rising over the dark page.
- **sereinwealth.com:** every element sharpens in from a blur; the full-bleed hero photo shrinks into a rounded card as you scroll; images peek in from the edges around a centred serif line.
- **dwell.au:** big words scattered around a centred video card; then one short phrase per screen ("two choices… rent or buy… what if there was another way?"), each word sliding in; the product is named only after the curiosity is built.
- **vendredi-society.com:** a heading fixed on the left while bold, full-colour cards scroll on the right; cards stack over each other.

## What /v/why should take (the motion spec)

1. **Smooth scroll on the page (Lenis).** Small, standard, and it is what makes every scroll-driven effect we already have feel like the references. Off for reduced motion.
2. **One journey line, Delta's way.** A single pale-lime path (our lime, close to their #C9ED97) drawn by scroll, carrying the loan's journey: lend → check → grow → repay → credit. Over a full-bleed photo in the turn section, through five circles holding the station drawings (prompts are in docs/why-thread-line-art-prompts.md).
3. **Stage cards that arrive in order** (coffee-cycle page): small label, then the big word, then the line of text, as the card rises and brightens. For "One loan, three good things".
4. **Depth, not effects:** where photos sit around a headline, give them different drift speeds (Delta's "Since 1961", Serein's peeking images). The problem section's two drifting photos already do this.
5. **Titles that move slower than their photo** on full-bleed photo sections (Delta's journey title).
6. **Enter from blur, sparingly** (Serein): headings and big figures sharpen into place; body text just fades.
7. **Stitch sections together:** the next section's first element overlaps the end of the last one (Delta's product strip under the hero, realfood's light sheet), instead of each section starting fresh after a gap.

What we leave behind: Delta's colours, type and coffee motifs; anything that moves without telling part of the story (the meeting's rule).
