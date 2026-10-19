import React from 'react'
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion'
import {Caption} from '../components/Chrome'
import {alpha} from '../lib/anim'
import {color, font} from '../theme'

/**
 * ACT 7 — reach.
 *
 * The browsers arrive in a row, then sweep into a ring and orbit. The ring
 * contracts to a point at the very end of the scene, which is the handoff into
 * Act 8: the LinkLens logo blooming in the space it leaves behind.
 *
 * Positions are computed rather than laid out with flex, because each mark has
 * to travel between two specific points — a row slot and an angle on a circle.
 */

interface Browser {
  name: string
  file: string
  /** Only tints the soft glow behind the mark; never applied to the logo. */
  glow: string
}

const BROWSERS: Browser[] = [
  {name: 'Chrome', file: 'chrome.svg', glow: '#a259fb'},
  {name: 'Chromium', file: 'chromium.svg', glow: '#a259fb'},
  {name: 'Edge', file: 'Edge.svg', glow: '#a259fb'},
  {name: 'Brave', file: 'brave.svg', glow: '#a259fb'},
  {name: 'Opera', file: 'opera.svg', glow: '#a259fb'},
  {name: 'Firefox', file: 'Firefox.svg', glow: '#a259fb'},
  {name: 'Safari', file: 'safari.svg', glow: '#a259fb'},
]

const TILE = 116
const GAP = 40
const ROW_TOP = 352
const CX = 960
const CY = 470
const RING_R = 292

const OUT = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const

/** x of each mark's centre while it is still in the row. */
const rowX = (i: number): number => {
  const total = BROWSERS.length * TILE + (BROWSERS.length - 1) * GAP

  return (1920 - total) / 2 + i * (TILE + GAP) + TILE / 2
}

export const Everywhere: React.FC = () => {
  const frame = useCurrentFrame()

  const appear = interpolate(frame, [10, 46], [0, 1], OUT)

  // Orbit, easing to a halt so the ring settles before it collapses.
  const orbitDeg = interpolate(frame, [138, 250], [0, 30], {
    ...OUT,
    easing: Easing.out(Easing.quad),
  })

  // collapse to centre — Act 8's logo grows out of this
  const collapse = interpolate(frame, [252, 300], [0, 1], {
    ...OUT,
    easing: Easing.in(Easing.cubic),
  })

  const nameFade = interpolate(frame, [70, 110], [1, 0], OUT)
  const ringGlow = interpolate(frame, [138, 200], [0, 1], OUT)

  return (
    <AbsoluteFill style={{background: color.bg}}>
      <BackdropWash />

      {/* the ring guide, revealed as the marks take their places */}
      <div
        style={{
          position: 'absolute',
          left: CX,
          top: CY,
          width: RING_R * 2,
          height: RING_R * 2,
          marginLeft: -RING_R,
          marginTop: -RING_R,
          borderRadius: '50%',
          border: `1px dashed ${alpha(color.purple[300], 0.22 * ringGlow)}`,
          transform: `rotate(${orbitDeg}deg) scale(${0.85 + ringGlow * 0.15})`,
        }}
      />

      {BROWSERS.map((b, i) => {
        const baseAngle = -90 + (360 / BROWSERS.length) * i
        const a = ((baseAngle + orbitDeg) * Math.PI) / 180
        const r = RING_R * (1 - collapse)

        // Staggered per mark. Moved as one block the middle of the morph is a
        // pile-up — the ring is far more central than the row, so any two marks
        // near the centre cross paths at the same time.
        const at = 56 + i * 7
        const toRing = interpolate(frame, [at, at + 62], [0, 1], {
          ...OUT,
          easing: Easing.out(Easing.cubic),
        })

        const fromX = rowX(i)
        const fromY = ROW_TOP + TILE / 2
        const toX = CX + r * Math.cos(a)
        const toY = CY + r * Math.sin(a)

        // Straight interpolation reads as a mechanical shuffle; bowing each path
        // outward on its own perpendicular makes the sweep look thrown.
        const dx = toX - fromX
        const dy = toY - fromY
        const len = Math.hypot(dx, dy) || 1
        const bow = Math.sin(toRing * Math.PI) * 54

        const x = fromX + dx * toRing - (dy / len) * bow
        const y = fromY + dy * toRing + (dx / len) * bow

        const scale = (1 - toRing * 0.12) * (1 - collapse * 0.55)

        return (
          <div
            key={b.name}
            style={{
              position: 'absolute',
              left: x - TILE / 2,
              top: y - TILE / 2,
              width: TILE,
              height: TILE,
              opacity: appear * (1 - collapse),
              transform: `scale(${scale})`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: -14,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(b.glow, 0.14 * toRing)} 0%, ${alpha(b.glow, 0)} 68%)`,
              }}
            />
            <Img
              src={staticFile(`browsers/${b.file}`)}
              style={{position: 'relative', width: '100%', height: '100%'}}
            />
          </div>
        )
      })}

      {/* names only make sense while the marks are still in a row */}
      {BROWSERS.map((b, i) => (
        <span
          key={`${b.name}-label`}
          style={{
            position: 'absolute',
            left: rowX(i),
            top: ROW_TOP + TILE + 18,
            transform: 'translateX(-50%)',
            fontFamily: font,
            fontSize: 18,
            fontWeight: 600,
            color: alpha(color.purple[50], 0.85),
            opacity: appear * nameFade * (1 - collapse),
            whiteSpace: 'nowrap',
          }}
        >
          {b.name}
        </span>
      ))}

      <Caption
        lines={[
          'One codebase. *Seven browsers.*',
          'Chromium, Gecko and WebKit — from a single source tree.',
        ]}
        start={40}
        stagger={1.2}
        size={40}
        bottom={110}
        dark
      />
    </AbsoluteFill>
  )
}

const BackdropWash: React.FC = () => {
  const frame = useCurrentFrame()

  // Geometry only — no colour wash. The old version put a 1500px purple ellipse
  // behind the ring; against #161617 it glowed like a lens flare.
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '44%',
        width: 880,
        height: 880,
        marginLeft: -440,
        marginTop: -440,
        borderRadius: '50%',
        border: `1px solid ${alpha(color.purple[300], 0.1)}`,
        transform: `scale(${0.9 + Math.sin(frame / 90) * 0.02})`,
      }}
    />
  )
}
