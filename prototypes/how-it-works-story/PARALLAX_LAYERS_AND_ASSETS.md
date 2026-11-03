# How it works · Approach 2: parallax layers, prompts and animation needs

Figma: "Approach Two (How It Works Flow) Rough" section, below your notes. It holds the world maps, the 4-layer diagram, 10 mobile scenes (with notes) and 10 laptop scenes.

## The 10 scenes (with the review notes applied)

| # | Scene | Rekha's world (camera) | Arjun's world (camera) | Seam |
|---|---|---|---|---|
| 01 | Opening | Home: lines draw in | Living room: lines draw in | 50/50 |
| 02 | Meet | Home: sewing | Living room: sofa | 50/50 |
| 03 | Her machine breaks (new) | Home: machine snaps, "₹ for the repair?" | Living room | 78/22 |
| 04 | She can't get the money | Pans to the bank; shutter down; bubbles: moneylender, family locker, Mahila Mandal, each ✕ | Living room | 78/22 |
| 05 | Vouched | Pans to the courtyard: officer, elder ✓, neighbour ✓ | Desk | 78/22 |
| 06 | Checked & listed | Courtyard: stamps; card rises onto the seam | Desk | 55/45 |
| 07 | Backed | Courtyard (small) | Desk: Back Rekha card → success state; other investors pop in | 22/78 |
| 08 | Funded | Pans to her shop: machine fixed | Desk: UPI-style money flies out of the card into her world | 55/45 |
| 09 | Repaid & tracked | Shop: she and the hired neighbour work | Walks to the balcony: coins come back into the tracker card | 45/55 |
| 10 | Impact | Shop: credit history card | Balcony: "₹5,000 → ₹5,425 after 12 months" | 50/50 |

- **Mobile:** Rekha's world is on top and Arjun's below. The user swipes →.
- **Laptop:** Rekha's world is on the left and Arjun's on the right. The user scrolls ↓, and the same camera pan plays.
- **Shared layers:** both layouts use the same layer art. Only the crop changes.

## The 4 layers

