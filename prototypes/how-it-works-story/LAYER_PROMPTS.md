# All prompts, layer by layer (How it works · Approach 2)

Every prompt below is complete. Copy one block and paste it.

**Before you generate:**
- **Background layers:** generate on plain white, then vectorise and delete the white.
- **Strips:** every strip is about 3.6:1, the same as your Rekha panorama (8614 × 2367).
- **References:**
  - Rekha's strips: attach your panorama.
  - Arjun's strips: generate A-0 first, then attach it to each.
  - Characters: attach one of your character sheets.

---

## Base reference (generate first)

### A-0 · Arjun's world, full panorama
```text
One very wide, continuous horizontal panorama, about 3.6:1, for a side-scrolling story, straight-on eye-level view, read from left to right. Hand-drawn line art in a single navy ink colour (#1B2A4A) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends. Very light and airy, simple, lots of empty wall and floor space. A modern Bengaluru apartment shown as a cutaway with the front wall removed, so the rooms run side by side with one straight floor line across the full width and a straight ceiling line along the top, rooms joined by open archways: 1) a living room with a big window showing a small city skyline, a two-seater sofa, a floor lamp, two picture frames and a houseplant; 2) a home work corner with a desk, a laptop on a stand, a mug, a desk chair, a bookshelf and a wall clock; 3) a glass door opening onto a small balcony with simple railings, potted plants and a wide Bengaluru skyline with trees and a few small clouds. Open empty floor space in the middle of each room for a character. No people, no text.
```

---

## L1 · Sky & far (z 0, moves 0.2×)

### L1-R · Rekha's world strip (attach your panorama)
```text
Using the reference image only for positions and proportions, redraw ONLY its farthest background layer as one very wide continuous strip with exactly the same size and proportions (about 3.6:1). Hand-drawn line art in a single pale grey-blue (#B4BFD3) on a plain white background, no fills, no colour, no shading, no texture, thin clean slightly wobbly marker line with round ends. Very light and airy, lots of empty space: a few small puffy clouds spread across the top, one soft low hill line near the horizon, and a few tiny far-away flat-roofed village houses and round trees along the horizon. Nothing in front of the horizon: no buildings, no ground line, no plants, no people, no text.
```

### L1-A · Arjun's world strip (attach A-0)
```text
Using the reference image only for positions and proportions, redraw ONLY its farthest layer as one very wide continuous strip with exactly the same size and proportions (about 3.6:1). Hand-drawn line art in a single pale grey-blue (#B4BFD3) on a plain white background, no fills, no colour, no shading, no texture, thin clean slightly wobbly marker line with round ends. Very light and sparse: the Bengaluru city skyline seen through the living room window and beyond the balcony, simple tall buildings with a few windows and a few round trees, and a few small puffy clouds across the top. Nothing else: no walls, no window frames, no furniture, no floor line, no people, no text.
```

### L1-P · Sky and far pieces (for drifting and reuse)
```text
Hand-drawn line art asset sheet in a single pale grey-blue (#B4BFD3) on a plain white background, no fills, no colour, no shading, no texture, thin clean slightly wobbly marker line with round ends. Each item isolated, evenly spaced in a grid with generous gaps, consistent scale: 8 small puffy clouds in different sizes, 3 small birds in flight, 2 birds sitting on a wire, a kite with a trailing string, a soft low hill line, 3 tiny far-away flat-roofed village houses, 3 tiny round far-away trees, 5 simple tall city buildings of different heights, a short stretch of electricity wire with two poles. No people, no text.
```

---

## L2 · Buildings & walls (z 1, moves 0.5×)

### L2-R · Rekha's world strip (attach your panorama)
```text
Using the reference image for positions and proportions, redraw ONLY its buildings layer as one very wide continuous strip with exactly the same size and proportions (about 3.6:1), each building in the same place as in the reference. Hand-drawn line art in a single light navy-grey (#7F8DAA) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends, simplified with fewer details than the reference. From left to right: a small Rajasthan village home shown as a cutaway with the front wall removed, a window with a cloth curtain, a wall shelf and a ceiling fan, and an open doorway on its right side; a small rural bank with a flat roof, a blank sign board and an empty counter opening with no shutter; a big neem tree with flat-roofed houses around a courtyard; a low stone boundary wall along a lane with an electricity pole; a small tailoring shop with a striped awning, a blank sign board and shelves. No sky, no clouds, no ground line, no furniture on the floor, no plants in front, no people, no text.
```

