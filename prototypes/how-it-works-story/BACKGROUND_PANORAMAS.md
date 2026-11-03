# Backgrounds as two connected panoramas (mobile first)

Rather than 7 separate backgrounds, each character gets **one long side-scrolling world**, cut into portrait panels that join edge to edge.
As you scroll down, the camera inside each band pans right along that world, so every scene flows straight into the next one.

- **Rekha's band:** home workshop → lane and bank → courtyard → lane home → her new shop
- **Arjun's band:** living room → desk corner → balcony

Both worlds put the ground line at exactly two thirds of the panel height. Characters stand on the same line in every scene, so the two bands read as parallel lives.

## Scroll map

| Scene | Rekha's band (camera) | Arjun's band (camera) | What carries you to the next scene |
|---|---|---|---|
| 01 Opening | R1, lines draw in | A1, lines draw in | Both worlds draw themselves in, line by line |
| 02 Meet | R1 holds | A1 holds | — |
| 03 Stuck | Pans R1 → R2: she walks out of the door to the bank | A1 holds (savings app) | Shutter comes down; she turns back up the lane |
| 04 Vouched | Pans R2 → R3: the field officer walks up the lane with her into the courtyard | Pans A1 → A2 (only a floor strip shows at 15%) | Elder and neighbour vouch |
| 05 Checked & listed | R3 holds | A2 holds | Her profile card rises onto the seam and drops into his band |
| 06 Backed | Pans R3 → R4 (ground strip only at 15%): she walks home hopeful | A2: he invests at the desk | Coins start to rise |
| 07 Funded | Pans R4 → R5: she arrives at her new shop | Pans A2 → A3: he steps out onto the balcony | Second machine, neighbour hired |
| 08 Repaid | R5 holds; calendar on the wall | A3 holds | Coins fall to him |
| 09 Next | R5 holds; she waves | A3 holds; next borrower card | Stage unpins |

## Production notes

- **Panels:** 3:4 portrait, so the tallest band (85% of the stage, about 375 × 520) is covered.
- **Joining panels:** generate them in order. Attach the previous panel as the reference for each new one. In Figma, overlap neighbouring panels by about 10% and blend the join.
- **Shutter:** the bank shutter is a separate prop, so code can roll it down in scene 03.
- **Band colour:** export the line art on a transparent background, so it sits on the coral or blue band colour from code.
- **Retired backgrounds:** the separate BG1–BG7 backgrounds are no longer needed.
  - The workshop, bank, courtyard, flat and desk are now panels R1–R5 and A1–A3.
  - The neutral strip (BG7) is replaced by the worlds drawing themselves in.

## One-image versions (a whole world in a single wide panorama)

Rekha's world:
```text
Hand-drawn line art illustration, a single navy ink colour (#1B2A4A) on a flat warm cream background (#F9E3BB). No fills, no colour, no shading, no hatching, no gradients, no texture. Clean, slightly wobbly marker line with round ends and a consistent medium line weight; thinner, lighter lines for distant objects. One very wide, continuous horizontal panorama for a side-scrolling mobile story, straight-on eye-level view, read from left to right. The ground line sits at the same height (two thirds down) across the entire width, and every area flows into the next with no breaks or borders. Five areas from left to right, each with an open empty space in its middle for characters: 1) a small village home in Rajasthan shown as a cutaway with the front wall removed, a simple tailoring room with a window and cloth curtain, a shelf of rolled fabric and thread spools, a wall calendar, a ceiling fan, and an open doorway with a hanging cloth curtain leading out to the lane; 2) a narrow village lane with a low boundary wall and an electricity pole whose wires run along the top of the image with a small bird, leading to the front of a small rural bank branch with a flat roof, a pillar, a blank sign board and a counter window with a roll-down shutter half closed; 3) an open village courtyard with a big neem tree, a charpai cot under it, a potted tulsi plant, grass tufts, and flat-roofed houses with doorways in the background; 4) a quiet stretch of lane with a low wall, grass tufts, small stones and a potted plant, mostly empty; 5) a small, cheerful village tailoring shopfront with a striped cloth awning, a blank sign board, two empty work tables inside, shelves of rolled fabric, a wall calendar, clothes hanging on a line across the front, potted plants by the step, and a tree at the far right where the lane ends. A few small puffy clouds across the sky. No people, no text.
```

