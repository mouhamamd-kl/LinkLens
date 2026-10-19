import React from 'react'
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion'
import {alpha, spin} from '../lib/anim'
import {color, font} from '../theme'

/**
 * ACT 4 — the reveal.
 *
 * The only scene with a deep purple background until the finale. Everything
 * before it is light and busy; this is the first still frame in the video, which
 * is what lets the mark land.
 *
 * Uses the real lockup from `public/logo/` rather than a drawn wordmark, so the
 * mark in the video is the mark that ships in the store listing.
 */

const OUT = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const

/** viewBox 120x42. Held exact so the lockup is never stretched. */
const LOGO_W = 620
const LOGO_H = LOGO_W / (120 / 42)

export const Reveal: React.FC = () => {
  const frame = useCurrentFrame()

  const dark = interpolate(frame, [0, 36], [0, 1], OUT)

  const iris = interpolate(frame, [26, 104], [0, 1], {...OUT, easing: Easing.out(Easing.cubic)})

  const markPop = interpolate(frame, [64, 128], [0, 1], {...OUT, easing: Easing.out(Easing.cubic)})

  const tagline = interpolate(frame, [150, 194], [0, 1], {...OUT, easing: Easing.out(Easing.cubic)})

  return (
    <AbsoluteFill style={{background: color.bg}}>
      <AbsoluteFill style={{background: color.bg, opacity: dark}} />

      {/*
        The iris is the one gradient left in the video, and it earns its place:
        it is the lens opening, it is animated on a 78-frame ramp, and it is
        centred on the subject. Tightened from a 900px falloff to a 620px one so
        it reads as a lens rather than a backdrop.
      */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '46%',
          width: 620,
          height: 620,
          marginLeft: -310,
          marginTop: -310,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(color.purple[500], 0.16)} 0%, ${alpha(color.purple[700], 0.05)} 55%, ${alpha(color.bg, 0)} 72%)`,
          transform: `scale(${0.5 + iris * 0.5})`,
          opacity: iris,
        }}
      />

      {/* counter-rotating lens rings */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '46%',
            width: 620 - i * 150,
            height: 620 - i * 150,
            marginLeft: -(620 - i * 150) / 2,
            marginTop: -(620 - i * 150) / 2,
            borderRadius: '50%',
            border: `1px solid ${alpha(color.purple[300], 0.25 - i * 0.08)}`,
            transform: `rotate(${spin(frame, i === 0 ? 8 : -6) * (0.4 + iris)}deg) scale(${0.6 + iris * 0.4})`,
            opacity: iris,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '46%',
          width: 760,
          height: 760,
          marginLeft: -380,
          marginTop: -380,
          borderRadius: '50%',
          border: `1.5px dashed ${alpha(color.purple[300], 0.22)}`,
          transform: `rotate(${spin(frame, -4)}deg) scale(${0.5 + iris * 0.5})`,
          opacity: iris,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '38%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: LOGO_W,
            height: LOGO_H,
            opacity: markPop,
            transform: `scale(${0.72 + markPop * 0.28}) translateY(${(1 - markPop) * 20}px)`,
          }}
        >
          <Img
            src={staticFile('logo/logo-white-text.svg')}
            style={{width: '100%', height: '100%'}}
          />
        </div>

        <div
          style={{
            opacity: tagline,
            transform: `translateY(${(1 - tagline) * 16}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontFamily: font,
            fontSize: 30,
            fontWeight: 500,
            color: alpha(color.purple[50], 0.75),
          }}
        >
          <span style={{width: 40, height: 1.5, background: color.purple[400]}} />
          Look closer at every link
          <span style={{width: 40, height: 1.5, background: color.purple[400]}} />
        </div>
      </div>
    </AbsoluteFill>
  )
}
