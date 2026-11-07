# Version 1.1 problem / solution: asset sheets, prompts and hand-off

The six scenes in `components/versions/story-scenes.tsx` are placeholder shapes. This is the locked style, every
sheet to generate in ChatGPT Plus, and exactly how to name and hand the pieces back so I can place them.

Files in this folder:
- `style-block.txt`: the locked style, ready to paste (also reproduced below).
- `style-test-prompt.txt`: the style plus a small test sheet, if you want to re-check the look.

## Locked style (paste at the start of every prompt)

```
Flat 2D vector illustration with light cel shading, minimal infographic style. Clean solid colour fills, no gradients, no textures, no outlines, no 3D rendering, no realism.

SHADING (important): light comes from the upper left. Depth comes ONLY from shading drawn INSIDE each shape's own silhouette: one subtle darker shade shape (the base colour about 10% darker, never heavy) along the right side or underside of the form, and at most one small lighter highlight on the upper left of larger forms such as the head, the cart or the building. Keep clothing shading very restrained: a single soft darker shape at the side or hem, no multiple folds. Absolutely NO shadows outside the silhouette: no ground shadow, no contact shadow, no cast shadow, no drop shadow, no offset shadow copy, no floor line. Every character and object floats alone on the plain background, cleanly cut-out.

FACES: simple but expressive. Round dark eyes, each with one tiny white highlight dot; short curved eyebrows that change with the emotion; soft blush cheeks in a light warm tone; a mouth drawn as a clean curve (small smile, frown, open happy mouth). NO nose, no nose mark or shadow. Hands are simple rounded mitts with a visible thumb. Hair is one solid shape with one highlight shape. Friendly, ordinary, never exaggerated.

DETAIL: keep detail to the minimum that still reads. Clothing is one or two shapes plus a simple neckline or hem edge. Props are simple, geometric, softly rounded.

COLOUR: palette only: ink #292D36, blue #0DAADE, green #8CA21E, red #E32642, yellow #FFCA3E, light grey #F1F2F5, mid grey #BBBCBF, white, a warm neutral skin tone, and a warm brown for hair and wood. Not decorative or too pretty; it must stay quiet so the animation reads first.

LAYOUT: no text, letters, numbers or logos anywhere. Plain pure white background. Items laid out on an even grid with generous space between them (no item touching or overlapping another), all at the same scale, same baseline, each one fully inside its own cell.
```

## How to work (read this first)

1. **Lock the style.** Generate `style-test-prompt.txt` once. When you like it, keep that image: it is the **style
   anchor**. Attach it to every prompt below and add: *"Match the attached image's style, proportions and
   character exactly."*
2. **One sheet per prompt.** Paste the locked style, then the sheet's text. Never ask for a whole scene.
3. **Same character everywhere.** For sheets that include the vendor, attach the anchor AND say "the same woman as
   the attached image". If a sheet drifts, regenerate it; don't patch.
4. **Words are code, not art.** Everything with text ("20–30%", STOP, the tags, "Funded") is drawn live, so the
   art is text-free.

### Hand-off to me (recommended)

You don't need to do much in Figma. In order of effort, pick one:

- **Easiest:** put the ChatGPT PNGs for each sheet in one folder, e.g. `Downloads\rangde-story-sheets\`, named
  `sheet-A-vendor.png`, `sheet-B-investors.png` ... and tell me the path. I will cut the frames out on the grid
  and remove the white background myself (and send you anything that doesn't cut cleanly).
- **Cleaner (what I'd do for the final pieces):** in Figma, one Frame per sheet; remove the background
  (Figma's *Remove background* on the image, or remove.bg); then slice each piece into its own **Frame named
  exactly as in the table below** and export each as PNG @2x (or SVG if you vectorised it). Give me the Figma
  link (I can read it directly) or the exported folder. Exact names let me wire every piece without asking.
- **Naming:** `sheet__item__state` in lowercase with hyphens, e.g. `vendor__walk__1.png`. The full list is in
  "Names to use" at the bottom. Keep every piece on the **same baseline and the same height** within its set
  (the pieces of a walk cycle, a face set, a stamp's two states), so swapping frames doesn't jump.

If you only want me to start now: send `sheet-A` first. It unlocks scenes 1, 2, 4, 5 and 6.

---

## Sheet A: the vendor (recurring, in five of the six scenes)

**Who:** an adult Indian woman who runs a sev puri / pani puri chaat cart. Blue kurta (simple round neckline),
cream salwar, flat sandals, light dupatta over one shoulder, black hair in a simple low bun. No apron. The blue
kurta is her identifier everywhere.

```
[locked style]

