import React from 'react'
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion'
import {Backdrop, Caption, Eyebrow} from '../components/Chrome'
import {BrowserFrame, Cursor} from '../components/Browser'
import {BlockPage} from '../components/Panel'
import {alpha} from '../lib/anim'
import {color, font, mono} from '../theme'

/**
 * ACT 5 — beat 4: overriding the block.
 *
 * A security tool that cannot be argued with is a bug report waiting to happen.
 * This beat exists to show that "Continue anyway" installs a *scoped, reversible*
 * allow-rule rather than switching protection off.
 */

const MW = 760
const MH = 470

export const ControlScene: React.FC = () => {
  const frame = useCurrentFrame()

  const inAt = interpolate(frame, [0, 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})

  const clickAt = 132
  const ruleAt = interpolate(frame, [170, 210], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  const scopedAt = interpolate(frame, [330, 370], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})

  return (
    <AbsoluteFill>
      <Backdrop tone="brand" seed={8} />
      <Eyebrow text="How it works · 04" start={4} />

      {/* left: the choice */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 300,
          opacity: inAt,
          transform: `translateX(${(1 - inAt) * -24}px)`,
        }}
      >
        <BrowserFrame
          url="chrome-extension://linklens/blocked"
          urlState="blocked"
          title="We've blocked this website"
          width={MW}
          height={MH}
          appear={1}
        >
          <BlockPage appear={1} hostname="acme-corp-secure.com" checkboxOn goBackEnabled />
        </BrowserFrame>
      </div>

      {/* cursor clicking "Continue to the site" */}
      <Cursor
        path={[
          {x: 330, y: 430},
          {x: 330, y: 690},
        ]}
        times={[70, 126]}
        clicks={[clickAt]}
      />

      {/* connector */}
      <div
        style={{
          position: 'absolute',
          left: 910,
          top: 520,
          width: 110,
          height: 3,
          background: `linear-gradient(to right, ${alpha(color.purple[400], ruleAt)}, ${alpha(color.purple[400], 0)})`,
          opacity: ruleAt,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 1010,
          top: 512,
          fontSize: 30,
          color: color.purple[500],
          opacity: ruleAt,
          transform: `translateX(${interpolate(frame, [170, 200], [-16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`,
        }}
      >
        →
      </div>

      {/* right: the rule that gets installed */}
      <div
        style={{
          position: 'absolute',
          left: 1050,
          top: 300,
          width: 760,
          opacity: ruleAt,
          transform: `translateX(${(1 - ruleAt) * 24}px)`,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 17,
            lineHeight: 1.9,
            padding: '28px 34px',
            borderRadius: 18,
            background: color.grey[50],
            boxShadow: `0 40px 80px -30px ${alpha(color.shadow, 0.6)}`,
            color: color.grey[600],
          }}
        >
          <Rline n={0} frame={frame} at={185}>
            {'{'}
          </Rline>
          <Rline n={1} frame={frame} at={200}>
            <K>id</K>: <Num>900412</Num>, <D>// hashed from the domain</D>
          </Rline>
          <Rline n={2} frame={frame} at={215}>
            <K>priority</K>: <Num>1</Num>,
          </Rline>
          <Rline n={3} frame={frame} at={230}>
            <K>action</K>: {'{'} <K>type</K>: <Str>"allow"</Str> {'}'},
          </Rline>
          <Rline n={4} frame={frame} at={245}>
            <K>condition</K>: {'{'} <K>urlFilter</K>: <Str>"||acme-corp-secure.com^"</Str> {'}'},
          </Rline>
          <Rline n={5} frame={frame} at={260}>
            {'}'}
          </Rline>
        </div>

        {/* scoping badge */}
        <div
          style={{
            marginTop: 22,
            display: 'flex',
            gap: 12,
            opacity: scopedAt,
            transform: `translateY(${(1 - scopedAt) * 12}px)`,
          }}
        >
          <Badge tone="green" label="This domain only" />
          <Badge tone="grey" label="Dies with the browser" />
          <Badge tone="grey" label="Reversible any time" />
        </div>
      </div>

      <Caption
        lines={[
          'Say yes, and LinkLens does *not* switch protection off.',
          'It installs a !scoped allow-rule! — this domain, this session, reversible.',
        ]}
        start={200}
        stagger={1.2}
        size={40}
        bottom={70}
      />
    </AbsoluteFill>
  )
}

const Rline: React.FC<{n: number; frame: number; at: number; children: React.ReactNode}> = ({frame, at, children}) => {
  const p = interpolate(frame, [at, at + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})

  return (
    <div style={{opacity: p, transform: `translateX(${(1 - p) * -10}px)`, whiteSpace: 'pre'}}>
      {children}
    </div>
  )
}

const Badge: React.FC<{tone: 'green' | 'grey'; label: string}> = ({tone, label}) => {
  const map = {
    green: {bg: color.green[50], fg: color.green[600], bd: color.green[200]},
    grey: {bg: color.grey[50], fg: color.grey[500], bd: color.grey[300]},
  }[tone]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 34,
        padding: '0 16px',
        borderRadius: 999,
        background: map.bg,
        boxShadow: `inset 0 0 0 1px ${map.bd}`,
        color: map.fg,
        fontFamily: font,
        fontSize: 15,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  )
}

const K: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: color.purple[300]}}>{children}</span>
const Str: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: color.green[300]}}>{children}</span>
const Num: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: color.orange[500]}}>{children}</span>
const D: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: color.grey[600]}}>{children}</span>