### L2-A · Arjun's world strip (attach A-0)
```text
Using the reference image for positions and proportions, redraw ONLY its walls layer as one very wide continuous strip with exactly the same size and proportions (about 3.6:1), each element in the same place. Hand-drawn line art in a single light navy-grey (#7F8DAA) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends, simplified: the straight ceiling line, the open archways between rooms, the living room window frame left empty, two picture frames, the bookshelf and the wall clock at the work corner, the glass balcony door frame and the balcony railing. No skyline, no clouds, no floor line, no furniture on the floor, no plants in front, no people, no text.
```

### L2-RP · Rekha's world building pieces (each one separate)
```text
Hand-drawn line art asset sheet in a single light navy-grey (#7F8DAA) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends, simple and light. Each item complete, isolated, straight-on front view, evenly spaced with generous gaps, consistent scale: a small Rajasthan village home shown as a cutaway with the front wall removed (window with cloth curtain, wall shelf, ceiling fan, open side doorway); a small rural bank front with a flat roof, a pillar, a blank sign board and an empty counter opening; a big neem tree; two flat-roofed village houses with doorways and cloth curtains; a 3-metre stretch of low stone boundary wall; an electricity pole; a small tailoring shop front with a striped awning, a blank sign board and empty shelves; a hanging clothes line with a few garments. No people, no text.
```

### L2-AP · Arjun's world wall pieces (each one separate)
```text
Hand-drawn line art asset sheet in a single light navy-grey (#7F8DAA) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends, simple and light. Each item complete, isolated, straight-on front view, evenly spaced with generous gaps, consistent scale: a large living room window frame (empty), an open archway, two picture frames, a wall bookshelf with books, a round wall clock, a pinboard, a glass balcony door frame, a 2-metre stretch of balcony railing, a hanging ceiling light. No people, no text.
```

---

## L3 · Ground & props (z 2, moves 1× with the camera)

### L3-R · Rekha's world strip (attach your panorama)
```text
Using the reference image for positions and proportions, redraw ONLY its ground layer as one very wide continuous strip with exactly the same size and proportions (about 3.6:1). Hand-drawn line art in a single navy ink colour (#1B2A4A) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends. One straight ground line across the full width at the same height as in the reference. On it, in the same places as the reference: an empty sewing table with a stool and a floor mat inside the home, a wooden bench outside the bank, a charpai under the neem tree, two empty work tables and a front step at the shop. A few small stones and grass tufts along the ground. Nothing taller than a table, no buildings, no sky, no machines, no people, no text.
```

### L3-A · Arjun's world strip (attach A-0)
```text
Using the reference image for positions and proportions, redraw ONLY its floor layer as one very wide continuous strip with exactly the same size and proportions (about 3.6:1). Hand-drawn line art in a single navy ink colour (#1B2A4A) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends. One straight floor line across the full width at the same height as the reference. On it, in the same places: the two-seater sofa with cushions, a side table and a floor lamp in the living room; the desk with a laptop on a stand, a mug and a desk chair at the work corner; a small stool and two potted plants on the balcony. Nothing on the walls, no skyline, no people, no text.
```

### L3-RP · Rekha's world line-art props (separate, some change state)
```text
Hand-drawn line art asset sheet in a single navy ink colour (#1B2A4A) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends. Each item complete, isolated, straight-on front view, evenly spaced with generous gaps, consistent scale: an empty sewing table, a small wooden stool, a woven floor mat, a wooden bench, a charpai cot, two empty shop work tables, a stone front step, a metal roll-down shop shutter in three separate states (rolled up, half down, fully down), 5 small stones, 4 grass tufts. No people, no text.
```

