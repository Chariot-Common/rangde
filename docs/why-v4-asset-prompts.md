# Version 4 ("Why we exist", /v/why): asset prompts

The problem chapter reuses the story sprites in `public/images/story/` (the moneylender, the bank, the deed, the gauge,
the ledger, Rekha reading a letter). Three cards in "So where do they go?" still need art. Until each file exists, the
card shows a dashed slot with its file name.

## How to make them

1. Use the same tool and the same **style anchor** image as the story sprites (see `v1-1-story-asset-prompts.md`).
   Attach the anchor to every prompt and add: *"Match the attached image's style, proportions and characters exactly."*
2. Paste the locked style from `docs/style-block.txt` first, then the sheet text below.
3. Text-free art only: every number and word on the page is live text.
4. Cut each one out on a transparent background, trim it to its edges, and save it as a `.webp` about 480px wide at:
   `public/images/why-v4/<file name>`. The page picks it up on the next reload, with no code change needed.

## 1. `where__family.webp`: family and friends

```
[locked style from docs/style-block.txt]

ONE item, centred: two adults standing side by side in front of a small, simple village house with a sloped roof. On the
left, the same woman as the attached image (Rekha: blue kurta, cream dupatta), holding out an open, empty hand, asking. On
the right, an older relative (a man in a white kurta and a grey shawl) with a gentle, apologetic face, turning out the
two empty pockets of his kurta. Beside them, a small, nearly empty clay pot of grain at their feet, to say the whole
village has the same lean months. Both faces kind but worried, never sad-dramatic. Same scale as the moneylender sprite.
```

## 2. `where__shg.webp`: self-help groups

```
[locked style from docs/style-block.txt]

ONE item, centred: five women of different ages sitting close together in a semicircle on a simple mat, seen from the
front, in saris and kurtas of the palette colours (blue, green, yellow, red, mid grey). In the middle of the group, one
shared open ledger book on the mat, the same ledger as the attached image's style. The women's hands rest on each other's
shoulders or on the ledger, so they read as bound together: one loan in the group's name. Expressions calm and serious,
not unhappy. Same scale as the moneylender sprite; the group fits inside a square.
```

## 3. `where__scheme.webp`: government schemes

```
[locked style from docs/style-block.txt]

ONE item, centred: a small government office building, simpler and lower than the bank sprite: a flat roof, a flagpole
with a blank flag (no colours or emblem on it), one door and one window counter. In front of it, a long queue of five
small, simple figures in palette colours waiting in a line that runs off to the right edge of the item; only the first
figure has reached the counter. A short paper notice pinned beside the door, with blank lines only. The queue is the
point: the scheme is there, but few reach the front. No text, no emblems, no real government symbols.
```

## Not generated: photos of borrowers

The opening photo and the photos in the three tabs are real Rang De borrowers from `public/images/collage/`. Don't
replace them with generated people: the page's whole argument rests on these being real. If you want a stronger opening
image (realfood.gov uses a tight, black-and-white face close-up), ask Rang De's field team for a portrait: one
entrepreneur, head and shoulders, at their place of work, eye level, natural light, landscape, at least 2400px wide, with
their consent to use it on the homepage.
