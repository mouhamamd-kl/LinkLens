import React from 'react'
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion'
import {Backdrop, Caption, Eyebrow} from '../components/Chrome'
import {BrowserFrame} from '../components/Browser'
import {FakeLogin, LinkLensPanel} from '../components/Panel'
import {alpha, slideIn} from '../lib/anim'
import {color} from '../theme'

/**
 * ACT 5 — beat 3: the side panel.
 *
 * This is the "it is always there" beat. The block page is a moment; the panel is
 * a persistent presence, so the animation docks it rather than cutting to it.
 */

const BW = 1560
const BH = 820
const BX = (1920 - BW) / 2
const BY = 110

const PANEL_W = 400

/** Ease a number up to `to`, with a digit-roll feel via rounding. */
const CountUp: React.FC<{to: number; start: number; dur: number; pad?: number}> = ({to, start, dur, pad}) => {
  const frame = useCurrentFrame()
  const p = interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })
  const n = Math.round(p * to)

  return <>{pad ? String(n).padStart(pad, '0') : n.toLocaleString('en-US')}</>
}

export const SidePanelScene: React.FC = () => {
  const frame = useCurrentFrame()

  const inAt = interpolate(frame, [0, 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  const panelX = slideIn(frame, 56, 40, BW)

  const warn = interpolate(frame, [240, 290], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  const prot = interpolate(frame, [330, 380], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  const stats = interpolate(frame, [400, 450], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  const act = interpolate(frame, [470, 510], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})

  // Activity rows land one after another.
  const rowCount = frame < 540 ? 0 : frame < 590 ? 1 : frame < 640 ? 2 : 3

  return (
    <AbsoluteFill>
      <Backdrop tone="brand" seed={7} />
      <Eyebrow text="How it works · 03" start={4} />

      <div
        style={{
          position: 'absolute',
          left: BX,
          top: BY,
          opacity: inAt,
          transform: `scale(${0.98 + inAt * 0.02})`,
        }}
      >
        <BrowserFrame url="https://acme-corp-secure.com/verify/login" title="Sign in — Acme Corp" width={BW} height={BH} appear={1}>
          {/* the page the panel is protecting, pushed aside by the dock */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: BW - PANEL_W,
              overflow: 'hidden',
              filter: 'saturate(0.85)',
            }}
          >
            <FakeLogin showEmail showPassword={false} />
          </div>

          {/* the dock — slides in from the right edge of the viewport */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: PANEL_W,
              transform: `translateX(${panelX}px)`,
              boxShadow: `-18px 0 40px -24px ${alpha(color.shadow, 0.5)}`,
            }}
          >
            <LinkLensPanel
              width={PANEL_W}
              warning={warn}
              protection={prot}
              stats={stats}
              activity={act}
              activityCount={rowCount}
              sessionCount={<CountUp to={20} start={430} dur={40} />}
              installCount={<CountUp to={2451} start={430} dur={70} />}
              blockedUrl="https://acme-corp-secure.com/verify/login"
            />
          </div>
        </BrowserFrame>
      </div>

      <Caption
        lines={['And a side panel that stays with you on *every* page.']}
        start={200}
        stagger={1.2}
        size={40}
        bottom={44}
        outAt={420}
        outDur={18}
      />

      <Caption
        lines={['!*2,451* links blocked since install* — counted on your own machine.']}
        start={450}
        stagger={1.2}
        size={40}
        bottom={44}
      />
    </AbsoluteFill>
  )
}