TASK: character sheet for ONE recurring character, the same woman in every cell: an Indian woman street-food vendor, adult, black hair in a simple low bun, plain blue kurta with a simple round neckline, cream salwar trousers, flat sandals, light dupatta over one shoulder. No apron. Cells left to right, top to bottom:
1. Neutral, front view, standing, arms down.
2. Sad: front view, standing, shoulders slightly lower, eyebrows slanted up in the middle, mouth turned down.
3. Happy: front view, standing, small smile, arms down.
4. Celebrating: front view, standing, both arms raised a little, open happy mouth.
5-8. Walk cycle facing right, four frames in order: contact, down, passing, up.
9. Facing right, holding a plain paper document in her right hand at chest height, neutral face.
10. Same pose as 9 but sad.
11. Same pose as 9 but happy.
12. Facing right, both hands held out in front, palms up, ready to receive something, neutral face.
13. Same pose as 12 but happy.
14. Same pose as 12 but sad.
15. Standing facing left, neutral.
Every pose on the same baseline and the same height, so frames swap cleanly. Between neutral, sad and happy versions only the eyebrows, mouth and cheeks differ.
```

## Sheet B: the cart (her business, a prop that also sets the scene)

```
[locked style]

TASK: props sheet for a street food cart, no text. Same style as the attached vendor image.
1. A wooden thela cart, side view facing right: two wheels, a flat counter top, a glass-sided box of round puris on top, a few small steel bowls, a yellow-and-white striped umbrella above.
2. The same cart, front view.
3. The same cart, side view, with the glass box empty and bowls stacked (the "closed" state).
4. A single plate of chaat: a small steel bowl with puris and a spoon, top-three-quarter view.
5. A steel water-can (for pani) and a ladle, separate.
```

## Sheet C: the investors (three kinds of ordinary people)

```
[locked style]

TASK: character sheet of three different everyday people in the same style as the attached image, none wearing blue kurtas.
- Student: young adult, backpack strap, simple cap, blue jeans, green top.
- Office worker: adult, light shirt with a small blue tie, dark trousers, green jacket.
- Retiree: older adult, short white hair, glasses, walking cane in the left hand, green cardigan.
Cells per person, left to right: (1) front view standing, neutral, holding a phone at chest height; (2) same but happy; (3) same but tapping the phone with a thumb; (4) phone lowered at their side, smiling.
Each person identical in height and baseline. Then, below, one extra student and one extra office worker with different hair and shirt colour (palette only), pose 2 only, so a row of five doesn't repeat.
```

## Sheet D: the lender and the teller

```
[locked style]

TASK: two supporting characters in the attached style, with ink-coloured clothing so they feel neutral.
(1) A money lender: adult man, ink-coloured shirt, a plain cap, a slightly stern but friendly-neutral face. Cells: front view neutral; facing LEFT with one arm extended forward holding a bundle of notes; facing LEFT with the arm drawn back after handing over.
(2) A bank teller seen from the waist up, behind a counter edge: neutral; right arm raised holding a rubber stamp; right arm lowered, stamp pressed down.
Same baseline and scale for every cell.
```

## Sheet E: bank props (first and last scenes share them)

```
[locked style]

TASK: props for a bank scene, no text.
1. A small bank building, front view: triangular pediment, four columns, plain base. No letters or signs.
2. A bank counter, front view, a long low desk, separate from the building.
3. A plain paper document, upright, with three short grey bars for text.
4. The same document with a red octagonal STOP-shaped stamp mark pressed on it, slightly rotated, no letters.
5. The same document with a green round stamp mark and a white tick inside, slightly rotated.
6. The red octagon stamp mark alone (no letters).
7. The green round stamp mark with a white tick, alone.
8. A hand-held rubber stamp, side view, ink-coloured handle, no text.
9. A dashed empty rectangle outline, landscape (a missing document slot).
10. A land deed document, landscape, plain border and three grey bars.
11. A small round red badge with a white cross, and a small round green badge with a white tick.
```

## Sheet F: money props

```
[locked style]

