import React from 'react'
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion'
import {alpha} from '../lib/anim'
import {color, font} from '../theme'

/**
 * The close. Six seconds, one mark, no new information.
 *
 * Act 7 ends with the browser ring collapsed to a point; that point is where
 * this logo grows out of, so the two cuts read as one continuous move rather
 * than a cut between slides.
 */

const OUT = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const

/** viewBox is 120x42 — ~2.857:1. Kept exact so the lockup never distorts. */
const LOGO_W = 660
const LOGO_H = LOGO_W / (120 / 42)

export const Close: React.FC = () => {
  const frame = useCurrentFrame()

  // Grows out of the collapsed ring, overshooting slightly.
  const bloom = interpolate(frame, [6, 62], [0, 1], {
    ...OUT,
    easing: Easing.out(Easing.cubic),
  })

  // Shockwave, one pass only.
  const wave = interpolate(frame, [6, 86], [0, 1], OUT)

  const tagline = interpolate(frame, [70, 104], [0, 1], {...OUT, easing: Easing.out(Easing.cubic)})
  const cta = interpolate(frame, [116, 150], [0, 1], OUT)

  // Rings drift outward behind the mark.
  const ringA = interpolate(frame, [20, 180], [0.55, 1.35], OUT)
  const ringB = interpolate(frame, [40, 180], [0.45, 1.15], OUT)

  return (
    <AbsoluteFill style={{background: color.bg}}>
      {/*
        No ambient glow here either. The mark is white-on-near-black and needs
        no lift behind it — a 1300px purple ellipse was the only thing on screen
        that looked generated.
      */}

      {[ringA, ringB].map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '46%',
            width: 720 - i * 190,
            height: 720 - i * 190,
            marginLeft: -(720 - i * 190) / 2,
            marginTop: -(720 - i * 190) / 2,
            borderRadius: '50%',
            border: `1px solid ${alpha(color.purple[300], (0.18 - i * 0.06) * (1 - (r - 0.55) / 0.8))}`,
            transform: `scale(${r})`,
          }}
        />
      ))}

      {wave > 0 && wave < 1 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '46%',
            width: 300 + wave * 1100,
            height: 300 + wave * 1100,
            marginLeft: -(300 + wave * 1100) / 2,
            marginTop: -(300 + wave * 1100) / 2,
            borderRadius: '50%',
            border: `1.5px solid ${alpha(color.purple[300], 0.5 * (1 - wave))}`,
          }}
        />
      )}

      {/* the logo */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '46%',
          width: LOGO_W,
          height: LOGO_H,
          marginLeft: -LOGO_W / 2,
          marginTop: -LOGO_H / 2,
          opacity: bloom,
          transform: `scale(${0.62 + bloom * 0.38})`,
        }}
      >
        <Img
          src={staticFile('logo/logo-white-text.svg')}
          style={{width: '100%', height: '100%'}}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '58%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            opacity: tagline,
            transform: `translateY(${(1 - tagline) * 16}px)`,
            fontFamily: font,
            fontSize: 30,
            fontWeight: 500,
            color: alpha(color.purple[50], 0.78),
          }}
        >
          <span
            style={{
              width: 48,
              height: 1.5,
              background: color.purple[400],
              transform: `scaleX(${tagline})`,
              transformOrigin: 'left',
            }}
          />
          Know what a link really is
          <span
            style={{
              width: 48,
              height: 1.5,
              background: color.purple[400],
              transform: `scaleX(${tagline})`,
              transformOrigin: 'right',
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 130,
          display: 'flex',
          justifyContent: 'center',
          opacity: cta,
          transform: `translateY(${(1 - cta) * 14}px)`,
        }}
      >
        <span
          style={{
            fontFamily: font,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: color.purple[300],
          }}
        >
          Thank you
        </span>
      </div>
    </AbsoluteFill>
  )
}
