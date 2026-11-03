# How it works v2: asset prompts

Three new sheets for the second take on How it works (`/v/idea-2`). Everything else the story
uses is already in `public/hiw-story`.

## Rules for every sheet

- **Attach** the reference images listed for each sheet (in `references/`), so the faces, outfits
  and line style match the existing drawings.
- **Background:** one flat, even dark grey, exactly `#444444`, with no gradient, floor, shadow or
  vignette. We key this colour out, so nothing in the drawing may use it.
- **Style:** flat 2D vector illustration with soft shading, warm muted colours and rounded shapes.
  It should match the references exactly, not a new style.
- **Layout:** each pose stands alone with clear space around it, nothing overlapping, all poses the
  same size and standing on the same baseline.
- No text, no labels, no frames, no ground line.
- **Size:** landscape, 1774 × 887 px (or any 2:1).

---

## 1. Arjun on his sofa (`arjun-sofa.png`)

**Where it's used:** Arjun's side of the story: the intro, the loan going live, lending, and the
repayments. The Figma frame shows him on a sofa.

**Attach:** `ref-arjun-phone.png`, `ref-arjun-think.png`, `ref-arjun-cheer.png`

**Prompt:**

> A character sheet of the same young Indian man as in the reference images (same face, hair,
> glasses, blue sweater over a white collared shirt, dark trousers, white sneakers), in the exact
> same flat 2D vector illustration style. He sits on a small, simple two-seater sofa in a muted
> warm grey-beige, seen from the front-side three-quarter view, facing right. Three poses on one
> sheet, left to right, the sofa identical in each:
> 1. relaxed, leaning back, scrolling his phone held in one hand, calm smile;
> 2. sitting forward, both hands on the phone, tapping the screen, focused and pleased;
> 3. leaning back, looking at the phone with a big happy smile, other hand in a small fist pump.
>
> Same scale and baseline for all three. Plain flat #444444 background, no floor, no shadow under
> the sofa, no text. Clear space between poses.

---

## 2. Rekha with her new machine (`rekha-new-machine.png`)

**Where it's used:** "The money reaches Rekha. She buys the second machine and takes on more
orders."

**Attach:** `ref-rekha-sewing.png`, `ref-rekha-proud.png`, `ref-rekha-wave.png`,
`ref-machine.png`, `ref-machine-bow.png`, `ref-rekha-full-sheet.png`

**Prompt:**

> A character sheet of the same Indian woman as in the reference images (same face, hair bun,
> bindi, gold earrings, coral kurta, red dupatta, cream salwar, red flats), in the exact same flat
> 2D vector illustration style. Two poses on one sheet, left to right:
> 1. standing next to a black treadle sewing machine on its wooden table (exactly the machine in
>    `ref-machine.png`), one hand resting proudly on the machine, the other hand on her hip, big
>    warm smile, facing right;
> 2. standing between two identical black treadle sewing machines on wooden tables (the same
>    machine as the reference), arms open towards both, delighted.
>
> Same height as the reference poses, same baseline. Plain flat #444444 background, no floor, no
> shadow, no text. Clear space between poses.

---

## 3. Orders coming in (`rekha-orders.png`) (optional)

**Where it's used:** "Orders keep coming in", placed next to the faded second machine.

**Attach:** `ref-machine.png`, `ref-bank.png` (for how minimal a prop should be)

**Prompt:**

> A small props sheet in the exact same flat 2D vector style as the references. Three separate
> objects, left to right:
> 1. a neat stack of five folded kurtas in coral, mustard, teal, cream and maroon, tied with a
>    string;
> 2. a small cloth bag of fabric rolls with a paper order slip pinned to it;
> 3. a wooden clothes hanger holding one finished coral kurta.
>
> Simple and minimal, few details, the same muted warm palette. Each object about a third of the
> height of the sewing machine reference. Plain flat #444444 background, no shadow, no text.
> Clear space between objects.

---

## Hand-over

Put the generated PNGs in `public/hiw-story/` with the file names above and tell me. I'll key out
the grey and swap them into the story:

- the sofa sheet replaces Arjun's standing poses;
- the new-machine sheet replaces Rekha waving in the "money reaches Rekha" scene;
- the orders sheet goes next to the faded machine in "orders keep coming in".
