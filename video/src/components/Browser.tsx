import React from 'react'
import {interpolate, useCurrentFrame} from 'remotion'
import {CLAMP, alpha} from '../lib/anim'
import {color, font, mono} from '../theme'

/**
 * Browser shell used across every scene, so the whole video reads as "one
 * continuous browsing session" rather than a slideshow of mockups.
 */
export const BrowserFrame: React.FC<{
  url: string
  urlState?: 'neutral' | 'blocked' | 'safe'
  /** Tab title. */
  title?: string
  width?: number
  height?: number
  /** 0 = not yet mounted, 1 = fully in. */
  appear?: number
  children?: React.ReactNode
  style?: React.CSSProperties
}> = ({
  url,
  urlState = 'neutral',
  title = 'New Tab',
  width = 1560,
  height = 880,
  appear = 1,
  children,
  style,
}) => {
  const accent =
    urlState === 'blocked'
      ? color.red[500]
      : urlState === 'safe'
        ? color.green[500]
        : color.grey[300]

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 18,
        overflow: 'hidden',
        background: color.grey[50],
        boxShadow: `0 50px 120px -30px ${alpha(color.shadow, 0.35)}, 0 0 0 1px ${alpha(color.grey[300], 0.9)}`,
        display: 'flex',
        flexDirection: 'column',
        opacity: appear,
        transform: `scale(${0.97 + 0.03 * appear})`,
        ...style,
      }}
    >
      {/* Tab strip + address bar */}
      <div
        style={{
          background: color.grey[200],
          borderBottom: `1px solid ${color.grey[300]}`,
          paddingTop: 12,
          flex: 'none',
        }}
      >
        <div style={{display: 'flex', alignItems: 'flex-end', padding: '0 16px'}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: 300,
              height: 40,
              padding: '0 16px',
              borderRadius: '12px 12px 0 0',
              background: color.grey[50],
              fontFamily: font,
              fontSize: 13,
              fontWeight: 600,
              color: color.grey[700],
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: urlState === 'blocked' ? color.red[500] : color.purple[500],
                flex: 'none',
              }}
            />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            height: 52,
            padding: '0 20px',
            background: color.grey[50],
          }}
        >
          {/* nav glyphs */}
          <div style={{display: 'flex', gap: 8, opacity: 0.4}}>
            <NavGlyph d="M15 18l-6-6 6-6" />
            <NavGlyph d="M9 18l6-6-6-6" />
          </div>

          {/* address bar */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              height: 36,
              padding: '0 14px',
              borderRadius: 18,
              background: urlState === 'neutral' ? color.grey[200] : alpha(accent, 0.08),
              boxShadow: `inset 0 0 0 1px ${urlState === 'neutral' ? 'transparent' : alpha(accent, 0.45)}`,
            }}
          >
            <span style={{display: 'flex', opacity: urlState === 'blocked' ? 1 : 0.45}}>
              {urlState === 'blocked' ? <WarnGlyph /> : <LockGlyph />}
            </span>
            <span
              style={{
                fontFamily: mono,
                fontSize: 13,
                fontWeight: 500,
                color: urlState === 'blocked' ? color.red[300] : color.grey[400],
                letterSpacing: '-0.01em',
              }}
            >
              {url}
            </span>
          </div>
        </div>
      </div>

      {/* page viewport */}
      <div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>{children}</div>
    </div>
  )
}

const NavGlyph: React.FC<{d: string}> = ({d}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d={d}
      stroke={color.grey[400]}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const LockGlyph: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    {/* Explicit, not currentColor: these inherit the document's default colour,
        which is black — invisible against the dark chrome. */}
    <rect x="4" y="10" width="16" height="11" rx="2.5" fill={color.grey[400]} />
    <path d="M8 10V7a4 4 0 018 0v3" stroke={color.grey[400]} strokeWidth="2.2" />
  </svg>
)

const WarnGlyph: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3l9.5 17H2.5L12 3z"
      fill={color.red[500]}
      stroke={color.red[600]}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <rect x="11" y="9" width="2" height="6" rx="1" fill="#fff" />
    <circle cx="12" cy="17.4" r="1.2" fill="#fff" />
  </svg>
)

/**
 * Mouse cursor driven by keyframes. Each segment gets its own easing window, so
 * a "move then click" beat reads as two distinct events rather than one drift.
 */
export const Cursor: React.FC<{
  path: {x: number; y: number}[]
  /** Frame at which the cursor arrives at path[i]. */
  times: number[]
  startFrame?: number
  scale?: number
  /** Click ripples, as frames. */
  clicks?: number[]
}> = ({path, times, startFrame = 0, scale = 1, clicks = []}) => {
  const frame = useCurrentFrame()
  const f = frame - startFrame

  if (f < 0) return null

  const x = sample(f, path, times, (p) => p.x)
  const y = sample(f, path, times, (p) => p.y)

  const clickProgress = clicks.length
    ? clicks.map((c) => Math.max(0, 1 - Math.abs(f - c) / 7))
    : []

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        zIndex: 70,
        pointerEvents: 'none',
        transform: `scale(${scale})`,
      }}
    >
      {clickProgress.map((p, i) =>
        p > 0 ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: -2,
              top: -2,
              width: 18 + (1 - p) * 40,
              height: 18 + (1 - p) * 40,
              borderRadius: '50%',
              border: `2px solid ${alpha(color.purple[500], p * 0.8)}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ) : null,
      )}
      <svg width="28" height="28" viewBox="0 0 24 24" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>
        <path
          d="M5 2.5l0 16.2 4.3-4.1 2.7 6.1 3.1-1.4-2.7-6 5.6-0.2L5 2.5z"
          fill="#ffffff"
          stroke={color.grey[800]}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

const sample = (
  f: number,
  path: {x: number; y: number}[],
  times: number[],
  pick: (p: {x: number; y: number}) => number,
): number => {
  if (path.length === 0) return 0
  if (f <= times[0]!) return pick(path[0]!)

  for (let i = 0; i < path.length - 1; i++) {
    const t0 = times[i]!
    const t1 = times[i + 1]!

    if (f <= t1) {
      return interpolate(f, [t0, t1], [pick(path[i]!), pick(path[i + 1]!)], {
        ...CLAMP,
      })
    }
  }

  return pick(path[path.length - 1]!)
}

/** Real content-script pill the extension injects onto every page. */
export const ContentPill: React.FC<{appear?: number}> = ({appear = 1}) => (
  <div
    style={{
      position: 'absolute',
      bottom: 26,
      right: 26,
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      height: 40,
      padding: '0 16px 0 12px',
      borderRadius: 20,
      background: color.grey[50],
      boxShadow: `0 6px 20px ${alpha(color.shadow, 0.16)}, 0 0 0 1px ${color.grey[300]}`,
      fontFamily: font,
      fontSize: 13,
      fontWeight: 600,
      color: color.grey[700],
      opacity: appear,
      transform: `translateY(${(1 - appear) * 14}px)`,
    }}
  >
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: 7,
        background: `linear-gradient(135deg, ${color.purple[400]}, ${color.purple[600]})`,
      }}
    />
    Open sidebar
  </div>
)

export {LockGlyph, WarnGlyph}
