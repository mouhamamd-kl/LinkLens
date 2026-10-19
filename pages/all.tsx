import React from 'react'
import ReactDOM from 'react-dom/client'
import Card from '../src/components/Card'
import IconButton from '../src/components/IconButton'
import Section from '../src/components/Section'
import Tag from '../src/components/Tag'
import { ClockIcon, SettingsIcon } from '../src/components/icons'
import { getActivity, hostnameOf, relativeTime } from '../src/lib/activity'
import type { ActivityEntry } from '../src/lib/activity'
import '../src/sidebar/styles.css'
import '../src/tokens.css'
import '../src/fonts.css'
import '../src/motion.css'

/*
 * The "view all" target for the panel's Recent activity card.
 *
 * Lives in pages/ rather than src/sidebar/ because Extension.js only treats
 * manifest-named HTML fields and the pages/ folder as entrypoints — a bare
 * src/sidebar/all.html would never be compiled.
 *
 * Same components, tokens and stylesheet as the panel, so it reads as the same
 * surface rather than a second design. The list is uncapped: the panel shows the
 * most recent few, this is where the rest of the log is read.
 */

/** Stored newest-first by recordBlock, so the order needs no sorting here. */
function ActivityRows({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return <li className="panel_activity_empty">No blocks yet</li>
  }

  return entries.map((entry, index) => (
    <li
      // at alone is not unique enough — two blocks in the same millisecond
      // would collide and React would drop a row.
      key={`${entry.at}-${index}`}
      className="panel_activity_row"
    >
      <div className="panel_activity_head">
        <div className="panel_activity_meta">
          <span className="panel_activity_title">{hostnameOf(entry.url)}</span>
          <span className="panel_activity_time">{relativeTime(entry.at)}</span>
        </div>
        <Tag tone="error" size="sm" weight="regular">
          Blocked
        </Tag>
      </div>
    </li>
  ))
}

function AllActivity() {
  const [entries, setEntries] = React.useState<ActivityEntry[]>([])

  React.useEffect(() => {
    let cancelled = false

    const read = () => {
      void (async () => {
        try {
          const log = await getActivity()

          if (!cancelled) setEntries(log)
        } catch (error) {
          console.error('[LinkLens] could not read the activity log', error)
        }
      })()
    }

    read()
    // Same reasoning as the panel: a block landing in another tab should show
    // up here without a reload.
    chrome.storage.onChanged.addListener(read)

    return () => {
      cancelled = true
      chrome.storage.onChanged.removeListener(read)
    }
  }, [])

  return (
    <main className="panel">
      <header className="panel_header">
        <div className="panel_header_left">
          {/* A real link rather than history.back(): the panel can be a sidebar,
              a side panel or a plain tab depending on the browser, and a
              history step is unreliable on Firefox for an extension page. */}
          <a className="panel_back" href="../sidebar/index.html">
            ← Back
          </a>
        </div>

        <IconButton label="Settings">
          <SettingsIcon size={20} />
        </IconButton>
      </header>

      <Card align="start">
        <Section icon={<ClockIcon size={16} />} title="All blocked links">
          <p className="panel_note">
            {entries.length === 0
              ? 'Nothing recorded yet'
              : `${entries.length} blocked ${entries.length === 1 ? 'link' : 'links'}, newest first`}
          </p>

          <ul className="panel_activity">
            <ActivityRows entries={entries} />
          </ul>
        </Section>
      </Card>
    </main>
  )
}

const container = document.getElementById('root')

if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <AllActivity />
    </React.StrictMode>,
  )
}