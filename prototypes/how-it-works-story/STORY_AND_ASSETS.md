# How it works, Approach 2: story, prompts and asset list

A scroll-based, character-led story for the "How it works" section of Approach 2. It is designed for phone first, and desktop is the same story turned sideways.

- **Phone:** one pinned stage, about 75% of the screen height. Rekha's band is on top and Arjun's band is below, with a dark diagonal line (the "seam") between them. The seam moves to give one side more of the screen.
- **Desktop:** Rekha is on the left and Arjun is on the right, and the seam becomes a vertical dotted line down the middle.
- **Captions:** one short line per scene, under the stage. There are no headings and no steps. The details live in the existing 4-step slider, which opens from the end of the story.

---

## 1. The story: "Two people, one loan"

Rekha is a tailor in a village in Rajasthan, and Arjun works in Bengaluru. They never meet, but by the end each has changed the other's year. Every scene is one thumb-scroll.

| # | Scene | Rekha's band (top / left) | Seam | Arjun's band (bottom / right) | Caption |
|---|---|---|---|---|---|
| 0 | **Opening** | Her silhouette in a doorway, the band fades in | 50/50 | His silhouette at a window, the band fades in | Rekha and Arjun have never met. |
| 1 | **Meet** | Sewing at her treadle machine, at home. **Determined** | 50/50 | On the sofa, scrolling his phone. **Bored** | Rekha sews in a village in Rajasthan. Arjun works in Bengaluru. |
| 2 | **Stuck** | At the bank counter. The shutter comes down. **Let down → worried** | 50/50 | His savings app shows "3%". He sighs. **Bored** | The bank won't lend to her. His savings barely grow. |
| 3 | **Vouched** | The field officer arrives at her door. The elder and a neighbour nod and raise their hands. **Hopeful** | Slides down to 85/15 | Faded strip | A local partner visits. Her neighbours vouch for her. |
| 4 | **Checked and listed** | The officer stamps four checks: ID, home, business and credit. **Determined → surprised** | 85/15. Her profile card assembles on the seam | Faded strip | Checked on the ground, then listed on Rang De. |
| 5 | **Backed** | Faded strip | Flips to 15/85. The card drops down | The card lands on his phone. He picks ₹5,000. Other investors' heads pop in around him. **Curious → pleased** | Arjun backs her. So do others. |
| 6 | **Funded** | Coins land. A second machine arrives, and she hires her neighbour. **Surprised → overjoyed** | Back to 50/50. Coins rise through the seam | **Happy** | Within a day, the money reaches her. Her business grows. |
| 7 | **Repaid** | Calendar pages flip. She repays. **Proud** | 50/50. Coins fall through the seam every month | His dashboard counter ticks up. **Delighted** | She repays every month. He earns up to 8.5% p.a. |
| 8 | **Next** | She waves | The seam fades away | A new card (the dairy farmer) slides in, and he taps it | And then he backs the next one. → **See the details** · **Start investing** |

**Facts to check before launch:** ₹40,000 for the loan and ₹5,000 for Arjun's share are example amounts. "Within a day" comes from the slider ("within 24 hours of collection"), and "up to 8.5% p.a." matches the rest of the site. Rekha must be a made-up name, or we need consent to use a real borrower's name.

### Animation beats per scene (for the motion pass)
- **Line-drawn props draw themselves in** (stroke animation) as the scene enters, and characters pop in with a small squash and stretch.
- **Faces change by swapping parts:** eyes, brows and mouth each switch on scroll, not on a timer.
- **Anything that crosses the seam** (the card and the coins) travels along a dotted path, so the eye follows it from one person to the other.
- **Reduced motion:** each scene shows its final frame, and captions fade in.

---

## 2. Visual rules (send these to the illustrator, or paste them with any prompt)

- **Characters:** flat colour avatar style. Soft rounded-square heads, visible ears, big close-set white eyes, a small triangle nose, no outlines, no gradients. One hard-edged flat shadow covers the right half of the face, body and clothes.
- **Hero props** (things a character touches: sewing machine, phone, profile card, coins, stamp) use the same flat colour and half shadow as the characters, so they sit in the same world.
- **Backgrounds and background props** are line art only: one navy ink colour `#1B2A4A` on flat cream `#F9E3BB`, with no fills, no colour and no shading. Only the characters and hero props carry colour, so they pop out of the line world.
- **Band colour:** Rekha's coral band and Arjun's blue band come from code. Export the line art with a transparent background so the lines sit on the band colour.
- **Colours:** Rekha coral `#E0663A`, Arjun blue `#2E8FD6`, field officer green `#639922`, ink `#1B2A4A`, cream `#F9E3BB`.
- **Delivery:** layered SVG, with every moving part (eyes, brows, mouth, arms, head) on its own named layer.

