import React from 'react'
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion'
import {Backdrop, Caption} from '../components/Chrome'
import {LensMark} from '../components/UI'
import {alpha} from '../lib/anim'
import {color, font} from '../theme'

/**
 * ACT 6 — the proof.
 *
 * Three numbers, no decoration. The third one is the argument that matters most
 * for a browser extension: nothing about your browsing leaves the machine.
 */

interface Stat {
  to: number
  prefix?: string
  suffix?: string
  label: string
  note: string
  tone: string
  start: number
}

const STATS: Stat[] = [
  {
    to: 2451,
    label: 'Links blocked since install',
    note: 'on this device',
    tone: color.purple[500],
    start: 50,
  },
  {
    to: 20,
    label: 'Blocked in this session',
    note: 'and counting',
    tone: color.red[500],
    start: 150,
  },
  {
    to: 0,
    label: 'Bytes of your browsing',
    note: 'sent anywhere. ever.',
    tone: color.green[500],
    start: 250,
  },
]

const CARD_W = 520
const CARD_H = 400
const GAP = 60

export const Proof: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop tone="brand" seed={9} />

      <div
        style={{
          position: 'absolute',
          left: (1920 - (CARD_W * 3 + GAP * 2)) / 2,
          top: 320,
          display: 'flex',
          gap: GAP,
        }}
      >
        {STATS.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <Caption
        lines={['Every one of those numbers was counted *on your own machine.*']}
        start={330}
        stagger={1.2}
        size={42}
        bottom={120}
      />
    </AbsoluteFill>
  )
}

const StatCard: React.FC<{stat: Stat}> = ({stat}) => {
  const frame = useCurrentFrame()

  const at = interpolate(frame, [stat.start, stat.start + 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })

  const count = interpolate(frame, [stat.start + 10, stat.start + 80], [0, stat.to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 4),
  })

  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        borderRadius: 26,
        background: color.grey[50],
        boxShadow: `0 0 0 1px ${color.grey[300]}, 0 40px 80px -40px ${alpha(color.shadow, 0.5)}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        opacity: at,
        transform: `translateY(${(1 - at) * 30}px)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* tint wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to bottom, ${alpha(stat.tone, 0.07)}, ${alpha(stat.tone, 0)})`,
        }}
      />

      <div
        style={{
          position: 'relative',
          fontFamily: font,
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          color: stat.tone,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {stat.prefix}
        {Math.round(count).toLocaleString('en-US')}
        {stat.suffix}
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: font,
            fontSize: 22,
            fontWeight: 600,
            color: color.grey[800],
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}
        >
          {stat.label}
        </span>
        <span style={{fontFamily: font, fontSize: 18, fontWeight: 500, color: color.grey[400]}}>{stat.note}</span>
      </div>
    </div>
  )
}

/** Reusable lockup for the closing card — kept here so both scenes match. */
export const ClosingLockup: React.FC<{scale?: number}> = ({scale = 1}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${scale})`}}>
    <LensMark size={74} id="close" />
    <span
      style={{
        fontFamily: font,
        fontSize: 88,
        fontWeight: 700,
        letterSpacing: '-0.045em',
        color: '#fff',
      }}
    >
      LinkLens
    </span>
  </div>
)
