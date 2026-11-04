# Question cards — visual prompts

For the cruise-style question cards on `/v/v1`, `/v/v1-2` and `/v/v3` (`QUESTION_CARDS` in
`components/versions/approaches.tsx`). The cards use the site's own story photos as placeholders
until these are made.

## How the image is used

- Closed card: tall portrait crop, **340 × 560** (phones ~ 330 × 480). The question sits bottom-left
  on a dark gradient; a frosted "+" sits top-right.
- Open card: the same image widens to **~920 × 560**; a frosted cream panel covers the right ~45%.
- So generate **wide (16:9 or 3:2), at least 2400 px wide**, with the subject in the **left third**,
  their face in the upper half, and quiet space (wall, sky, field) bottom-left and on the right.

## Shared style (paste before every prompt)

> Documentary photograph, rural India, shot on a 35mm lens at eye level, natural daylight, soft late-
> morning or golden-hour light. Real working people, not models; candid, mid-task, unposed, dignified.
> Warm, earthy palette — mustard, terracotta, leaf green, indigo, sun-faded whitewash — with gentle
> contrast and true skin tones; no heavy grading, no HDR, no lens flare. Shallow depth of field, the
> background still readable. Feels like Rang De's borrower stories: hopeful, specific, lived-in. No
> text, logos, watermarks or brand names; no money held up to camera; no staged handshakes.

## The five cards

1. **Why aren’t Rang De returns higher?** — the money doing more than earning.
   > A woman in her 40s in a small village tailoring workshop in Rajasthan, sewing on a black hand-
   > cranked machine, a stack of finished school uniforms beside her, a second machine behind her where
   > a younger woman she now employs is working. Lime-washed wall, a calendar and a window of soft light.
   > Subject on the left third, looking at her work with quiet pride.

2. **How secure is the money I put in Rang De?** — someone on the ground, every loan.
   > A local field officer, a woman in a simple cotton kurta with a cloth bag and a register, sitting on
   > a charpai outside a small rural shop talking with the shop owner, both looking at a notebook
   > together. Afternoon light, a dusty lane and the shop's shelves behind. Officer and owner on the
   > left third, warm and attentive, a sense of trust and routine.

3. **I’m an NRI/OCI. Can I still invest in Rang De?** — from far away to back home.
   > Split-world feeling in one frame: in the foreground left, a hand holding a phone (screen blank or
   > turned away) by a rain-streaked window of a city apartment abroad, soft cool light; through and
   > beyond it, softly out of focus, a sunlit paddy field and a farmer in rural Assam. Or, simpler: an
   > Indian man in his 30s on a balcony abroad at dusk, smiling at his phone, warm lamp light. No flags.

4. **What happens if the borrower doesn’t repay?** — many hands, the risk shared.
   > A self-employed potter in Tamil Nadu shaping a pot on a wheel outside her home, rows of drying pots
   > around her, a neighbour and her daughter helping carry pots to the sun. Clay-red ground, morning
   > light, a sense of a business that keeps going. Potter on the left third, hands in focus.

5. **How does Rang De choose who gets a loan?** — met in person, checked carefully.
   > A field partner photographing a dairy farmer's buffalo shed with a phone for a loan profile, the
   > farmer standing proudly beside two buffaloes in a village in Maharashtra, a tin-roofed shed, hay,
   > soft morning haze. Farmer on the left third facing the camera, field partner partly turned away.

## After generating

Save as `public/images/approaches/faq-<1-5>.webp` (quality ~80, 2400 px wide) and point each card's
`image` at it; set `focus` (e.g. `"30% 40%"`) if the subject needs nudging in the tall crop.
