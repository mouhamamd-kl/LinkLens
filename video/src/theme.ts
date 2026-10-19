/*
 * Brand tokens for the LinkLens video.
 *
 * ── The palette ─────────────────────────────────────────────────────────────
 * A single-hue dark theme. The page colour is #161617, sampled from the product
 * design (HSB 267, 5%, 9%). Every surface is a slight lift off it; every piece
 * of type is a tint of #A259FB or a neutral off-white; nothing else.
 *
 * `color.grey` is NOT grey and is NOT the extension's grey ramp. It is a bag of
 * dark-surface and text slots, kept under that name so the ~200 existing call
 * sites keep working. The slots' *roles* are unchanged from the original
 * light theme — only their values are:
 *
 *   50  card / panel surface        (was #ffffff — light page)
 *   100 page background             (was #f6f5f7)
 *   200 field fill, browser chrome  (was #f3f2f5)
 *   300 border / divider            (was #e1e0e2)
 *   400 muted text, notes           (was #5d5665)
 *   500 disabled text               (was #4a4550)
 *   600 body text                   (was #29272b)
 *   700 heading text                (was #151516)
 *   800 highest-contrast text       (was #0a0a0a — the old page black)
 *
 * Note that 600/700/800 invert relative to the light ramp: on a dark surface
 * brighter means more prominent, so "heading" is now lighter, not darker.
 */

export const color = {
  /** The background, sampled from the product design. */
  bg: '#161617',

  /** Shadows are pure black. A tinted shadow on a near-black page reads as haze. */
  shadow: '#000000',

  purple: {
    50: '#f5eefe',
    100: '#ecdefe',
    200: '#dabdfd',
    300: '#c79bfd',
    400: '#b47afc',
    500: '#a259fb',
    600: '#8147c9',
    700: '#613597',
    800: '#412464',
  },

  /**
   * Red is used ONLY to mean "danger" — a blocked site, a caught request. On a
   * dark surface the saturated #ff0000 is unreadable as text, so 400/500 are
   * lifted and 50 is a dark tint rather than the old pale pink.
   */
  red: {
    50: '#2a1215',
    100: '#3a161a',
    200: '#5c2027',
    300: '#ff6b6b',
    400: '#ff5252',
    500: '#ff3b3b',
    600: '#e02424',
    700: '#8f1616',
    800: '#4a0e0e',
  },

  /** Green is used ONLY to mean "safe" or "succeeded". Same treatment as red. */
  green: {
    50: '#0e2114',
    100: '#12301d',
    200: '#1d4d2e',
    300: '#6ede6e',
    400: '#4ade4a',
    500: '#2fc72f',
    600: '#1e9e1e',
    700: '#146514',
    800: '#0b3d0b',
  },

  /* Dark surface + text slots. See the note above. */
  grey: {
    50: '#1d1d20',
    100: '#161617',
    200: '#232328',
    300: '#2e2e34',
    400: '#8a8794',
    500: '#6e6b78',
    600: '#b7b4c0',
    700: '#e4e2ea',
    800: '#f6f4f9',
  },

  orange: {
    50: '#2a1d0f',
    500: '#ff8c1a',
  },

  blue: {
    50: '#131a2e',
    500: '#5b7cff',
  },
} as const

/** Semantic aliases, mirroring the `Mapped` layer in tokens.css. */
export const semantic = {
  action: color.purple[500],
  actionHover: color.purple[400],
  error: color.red[400],
  success: color.green[400],
  textHeading: color.grey[800],
  textBody: color.grey[600],
  textPlaceholder: color.grey[400],
  textOnAction: '#ffffff',
  surfacePage: color.bg,
  surfaceDefault: color.grey[50],
  surfaceError: color.red[50],
  surfaceSuccess: color.green[50],
} as const

/**
 * Inter is the extension's UI face. It is requested first so a machine with the
 * real family installed (or a cached Remotion font) gets the exact product look;
 * the rest of the stack degrades to Segoe UI / Roboto, which keeps the metrics
 * close enough that nothing shifts between the two.
 */
export const font =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

export const mono = "'JetBrains Mono', 'SF Mono', Consolas, 'Courier New', monospace"
