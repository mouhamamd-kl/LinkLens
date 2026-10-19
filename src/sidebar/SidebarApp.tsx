import React from 'react'
import Button from '../components/Button'
import Card, { Divider } from '../components/Card'
import CopyableLink from '../components/CopyableLink'
import Section from '../components/Section'
import StatBlock from '../components/StatBlock'
import Tag from '../components/Tag'
import Toggle from '../components/Toggle'
import {
  ClockIcon,
  ShieldIcon,
} from '../components/icons'
import logoUrl from '../images/logo.svg'
import { api } from '../lib/webapi'
import { defangUrl, getActivity, getStats, hostnameOf, relativeTime } from '../lib/activity'
import type { ActivityEntry, BlockStats } from '../lib/activity'

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

/** storage.local key for the protection preference. Mirrored in background.ts. */
const PROTECTION_KEY = 'settings:protection'

/**
 * Counters and the activity log, kept live.
 *
 * storage.onChanged covers storage.local and storage.session alike, so one
 * listener picks up both the lifetime total and the per-session count without
 * having to know which area a write landed in.
 */
function useBlockData(): { stats: BlockStats; entries: ActivityEntry[] } {
  const [stats, setStats] = React.useState<BlockStats>({ session: 0, total: 0 })
  const [entries, setEntries] = React.useState<ActivityEntry[]>([])

  React.useEffect(() => {
    let cancelled = false

    const read = () => {
      void (async () => {
        try {
          const [next, log] = await Promise.all([getStats(), getActivity()])

          if (!cancelled) {
            setStats(next)
            setEntries(log)
          }
        } catch (error) {
          console.error('[LinkLens] could not read the block data', error)
        }
      })()
    }

    read()
    chrome.storage.onChanged.addListener(read)

    return () => {
      cancelled = true
      chrome.storage.onChanged.removeListener(read)
    }
  }, [])

  return { stats, entries }
}

function Header() {
  return (
    <header className="panel_header">
      <div className="panel_header_left">
        {/* The white-text lockup, since the panel is dark. The wordmark is part
            of the artwork, so alt carries the name the pixels no longer do. */}
        <img className="panel_wordmark" src={logoUrl} alt="LinkLens" />
        <span className="panel_version">{VERSION}</span>
      </div>
    </header>
  )
}

/**
 * The last blocked URL, not the current tab's.
 *
 * The activity log is stored newest-first, so entries[0] is the most recent
 * block — reusing it avoids a second storage key for the same fact, and it
 * survives the panel being closed between blocks.
 *
 * Null before anything has been blocked, which is also the case when the panel
 * is opened on a page that was never blocked at all.
 */
