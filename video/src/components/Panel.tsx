import React from 'react'
import {useCurrentFrame} from 'remotion'
import {alpha} from '../lib/anim'
import {
  Button,
  Card,
  ClockIcon,
  DangerousIcon,
  Divider,
  SectionHeader,
  SettingsIcon,
  ShieldIcon,
  StatBlock,
  Tag,
  Toggle,
} from './UI'
import {color, font, mono} from '../theme'

/**
 * Recreation of the LinkLens side panel (Figma 162:323). The real panel is
 * 319px wide; this renders at 400 so captions stay legible at 1080p.
 *
 * Every section takes its own `appear` (0..1) so scenes can build the panel up
 * one card at a time instead of slamming the whole thing on screen.
 */

type Reveal = number

const appear = (v: Reveal): React.CSSProperties => ({
  opacity: v,
  transform: `translateY(${(1 - v) * 16}px)`,
})

const SECTION_GAP = 12

export const LinkLensPanel: React.FC<{
  width?: number
  warning?: Reveal
  protection?: Reveal
  stats?: Reveal
  activity?: Reveal
  /** How many activity rows are present. */
  activityCount?: number
  version?: string
  blockedUrl?: string
  sessionCount?: React.ReactNode
  installCount?: React.ReactNode
  activityRows?: {title: string; time: string}[]
  style?: React.CSSProperties
}> = ({
  width = 400,
  warning = 1,
  protection = 1,
  stats = 1,
  activity = 1,
  activityCount = 3,
  version = 'v1.0.0',
  blockedUrl = 'https://stitch.google.com/projects/17593243975137907603',
  sessionCount = '20',
  installCount = '2451',
  activityRows = [
    {title: 'Stitch - Projects', time: '2 min ago'},
    {title: 'Stitch - Projects', time: '2 min ago'},
    {title: 'Stitch - Projects', time: '2 min ago'},
  ],
  style,
}) => (
  <div
    style={{
      width,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: SECTION_GAP,
      padding: 10,
      background: color.grey[100],
      fontFamily: font,
      color: color.grey[700],
      ...style,
    }}
  >
    {/* Header */}
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <span style={{fontSize: 14, fontWeight: 600, color: color.grey[700]}}>LinkLens</span>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 8,
            background: color.grey[200],
            fontSize: 11,
            fontWeight: 600,
            color: color.grey[400],
          }}
        >
          {version}
        </span>
      </div>
      <SettingsIcon size={20} />
    </div>

    {warning > 0 && (
      <Card align="center" style={appear(warning)}>
        <Tag tone="error" size="sm">
          Suspected phishing
        </Tag>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            minHeight: 26,
            padding: '4px 8px',
            borderRadius: 8,
            background: color.grey[200],
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 12,
              color: color.purple[500],
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {blockedUrl}
          </span>
        </div>

        <Button variant="solid" size="md" icon={<ShieldIcon size={18} />} style={{width: '100%'}}>
          Go Back to safety
        </Button>

        <p style={{margin: 0, fontSize: 10, lineHeight: 1.6, color: color.grey[400], textAlign: 'center'}}>
          False alarm? Review warning options below
        </p>

        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%'}}>
          <p style={{margin: 0, fontSize: 10, lineHeight: 1.6, color: color.grey[400]}}>
            Proceed only if you trust this site
          </p>
          <div style={{display: 'flex', justifyContent: 'space-between', gap: 8, width: '100%'}}>
            <Button variant="outline" size="sm" icon={<DangerousIcon size={16} />} style={{flex: 1}}>
              Continue anyway
            </Button>
            <Button variant="outline" size="sm" style={{flex: 1, color: color.grey[400]}}>
              Report
            </Button>
          </div>
        </div>

        <Divider />
      </Card>
    )}

    {protection > 0 && (
      <Card align="center" style={appear(protection)}>
        <h2 style={{margin: 0, fontSize: 12, fontWeight: 600, width: '100%', textAlign: 'left'}}>Protection</h2>

        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 5}}>
            <ShieldIcon size={15} />
            <span style={{fontSize: 12, fontWeight: 500}}>Surfing protection is on</span>
          </div>
          <Toggle checked />
        </div>

        <p style={{margin: 0, fontSize: 10, lineHeight: 1.6, color: color.grey[400], textAlign: 'center'}}>
          Real-time scanning is actively monitoring your web traffic for malicious links.
        </p>
      </Card>
    )}

    {stats > 0 && (
      <Card align="start" style={appear(stats)}>
        <SectionHeader icon={<ClockIcon size={15} />} title="Recent blocked links" />
        <div style={{display: 'flex', alignItems: 'center', gap: 12, width: '100%', marginTop: 10}}>
          <StatBlock label="Blocked In This Session" value={sessionCount} />
          <Divider vertical />
          <StatBlock label="Blocked Since install" value={installCount} />
        </div>
      </Card>
    )}

    {activity > 0 && (
      <Card align="start" style={appear(activity)}>
        <SectionHeader
          icon={<ClockIcon size={15} />}
          title="Recent activity"
          action={
            <span style={{fontSize: 10, fontWeight: 600, color: color.purple[500], textDecoration: 'underline'}}>
              view all
            </span>
          }
        />

        <ul style={{listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, width: '100%'}}>
          {activityRows.slice(0, activityCount).map((row, i) => (
            <li key={i} style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
                  <span style={{fontSize: 10, color: color.grey[600]}}>{row.title}</span>
                  <span style={{fontSize: 10, fontWeight: 600, color: color.grey[700]}}>{row.time}</span>
                </div>
                <Tag tone="error" size="sm">
                  Suspected phishing
                </Tag>
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button variant="outline" size="xs">
                  view details
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    )}
  </div>
)

/**
 * The blocked interstitial (Figma 165:999), rendered inside a BrowserFrame
 * viewport. `canGoBack` dims the safety control the way the real page does on
 * gecko when there is no recorded previous page.
 */
export const BlockPage: React.FC<{
  /** 0..1 scale-in of the whole block. */
  appear?: number
  hostname?: string
  checkboxOn?: boolean
  goBackEnabled?: boolean
}> = ({appear = 1, hostname = 'mgeko.cc', checkboxOn = true, goBackEnabled = true}) => {
  const frame = useCurrentFrame()

  // The warning icon breathes slightly once mounted — the only motion on the
  // real page, and enough to keep a full-frame cut from feeling static.
  const breathe = 1 + Math.sin(frame / 22) * 0.012

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: color.grey[100],
        padding: 46,
        fontFamily: font,
        opacity: appear,
      }}
    >
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 26}}>
        <WarningArt scale={breathe * appear} />
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16}}>
          <h1
            style={{
              margin: 0,
              fontSize: 42,
              lineHeight: 1.2,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: color.grey[800],
            }}
          >
            We&apos;ve blocked this website
          </h1>
          <Tag tone="error" size="md">
            Suspected phishing
          </Tag>
        </div>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 22, marginTop: 26}}>
        <p style={{margin: 0, fontSize: 17, lineHeight: 1.5, fontWeight: 500, color: color.grey[700], maxWidth: 900}}>
          This link was flagged as potentially unsafe. It may be designed to steal your
          passwords, personal information, or other sensitive data.
        </p>
        <p style={{margin: 0, fontSize: 14, lineHeight: 1.4, fontWeight: 400, color: color.grey[500]}}>
          Blocked Website: <b>{hostname}</b>
        </p>
      </div>

      <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 34}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              background: checkboxOn ? color.purple[500] : color.grey[50],
              boxShadow: `inset 0 0 0 1.6px ${checkboxOn ? color.purple[500] : color.grey[300]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {checkboxOn && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span style={{fontSize: 14, color: color.grey[700]}}>Don&apos;t warn me again</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: 10,
            borderRadius: 32,
            background: color.grey[50],
            boxShadow: `0 0 0 1px ${color.grey[300]}`,
          }}
        >
          <Button variant="outline" size="lg" tone="danger" icon={<DangerousIcon size={19} />}>
            Continue to the site
          </Button>
          <Button
            variant="solid"
            size="lg"
            icon={<ShieldIcon size={19} />}
            style={
              goBackEnabled
                ? undefined
                : {background: color.grey[300], color: color.grey[500], boxShadow: 'none'}
            }
          >
            Go Back to safety
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Stand-in for ../src/warning.svg, redrawn as vector so it scales cleanly. */
const WarningArt: React.FC<{scale?: number}> = ({scale = 1}) => (
  <svg
    width="150"
    height="150"
    viewBox="0 0 120 120"
    fill="none"
    style={{transform: `scale(${scale})`, transformOrigin: 'left center', flex: 'none'}}
  >
    <circle cx="60" cy="60" r="56" fill={color.red[50]} />
    <path
      d="M60 24l34 58H26l34-58z"
      fill={color.red[500]}
      stroke={color.red[600]}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <rect x="55.5" y="42" width="9" height="24" rx="4.5" fill="#fff" />
    <circle cx="60" cy="73" r="5" fill="#fff" />
  </svg>
)

/** A fake sign-in page — the phishing target in Act 1. */
export const FakeLogin: React.FC<{
  brandColor?: string
  brandName?: string
  email?: string
  password?: string
  showEmail?: boolean
  showPassword?: boolean
}> = ({
  brandColor = color.purple[500],
  brandName = 'Acme Corp',
  email = 'jordan.reyes@gmail.com',
  password = '••••••••••••',
  showEmail = true,
  showPassword = false,
}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: color.grey[100],
      fontFamily: font,
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        width: 420,
        padding: 40,
        borderRadius: 20,
        background: color.grey[50],
        boxShadow: `0 0 0 1px ${color.grey[300]}, 0 20px 50px -20px ${alpha(color.shadow, 0.3)}`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <div style={{width: 34, height: 34, borderRadius: 10, background: brandColor}} />
        <span style={{fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: color.grey[800]}}>
          {brandName}
        </span>
      </div>

      <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: 14}}>
        <Field label="Email" value={showEmail ? email : ''} />
        <Field label="Password" value={showPassword ? password : ''} dots />
      </div>

      <div
        style={{
          width: '100%',
          height: 44,
          borderRadius: 12,
          background: brandColor,
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
  </div>
)

const Field: React.FC<{label: string; value: string; dots?: boolean}> = ({label, value, dots}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
    <span style={{fontSize: 12, fontWeight: 600, color: color.grey[500]}}>{label}</span>
    <div
      style={{
        height: 44,
        borderRadius: 12,
        boxShadow: `inset 0 0 0 1.4px ${color.grey[300]}`,
        background: color.grey[50],
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
      }}
    >
      <span
        style={{
          fontFamily: dots ? mono : font,
          fontSize: 14,
          color: color.grey[700],
          letterSpacing: dots ? '0.12em' : '-0.01em',
        }}
      >
        {value}
      </span>
      {value.length === 0 && (
        <span
          style={{
            width: 1.5,
            height: 18,
            background: color.grey[400],
            marginLeft: 1,
            display: 'inline-block',
          }}
        />
      )}
    </div>
  </div>
)
