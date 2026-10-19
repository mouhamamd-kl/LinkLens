import React from 'react'
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion'
import {Backdrop, Caption, Eyebrow} from '../components/Chrome'
import {BrowserFrame, Cursor} from '../components/Browser'
import {BlockPage} from '../components/Panel'
import {alpha} from '../lib/anim'
import {color} from '../theme'

/**
 * ACT 5 — beat 2: the block page.
 *
 * The important thing this scene has to communicate is choice, not fear: there
 * is a default that is safe and an escape hatch that is honest about its cost.
 */

const BW = 1600
const BH = 900
const BX = (1920 - BW) / 2
const BY = 80

/** Centre of "Go Back to safety" in the action bar. */
const SAFE_POS = {x: BX + BW - 46 - 10 - 115, y: BY + 104 + (900 - 104) - 46 - 45}

export const BlockPageScene: React.FC = () => {
  const frame = useCurrentFrame()

  const inAt = interpolate(frame, [0, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  const urlFlip = interpolate(frame, [10, 48], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})

  // A red wipe sweeps down the address bar, then the page itself fades up.
  const pageAt = interpolate(frame, [70, 116], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  const safeRing = interpolate(frame, [430, 470], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})

  return (
    <AbsoluteFill>
      <Backdrop tone="brand" seed={6} />
      <Eyebrow text="How it works · 02" start={4} />

      <div
        style={{
          position: 'absolute',
          left: BX,
          top: BY,
          opacity: inAt,
          transform: `scale(${0.98 + inAt * 0.02}) translateY(${(1 - inAt) * 20}px)`,
        }}
      >
        <BrowserFrame url="chrome-extension://linklens/blocked" urlState="blocked" title="We've blocked this website" width={BW} height={BH} appear={1}>
          <BlockPage appear={pageAt} hostname="acme-corp-secure.com" checkboxOn goBackEnabled />
        </BrowserFrame>
      </div>

      {/* ring the safe default */}
      {safeRing > 0 && (
        <div
          style={{
            position: 'absolute',
            left: SAFE_POS.x - 150,
            top: SAFE_POS.y - 48,
            width: 300,
            height: 96,
            borderRadius: 28,
            border: `3px solid ${alpha(color.purple[500], safeRing)}`,
            boxShadow: `0 0 0 8px ${alpha(color.purple[500], safeRing * 0.1)}`,
            opacity: safeRing,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* cursor: land on the safe button, click, then drift away */}
      <Cursor
        path={[
          {x: 760, y: 300},
          SAFE_POS,
          {x: 520, y: 500},
        ]}
        times={[200, 420, 520]}
        clicks={[426]}
        startFrame={0}
      />

      {/* the red wipe over the tab, right as the block lands */}
      <div
        style={{
          position: 'absolute',
          left: BX + 16,
          top: BY + 12,
          width: 300,
          height: 40,
          borderRadius: '12px 12px 0 0',
          background: alpha(color.red[500], urlFlip * 0.12),
          pointerEvents: 'none',
        }}
      />

      <Caption
        lines={['Instead of the site, the tab lands on a *block page*.']}
        start={110}
        stagger={1.2}
        size={40}
        bottom={44}
        outAt={300}
        outDur={18}
      />

      <Caption
        lines={['It names the domain, states the reason,', 'and offers two honest choices.']}
        start={320}
        stagger={1.2}
        size={40}
        bottom={44}
        outAt={430}
        outDur={18}
      />

      <Caption
        lines={['*Go Back to safety* is the default —', 'the page never runs a single line of the attacker’s code.']}
        start={460}
        stagger={1.2}
        size={40}
        bottom={44}
      />
    </AbsoluteFill>
  )
}
