import React from 'react'
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion'
import {Backdrop, Caption, Eyebrow} from '../components/Chrome'
import {ShieldIcon} from '../components/UI'
import {alpha} from '../lib/anim'
import {color, font, mono} from '../theme'

/**
 * ACT 5 — beat 1: interception at the network layer.
 *
 * The claim being made is specific: the request is never issued, so there is no
 * "loaded a little, then hid" moment and no race to beat. The animation has to
 * show the packet being stopped, not the page being hidden.
 */

const LINE_Y = 400
const LINE_X0 = 430
const LINE_X1 = 1490
const GATE_X = 960

/* Declared above RULE_LINES because the rule body references them at module
 * evaluation time — as consts below it they would be in the TDZ. */
const Key: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{color: color.purple[300]}}>{children}</span>
)
const Str: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{color: color.green[300]}}>{children}</span>
)
const Num: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{color: color.orange[500]}}>{children}</span>
)

const RULE_LINES: {content: React.ReactNode; indent?: number}[] = [
  {content: '{'},
  {content: <><Key>id</Key>: <Num>2</Num>,</>},
  {content: <><Key>priority</Key>: <Num>1</Num>,</>},
  {content: <><Key>action</Key>: {'{'}</>},
  {content: <><Key>type</Key>: <Str>"redirect"</Str>,</>, indent: 2},
  {content: <><Key>redirect</Key>: {'{'} <Key>extensionPath</Key>: <Str>"/locked.html"</Str> {'}'}</>, indent: 2},
  {content: '}'},
  {content: <><Key>condition</Key>: {'{'}</>},
  {content: <><Key>urlFilter</Key>: <Str>"||mgeko.cc^"</Str>,</>, indent: 2},
  {content: <><Key>resourceTypes</Key>: [<Key>main_frame</Key>, <Key>script</Key>, …]</>, indent: 2},
  {content: '}'},
  {content: '}'},
]

