import React from 'react'
import Button from '../components/Button'
import Card, { Divider } from '../components/Card'
import CopyableLink from '../components/CopyableLink'
import IconButton from '../components/IconButton'
import Section from '../components/Section'
import StatBlock from '../components/StatBlock'
import Tag from '../components/Tag'
import Toggle from '../components/Toggle'
import {
  ClockIcon,
  DangerousIcon,
  InfoIcon,
  SettingsIcon,
  ShieldIcon,
} from '../components/icons'

/*
 * The side panel, from Figma frame 162:323 ("Extension", 319x919).
 *
 * Five sections in a vertical stack, padding 10, itemSpacing 12. Heights are
 * 53 / 240 / 197 / 105 / 256, which sums with the gaps and padding to exactly
 * 919 — the layout needs no guessing.
 *
 * `watchPageTitle` is not carried over: the design has no element for the
 * current page's title, so the panel's title area is the wordmark instead.
 */

const VERSION = 'v1.0.0'
const BLOCKED_URL = 'https://stitch.google.com/projects/17593243975137907603'

interface ActivityRow {
  title: string
  time: string
  tag: string
}

const ACTIVITY: ActivityRow[] = [
  { title: 'Stitch - Projects', time: '2 min ago', tag: 'Suspected phishing' },
  { title: 'Stitch - Projects', time: '2 min ago', tag: 'Suspected phishing' },
  { title: 'Stitch - Projects', time: '2 min ago', tag: 'Suspected phishing' },
]

function Header() {
  return (
    <header className="panel_header">
      <div className="panel_header_left">
        <span className="panel_wordmark">LinkLens</span>
        <span className="panel_version">{VERSION}</span>
      </div>

      <IconButton label="Settings">
        <SettingsIcon size={20} />
      </IconButton>
    </header>
  )
}

function WarningCard() {
  return (
    <Card align="center">
      <Tag tone="error" size="sm" radius={12}>
        Suspected phishing
      </Tag>

      {/* The strip truncates to fit 275px; the title carries the full URL and
          the icon copies it. The text stays selectable. */}
      <div className="panel_url" title={BLOCKED_URL}>
        <CopyableLink value={BLOCKED_URL} label={BLOCKED_URL} />
      </div>

      <Button variant="solid" size="md" icon={<ShieldIcon size={20} />}>
        Go Back to safety
      </Button>

      <p className="panel_note">False alarm? Review warning options below</p>

      <div className="panel_proceed">
        <p className="panel_note">Proceed only if you trust this site</p>

        <div className="panel_proceed_actions">
          <Button variant="outline" size="sm" icon={<DangerousIcon size={20} />}>
            Continue anyway
          </Button>

          <Button variant="outline" size="sm" aria-hidden={true} tabIndex={-1} >
            Report false positive
          </Button>
        </div>
      </div>

      <Divider />
    </Card>
  )
}

function ProtectionCard() {
  const [on, setOn] = React.useState(true)

  return (
    <Card align="center">
      <h2 className="panel_card_title">Protection</h2>

      <div className="panel_protection">
        <div className="panel_protection_status">
          <ShieldIcon size={16} />
          <span>Surfing protection is on</span>
        </div>

        <Toggle checked={on} onChange={setOn} label="Surfing protection" />
      </div>

      <p className="panel_note">
        Real-time scanning is actively monitoring your web traffic for malicious
        links.
      </p>
    </Card>
  )
}

function StatsCard() {
  return (
    <Card align="start">
      <Section icon={<ClockIcon size={16} />} title="Recent blocked links">
        <div className="panel_stats">
          <StatBlock label="Blocked In This Session" value="20" />
          <Divider vertical />
          <StatBlock label="Blocked Since install" value="2451" />
        </div>
      </Section>
    </Card>
  )
}

function ActivityCard() {
  return (
    <Card align="start">
      <Section
        icon={<ClockIcon size={16} />}
        title="Recent activity"
        action={
          <button type="button" className="panel_link">
            view all
          </button>
        }
      >
        <ul className="panel_activity">
          {ACTIVITY.map((row, index) => (
            <li key={`${row.title}-${index}`} className="panel_activity_row">
              <div className="panel_activity_head">
                <div className="panel_activity_meta">
                  <span className="panel_activity_title">{row.title}</span>
                  <span className="panel_activity_time">{row.time}</span>
                </div>
                <Tag tone="error" size="sm" weight="regular">
                  {row.tag}
                </Tag>
              </div>

              <div className="panel_activity_action">
                <Button variant="outline" size="xs" >
                  view details
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </Card>
  )
}

export default function SidebarApp() {
  return (
    <main className="panel">
      <Header />
      <WarningCard />
      <ProtectionCard />
      <StatsCard />
      <ActivityCard />
    </main>
  )
}