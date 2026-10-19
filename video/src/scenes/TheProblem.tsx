import React from 'react'
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion'
import {Backdrop, Caption} from '../components/Chrome'
import {alpha} from '../lib/anim'
import {color, font, mono} from '../theme'

/**
 * ACT 3 — the problem.
 *
 * Three sites, pixel-identical pages, three different destinations. The swap is
 * the argument: the body of the page carries zero signal, so the only thing left
 * to judge by is a 13px string in the address bar.
 */

const REAL = 'https://acme.com/login'
const FAKE_1 = 'https://acme-corp-secure.com/login'
const FAKE_2 = 'https://acme-verify.account-id.com/login'

const SITES = [REAL, FAKE_1, FAKE_2]
const LABELS = ['The real one', 'A fake', 'Another fake']

const CARD_W = 520
const CARD_H = 540
const GAP = 60

export const TheProblem: React.FC = () => {
  const frame = useCurrentFrame()

  const cardsIn = [0, 40, 80].map((d) =>
    interpolate(frame, [d, d + 46], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: (t) => 1 - Math.pow(1 - t, 3),
    }),
  )

  // The swap happens once, all three at the same moment, so the eye reads it as
  // "the page did not change" rather than "three things happened".
  const swap = interpolate(frame, [210, 270], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const urlPop = interpolate(frame, [300, 350], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })

  return (
    <AbsoluteFill>
      <Backdrop tone="brand" seed={3} />

      <div
        style={{
          position: 'absolute',
          left: (1920 - (CARD_W * 3 + GAP * 2)) / 2,
          top: 250,
          display: 'flex',
          gap: GAP,
        }}
      >
        {SITES.map((site, i) => (
          <SiteCard
            key={site}
            index={i}
            url={REAL}
            realUrl={site}
            swap={swap}
            appear={cardsIn[i]!}
            urlPop={urlPop}
            label={LABELS[i]!}
          />
        ))}
      </div>

      {/* A scanning rule sweeps across the cards to underline "identical" */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 250,
          height: CARD_H,
          width: 2,
          background: `linear-gradient(to bottom, ${alpha(color.purple[500], 0)}, ${color.purple[400]}, ${alpha(color.purple[500], 0)})`,
          opacity: 0.7,
          transform: `translateX(${interpolate(frame, [150, 260], [-40, 1960], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: (t) => 1 - Math.pow(1 - t, 3),
          })}px)`,
        }}
      />

      <Caption
        lines={[
          'Three sites. *One identical page.*',
          'The only signal is a string !13 pixels long!',
        ]}
        start={140}
        stagger={1.4}
        size={44}
        bottom={108}
      />
    </AbsoluteFill>
  )
}

const SiteCard: React.FC<{
  index: number
  url: string
  realUrl: string
  swap: number
  appear: number
  urlPop: number
  label: string
}> = ({index, url, realUrl, swap, appear, urlPop, label}) => {
  // Cards 1 and 2 stay muted until the swap reveals what they really are.
  const revealed = index === 0 ? 1 : swap
  const bad = index > 0

  return (
    <div
      style={{
        width: CARD_W,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 28}px)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* address strip */}
      <div
        style={{
          height: 52,
          borderRadius: 14,
          background: color.grey[50],
          boxShadow: `0 0 0 1.5px ${bad ? alpha(color.red[400], revealed) : color.grey[300]}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
          transform: `scale(${1 + urlPop * 0.03})`,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: bad ? alpha(color.red[500], revealed) : color.green[500],
            flex: 'none',
          }}
        />
        {/* crossfade between the two hosts */}
        <div style={{position: 'relative', flex: 1, height: 20, overflow: 'hidden'}}>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              fontFamily: mono,
              fontSize: 13,
              fontWeight: 600,
              color: color.grey[500],
              opacity: 1 - swap,
            }}
          >
            {url}
          </span>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              fontFamily: mono,
              fontSize: 13,
              fontWeight: 600,
              color: bad ? color.red[600] : color.grey[500],
              opacity: swap,
            }}
          >
            {realUrl}
          </span>
        </div>
      </div>

      {/* page body — byte-for-byte the same across all three */}
      <div
        style={{
          height: CARD_H - 66,
          borderRadius: 18,
          background: color.grey[50],
          boxShadow: `0 0 0 1px ${color.grey[300]}, 0 30px 60px -30px ${alpha(color.shadow, 0.35)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          padding: 32,
          fontFamily: font,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <div style={{width: 30, height: 30, borderRadius: 9, background: color.purple[500]}} />
          <span style={{fontSize: 19, fontWeight: 700, color: color.grey[800], letterSpacing: '-0.02em'}}>
            Acme Corp
          </span>
        </div>

        <MiniField label="Email" />
        <MiniField label="Password" />

        <div
          style={{
            width: '100%',
            height: 42,
            borderRadius: 12,
            background: color.purple[500],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Sign in
        </div>
      </div>

      {/* verdict */}
      <div
        style={{
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          background: bad ? alpha(color.red[500], 0.08 * revealed) : color.green[50],
          fontFamily: font,
          fontSize: 14,
          fontWeight: 600,
          color: bad ? alpha(color.red[500], revealed) : color.green[600],
          opacity: revealed,
        }}
      >
        {label}
      </div>
    </div>
  )
}

const MiniField: React.FC<{label: string}> = ({label}) => (
  <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: 6}}>
    <span style={{fontSize: 12, fontWeight: 600, color: color.grey[500], fontFamily: font}}>{label}</span>
    <div
      style={{
        height: 42,
        borderRadius: 12,
        boxShadow: `inset 0 0 0 1.4px ${color.grey[300]}`,
      }}
    />
  </div>
)
