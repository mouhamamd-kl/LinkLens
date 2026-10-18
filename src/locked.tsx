import React from 'react'
import ReactDOM from 'react-dom/client'
// Button.css is imported directly rather than through ./components/Button:
// the two action controls are anchors now, so the component itself is
// tree-shaken away and its CSS import would go with it.
import './components/Button.css'
import Checkbox from './components/Checkbox'
import Tag from './components/Tag'
import { DangerousIcon, ShieldIcon } from './components/icons'
import warningArt from './warning.svg'
import './tokens.css'
import './fonts.css'
import './tokens-desktop.css'
import './locked.css'

/*
 * The blocked interstitial, from Figma frame 165:999 ("Website").
 *
 * That frame has no layout container — its five children are absolutely
 * positioned on a 1440x1024 artboard, and the tag sat at x=280/y=232
 * overlapping the icon's box. Everything below keeps the measured colours,
 * sizes and type values but composes them as real containers.
 */
function BlockedApp() {
  const [dontWarn, setDontWarn] = React.useState(true)
  // The URL the network stack consumed; stashed by background.ts on
  // webNavigation.onBeforeNavigate. Null until it arrives, and null if the page
  // was opened directly rather than via a redirect.
  const [blockedUrl, setBlockedUrl] = React.useState<string | null>(null)
  const [previousUrl, setPreviousUrl] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        })
        if (tab?.id === undefined || cancelled) return

        const blockedKey = `blocked:${tab.id}`
        const previousKey = `lastPage:${tab.id}`
        // One call for both keys. They have different shapes — blockedKey holds
        // an object, previousKey a bare string — hence the asymmetric reads.
        const stored = await chrome.storage.session.get([blockedKey, previousKey])
        if (!cancelled) {
          setBlockedUrl(stored[blockedKey]?.url ?? null)
          setPreviousUrl(stored[previousKey] ?? null)
        }
      } catch (error) {
        // Previously silent, which made a missing `storage` permission look
        // exactly like a button that does nothing.
        console.error('[LinkLens] could not read the blocked URL', error)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const hostname = React.useMemo(() => {
    if (!blockedUrl) return null
    try {
      return new URL(blockedUrl).hostname
    } catch {
      return null
    }
  }, [blockedUrl])

  // The page navigates itself rather than asking the background to do it: the
  // allow rule has to be installed before the request leaves, and keeping the
  // navigation here avoids a flash of an extension URL.
  const proceed = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    // The anchor carries a real href so hovering previews the destination, so
    // the default navigation has to be stopped here. Nothing navigates on its
    // own — this handler does, once, after the allow rule exists.
    event.preventDefault()

    if (!blockedUrl || !hostname || pending) return

    setPending(true)

    try {
      await chrome.runtime.sendMessage({
        action: 'proceed',
        domain: hostname,
        permanent: dontWarn,
      })

      // replace() rather than assign() so the interstitial does not sit in
      // history — pressing back from the page would return to it.
      window.location.replace(blockedUrl)
    } catch (error) {
      console.error('[LinkLens] could not lift the block', error)
      setPending(false)
    }
  }

  const goBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    window.history.back()
  }

  return (
    <main className="locked">
      <div className="locked_content">
        <img className="locked_warning" src={warningArt} alt="" />

        <div className="locked_heading">
          <h1 className="locked_heading_title">We've blocked this website</h1>
          <Tag tone="error">Suspected phishing</Tag>
        </div>
      </div>

      <div className="locked_body">
        <p className="locked_description">
          This link was flagged as potentially unsafe. It may be designed to
          steal your passwords, personal information, or other sensitive data.
        </p>

        <p className="locked_origin">
          Blocked Website:
          <b> {hostname ?? "suspicious-example.com"}</b>
        </p>
      </div>

      <div className="locked_footer">
        <Checkbox
          label="Don't warn me again"
          defaultChecked={dontWarn}
          onChange={setDontWarn}
        />

        <div className="locked_actionbar">
          <a
            className="button button--outline button--lg"
            href={blockedUrl ?? '#'}
            onClick={(event) => void proceed(event)}
            aria-disabled={pending || undefined}
            title={blockedUrl ?? undefined}
          >
            <DangerousIcon />
            <span className="button_label">Continue to the site</span>
          </a>

          <a
            className="button button--solid button--lg"
            href={previousUrl ?? '#'}
            onClick={goBack}
            title={previousUrl ?? undefined}
          >
            <ShieldIcon />
            <span className="button_label">Go Back to safety</span>
          </a>
        </div>
      </div>
    </main>
  )
}

const container = document.getElementById('root')

if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <BlockedApp />
    </React.StrictMode>
  )
}