---

## 3. Prompts

### Shared style block, full body
Start every character prompt with this:

```text
Flat 2D vector character illustration, friendly modern app style. Soft rounded-square head, visible rounded ears, big close-set white oval eyes with large dark brown pupils, small rounded triangle nose in a darker skin tone, simple expressive mouth. Chunky proportions: head about one third of body height, simple rounded torso, short legs, rounded mitten-like hands. Bold simple hair shapes. No outlines, no gradients, no texture. One hard-edged flat shadow covering the right half of the face, body and clothes, a slightly darker tone of the same colour. Plain warm cream background #F9E3BB, generous spacing, clean professional character model sheet.
```

**Avoid / negative:** `outlines, gradients, 3D, realistic, anime, texture, soft shading, text, watermark, extra fingers`

**How to keep characters consistent:**
1. Generate the **front view** of each character first, and re-roll until it's right.
2. Use that image as the character or image reference for every other sheet of that character.
3. Leave text and labels out of the image, and add them in Figma afterwards.

---

### 3a. Full character sheets (one per character)
Each sheet has a turnaround row (front, 3/4, side, back) and a poses row with the poses from that character's scenes. Use 16:9.

**Rekha (lead, entrepreneur)**
```text
[style block] Full character sheet of Rekha, a 35-year-old woman tailor from rural Rajasthan, India. Warm brown skin, dark hair in a top bun, small red bindi, small gold earrings, coral kurta, deep terracotta dupatta across one shoulder, cream salwar, maroon juttis. Top row: full-body turnaround, front, three-quarter, side profile, back, standing neutral, same height on faint dashed guide lines. Bottom row, five full-body poses: sitting at a treadle sewing machine stitching, standing with hands folded looking worried, standing hopeful with hands clasped at her chest, proudly presenting a new sewing machine with one open hand, waving happily.
```

**Arjun (lead, investor)**
```text
[style block] Full character sheet of Arjun, a 30-year-old salaried professional from Bengaluru, India. Medium brown skin, tall swept-up black quiff, thin round navy glasses, bright blue shirt with a cream collar, charcoal trousers, white sneakers. Top row: full-body turnaround, front, three-quarter, side profile, back, standing neutral on faint dashed guide lines. Bottom row, five full-body poses: slouched on a sofa scrolling a phone looking bored, leaning forward staring at the phone curious, tapping the phone with one finger, small fist pump with a big smile, sitting at a laptop smiling.
```

**Field officer (local partner)**
```text
[style block] Full character sheet of a field officer from a rural lending partner in India, a woman in her 40s, deep brown skin, black bob haircut, leaf-green kurta, dark trousers, pale ID card on a lanyard, cloth shoulder bag. Top row: full-body turnaround, front, three-quarter, side profile, back, on faint dashed guide lines. Bottom row, five poses: walking holding a clipboard, greeting with a namaste, listening and writing on the clipboard, pressing a rubber stamp onto a form, giving a thumbs up.
```

**Village elder**
```text
[style block] Full character sheet of a village elder in Rajasthan, a man in his 70s, brown skin, bald head, big white moustache, round glasses, white kurta, grey shawl, wooden walking stick. Top row: front, three-quarter, side, back turnaround. Bottom row, four poses: leaning on the stick smiling, raising one hand to vouch, nodding with eyes closed, laughing.
```

**Neighbour (Rekha later hires her)**
```text
[style block] Full character sheet of a young village woman in her 20s, light brown skin, long wavy black hair, freckles, small bindi, mustard yellow kurta, green dupatta. Top row: front, three-quarter, side, back turnaround. Bottom row, four poses: waving, nodding and pointing towards someone, sitting at a sewing machine working, cheering with both arms up.
```

**Dairy farmer (the next borrower in scene 8)**
```text
[style block] Full character sheet of a dairy farmer from rural India, a man in his 50s, dark brown skin, orange turban, black moustache, white kurta, brown dhoti, sandals. Top row: front, three-quarter, side, back turnaround. Bottom row, four poses: standing with a steel milk can, patting a cow, looking hopeful with hands together, waving.
```