### L3-AP · Arjun's world line-art props (separate)
```text
Hand-drawn line art asset sheet in a single navy ink colour (#1B2A4A) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends. Each item complete, isolated, straight-on front view, evenly spaced with generous gaps, consistent scale: a two-seater sofa with cushions, a small side table, a floor lamp, a work desk, a desk chair, a laptop on a stand, a coffee mug, a small balcony stool, two potted plants, a floor rug. No people, no text.
```

### L3-H · Hero props (flat colour, characters touch or use these)
```text
Flat 2D vector prop sheet in a friendly modern app illustration style that matches flat colour avatar characters: no outlines, no gradients, no texture, one hard-edged flat shadow covering the right half of each object in a slightly darker tone of the same colour. Plain white background, each object complete, isolated, front view, evenly spaced with generous gaps, consistent scale: 1) a black-and-gold Indian treadle sewing machine on its table, working; 2) the same machine broken, wheel tilted, belt hanging loose, a spring popping out; 3) the same machine fixed and shining with two small sparkle marks; 4) a bolt of coral fabric; 5) a spool of thread with a needle; 6) a steel almirah family locker, closed, with a small padlock; 7) a moneylender's ledger book; 8) a rubber stamp; 9) a clipboard with a blank form; 10) a basic button phone; 11) a modern smartphone held upright with a blank screen; 12) a small stack of folded finished clothes. No people, no text.
```

---

## Characters (z 3, walk with or across the camera)

You already have the main characters. These prompts only cover what's missing. Attach your existing character sheet as the reference each time.

### C-1 · Bubble characters for scene 04
```text
In exactly the same style as the reference character sheet: flat 2D vector characters, friendly modern app style, soft rounded-square heads, visible rounded ears, big close-set white oval eyes with large dark brown pupils, small rounded triangle nose in a darker skin tone, simple expressive mouth, chunky proportions, bold simple hair shapes, no outlines, no gradients, no texture, one hard-edged flat shadow covering the right half of the face, body and clothes. Plain white background. Three head-and-shoulders portraits, each centred inside its own circle crop with even spacing: 1) a village moneylender, a man in his 50s with a moustache, a white kurta and a dark waistcoat, holding a small ledger book, looking stern; 2) Rekha's family, an older man and woman standing beside a closed steel almirah with a padlock, looking apologetic; 3) a village Mahila Mandal, three women in colourful saris and dupattas sitting close together, looking sorry. No text.
```

### C-2 · Rekha, walk cycle and missing poses
```text
In exactly the same style as the reference character sheet, the same character Rekha with identical face, hair, bindi, earrings, coral kurta, terracotta dupatta, cream salwar and maroon juttis. Flat 2D vector, no outlines, no gradients, no texture, one hard-edged flat shadow on the right half. Plain white background, every figure at exactly the same height with the feet on one shared baseline, evenly spaced. Top row: a 6-frame side-view walk cycle facing right (contact, down, passing, up, contact, down). Bottom row: sitting at a treadle sewing machine with her foot on the treadle, standing shocked with hands up, standing stuck with arms hanging and shoulders low, standing hopeful with hands clasped, standing proud with one hand open, waving. No text.
```

### C-3 · Arjun, walk cycle and missing poses
```text
In exactly the same style as the reference character sheet, the same character Arjun with identical face, tall black quiff, thin round navy glasses, blue shirt with a cream collar, charcoal trousers and white sneakers. Flat 2D vector, no outlines, no gradients, no texture, one hard-edged flat shadow on the right half. Plain white background, every figure at exactly the same height with the feet on one shared baseline, evenly spaced. Top row: a 6-frame side-view walk cycle facing right. Bottom row: slouched on a sofa scrolling a phone, standing at a desk tapping a phone, leaning on a balcony railing smiling, small fist pump, standing relaxed holding a phone. No text.
```

### C-4 · Field officer, walk cycle and poses
```text
In exactly the same style as the reference character sheet, the same field officer with identical face, black bob, leaf-green kurta, ID lanyard and cloth shoulder bag. Flat 2D vector, no outlines, no gradients, no texture, one hard-edged flat shadow on the right half. Plain white background, every figure at exactly the same height with the feet on one shared baseline, evenly spaced. Top row: a 6-frame side-view walk cycle facing right, holding a clipboard. Bottom row: listening and writing on the clipboard, pressing a rubber stamp down, giving a thumbs up, greeting with a namaste. No text.
```