| Layer | z-index | Speed vs camera | What's in it | Line strength |
|---|---|---|---|---|
| L1 Sky & far | 0 | 0.2× | Clouds, hills, far houses, city skyline | Palest (#B4BFD3) |
| L2 Buildings | 1 | 0.5× | Houses, bank, tree, shop, walls, windows | Light (#7F8DAA) |
| L3 Ground & props | 2 | 1× | Ground line, tables, charpai, bench, sofa, desk | Full ink (#1B2A4A) |
| Characters | 3 | Walk with or across the camera | Your flat colour characters | — |
| L4 Foreground | 4 | 1.4× | A few big plants, pots and grass clumps, cropped by the edge | Ink + very light sage fill |

**Keep it calm:** only L3 and the characters carry the story. L1 and L2 should be quiet enough to read as wallpaper.

## Layer prompts

**How to use them:**
- **Rekha's world:** attach your existing panorama as the reference, so each layer lands in the same place.
- **Arjun's world:** generate the full panorama first (A-0), then use it as the reference for A-L1 to A-L4.
- **Size:** export every layer at the same size, about 3.6:1 (your panorama is 8614 × 2367), on plain white. Vectorize, then delete the white.

### R-L1 · Rekha's world · sky and far
```text
Using the reference image only for positions and proportions, redraw ONLY its farthest background layer as one very wide continuous strip with exactly the same size and proportions (about 3.6:1). Hand-drawn line art in a single pale grey-blue (#B4BFD3) on a plain white background, no fills, no colour, no shading, no texture, thin clean slightly wobbly marker line with round ends. Very light and airy, lots of empty space: a few small puffy clouds spread across the top, one soft low hill line near the horizon, and a few tiny far-away flat-roofed village houses and round trees along the horizon. Nothing in front of the horizon: no buildings, no ground line, no plants, no people, no text.
```

### R-L2 · Rekha's world · buildings
```text
Using the reference image for positions and proportions, redraw ONLY its buildings layer as one very wide continuous strip with exactly the same size and proportions (about 3.6:1), each building in the same place as in the reference. Hand-drawn line art in a single light navy-grey (#7F8DAA) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends, simplified with fewer details than the reference. From left to right: a small Rajasthan village home shown as a cutaway with the front wall removed, a window with a cloth curtain, a wall shelf and a ceiling fan, and an open doorway on its right side; a small rural bank with a flat roof, a blank sign board and an empty counter opening with no shutter; a big neem tree with flat-roofed houses around a courtyard; a low stone boundary wall along a lane; a small tailoring shop with a striped awning, a blank sign board and shelves. No sky, no clouds, no ground line, no furniture on the floor, no plants in front, no people, no text.
```

### R-L3 · Rekha's world · ground and props
```text
Using the reference image for positions and proportions, redraw ONLY its ground layer as one very wide continuous strip with exactly the same size and proportions (about 3.6:1). Hand-drawn line art in a single navy ink colour (#1B2A4A) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends. One straight ground line across the full width at the same height as in the reference. On it, in the same places as the reference: an empty sewing table with a stool and a floor mat inside the home, a wooden bench outside the bank, a charpai under the neem tree, two empty work tables and a front step at the shop. A few small stones and grass tufts along the ground. Nothing taller than a table, no buildings, no sky, no machines, no people, no text.
```

### R-L4 · Rekha's world · foreground
```text
One very wide continuous strip with exactly the same size and proportions as the reference (about 3.6:1), on a plain white background. Only 7 large foreground plants spaced unevenly along the bottom edge: clay pots with leafy plants, tall grass clumps and a small bush, drawn two to three times larger than the plants in the reference as if very close to the camera, several cut off by the bottom edge of the image. Hand-drawn navy ink line art (#1B2A4A) with a very light flat sage fill (#E3EEDF) inside the leaves and pots, no shading, no texture. Everything above the plants is empty white. No buildings, no ground line, no people, no text.
```

### A-0 · Arjun's world · full panorama (generate first)
```text
One very wide, continuous horizontal panorama, about 3.6:1, for a side-scrolling story, straight-on eye-level view, read from left to right. Hand-drawn line art in a single navy ink colour (#1B2A4A) on a plain white background, no fills, no colour, no shading, no texture, clean slightly wobbly marker line with round ends. Very light and airy, simple, lots of empty wall and floor space. A modern Bengaluru apartment shown as a cutaway with the front wall removed, so the rooms run side by side with one straight floor line across the full width and a straight ceiling line along the top, rooms joined by open archways: 1) a living room with a big window showing a small city skyline, a two-seater sofa, a floor lamp, two picture frames and a houseplant; 2) a home work corner with a desk, a laptop on a stand, a mug, a desk chair, a bookshelf and a wall clock; 3) a glass door opening onto a small balcony with simple railings, potted plants and a wide Bengaluru skyline with trees and a few small clouds. Open empty floor space in the middle of each room for a character. No people, no text.
```

### A-L1 · Arjun's world · sky and far
```text
Using the reference image only for positions and proportions, redraw ONLY its farthest layer as one very wide strip with exactly the same size and proportions. Hand-drawn line art in a single pale grey-blue (#B4BFD3) on a plain white background, no fills, thin clean marker line with round ends, very light and sparse: the city skyline seen through the living room window and beyond the balcony (simple tall buildings and a few round trees), and a few small puffy clouds. Nothing else: no walls, no furniture, no floor line, no people, no text.
```

### A-L2 · Arjun's world · walls and rooms
```text
Using the reference image for positions and proportions, redraw ONLY its walls layer as one very wide strip with exactly the same size and proportions, each element in the same place. Hand-drawn line art in a single light navy-grey (#7F8DAA) on a plain white background, no fills, clean slightly wobbly marker line, simplified: the ceiling line, the open archways between rooms, the living room window frame (empty, no skyline), two picture frames, the bookshelf and wall clock at the work corner, the glass balcony door frame and the balcony railing. No skyline, no furniture on the floor, no plants in front, no people, no text.
```

### A-L3 · Arjun's world · floor and furniture
```text
Using the reference image for positions and proportions, redraw ONLY its floor layer as one very wide strip with exactly the same size and proportions. Hand-drawn line art in a single navy ink colour (#1B2A4A) on a plain white background, no fills, clean slightly wobbly marker line with round ends. One straight floor line across the full width at the same height as the reference. On it, in the same places: the two-seater sofa with cushions and a floor lamp in the living room, the desk with a laptop on a stand, a mug and a desk chair at the work corner, a small stool and potted plants on the balcony. Nothing on the walls, no skyline, no people, no text.
```

### A-L4 · Arjun's world · foreground
```text
One very wide strip with exactly the same size and proportions as the reference, on a plain white background. Only 6 large foreground plants spaced unevenly along the bottom edge: a tall potted monstera, a snake plant, a fiddle-leaf fig in a pot, a small side plant and two leafy clumps, drawn two to three times larger than the plants in the reference as if very close to the camera, several cut off by the bottom edge. Navy ink line art (#1B2A4A) with a very light flat sage fill (#E3EEDF), no shading, no texture. Everything else empty white. No furniture, no people, no text.
```

## Separate asset prompts

### 1. Animated props in Rekha's world (flat colour, matches the characters)
```text
Flat 2D vector prop sheet in a friendly modern app illustration style matching flat colour avatar characters: no outlines, no gradients, no texture, one hard-edged flat shadow on the right half of each object in a slightly darker tone. Plain white background, each object isolated with generous space, front view, consistent scale. Objects: a black-and-gold Indian treadle sewing machine on its table, working; the same machine broken, with its wheel tilted, the belt hanging loose and a spring popping out; the same machine fixed and shining with two small sparkle marks; a steel almirah family locker, closed, with a small padlock; a rubber stamp; a clipboard with a blank form; a basic button phone. No people, no text.
```

### 2. Line-art props that move or change (line art, matches the backgrounds)
```text
Hand-drawn line art prop sheet in a single navy ink colour (#1B2A4A) on a plain white background, no fills, no colour, no shading, clean slightly wobbly marker line with round ends, each object isolated and evenly spaced, front view, consistent scale: a metal roll-down shop shutter in three states (fully up and rolled, half down, fully down), a wooden bench, a charpai cot, a small wooden stool, a sewing table, a two-seater sofa, a work desk with a desk chair, a laptop on a stand, a floor lamp. No people, no text.
```

### 3. Sky pieces for drifting (L1)
```text
Hand-drawn line art sheet in a single pale grey-blue (#B4BFD3) on a plain white background, no fills, thin clean marker line: 8 small puffy clouds in different sizes, 3 small birds in flight, 2 birds sitting, a kite with a string. Each isolated and evenly spaced. No text.
```

### 4. Foreground pieces (L4)
```text
Hand-drawn foreground plant sheet, navy ink line art (#1B2A4A) with a very light flat sage fill (#E3EEDF), no shading, plain white background, each isolated and evenly spaced, drawn large and close-up: 4 clay pots with leafy plants, 3 tall grass clumps, 2 small bushes, a tulsi pot, a potted monstera, a snake plant, a fiddle-leaf fig. No text.
```

### 5. Money animation (UPI style)
```text
Flat 2D vector effects sheet for a payment animation, inspired by the success animations in Indian UPI payment apps, friendly modern app style, no outlines, no gradients, plain white background, each item isolated and evenly spaced: a gold rupee coin seen from the front, the same coin at three turning angles and edge-on for a spin, a small stack of gold coins, a green Indian rupee note flat, the same note slightly curled and flying, a bundle of three notes, small sparkle bursts in gold, a green circular success tick with a burst ring around it, soft motion trail streaks in pale gold. No text other than the ₹ symbol on the coins.
```

### 6. Story effects
```text
Flat 2D vector effects sheet, minimal, no outlines, no gradients, plain white background, each effect isolated: a small red snap spark zigzag, a grey smoke puff in three sizes, a coiled metal spring, a red cross mark, a green tick in a circle, a navy ink stamp splash, a round thought bubble with two small trailing circles, a speech bubble, confetti pieces in coral, blue and marigold. No text.
```

### 7. Bubble characters for scene 04 (match your character sheets)
Attach one of your existing character sheets as the style reference.
```text
In exactly the same style as the reference character sheet: flat 2D vector characters, soft rounded-square heads, visible rounded ears, big close-set white oval eyes with dark pupils, small rounded triangle nose, chunky proportions, no outlines, no gradients, one hard-edged flat shadow on the right half. Plain white background. Three head-and-shoulders portraits, each centred inside a circle crop: 1) a village moneylender, a man in his 50s with a moustache, a white kurta and a dark waistcoat, holding a small ledger book, looking stern; 2) Rekha's family, an older couple standing beside a closed steel almirah with a padlock, looking apologetic; 3) a village Mahila Mandal, three women in colourful saris and dupattas sitting close together, looking sorry. No text.
```

## What I need from your character assets for the animation

1. **Format:** SVG (preferred, since you're already vectorising) or transparent PNG at 3×. One file per pose.
2. **Same scale and baseline:**
   - Every character is exported on the same canvas height, with the feet on the same baseline.
   - An adult is the same height in every file.
   - This lets characters stand on the L3 ground line and walk between zones.
3. **Walk cycles,** side view, 6 frames each, for:
   - Rekha (home → bank → courtyard → shop)
   - the field officer (walks in, scene 05)
   - Arjun (desk → balcony, scene 09)
4. **Faces on their own layers:** eyes, brows and mouth separated, or full heads in each expression on the same pivot, so expressions can switch without redrawing the body. The expressions I need:
   - **Rekha:** focused, worried, shocked, stuck, hopeful, overjoyed, proud
   - **Arjun:** bored, curious, focused, pleased, happy
   - **Officer:** listening, stamping, approving
   - **Elder and neighbour:** kind, vouching
5. **Poses per scene:**
   - **Rekha:** sitting at the machine (sewing loop: arm and foot), standing worried, walking, standing hopeful, waving
   - **Arjun:** on the sofa scrolling, standing at the desk tapping the phone, walking, leaning on the balcony railing
   - **Field officer:** walking with the clipboard, stamping
   - **Elder:** hand raised to vouch
   - **Neighbour:** nodding, sewing (hired, scenes 09–10)
   - **Crowd:** 5–8 investor heads
6. **Held props as separate layers,** so they can move on their own: phone, clipboard, stamp.
7. **Missing characters:** a moneylender, Rekha's family and the Mahila Mandal women. Prompt 7 covers these.
8. **File names:** `rekha_walk_01.svg`, `rekha_face_worried.svg`, `arjun_desk_tap.svg`.
9. **Build approach:**
   - Parallax layers and the camera in code (motion/react, driven by scroll or swipe).
   - Character loops (sewing, walking, tapping) in Rive or Lottie.
   - Cards and money flow in code.