The investor's world:
```text
Hand-drawn line art illustration, a single navy ink colour (#1B2A4A) on a flat warm cream background (#F9E3BB). No fills, no colour, no shading, no hatching, no gradients, no texture. Clean, slightly wobbly marker line with round ends and a consistent medium line weight; thinner, lighter lines for distant objects. One very wide, continuous horizontal panorama for a side-scrolling mobile story, straight-on eye-level view, read from left to right. A modern Bengaluru apartment shown as a cutaway with the front wall removed, so the rooms run side by side. The floor line sits at the same height (two thirds down) across the entire width, the ceiling line runs straight along the top, and every room flows into the next through open archways with no breaks or borders. Three areas from left to right, each with an open empty space in its middle for a character: 1) a living room with a two-seater sofa with cushions, a floor lamp, a houseplant, two framed pictures and a small side table; 2) a home work corner with a desk, a laptop on a stand, a coffee mug, a desk chair, a bookshelf, a pinboard and a wall clock; 3) a glass door opening onto a small balcony with simple railings, potted plants and a hanging plant, with the Bengaluru skyline, tall buildings, trees and small puffy clouds beyond, drawn in thinner lines. No people, no text.
```

**Size:** use the widest ratio your tool allows (21:9 or 3:1). If the result squeezes the areas, generate it at 16:9 and use "extend right" until each area is about one phone screen wide.

## Full prompts (panel by panel)

### R1 Rekha's home workshop
```text
Hand-drawn line art illustration, a single navy ink colour (#1B2A4A) on a flat warm cream background (#F9E3BB). No fills, no colour, no shading, no hatching, no gradients, no texture. Clean, slightly wobbly marker line with round ends and a consistent medium line weight; thinner, lighter lines for distant objects. Portrait 3:4 panel that is the first panel of a long, continuous side-scrolling panorama, straight-on eye-level view. The ground line sits at exactly two thirds of the height and runs straight across the full width, touching both the left and right edges. Scene: a small village home in Rajasthan shown as a cutaway with the front wall removed, so we see inside a simple tailoring room: a flat roof line along the top, a window with a cloth curtain on the left wall, a shelf with rolled fabric and thread spools, a wall calendar, a ceiling fan, a floor mat. On the right edge, the side wall with an open doorway and a hanging cloth curtain leading outside, and a little of the lane visible beyond it. The middle third stays open for a character at a sewing machine. No people, no text.
```

### R2 Lane and village bank (attach R1 as the reference)
```text
Hand-drawn line art illustration, a single navy ink colour (#1B2A4A) on a flat warm cream background (#F9E3BB). No fills, no colour, no shading, no hatching, no gradients, no texture. Clean, slightly wobbly marker line with round ends and a consistent medium line weight; thinner, lighter lines for distant objects. Portrait 3:4 panel of a long, continuous side-scrolling panorama, straight-on eye-level view. This panel sits immediately to the right of the reference image: its left edge continues the reference's right edge exactly, with the same ground line at two thirds of the height, the same line weight and the same perspective, as if it were one drawing cut in two. The ground line touches both edges. Scene: outside in a narrow village lane, a low boundary wall with grass tufts, an electricity pole with wires running across the top and a small bird on the wire. On the right side, the front of a small rural bank branch: a flat roof, a pillar, a blank sign board, and a counter window with an empty frame where a roll-down shutter will go. The middle third stays open for characters. No people, no text.
```

### R3 Village courtyard (attach R2 as the reference)
```text
Hand-drawn line art illustration, a single navy ink colour (#1B2A4A) on a flat warm cream background (#F9E3BB). No fills, no colour, no shading, no hatching, no gradients, no texture. Clean, slightly wobbly marker line with round ends and a consistent medium line weight; thinner, lighter lines for distant objects. Portrait 3:4 panel of a long, continuous side-scrolling panorama, straight-on eye-level view. This panel sits immediately to the right of the reference image: its left edge continues the reference's right edge exactly, with the same ground line at two thirds of the height, the same line weight and the same perspective, as if it were one drawing cut in two. The ground line touches both edges. Scene: an open village courtyard, a big neem tree on the left with its branches reaching across the top, a charpai cot under the tree, a potted tulsi plant and grass tufts, flat-roofed houses with doorways and cloth curtains in the background, two small puffy clouds. The middle third stays open for a small group of characters. No people, no text.
```