**Shopkeeper (an extra in the listings feed)**
```text
[style block] Full character sheet of a small kirana shop owner from a town in India, a man in his 40s, brown skin, short black hair, black moustache, ochre shirt, grey trousers. Top row: front, three-quarter, side, back turnaround. Bottom row, three poses: standing behind a small shop counter, handing over a packet, smiling with arms crossed.
```

**Investor (joins Arjun)**
```text
[style block] Full character sheet of a young urban investor, a woman in her late 20s, light brown skin, brown bob haircut, light freckles, sky-blue top, white trousers, tote bag. Top row: front, three-quarter, side, back turnaround. Bottom row, three poses: holding a phone smiling, tapping the phone, waving.
```

**Crowd (other investors popping in)**
```text
[style block] Sheet of 8 simple head-and-shoulders avatars of urban Indian investors in muted light blue, grey and white clothing, varied ages, genders, hairstyles and skin tones, all smiling, arranged in a neat 4 by 2 grid. Simpler than the main characters.
```

### 3b. Expression sheets (faces zoomed in)
Use the same prompts as before, with each character's front view attached as the reference image. Rekha and Arjun get 8 expressions each, the field officer gets 6, and the supporting characters get 4 each. The expressions needed are listed in section 4.

---

### 3c. Asset sheets
**Hero props: flat, with the half shadow**
```text
Flat 2D vector prop sheet in a friendly modern app illustration style, no outlines, no gradients, one hard-edged flat shadow on the right half of each object, plain cream background #F9E3BB, objects neatly spaced in a grid: a black-and-gold Indian treadle sewing machine on a wooden table, a second identical sewing machine with a red ribbon bow, a bolt of coral fabric, a spool of thread with a needle, a smartphone held upright, a basic button phone, a rubber stamp, a round gold rupee coin, a stack of rupee coins, a clipboard with a form, a steel milk can, a cloth shoulder bag.
```

**Background props: line art, same as the backgrounds.** Start each sheet with the background style block (section 3d), then add:

Rekha's village and workshop:
```text
Prop sheet, each object isolated and neatly spaced in a grid: a village house with a flat roof and small window, a doorway with a hanging cloth curtain, a neem tree, a potted tulsi plant, three grass tufts, a charpai cot, a wooden shelf with rolled fabric, a window with a cloth curtain, a wall calendar, a ceiling fan, a clothes line with hanging garments, an electricity pole with wires and a bird.
```

The village bank:
```text
Prop sheet, each object isolated and neatly spaced in a grid: a small Indian bank building with columns, a bank counter with a roll-down shutter half closed, the same counter with the shutter fully closed, a round wall clock, a notice board with pinned papers, a wooden bench.
```

Arjun's flat and desk:
```text
Prop sheet, each object isolated and neatly spaced in a grid: a two-seater sofa with cushions, a floor lamp, a houseplant in a pot, two picture frames, a big window with a city skyline, a work desk, a laptop on a stand, a coffee mug, a shelf with books, a desk chair.
```

**Effects and small icons**
```text
Flat 2D vector effects sheet, minimal, no outlines, cream background: motion lines, a small sparkle burst, a stamp ink splash, green check ticks in circles, a dotted travel path with arrowheads, small rupee coins with motion trails, a notification bubble, confetti pieces in coral, blue and marigold, a calendar page tearing off.
```

---

### 3d. Background sheets

> **Replaced:** the backgrounds are now two connected panoramas, one per character, that the camera pans along as you scroll. The full prompts are in [BACKGROUND_PANORAMAS.md](BACKGROUND_PANORAMAS.md). The separate backgrounds below are kept for reference only.
Generate every background **empty, with no characters**, and with the centre clear, so characters can stand in it. Make each one twice: **4:5** for the phone bands and **16:9** for desktop. Line art only, like the village courtyard reference.

**Background style block:**
```text
Hand-drawn line art illustration, a single navy ink colour (#1B2A4A) on a flat warm cream background (#F9E3BB). No fills, no colour, no shading, no hatching, no gradients, no texture. Clean, slightly wobbly marker line with round ends and a consistent medium line weight; thinner, lighter lines for distant objects. Friendly, simple details such as potted plants, grass tufts and small puffy clouds. Straight-on eye-level view, calm and uncluttered, a wide open empty area in the centre for characters to stand. No people, no text.
```