### C-5 · Crowd of other investors
```text
In exactly the same style as the reference character sheet: 8 head-and-shoulders avatars of urban Indian investors, varied ages, genders, hairstyles and skin tones, all smiling, wearing simple muted light blue, grey and white tops, flat 2D vector, no outlines, no gradients, one hard-edged flat shadow on the right half, each the same size, arranged in a neat 4 by 2 grid on a plain white background. No text.
```

---

## L4 · Foreground (z 4, moves 1.4×)

### L4-R · Rekha's world strip (attach your panorama)
```text
One very wide continuous strip with exactly the same size and proportions as the reference (about 3.6:1), on a plain white background. Only 7 large foreground plants spaced unevenly along the bottom edge: clay pots with leafy plants, tall grass clumps, a tulsi pot and a small bush, drawn two to three times larger than the plants in the reference as if very close to the camera, several cut off by the bottom edge of the image. Hand-drawn navy ink line art (#1B2A4A) with a very light flat sage fill (#E3EEDF) inside the leaves and pots, no shading, no texture. Everything above the plants is empty white. No buildings, no ground line, no people, no text.
```

### L4-A · Arjun's world strip (attach A-0)
```text
One very wide continuous strip with exactly the same size and proportions as the reference (about 3.6:1), on a plain white background. Only 6 large foreground plants spaced unevenly along the bottom edge: a tall potted monstera, a snake plant, a fiddle-leaf fig in a pot, a small side plant and two leafy clumps, drawn two to three times larger than the plants in the reference as if very close to the camera, several cut off by the bottom edge. Hand-drawn navy ink line art (#1B2A4A) with a very light flat sage fill (#E3EEDF), no shading, no texture. Everything else empty white. No furniture, no people, no text.
```

### L4-P · Foreground pieces
```text
Hand-drawn foreground plant sheet, navy ink line art (#1B2A4A) with a very light flat sage fill (#E3EEDF) inside leaves and pots, no shading, no texture, plain white background. Each item complete, isolated, evenly spaced with generous gaps, drawn large and close-up: 4 clay pots with different leafy plants, 3 tall grass clumps, 2 small round bushes, a tulsi pot on a small stand, a potted monstera, a snake plant, a fiddle-leaf fig, a hanging plant in a basket. No people, no text.
```

---

## FX · Effects (z 5, above everything)

### FX-1 · Money flow (UPI style, scenes 07–09)
```text
Flat 2D vector effects sheet for a payment animation, inspired by the success animations in Indian UPI payment apps, friendly modern app style, no outlines, no gradients, no texture, plain white background. Each item isolated and evenly spaced with generous gaps: a gold rupee coin seen from the front with a ₹ symbol, the same coin at three turning angles and edge-on for a spin, a small stack of gold coins, a green Indian rupee note lying flat, the same note slightly curled and flying, a bundle of three notes, small gold sparkle bursts in three sizes, a green circular success tick with a burst ring around it, soft pale-gold motion trail streaks, a small coin drop with a bounce shadow. No text other than the ₹ symbol on the coins.
```

### FX-2 · Story effects (scenes 03–06)
```text
Flat 2D vector effects sheet, minimal, friendly modern app style, no outlines, no gradients, no texture, plain white background. Each effect isolated and evenly spaced with generous gaps: a small red snap spark zigzag, a grey smoke puff in three sizes, a coiled metal spring, a red cross mark, a green tick inside a circle, a navy ink stamp splash, a round thought bubble with two small trailing circles, a rounded speech bubble, a small burst of sweat drops, confetti pieces in coral, blue and marigold, three small motion lines. No text.
```

---

## Built in code (no prompt needed)

- Profile card, Back Rekha amount picker and its success state
- Repayment tracker, credit history card, returns card
- Captions and CTAs
- Seam line and band colours
