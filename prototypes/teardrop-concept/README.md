# Teardrop concept (Stark contrast approach)

Homepage hero concept, problem first: "65% of India's Population / Faces a silent epidemic".
One scroll glides the camera into a glass tear under her eye while her face slides up behind
it, until the screen turns white.

- **Live:** https://rangde-v1.vercel.app/v/stark-contrast-approach
- **The page:** `public/v/stark-contrast-approach/teardrop-concept.html`. One self-contained
  HTML file (CSS, JS and the portrait are all inside it), so you can also double-click it to
  open it locally. The `/v/stark-contrast-approach` URL is a rewrite in `next.config.ts`.
- **Figma:** Rang De Master Design III, frame "Emphasis Dark to White Concept" (node 3041:185)
  https://www.figma.com/design/OOGgv2xrymOeuLapDwdZMV/Rang-De-Master-Design-III?node-id=3041-185
- **Tuning:** the `CONFIG` object in the page's script (scroll length is `.track` in the CSS).
  Add `?debug` to the URL to see the scroll progress.
- **Portrait:** `portrait.svg` here is the source (exported from Figma with its background
  removed). It is embedded in the page as a base64 data URI; if you change it, re-embed it:

  ```bash
  node -e "const fs=require('fs');const f='public/v/stark-contrast-approach/teardrop-concept.html';let h=fs.readFileSync(f,'utf8');h=h.replace(/data:image\/svg\+xml;base64,[A-Za-z0-9+\/=]+/,'data:image/svg+xml;base64,'+fs.readFileSync('prototypes/teardrop-concept/portrait.svg').toString('base64'));fs.writeFileSync(f,h)"
  ```
