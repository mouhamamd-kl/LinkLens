import React from 'react'
import {color, font, mono} from '../theme'

/* Icons lifted from ../src/components/icons.tsx so the video shows the real
 * glyphs rather than lookalikes. */

export const ShieldIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color: c = color.purple[500],
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2.6l7.2 2.8v6.1c0 4.5-3 8.3-7.2 9.9-4.2-1.6-7.2-5.4-7.2-9.9V5.4L12 2.6z"
      stroke={c}
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M8.8 12.1l2.2 2.2 4.2-4.4" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const DangerousIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color: c = color.red[500],
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3.5l9 16.5H3l9-16.5z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
    <rect x="11.1" y="9.5" width="1.9" height="5.5" rx="0.95" fill={c} />
    <circle cx="12.05" cy="17.3" r="1.15" fill={c} />
  </svg>
)

export const ClockIcon: React.FC<{size?: number; color?: string}> = ({
  size = 16,
  color: c = color.grey[500],
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.8" />
    <path d="M12 7v5.4l3.4 2" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const SettingsIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color: c = color.grey[700],
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.9 2.9l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6v.2a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.9-2.9l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1.1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.9-2.9l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.6V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.9 2.9l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.6 1h.2a2 2 0 110 4h-.1a1.7 1.7 0 00-1.6 1z" />
  </svg>
)

/* --- primitives copied from ../src/components --- */

export const Tag: React.FC<{
  children: React.ReactNode
  tone?: 'error' | 'success' | 'neutral'
  size?: 'sm' | 'md'
}> = ({children, tone = 'error', size = 'md'}) => {
  // Tinted fills rather than the old pale red/green surfaces — a #ffe5e5 pill
  // reads as a light-mode leftover the moment the page goes dark.
  const map = {
    error: {bg: 'rgba(255, 59, 59, 0.13)', fg: color.red[300], bd: 'rgba(255, 59, 59, 0.34)'},
    success: {bg: 'rgba(47, 199, 47, 0.13)', fg: color.green[300], bd: 'rgba(47, 199, 47, 0.34)'},
    neutral: {bg: color.grey[200], fg: color.grey[400], bd: color.grey[300]},
  }[tone]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: size === 'sm' ? 22 : 26,
        padding: '0 10px',
        borderRadius: 12,
        background: map.bg,
        boxShadow: `inset 0 0 0 1px ${map.bd}`,
        color: map.fg,
        fontFamily: font,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

export const Card: React.FC<{
  children: React.ReactNode
  align?: 'center' | 'start'
  style?: React.CSSProperties
}> = ({children, align = 'center', style}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: align === 'center' ? 'center' : 'stretch',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      background: color.grey[50],
      boxShadow: `0 0 0 1px ${color.grey[300]}, 0 1px 2px ${color.grey[200]}`,
      ...style,
    }}
  >
    {children}
  </div>
)

export const Button: React.FC<{
  children: React.ReactNode
  variant?: 'solid' | 'outline'
  tone?: 'action' | 'danger'
  icon?: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
}> = ({children, variant = 'solid', tone = 'action', icon, size = 'md', style}) => {
  const solid = variant === 'solid'
  const accent = tone === 'danger' ? color.red[500] : color.purple[500]
  const heights = {xs: 28, sm: 32, md: 42, lg: 50}

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: heights[size],
        padding: size === 'xs' ? '0 12px' : '0 18px',
        borderRadius: size === 'lg' ? 25 : 12,
        background: solid ? accent : color.grey[50],
        boxShadow: solid ? 'none' : `inset 0 0 0 1.5px ${color.grey[300]}`,
        // White, not grey[50] — grey[50] is the card surface in the dark ramp,
        // so a solid button's label was coming out near-black on purple.
        color: solid ? '#ffffff' : accent,
        fontFamily: font,
        fontSize: size === 'xs' ? 12 : 14,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon}
      {children}
    </div>
  )
}

export const Toggle: React.FC<{checked: boolean}> = ({checked}) => (
  <div
    style={{
      position: 'relative',
      width: 46,
      height: 26,
      borderRadius: 13,
      background: checked ? color.purple[500] : color.grey[300],
      flex: 'none',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 3,
        left: checked ? 23 : 3,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: color.grey[50],
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }}
    />
  </div>
)

export const StatBlock: React.FC<{label: string; value: React.ReactNode}> = ({label, value}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1}}>
    <span
      style={{
        fontFamily: font,
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: '-0.03em',
        color: color.grey[800],
        lineHeight: 1.1,
      }}
    >
      {value}
    </span>
    <span
      style={{
        fontFamily: font,
        fontSize: 10,
        fontWeight: 500,
        color: color.grey[400],
        textAlign: 'center',
        lineHeight: 1.3,
      }}
    >
      {label}
    </span>
  </div>
)

export const Divider: React.FC<{vertical?: boolean}> = ({vertical}) => (
  <div
    style={{
      background: color.grey[300],
      width: vertical ? 1 : '100%',
      height: vertical ? 44 : 1,
      flex: 'none',
    }}
  />
)

export const SectionHeader: React.FC<{
  icon: React.ReactNode
  title: string
  action?: React.ReactNode
}> = ({icon, title, action}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 6, width: '100%'}}>
    {icon}
    <span
      style={{
        fontFamily: font,
        fontSize: 12,
        fontWeight: 600,
        color: color.grey[700],
        flex: 1,
      }}
    >
      {title}
    </span>
    {action}
  </div>
)

/** The purple lens mark used in the wordmark and the reveal. */
export const LensMark: React.FC<{size?: number; id?: string}> = ({size = 44, id = 'lm'}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={color.purple[400]} />
        <stop offset="100%" stopColor={color.purple[700]} />
      </linearGradient>
    </defs>
    <circle cx="21" cy="21" r="13" stroke={`url(#${id}-g)`} strokeWidth="3.6" />
    <path d="M31 31l9 9" stroke={`url(#${id}-g)`} strokeWidth="4" strokeLinecap="round" />
    <circle cx="21" cy="21" r="4.5" fill={`url(#${id}-g)`} />
  </svg>
)

export {mono}