function WarningCard({ lastUrl }: { lastUrl: string | null }) {
  // Defanged once and used for all three surfaces. The tooltip mattered as much
  // as the clipboard: a raw URL in a title attribute is still a URL the browser
  // will happily hand to a click or a middle-click.
  const safeUrl = lastUrl ? defangUrl(lastUrl) : null

  return (
    <Card align="center">
      <Tag tone="error" size="sm" radius={12}>
        Suspected phishing
      </Tag>

      {safeUrl ? (
        <>
          {/* The strip truncates to fit 275px; the title carries the full URL
              and the icon copies it. The text stays selectable. */}
          <div className="panel_url" title={safeUrl}>
            <CopyableLink value={safeUrl} label={lastUrl ? lastUrl : ""} />
          </div>
        </>
      ) : (
        <p className="panel_note">No blocked pages yet</p>
      )}

      <p className="panel_note">False alarm? Review warning options below</p>

      <div className="panel_proceed">
        <div className="panel_proceed_actions">
          <Button variant="outline" size="sm" aria-hidden={true} tabIndex={-1}>
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
  // Null until the stored preference has been read. The toggle is disabled for
  // that window: clicking before it resolves would race the read and could be
  // overwritten by whatever it returned.
  const [loaded, setLoaded] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const stored = await api.storage.local.get(PROTECTION_KEY)

        if (!cancelled) setOn(stored[PROTECTION_KEY] !== false)
      } catch (error) {
        console.error('[LinkLens] could not read the protection setting', error)
      } finally {
        // Settles on failure too, so a read error leaves a usable control
        // rather than one dimmed forever.
        if (!cancelled) setLoaded(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const toggle = async (next: boolean) => {
    setBusy(true)

    try {
      const result = await api.runtime.sendMessage({
        action: 'setProtection',
        enabled: next,
      })

      // Applied before the knob moves, so the control never shows a state the
      // ruleset is not actually in.
      if (result?.ok) setOn(next)
    } catch (error) {
      console.error('[LinkLens] could not change protection', error)
    } finally {
      setBusy(false)
    }
  }

  const status = !loaded
    ? 'Checking protection…'
    : on
      ? 'Surfing protection is on'
      : 'Surfing protection is off'

  return (
    <Card align="center">
      <h2 className="panel_card_title">Protection</h2>

      <div className="panel_protection">
        <div className="panel_protection_status">
          <ShieldIcon size={16} />
          <span>{status}</span>
        </div>

        <Toggle
          checked={on}
          onChange={(next) => void toggle(next)}
          label="Surfing protection"
          disabled={!loaded || busy}
        />
      </div>

      <p className="panel_note">
        {loaded && !on
          ? 'Your traffic isn’t being scanned. Turn protection back on to block unsafe links.'
          : 'Real-time scanning is actively monitoring your web traffic for malicious links.'}
      </p>
    </Card>
  )
}

function StatsCard({ stats }: { stats: BlockStats }) {
  return (
    <Card align="start">
      <Section icon={<ClockIcon size={16} />} title="Recent blocked links">
        <div className="panel_stats">
          <StatBlock label="Blocked In This Session" value={String(stats.session)} />
          <Divider vertical />
          <StatBlock label="Blocked Since install" value={String(stats.total)} />
        </div>
      </Section>
    </Card>
  )
}

/**
 * How many rows the card draws. Lower than the 25 the log stores in
 * storage.local — the card is a scannable summary, and the remainder is what
 * "view all" would eventually reach for.
 */
const ACTIVITY_RENDER_LIMIT = 8

function ActivityCard({ entries }: { entries: ActivityEntry[] }) {
  // Newest-first already, so slicing the head keeps the most recent.
  const visible = entries.slice(0, ACTIVITY_RENDER_LIMIT)

  return (
    <Card align="start">
      <Section
        icon={<ClockIcon size={16} />}
        title="Recent activity"
        action={
          // A real link so it navigates whatever surface the panel is in —
          // Firefox sidebar, Chromium side panel, or a tab on Android.
          <a className="panel_link" href="../pages/all.html">
            view all
          </a>
        }
      >
        <ul className="panel_activity">
          {visible.length === 0 ? (
            <li className="panel_activity_empty">No blocks yet</li>
          ) : (
            visible.map((entry, index) => (
              <li
                // at alone is not unique enough — two blocks in the same
                // millisecond would collide.
                key={`${entry.at}-${index}`}
                className="panel_activity_row"
              >
                <div className="panel_activity_head">
                  <div className="panel_activity_meta">
                    {/* Hostname, not a page title: the redirect consumes the
                        navigation before anything renders, so a blocked page
                        never has a title to read. */}
                    <span className="panel_activity_title">
                      {hostnameOf(entry.url)}
                    </span>
                    <span className="panel_activity_time">
                      {relativeTime(entry.at)}
                    </span>
                  </div>
                  <Tag tone="error" size="sm" weight="regular">
                    Blocked
                  </Tag>
                </div>
              </li>
            ))
          )}
        </ul>
      </Section>
    </Card>
  )
}

export default function SidebarApp() {
  const { stats, entries } = useBlockData()

  return (
    <main className="panel">
      <Header />
      {/* Newest-first, so the head of the log is the most recent block. */}
      <WarningCard lastUrl={entries[0]?.url ?? null} />
      <ProtectionCard />
      <StatsCard stats={stats} />
      <ActivityCard entries={entries} />
    </main>
  )
}