| ID | Background | Prompt (after the background style block) |
|---|---|---|
| BG1 | **Rekha's home workshop** | `Interior of a small home tailoring workshop in a Rajasthan village: plain walls, a window with a cloth curtain, a shelf with rolled fabric and thread spools, a hanging calendar, a ceiling fan, a stool, a floor mat.` |
| BG2 | **Village bank** | `Inside a small rural Indian bank branch: a counter with a roll-down shutter half closed, a round wall clock, a notice board, a ceiling fan, a wooden bench, a grilled window.` |
| BG3 | **Village courtyard** | `Village courtyard in Rajasthan: flat-roofed houses on both sides with doorways and cloth curtains, a neem tree, potted plants, a charpai, grass tufts, an electricity pole with wires and a bird, a low wall with trees behind, a few small clouds.` |
| BG4 | **Arjun's flat** | `Living room of a modern apartment in Bengaluru: a sofa with cushions, a floor lamp, a houseplant, framed pictures, a big window with a city skyline and small clouds.` |
| BG5 | **Arjun's desk** | `Corner of a modern apartment with a work desk: a desk with a laptop stand and a mug, a shelf with books, a desk chair, a window with tall buildings outside.` |
| BG6 | **Rekha's workshop, later** | `The same village tailoring workshop as the reference image, now busier: two sewing machines, more fabric on the shelves, finished clothes hanging on a line, a small sign on the wall.` |
| BG7 | **Neutral ground strip** | `A wide strip of simple ground: a few grass tufts, small stones and a potted plant at each end, mostly empty.` |

**Mobile versions (9:16).** Add this after the background style block, then use the mobile prompts below:
```text
Vertical portrait composition for a phone screen, 9:16. Fewer, bigger, simpler objects than a desktop scene. Buildings, trees and furniture sit along the left and right edges, and the middle third stays empty for characters. Ground line at about two thirds of the height. Keep everything important between 30% and 75% of the height, so the image still works when cropped to a short wide strip.
```

| ID | Mobile prompt |
|---|---|
| BG1 | `Village tailoring workshop: a window with a cloth curtain high on the left wall, a tall shelf with rolled fabric and thread spools on the right edge, a calendar on the wall, a ceiling fan at the top, a floor mat in the empty centre.` |
| BG2 | `Small rural bank branch: the counter with a half-closed roll-down shutter on the right side, a round wall clock above it, a notice board on the left wall, a ceiling fan at the top, a bench in the bottom-left corner.` |
| BG3 | `Rajasthan village courtyard: a flat-roofed house with a doorway and cloth curtain on the left edge, a neem tree on the right edge with branches reaching across the top, an electricity pole with wires and a bird, a low wall far behind, grass tufts and a potted plant in the bottom corners, two small clouds.` |
| BG4 | `Bengaluru apartment living room: a tall window with a city skyline on the left, a floor lamp and houseplant on the right edge, framed pictures on the wall, the edge of a sofa along the bottom.` |
| BG5 | `Apartment desk corner: a window with tall buildings at the top, a desk with a laptop stand and mug on the right edge, a bookshelf on the left wall, a desk chair at the bottom.` |
| BG6 | `The same workshop as the reference image, now busier: a second sewing machine on the left, more fabric on the shelf on the right, clothes hanging on a line across the top, a small sign on the wall.` |
| BG7 | `A narrow strip of simple ground with a few grass tufts and small stones at each end, mostly empty.` |

**Tip:** to make a background usable for parallax, also ask for "foreground layer only", "midground layer only" and "back wall only" versions, or split it into those layers in Figma.

---

## 4. Asset list

### Characters
| ID | Character | Full sheet | Expressions needed | Poses needed | Scenes |
|---|---|---|---|---|---|
| C1 | **Rekha** | Turnaround + 5 poses | worried, let down, determined, hopeful, surprised, proud, overjoyed, tired | sewing (seated), standing worried, hopeful hands clasped, presenting the new machine, waving | 0–8 |
| C2 | **Arjun** | Turnaround + 5 poses | bored, curious, sceptical, surprised, focused, pleased, happy, delighted | sofa scrolling, leaning in, tapping the phone, fist pump, at the laptop | 0–8 |
| C3 | **Field officer** | Turnaround + 5 poses | welcoming, listening, checking, approving, pleased, satisfied | walking with the clipboard, namaste, writing, stamping, thumbs up | 3–4 |
| C4 | **Elder** | Turnaround + 4 poses | kind, concerned, surprised, laughing | leaning on the stick, hand raised to vouch, nodding | 3 |
| C5 | **Neighbour** | Turnaround + 4 poses | friendly, curious, surprised, excited | waving, pointing, sewing, cheering | 3, 6 |
| C6 | **Dairy farmer** | Turnaround + 4 poses | calm, worried, hopeful, laughing | with the milk can, with the cow, hands together, waving | 8 |
| C7 | **Shopkeeper** | Turnaround + 3 poses | calm, curious, surprised, happy | behind the counter, smiling | 5 (feed card) |
| C8 | **Investor** | Turnaround + 3 poses | idle, curious, pleased, happy | holding the phone, tapping, waving | 5 |
| C9 | **Crowd** | 8 heads | smiling | heads only | 5, 6 |

