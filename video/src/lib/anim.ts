import {Easing, interpolate, spring} from 'remotion'

/**
 * Every helper returns a value clamped outside its own window, so a scene never
 * has to branch on whether it has started yet.
 */

type InterpOpts = {extrapolateLeft?: 'clamp'; extrapolateRight?: 'clamp'}

export const CLAMP: InterpOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}

/** 0 -> 1 across `dur` frames, starting at `start`. */
export const fadeIn = (frame: number, start = 0, dur = 18): number =>
  interpolate(frame, [start, start + dur], [0, 1], CLAMP)

/** Inverse of fadeIn: visible for `until`, then gone. */
export const fadeOut = (frame: number, until: number, dur = 18): number =>
  interpolate(frame, [until, until + dur], [1, 0], CLAMP)

/** Fade in on the way in and back out on the way out. */
export const fadeInOut = (
  frame: number,
  start: number,
  dur: number,
  hold: number,
  out = 14,
): number =>
  Math.min(fadeIn(frame, start, dur), fadeOut(frame, start + dur + hold, out))

/** Slides up into place: `dist` px below its resting place. */
export const rise = (frame: number, start = 0, dur = 22, dist = 26): number =>
  interpolate(frame, [start, start + dur], [dist, 0], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  })

/** Slides in from the right, for side panels. */
export const slideIn = (frame: number, start = 0, dur = 26, dist = 420): number =>
  interpolate(frame, [start, start + dur], [dist, 0], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  })

/** Scale, overshooting slightly — for icons and badges that should feel sprung. */
export const popScale = (
  frame: number,
  fps: number,
  start = 0,
  damping = 14,
  stiffness = 180,
): number =>
  spring({
    frame: frame - start,
    fps,
    config: {damping, stiffness, mass: 0.7},
  })

/** Non-overshooting scale, for panels that should not wobble. */
export const softScale = (
  frame: number,
  fps: number,
  start = 0,
  damping = 26,
): number =>
  spring({
    frame: frame - start,
    fps,
    config: {damping, stiffness: 140, mass: 0.9},
  })

/** A continuous slow rotation, for ambient background motion. */
export const spin = (frame: number, degreesPerSecond = 6): number =>
  (frame / 30) * degreesPerSecond

/** Blinking caret / cursor. Returns 1 or 0 on a frame-quantised period. */
export const blink = (frame: number, period = 30): number =>
  Math.floor(frame / period) % 2 === 0 ? 1 : 0

/**
 * A typewriter that reveals `text` up to the local frame, then stops.
 * Used for URL and credential fields.
 */
export const typed = (frame: number, text: string, speed = 2, start = 0): string =>
  text.slice(0, Math.max(0, Math.floor((frame - start) / speed)))

/** Wraps a value in an rgba() of the given hex colour. */
export const alpha = (hex: string, a: number): string => {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h

  const n = parseInt(full, 16)

  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}