### R4 Lane home (attach R3 as the reference)
```text
Hand-drawn line art illustration, a single navy ink colour (#1B2A4A) on a flat warm cream background (#F9E3BB). No fills, no colour, no shading, no hatching, no gradients, no texture. Clean, slightly wobbly marker line with round ends and a consistent medium line weight; thinner, lighter lines for distant objects. Portrait 3:4 panel of a long, continuous side-scrolling panorama, straight-on eye-level view. This panel sits immediately to the right of the reference image: its left edge continues the reference's right edge exactly, with the same ground line at two thirds of the height, the same line weight and the same perspective, as if it were one drawing cut in two. The ground line touches both edges. Scene: a quiet stretch of village lane, a low wall running along the back, grass tufts, small stones, a potted plant, an electricity pole with wires, a few distant trees and one small cloud. Mostly empty and calm, with most detail close to the ground line so it still reads when cropped to a short strip. No people, no text.
```

### R5 Rekha's new shop (attach R4 as the reference)
```text
Hand-drawn line art illustration, a single navy ink colour (#1B2A4A) on a flat warm cream background (#F9E3BB). No fills, no colour, no shading, no hatching, no gradients, no texture. Clean, slightly wobbly marker line with round ends and a consistent medium line weight; thinner, lighter lines for distant objects. Portrait 3:4 panel that is the last panel of a long, continuous side-scrolling panorama, straight-on eye-level view. This panel sits immediately to the right of the reference image: its left edge continues the reference's right edge exactly, with the same ground line at two thirds of the height, the same line weight and the same perspective, as if it were one drawing cut in two. The ground line touches both edges. Scene: a small, cheerful village tailoring shopfront with an open front: a flat roof with a striped cloth awning, a blank sign board above, two empty work tables inside where sewing machines will go, shelves full of rolled fabric, a wall calendar, finished clothes hanging on a line across the front, potted plants by the step, and a tree at the right edge where the lane ends. The middle third stays open for characters. No people, no text.
```

### A1 Arjun's living room
```text
Hand-drawn line art illustration, a single navy ink colour (#1B2A4A) on a flat warm cream background (#F9E3BB). No fills, no colour, no shading, no hatching, no gradients, no texture. Clean, slightly wobbly marker line with round ends and a consistent medium line weight; thinner, lighter lines for distant objects. Portrait 3:4 panel that is the first panel of a long, continuous side-scrolling panorama, straight-on eye-level view. The floor line sits at exactly two thirds of the height and runs straight across the full width, touching both the left and right edges. Scene: the living room of a modern apartment in Bengaluru, a two-seater sofa with cushions in the centre-left, a floor lamp, a houseplant in a pot, two framed pictures on the wall, a small side table. On the right edge, an open archway leading into the next room. The middle third stays open for a character on the sofa. No people, no text.
```

### A2 Arjun's desk corner (attach A1 as the reference)
```text
Hand-drawn line art illustration, a single navy ink colour (#1B2A4A) on a flat warm cream background (#F9E3BB). No fills, no colour, no shading, no hatching, no gradients, no texture. Clean, slightly wobbly marker line with round ends and a consistent medium line weight; thinner, lighter lines for distant objects. Portrait 3:4 panel of a long, continuous side-scrolling panorama, straight-on eye-level view. This panel sits immediately to the right of the reference image: its left edge continues the reference's right edge exactly, with the same floor line at two thirds of the height, the same wall height, the same line weight and the same perspective, as if it were one drawing cut in two. The floor line touches both edges. Scene: a home work corner, a desk with a laptop on a stand and a coffee mug, a desk chair, a bookshelf with books, a pinboard and a wall clock, a floor rug. On the right edge, a glass door leading out to a balcony. The middle third stays open for a character. No people, no text.
```

### A3 Arjun's balcony (attach A2 as the reference)
```text
Hand-drawn line art illustration, a single navy ink colour (#1B2A4A) on a flat warm cream background (#F9E3BB). No fills, no colour, no shading, no hatching, no gradients, no texture. Clean, slightly wobbly marker line with round ends and a consistent medium line weight; thinner, lighter lines for distant objects. Portrait 3:4 panel that is the last panel of a long, continuous side-scrolling panorama, straight-on eye-level view. This panel sits immediately to the right of the reference image: its left edge continues the reference's right edge exactly, with the same floor line at two thirds of the height, the same line weight and the same perspective, as if it were one drawing cut in two. The floor line touches both edges. Scene: a small apartment balcony with simple railings, potted plants and a hanging plant, a small stool, and beyond the railing the Bengaluru skyline with tall buildings, trees and small puffy clouds drawn in thinner lines. The middle third stays open for a character. No people, no text.
```
