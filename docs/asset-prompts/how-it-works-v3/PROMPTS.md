# How it works v3 (line art): asset prompts

Hand-drawn line-art sheets for `/v/idea-3`, in the minimal direction of Lemonade's illustrations. They
replace the auto-converted line art. Make them as our own drawings; Lemonade's images are only a
style reference, never something to copy.

## Paste this style block at the start of every prompt

> Clean minimal line illustration. One single continuous line weight everywhere, about 3px at this
> size, dark charcoal grey #4A4A4A, rounded line ends and corners. No black. Fills are only white
> #FFFFFF, plus one light grey #EDEDED on the shadow side of shapes and on hair, and a slightly
> darker grey #DEDEDE for dark materials (trousers, the sewing machine head). No other colours, no
> gradients, no texture, no hatching, no sketchy or double lines. Simple, friendly, a little
> playful, few details; faces are very simple: dot or small oval eyes, a short curved smile, no
> nose line or just a tiny one. Slight three-quarter view for objects. Background: one flat pure
> green #00FF00, nothing else on it: no floor line, no shadow, no text, no frame. Every figure or
> object stands alone with clear green space around it, all on the same baseline.

Attach **all three Lemonade images** (`style-lemonade-hero`, `style-lemonade-cards`,
`style-lemonade-objects`) as the style reference with every prompt, plus the character images listed
for each sheet so faces, hair and clothes stay the same people. Landscape, about 2400 × 1200 px.

---

## 1. Rekha: poses (`line-rekha-poses.png`)

**Also attach:** `char-rekha-sheet`, `char-rekha-machines`

> [style block] A character sheet of the same Indian woman as in the character reference: hair in a
> bun, small bindi, small earrings, knee-length kurta, a dupatta over one shoulder, loose salwar,
> flat shoes. Four poses left to right, same height:
> 1. sitting on a stool at a treadle sewing machine on its wooden table, sewing, facing right;
> 2. standing, hands clasped in front of her chest, hopeful smile, facing the viewer;
> 3. standing, one arm held out to her right as if presenting something, smiling;
> 4. standing between two identical treadle sewing machines on tables, arms open towards both,
>    delighted.

## 2. Rekha: walk cycle (`line-rekha-walk.png`)

**Also attach:** `char-rekha-sheet` (top row is her colour walk cycle)

> [style block] A 6-frame walk cycle of the same woman, side view facing right, evenly spaced in
> one row, same height and same baseline in every frame, a smooth loop (frame 6 leads back into
> frame 1). Dupatta moving slightly with each step.

## 3. Arjun on his sofa (`line-arjun-sofa.png`)

**Also attach:** `char-arjun-sofa`

> [style block] A character sheet of the same young man as in the reference: curly hair, round
> glasses, a sweater over a collared shirt, trousers, sneakers. He sits on a simple two-seater sofa
> seen from three-quarter view, facing right; the sofa is identical in each pose. Three poses:
> 1. leaning back, legs crossed, scrolling his phone in one hand, calm smile;
> 2. sitting forward, both hands on the phone, tapping it, focused;
> 3. leaning back, looking at the phone with a big smile, other hand in a small fist pump.

## 4. Field partner (`line-field-partner.png`)

**Also attach:** `char-field-partner-sheet`

> [style block] A character sheet of the same young woman as in the reference: shoulder-length
> hair, kurta and salwar, an ID card on a lanyard, a cloth bag on one shoulder, a clipboard. Top
> row: a 6-frame walk cycle, side view facing right, same height and baseline, a smooth loop.
> Bottom row, two standing poses: writing on the clipboard; holding the clipboard and giving a
> thumbs up with a smile.

## 5. Props (`line-props.png`)

**Also attach:** `prop-machines`, `prop-orders`, `prop-bank`, `prop-cloud`

> [style block] A props sheet, each object separate:
> 1. a treadle sewing machine on its wooden table, three-quarter view;
> 2. the same sewing machine with a ribbon bow tied on it;
> 3. a neat stack of five folded clothes tied with a string;
> 4. a small, simple bank building front, a "BANK" sign on top, one wide open window and a door;
> 5. a roller shutter on its own, the exact width and height of that bank's window opening;
> 6. three simple clouds of different sizes, outline only, white fill.

## 6. Optional: quiet backgrounds (`line-backgrounds.png`)

> [style block, but all lines very light grey #D6D6D6 and fills #F7F7F7 only] Two separate wide
> background strips, low detail, meant to sit far behind characters: 1. a small Indian village
> house with a tiled roof, a tree and a low wall; 2. a city apartment block with balconies and a
> potted plant. No people.

---

## Hand-over

Put the PNGs in `public/hiw-story/line/` with the file names above (green background is fine, I'll
remove it) and tell me. I'll cut each pose, line them up with the story and swap out the current
auto-made line art on `/v/idea-3`.