TASK: props sheet, no text.
1. A stack of green rupee notes, side view, three notes thick, slightly fanned.
2. The same stack squashed flat (about 60% of the height), as if pressed down.
3. A single banknote, flat.
4. A gold coin, front view, plain circle in the centre (no symbol).
5. The same coin turned edge-on (thin ellipse), and a half-turned one, for a spin.
6. A solid red pill shape (a long rounded capsule, landscape), heavy-looking, with a thicker darker-red underside band inside the shape. Empty, no text.
7. A solid green pill shape, same size and proportions as 6, lighter looking, thinner underside band. Empty, no text.
8. The red pill drawn slightly squashed wider (impact) and the green pill slightly stretched (a light bounce).
9. A smartphone, front view, plain screen with a green coin icon (no text).
10. Three small motion marks in ink at 40% opacity: a short dotted trail, a four-line impact burst, a small sparkle.
11. An empty rounded progress bar track, and the same bar fully filled in green.
```

## Sheet G: the credit meter

```
[locked style]

TASK: parts of a credit-score gauge, no numbers or text, each part separate in its own cell:
1. A half-circle gauge track in light grey, thick, round caps.
2. A matching thinner half-circle fill arc in green, same radius, round caps.
3. The same fill arc in red.
4. A needle: a thin ink line with a rounded tip, pointing straight up, plus a round pivot cap.
5. A rounded-square white card (the gauge's backing), with the inside-the-shape shading only.
6. A small empty ledger book, front view, blank pages, a pencil lying across it.
7. The same ledger with a tick on it.
```

---

## What each scene uses

| # | Scene | Pieces | Motion (all scrubbed by scroll) |
|---|---|---|---|
| 1 | Banks won't lend | Vendor walk 5-8, then 10 (sad, document); bank + counter; document; STOP stamp; dashed slot; red badge | walks in, puts the document on the counter, the stop stamp slams on, missing items appear |
| 2 | Informal loans cost more | Vendor 14 (sad); lender 1-3; notes stack, then squashed; red pill, then impact | cash handed across, the red pill drops on it and squashes it |
| 3 | No credit score built | Gauge parts G1-G5; red arc; ledger | green fill rises as she repays, a "repaid" beat, then it snaps back to zero and the empty ledger shows |
| 4 | Investors lend | Investors C (row of five); vendor 3 (happy) + cart; coins + trails; phone; progress bar | five people tap phones, coins fly to her, the funded bar fills |
| 5 | Interest stays fair | Vendor 13 (happy); lender 1-3; notes stack (stays whole); green pill, light bounce | same hand-over as scene 2, the green pill lands lightly |
| 6 | Repaying builds credit | Same bank, counter, pose as scene 1 but happy (11); document, then ticked; green stamp | same walk-in, tick stamped in the same position, she smiles |

## Names to use (file / Figma frame names)

Vendor (sheet A): `vendor__neutral-front`, `vendor__sad-front`, `vendor__happy-front`, `vendor__celebrate-front`,
`vendor__walk__1` ... `vendor__walk__4`, `vendor__doc-neutral`, `vendor__doc-sad`, `vendor__doc-happy`,
`vendor__hands-neutral`, `vendor__hands-happy`, `vendor__hands-sad`, `vendor__neutral-left`.

Cart (B): `cart__side`, `cart__front`, `cart__closed`, `cart__plate`, `cart__water-can`.

Investors (C): `investor-student__1` ... `__4`, `investor-office__1` ... `__4`, `investor-retiree__1` ... `__4`,
`investor-student-b__2`, `investor-office-b__2`.

Lender and teller (D): `lender__neutral`, `lender__give`, `lender__after`, `teller__neutral`, `teller__stamp-up`,
`teller__stamp-down`.

Bank (E): `bank__building`, `bank__counter`, `bank__doc`, `bank__doc-stop`, `bank__doc-tick`, `bank__stamp-stop`,
`bank__stamp-tick`, `bank__stamp-tool`, `bank__slot-empty`, `bank__deed`, `bank__badge-no`, `bank__badge-ok`.

Money (F): `money__notes`, `money__notes-squashed`, `money__note`, `money__coin`, `money__coin-edge`,
`money__coin-half`, `money__pill-red`, `money__pill-green`, `money__pill-red-hit`, `money__pill-green-bounce`,
`money__phone`, `money__trail`, `money__burst`, `money__sparkle`, `money__bar-empty`, `money__bar-full`.

Gauge (G): `gauge__track`, `gauge__fill-green`, `gauge__fill-red`, `gauge__needle`, `gauge__card`, `gauge__ledger`,
`gauge__ledger-tick`.

## Still open

- The code's placeholder borrower still has an apron; I'll swap it for the kurta vendor when the sheets arrive.
- A teller is optional (sheet D part 2). Say if you'd rather skip it.
