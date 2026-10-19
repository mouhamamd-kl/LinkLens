import React from 'react'
import {interpolate, useCurrentFrame} from 'remotion'
import {CLAMP} from '../lib/anim'
import {color, font} from '../theme'

/**
 * Kinetic captions. The video is silent, so this carries the entire narrative
 * and has to be readable in one glance from the back of a room.
 *
 * Inline markup inside a line string:
 *   *word*  -> brand purple (a key term)
 *   !word!  -> alert red (the dangerous part)
 *   ~word~  -> muted grey (de-emphasised filler)
 */
type Token = {text: string; tone: 'plain' | 'accent' | 'danger' | 'muted'}

const parse = (line: string): Token[] => {
  const out: Token[] = []
  // Ordered alternation: the three delimiters are disjoint, so one pass with a
  // sticky-free global match is enough to pair each opener with its closer.
  const re = /\*([^*]+)\*|!([^!]+)!|~([^~]+)~/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push({text: line.slice(last, m.index), tone: 'plain'})
    if (m[1] !== undefined) out.push({text: m[1], tone: 'accent'})
    else if (m[2] !== undefined) out.push({text: m[2], tone: 'danger'})
    else out.push({text: m[3]!, tone: 'muted'})
    last = m.index + m[0].length
  }

  if (last < line.length) out.push({text: line.slice(last), tone: 'plain'})

  return out
}

export const Caption: React.FC<{
  lines: string[]
  start?: number
  /** Frames between each word appearing. */
  stagger?: number
  size?: number
  align?: 'center' | 'left'
  /** Bottom offset in px. */
  bottom?: number
  maxWidth?: number
  /** Frame at which the whole block starts fading back out. Omit to hold. */
  outAt?: number
  outDur?: number
  /**
   * Set on dark scenes. The default plain/muted colours are near-black, tuned for
   * the light product frames, and disappear entirely on a black backdrop.
   */
  dark?: boolean
}> = ({
  lines,
  start = 0,
  stagger = 2,
  size = 46,
  align = 'center',
  bottom = 96,
  maxWidth = 1400,
  outAt,
  outDur = 16,
  dark = false,
}) => {
  const frame = useCurrentFrame()

  let wordIndex = 0

  // Applied to the wrapper so per-word springs stay independent of the exit.
  const exit =
    outAt === undefined
      ? 1
      : interpolate(frame, [outAt, outAt + outDur], [1, 0], CLAMP)

  const renderLine = (line: string, lineIndex: number) => {
    const tokens = parse(line)

    return (
      // Tokens render inline rather than as flex items: the parser keeps each
      // token's surrounding spaces, so `*word*.` keeps its period attached.
      // A flex `gap` here would detach every punctuation run from its word.
      <div
        key={lineIndex}
        style={{
          textAlign: align,
          lineHeight: 1.18,
          marginBottom: size * 0.28,
        }}
      >
        {tokens.map((token, ti) => {
          const at = start + wordIndex * stagger
          wordIndex += 1

          // Words enter slightly staggered and never animate out on their own —
          // the whole caption block fades with the scene that owns it.
          const p = Math.max(0, Math.min(1, (frame - at) / 16))
          const e = 1 - Math.pow(1 - p, 3)

          // NB: these read from grey[700]/[500], not grey[50]. grey[50] is a
          // surface colour in the dark ramp (#1d1d20) — using it for text here
          // put near-black type on a near-black page.
          const tone =
            token.tone === 'accent'
              ? color.purple[400]
              : token.tone === 'danger'
                ? color.red[300]
                : token.tone === 'muted'
                  ? dark
                    ? color.grey[500]
                    : color.grey[400]
                  : dark
                    ? color.grey[700]
                    : color.grey[800]

          return (
            <span
              key={`${token.text}-${ti}`}
              style={{
                fontFamily: font,
                fontSize: size,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.18,
                color: tone,
                opacity: e,
                display: 'inline-block',
                whiteSpace: 'pre',
                transform: `translateY(${(1 - e) * 18}px)`,
                filter: `blur(${(1 - e) * 6}px)`,
              }}
            >
              {token.text}
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom,
        opacity: exit,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        padding: '0 80px',
        maxWidth,
        margin: align === 'center' ? '0 auto' : undefined,
      }}
    >
      {lines.map(renderLine)}
    </div>
  )
}

/**
 * The soft purple wash that keeps large flat areas from looking like a
 * screenshot. Rendered behind everything else in a scene.
 */
export const Backdrop: React.FC<{
  tone?: 'brand' | 'alert' | 'dark' | 'clean'
  /** Frame to start drifting, so successive scenes are not identical. */
  seed?: number
}> = ({tone = 'brand', seed = 0}) => {
  /*
   * Flat by design.
   *
   * This used to lay three 1100-1250px blurred radial washes over every scene and
   * drift them on sine waves. On a near-black page they read as a stock template
   * rather than a design decision — the thing that most reliably marks a frame as
   * generated. Depth now comes from surface lifts and 1px borders, which is how
   * the product itself separates layers.
   *
   * `tone` and `seed` are kept so call sites do not have to change; there is
   * nothing left to tune.
   */
  void tone
  void seed

  return <div style={{position: 'absolute', inset: 0, background: color.bg}} />
}

/** Small uppercase eyebrow used to label acts. */
export const Eyebrow: React.FC<{
  text: string
  start?: number
  tone?: string
  top?: number
}> = ({text, start = 0, tone = color.purple[500], top = 78}) => {
  const frame = useCurrentFrame()
  const p = frame - start
  const e = p < 0 ? 0 : Math.min(1, p / 18)

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: e,
        transform: `translateY(${(1 - e) * -12}px)`,
      }}
    >
      <span
        style={{
          fontFamily: font,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: tone,
        }}
      >
        {text}
      </span>
    </div>
  )
}

export const clampFrame = (frame: number, at: number, dur: number) =>
  Math.max(0, Math.min(1, (frame - at) / dur))
