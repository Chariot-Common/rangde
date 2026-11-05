@AGENTS.md

# Rang De design system

Source of truth is the Figma file "Rang De Design System v2". Light theme only. New UI uses the design system below; older sections of the site still use the first-generation tokens in `app/globals.css` and `components/ui/LegacyButton.tsx`. Don't restyle those unless asked.

## Rules

- **Tokens:** design-system tokens live in `styles/tokens.css`. In new code never hardcode colours, sizes, spacing, radii, shadows or font values, including arbitrary Tailwind values like `p-[18px]` or `bg-[#fff]`.
- **Tailwind:** `styles/tailwind-theme.css` maps the tokens to utilities (`bg-primary-100`, `text-text-grey-64`, `rounded-2`, `shadow-6`, `p-r4`, `max-w-page`). Tailwind's defaults are NOT cleared here (the older sections still use them). Spacing names are Figma step numbers: `p-4` = step 4 = 16px. Steps 0, 6, 7, 8, 9 and 18 clash with Tailwind's own numbers, so they are `ds-0`, `ds-6` ... `ds-18` (`p-ds-6` = 32px). `r` = responsive, `f`/`x` = fixed / off-scale pixel value. For a true 0 offset use `inset-zero`, `top-zero`, `left-zero` etc. Type scale `text-h1`..`text-p4` is defined in `app/globals.css`.
- **Components:** design-system components live in `components/ui`, exported from `components/ui/index.ts` (import from `@/components/ui`). Reuse them; never recreate a button, input, tab, popup etc. inline. `LegacyButton` is the original site button, used by the older sections only.
- **Icons:** only through `<Icon name="..." />` (SVGs in `public/icons/ds`) or `<MotionIcon name="..." />` (Lottie JSON in `public/icons/motion`). Don't draw, inline or import icons any other way.
- **Brand assets:** `public/brand` (logo, footer tree, social icons, RBI seal). `public/ui` holds component artwork (tooltip pointers, timeline, tab separator).
- **Ask first:** if a token, component, variant, state or icon is missing, ask before inventing it. Do not guess values. When given a screenshot or Figma link, build from it using existing tokens and components.
- Fonts: Inter (500, 700, 900) through `--font-family-base`, which points at the `next/font` variable set in `app/layout.tsx`.

## Components

Button, Input, Tabs, Accordion, Tooltip, Popup, BottomBand / CartBand, PillTicker, Icon, MotionIcon, Slider, Header, Footer. Usage examples are in the "Rang De Claude Code" project's `CLAUDE.md` (a sibling folder of this one) and in each component's file.
