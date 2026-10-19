# LinkLens — hackathon video

A 3-minute animated explainer built with [Remotion](https://remotion.dev).
No slides, no talking head: every frame is a scene rendered from React, so
motion, timing and colour are all code you can edit.

- **1920×1080, 30fps, 5400 frames (180s), silent.**
- Brand colours and type are imported from `../src/tokens.css` and
  `../src/fonts.css` via `src/theme.ts` — the video cannot drift from the
  extension's real UI.
- **Single-hue dark theme.** The page colour is `#161617` — sampled from the
  product design (HSB 267, 5%, 9%). Surfaces are 1–8% lifts off it, type is
  off-white, and `#A259FB` is the only brand hue. Red and green appear **only**
  as semantic signals (danger / safe), never as structure.

### Why the backgrounds are flat

`Backdrop` used to lay three 1100–1250px blurred radial washes over every scene
and drift them on sine waves. On a near-black page they read as a stock
template rather than a design decision. They are gone. Depth now comes from
surface lifts and 1px borders — the same way the extension's own UI separates
layers.

Only two gradients remain, both doing a job rather than decorating:

| Where | What |
|-------|------|
| `Reveal` | The iris — it *is* a lens opening, animated on a 78-frame ramp |
| `NetworkLayer` | The gate glow, tied to whether the packet has been caught |

If you add a scene, keep it flat.

## Commands

```bash
npm install

npm run dev            # Remotion Studio, scrub every frame live
npm run render         # -> out/linklens.mp4  (full quality)
npm run render:preview # -> out/linklens-preview.mp4 (half scale, fast)
npm run still          # -> out/still.png (frame 0)
```

Rendering needs Remotion's Chrome Headless Shell:

```bash
npx remotion browser ensure
```

## The cut

| # | Scene | In | Length | What it does |
|---|-------|----|--------|--------------|
| 1 | `ColdOpen` | 0:00 | 16s | A routine email. Nothing looks wrong. |
| 2 | `CredentialsStolen` | 0:16 | 12s | The click, the typing, the handover. |
| 3 | `TheProblem` | 0:28 | 24s | Three sites, one identical page, three destinations. |
| 4 | `Reveal` | 0:52 | 12s | The real lockup on deep purple. First still frame in the video. |
| 5 | `NetworkLayer` | 1:04 | 22s | The request is stopped before it is issued. |
| 6 | `BlockPageScene` | 1:26 | 22s | The block page, and the choice it offers. |
| 7 | `SidePanelScene` | 1:48 | 24s | The always-on panel and its counters. |
| 8 | `ControlScene` | 2:12 | 16s | "Continue anyway" installs a scoped allow-rule. |
| 9 | `Proof` | 2:28 | 16s | 2,451 · 20 · 0. |
| 10 | `Everywhere` | 2:44 | 10s | Seven browsers sweep into an orbiting ring. |
| 11 | `Close` | 2:54 | 6s | The ring collapses; the logo grows out of it. |

Timing lives in one place: `src/LinkLensVideo.tsx` (`SCENES`). Change a `from`
or a `dur` there and every scene follows.

## Editing captions

Captions carry the whole narrative, since the video is silent. They live at the
bottom of each scene and support inline markup:

| Markup | Renders as |
|--------|-----------|
| `*word*` | brand purple — a key term |
| `!word!` | alert red — the dangerous part |
| `~word~` | muted grey — de-emphasised filler |

```tsx
<Caption
  lines={['Three sites. *One identical page.*', 'The only signal is a !13 pixel string!']}
  start={140}
  outAt={430}   // fade this caption back out
/>
```

## Where things live

```
src/
  LinkLensVideo.tsx     the cut — scene order and timings
  theme.ts              brand tokens; the `grey` ramp is purple, not grey
  lib/anim.ts           interpolation helpers (all frame-driven, no CSS timing)
  components/
    Chrome.tsx          Caption, Backdrop, Eyebrow
    Browser.tsx         browser shell, cursor, content pill
    UI.tsx              icons and primitives from src/components
    Panel.tsx           side panel, block page, fake login
  scenes/               one file per act
public/
  browsers/             vendor browser marks, rendered at natural colour
  logo/                 the shipped lockup, white-text and dark-text
```

## Working with the logo

`public/logo/logo-white-text.svg` (mark `#A259FB`, text `#F7F6F8`) is used on the
two deep-purple scenes. `logo-dark-text.svg` is the same lockup with near-black
text for light backgrounds, if you add a scene on a pale backdrop.

Both are `viewBox="0 0 120 42"`. The scenes hold that ratio exactly — if you swap
in a different lockup, keep `LOGO_W / (120 / 42)` or the wordmark will shear.

Every animation is driven by `useCurrentFrame()` and `interpolate()` — no CSS
transitions or keyframes, because those do not render deterministically frame by
frame. Anything that is not a pure function of the frame will render as garbage
or as a still.

## Reusing the real UI

`components/Panel.tsx` and `components/UI.tsx` are hand-rebuilt from the
extension rather than screenshotted, so they stay crisp at 1080p. The real
components live at `../src/components/` if you want to diff them — the shapes
are intentionally identical, the props are not, because the video needs
per-frame control that the product does not.

If you change the brand palette, update **both** `../src/tokens.css` and
`src/theme.ts` in the same commit. Keep the *slot roles* in `color.grey`
identical — only the values change:

| Slot | Role | Value |
|------|------|-------|
| 50 | card / panel surface | `#1d1d20` |
| 100 | page background | `#161617` |
| 200 | field fill, browser chrome | `#232328` |
| 300 | border / divider | `#2e2e34` |
| 400 | muted text, notes | `#8a8794` |
| 500 | disabled text | `#6e6b78` |
| 600 | body text | `#b7b4c0` |
| 700 | heading text | `#e4e2ea` |
| 800 | highest-contrast text | `#f6f4f9` |

**The 600/700/800 slots invert relative to a light theme** — on a dark surface
brighter means more prominent, so "heading" is lighter, not darker. Two
consequences that will bite you otherwise:

- `color.grey[50]` is a **surface**, not white. Anything that wants white text on
  a brand fill must say `'#ffffff'` explicitly. `UI.tsx`'s solid `Button` does.
- `color.grey[800]` is **near-white text**, not a dark panel. The code panels in
  `NetworkLayer` and `ControlScene` use `grey[50]` as their fill for this reason.

Shadows are `color.shadow` (`#000000`). A tinted shadow on a near-black page
reads as haze, not depth.