### Hero props (flat, with the half shadow)
| ID | Asset | States / variants | Scenes |
|---|---|---|---|
| P1 | Treadle sewing machine | idle, needle moving (2 frames) | 1, 6 |
| P2 | Second sewing machine | with a ribbon bow, without | 6 |
| P3 | Fabric bolt, thread and needle | — | 1 |
| P4 | Smartphone (Arjun) | screen empty, so screens can be built in code | 1, 2, 5, 7, 8 |
| P5 | Basic button phone (Rekha) | screen off, notification | 6 |
| P6 | Rubber stamp | raised, pressed | 4 |
| P7 | Clipboard with a form | blank, with 4 ticks | 3, 4 |
| P8 | Rupee coin | single, stack, with motion trail | 6, 7 |
| P9 | Milk can and cow | — | 8 |
| P10 | Cloth shoulder bag (officer) | — | 3 |

### Background props (line art, drawn in on scroll)
| ID | Asset | Scenes |
|---|---|---|
| L1 | Bank building | 2 |
| L2 | Bank counter with a roll-down shutter | 2 (the shutter animates down) |
| L3 | Village house, doorway with a curtain | 3 |
| L4 | Neem tree, tulsi plant, grass tufts | 1, 3, 6 |
| L5 | Charpai | 3 |
| L6 | Wall calendar | 7 (pages flip) |
| L7 | Ceiling fan | 1, 2 |
| L8 | Sofa, floor lamp, houseplant, picture frames | 1, 2, 5 |
| L9 | Window with a city skyline | 1, 7 |
| L10 | Desk and laptop | 7 |

### UI built in code, not illustrated
These must stay sharp, use real fonts and show real numbers, so they're built in code rather than drawn.

| ID | Asset | Scenes |
|---|---|---|
| U1 | Savings app screen showing "3% p.a." | 2 |
| U2 | Rang De profile card for Rekha (photo slot uses her avatar, ₹40,000, tailoring, Rajasthan, a "Verified" tick) | 4, 5 |
| U3 | Invest amount picker: ₹500, ₹2,000, ₹5,000 | 5 |
| U4 | Funding progress bar on the card | 5, 6 |
| U5 | "Money received" notification | 6 |
| U6 | Repayments dashboard with a ticking counter | 7 |
| U7 | Next borrower card (dairy farmer) | 8 |
| U8 | Captions, end CTAs ("See the details", "Start investing") | all, 8 |

### Effects
| ID | Asset | Scenes |
|---|---|---|
| E1 | Seam: dark diagonal line (phone), dotted vertical line (desktop) | all |
| E2 | Dotted travel path with arrowheads | 4–7 |
| E3 | Stamp ink splash + green check ticks | 4 |
| E4 | Sparkle burst | 4, 6, 8 |
| E5 | Pop-in puffs for crowd heads | 5 |
| E6 | Confetti in coral, blue and marigold | 6 |
| E7 | Motion lines | 5, 6 |

### Backgrounds
| ID | Background | Scenes |
|---|---|---|
| BG1 | Rekha's home workshop | 1, 4 |
| BG2 | Village bank | 2 |
| BG3 | Village courtyard | 3 |
| BG4 | Arjun's flat | 1, 2, 5 |
| BG5 | Arjun's desk | 7 |
| BG6 | Rekha's workshop, later | 6, 7 |
| BG7 | Neutral ground strip (bands are code) | 0, 8, transitions |

**Totals:** 9 character sheets, 8 expression sheets, 10 hero props, 10 ambient props, 8 UI pieces built in code, 7 effects, and 7 backgrounds in 2 crops each.