export const NetworkLayer: React.FC = () => {
  const frame = useCurrentFrame()

  const lineDraw = interpolate(frame, [50, 140], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const browserAt = interpolate(frame, [10, 54], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  const gateAt = interpolate(frame, [120, 170], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})

  // Packet flies right and stops dead at the gate.
  const packetX = interpolate(frame, [150, 258], [LINE_X0, GATE_X - 74], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 1.4),
  })

  const caught = frame >= 258
  const flash = caught
    ? interpolate(frame, [258, 274, 316], [0, 1, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 0

  const stampAt = interpolate(frame, [300, 340], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })

  const serverDim = caught ? interpolate(frame, [258, 300], [1, 0.28], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1

  return (
    <AbsoluteFill>
      <Backdrop tone="brand" seed={5} />
      <Eyebrow text="How it works · 01" start={4} />

      {/* pipeline */}
      <div style={{position: 'absolute', inset: 0}}>
        {/* wire */}
        <div
          style={{
            position: 'absolute',
            left: LINE_X0,
            top: LINE_Y,
            height: 3,
            width: (LINE_X1 - LINE_X0) * lineDraw,
            background: `linear-gradient(to right, ${color.purple[300]}, ${alpha(color.purple[300], 0.35)})`,
            borderRadius: 2,
          }}
        />

        {/* browser node */}
        <Node x={300} appear={browserAt} label="Browser tab" sub="acme-corp-secure.com" tone="grey" />

        {/* LinkLens gate */}
        <div
          style={{
            position: 'absolute',
            left: GATE_X,
            top: LINE_Y,
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            opacity: gateAt,
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(caught ? color.red[500] : color.purple[500], 0.32 + flash * 0.3)} 0%, ${alpha(color.purple[500], 0)} 70%)`,
              transform: 'scale(1)',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: 128,
              height: 128,
              borderRadius: 26,
              background: color.grey[50],
              boxShadow: `0 0 0 2px ${caught ? color.red[500] : color.purple[500]}, 0 20px 50px -15px ${alpha(color.shadow, 0.4)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldIcon size={62} color={caught ? color.red[500] : color.purple[500]} />
          </div>
          <span
            style={{
              fontFamily: font,
              fontSize: 17,
              fontWeight: 700,
              color: color.grey[800],
              letterSpacing: '-0.01em',
            }}
          >
            LinkLens
          </span>
          <span style={{fontFamily: mono, fontSize: 12, color: color.grey[400]}}>declarativeNetRequest</span>
        </div>

        {/* destination node */}
        <Node x={1660} appear={browserAt} label="The site" sub="would have loaded" tone="grey" dim={serverDim} />

        {/* travelling packet */}
        <div
          style={{
            position: 'absolute',
            left: packetX,
            top: LINE_Y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: caught ? color.red[500] : color.purple[500],
              boxShadow: `0 0 0 ${caught ? 10 : 18}px ${alpha(caught ? color.red[500] : color.purple[500], 0.16 + flash * 0.2)}`,
            }}
          />
        </div>

        {/*
          Label sits to the LEFT of the dot, right-aligned. Centring it on the
          dot slid it under the gate's 128px box once the packet stopped there.
        */}
        <div
          style={{
            position: 'absolute',
            left: packetX - 28,
            top: LINE_Y - 30,
            transform: 'translateX(-100%)',
            fontFamily: mono,
            fontSize: 12,
            fontWeight: 600,
            color: caught ? color.red[600] : color.purple[600],
            background: color.grey[50],
            padding: '4px 10px',
            borderRadius: 8,
            boxShadow: `0 0 0 1px ${alpha(caught ? color.red[400] : color.purple[300], 0.8)}`,
            whiteSpace: 'nowrap',
          }}
        >
          GET /verify/login
        </div>

        {/* blocked stamp */}
        {caught && (
          <div
            style={{
              position: 'absolute',
              left: GATE_X - 240,
              top: LINE_Y - 190,
              opacity: stampAt,
              transform: `scale(${0.86 + stampAt * 0.14}) rotate(${(1 - stampAt) * -6}deg)`,
              padding: '14px 26px',
              borderRadius: 14,
              background: color.red[500],
              color: '#fff',
              fontFamily: font,
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: `0 20px 50px -12px ${alpha(color.red[500], 0.7)}`,
            }}
          >
            Blocked
          </div>
        )}
      </div>

      {/* the rule that did it */}
      <div
        style={{
          position: 'absolute',
          left: (1920 - 860) / 2,
          top: 545,
          width: 860,
          opacity: interpolate(frame, [300, 340], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          transform: `translateY(${interpolate(frame, [300, 340], [20, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 14,
            lineHeight: 1.7,
            padding: '26px 32px',
            borderRadius: 18,
            background: color.grey[50],
            boxShadow: `0 40px 80px -30px ${alpha(color.shadow, 0.6)}`,
            color: color.grey[600],
          }}
        >
          {RULE_LINES.map((l, i) => {
            const at = 320 + i * 11
            const p = interpolate(frame, [at, at + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})

            return (
              <div key={i} style={{opacity: p, transform: `translateX(${(1 - p) * -8}px)`, paddingLeft: (l.indent ?? 0) * 22}}>
                {l.content}
              </div>
            )
          })}
        </div>
      </div>

      <Caption
        lines={['The request is matched at the *network layer* —', 'before a single pixel of the page can load.']}
        start={120}
        stagger={1.2}
        size={42}
        bottom={56}
      />
    </AbsoluteFill>
  )
}

const Node: React.FC<{x: number; appear: number; label: string; sub: string; tone: 'grey'; dim?: number}> = ({
  x,
  appear,
  label,
  sub,
  dim = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: LINE_Y,
      transform: `translate(-50%, -50%) scale(${0.9 + appear * 0.1})`,
      opacity: appear * dim,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
    }}
  >
    <div
      style={{
        width: 148,
        height: 96,
        borderRadius: 14,
        background: color.grey[50],
        boxShadow: `0 0 0 1.5px ${color.grey[300]}, 0 20px 40px -22px ${alpha(color.shadow, 0.4)}`,
        overflow: 'hidden',
      }}
    >
      <div style={{height: 22, background: color.grey[200], borderBottom: `1px solid ${color.grey[300]}`}} />
      <div style={{padding: 12, display: 'flex', flexDirection: 'column', gap: 7}}>
        <div style={{height: 7, width: '70%', borderRadius: 4, background: color.grey[200]}} />
        <div style={{height: 7, width: '45%', borderRadius: 4, background: color.grey[200]}} />
        <div style={{height: 7, width: '58%', borderRadius: 4, background: color.grey[200]}} />
      </div>
    </div>
    <span style={{fontFamily: font, fontSize: 16, fontWeight: 700, color: color.grey[800]}}>
      {label}
    </span>
    <span style={{fontFamily: mono, fontSize: 12, color: color.grey[400]}}>{sub}</span>
  </div>
)
