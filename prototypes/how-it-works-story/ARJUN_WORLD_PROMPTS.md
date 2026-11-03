# Arjun's world: every prompt, in order

His world is a city flat in Bengaluru: living room → desk corner → balcony.
It's a different place from Rekha's village, so it gets its own prompts. Every prompt is complete: copy one block, paste it, attach what it says, then generate.

**You don't have an Arjun panorama yet.** Step 1 makes it. Every layer after that uses the Step 1 picture as its reference.

**Rules for every background layer:**
- Keep the output the same shape as the Step 1 picture (about 3.6 : 1).
- Generate on white, vectorise, then delete the white.

---

## Step 1 · Arjun's full panorama (make this first)
**Attach:** nothing

You won't use this picture on the site. It's only the reference that keeps the four layers lined up.

```text
One very wide, continuous horizontal panorama, about 3.6:1, for a side-scrolling story, straight-on eye-level view, read from left to right. Hand-drawn line art in a single navy ink colour (#1B2A4A) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends. Very light and airy, simple, lots of empty wall and floor space. A modern Bengaluru apartment shown as a cutaway with the front wall removed, so the rooms run side by side with one straight floor line across the full width and a straight ceiling line along the top, rooms joined by open archways: 1) a living room with a big window showing a small city skyline, a two-seater sofa, a floor lamp, two picture frames and a houseplant; 2) a home work corner with a desk, a laptop on a stand, a mug, a desk chair, a bookshelf and a wall clock; 3) a glass door opening onto a small balcony with simple railings, potted plants and a wide Bengaluru skyline with trees and a few small clouds. Open empty floor space in the middle of each room for a character. No people, no text.
```

---

## Step 2 · City skyline (back layer, moves slowest)
**Attach:** the Step 1 picture

```text
Using the reference image only for positions and proportions, redraw ONLY its farthest layer as one very wide continuous strip with exactly the same size and proportions (about 3.6:1). Hand-drawn line art in a single pale grey-blue (#B4BFD3) on a plain white background, no fills, no colour, no shading, no texture, thin clean slightly wobbly marker line with round ends. Very light and sparse: the Bengaluru city skyline seen through the living room window and beyond the balcony, simple tall buildings with a few windows and a few round trees, and a few small puffy clouds across the top. Nothing else: no walls, no window frames, no furniture, no floor line, no people, no text.
```

## Step 3 · Walls, windows and doors
**Attach:** the Step 1 picture

```text
Using the reference image for positions and proportions, redraw ONLY its walls layer as one very wide continuous strip with exactly the same size and proportions (about 3.6:1), each element in the same place. Hand-drawn line art in a single light navy-grey (#7F8DAA) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends, simplified: the straight ceiling line, the open archways between rooms, the living room window frame left empty, two picture frames, the bookshelf and the wall clock at the work corner, the glass balcony door frame and the balcony railing. No skyline, no clouds, no floor line, no furniture on the floor, no plants in front, no people, no text.
```

## Step 4 · Floor and furniture (Arjun walks on this)
**Attach:** the Step 1 picture

```text
Using the reference image for positions and proportions, redraw ONLY its floor layer as one very wide continuous strip with exactly the same size and proportions (about 3.6:1). Hand-drawn line art in a single navy ink colour (#1B2A4A) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends. One straight floor line across the full width at the same height as the reference. On it, in the same places: the two-seater sofa with cushions, a side table and a floor lamp in the living room; the desk with a laptop on a stand, a mug and a desk chair at the work corner; a small stool and two potted plants on the balcony. Nothing on the walls, no skyline, no people, no text.
```

## Step 5 · Foreground plants (front layer, moves fastest)
**Attach:** the Step 1 picture

```text
One very wide continuous strip with exactly the same size and proportions as the reference (about 3.6:1), on a plain white background. Only 6 large foreground plants spaced unevenly along the bottom edge: a tall potted monstera, a snake plant, a fiddle-leaf fig in a pot, a small side plant and two leafy clumps, drawn two to three times larger than the plants in the reference as if very close to the camera, several cut off by the bottom edge. Hand-drawn navy ink line art (#1B2A4A) with a very light flat sage fill (#E3EEDF), no shading, no texture. Everything else empty white. No furniture, no people, no text.
```

---

## Step 6 · Arjun's walk cycle and poses
**Attach:** Arjun's character sheet

```text
In exactly the same style as the reference character sheet, the same character Arjun with identical face, tall black quiff, thin round navy glasses, blue shirt with a cream collar, charcoal trousers and white sneakers. Flat 2D vector, no outlines, no gradients, no texture, one hard-edged flat shadow on the right half. Plain white background, every figure at exactly the same height with the feet on one shared baseline, evenly spaced. Top row: a 6-frame side-view walk cycle facing right. Bottom row: slouched on a sofa scrolling a phone, standing at a desk tapping a phone, leaning on a balcony railing smiling, small fist pump, standing relaxed holding a phone. No text.
```

## Step 7 · Other investors (the crowd in scene 07)
**Attach:** Arjun's character sheet

```text
In exactly the same style as the reference character sheet: 8 head-and-shoulders avatars of urban Indian investors, varied ages, genders, hairstyles and skin tones, all smiling, wearing simple muted light blue, grey and white tops, flat 2D vector, no outlines, no gradients, one hard-edged flat shadow on the right half, each the same size, arranged in a neat 4 by 2 grid on a plain white background. No text.
```

## Step 8 · His phone (flat colour)
**Attach:** Arjun's character sheet, so the colours match

```text
Flat 2D vector prop in a friendly modern app illustration style that matches flat colour avatar characters: no outlines, no gradients, no texture, one hard-edged flat shadow covering the right half in a slightly darker tone. Plain white background, isolated, front view: a modern smartphone held upright with a blank screen, shown three times side by side at the same size: facing front, tilted slightly left, tilted slightly right. No people, no text.
```

---

**Coins and notes:** these fly between both worlds, so generate them once. The prompt is Step 11 in REKHA_WORLD_PROMPTS.md.

## Checklist: what you should end up with
- [ ] Full panorama (reference only, not used on the site)
- [ ] City skyline strip (pale grey-blue)
- [ ] Walls, windows and doors strip (light navy-grey)
- [ ] Floor and furniture strip (navy)
- [ ] Foreground plants strip (navy with sage)
- [ ] Arjun's walk cycle and poses
- [ ] 8 investor avatars
- [ ] Phone
