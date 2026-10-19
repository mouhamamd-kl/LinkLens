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
import { api } from './lib/webapi'
import './tokens.css'
import './fonts.css'
import './tokens-desktop.css'
import './locked.css'

// Gecko, folded to a single branch at build time. waterfox and librewolf are
// deliberately left out: neither is a target this project builds, and naming
// them adds two TS2367 errors because they are absent from the union
// import.meta.env.EXTENSION_PUBLIC_BROWSER is typed as.
const isFirefoxLike =
  import.meta.env.EXTENSION_PUBLIC_BROWSER === 'firefox' ||
  import.meta.env.EXTENSION_PUBLIC_BROWSER === 'gecko-based'

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
  // Kept rather than re-queried: goBack needs it, and tabs.goBack is the only
  // route that works from a DNR-redirected extension page on Firefox.
  const [tabId, setTabId] = React.useState<number | null>(null)
  // previousUrl starts null and is filled asynchronously, so without this the
  // Go Back control renders dimmed on every load and then brightens.
  const [loaded, setLoaded] = React.useState(false)
  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        console.log('[LinkLens] reading blocked state')
        const [tab] = await api.tabs.query({
          active: true,
          currentWindow: true,
        })
        console.log('[LinkLens] tab', tab?.id)
        if (tab?.id === undefined || cancelled) return

        setTabId(tab.id)

        const blockedKey = `blocked:${tab.id}`
        const previousKey = `lastPage:${tab.id}`
        // One call for both keys. They have different shapes — blockedKey holds
        // an object, previousKey a bare string — hence the asymmetric reads.
        const stored = await api.storage.session.get([blockedKey, previousKey])
        // JSON.stringify, because logcat renders a plain object as
        // "[object Object]" — which is useless for telling null from populated.
        console.log('[LinkLens] keys', JSON.stringify({
          blockedKey,
          previousKey,
          blocked: stored[blockedKey],
          previous: stored[previousKey],
        }))
        const blocked = stored[blockedKey]?.url ?? null

        if (!cancelled) {
          setBlockedUrl(blocked)
          setPreviousUrl(stored[previousKey] ?? null)
        }

        // Reaching this page at all means the redirect fired, which is the only
        // trustworthy proof of a block — onBeforeNavigate fires for every
        // navigation and cannot tell a blocked one from a successful one.
        //
        // `blocked`, not the `blockedUrl` state: this effect runs once on mount
        // with [] deps, so the state variable in this closure is the initial
        // null and the guard would never pass.
        if (blocked) {
          void api.runtime.sendMessage({ action: 'recordBlock', url: blocked })
        }
      } catch (error) {
        // Previously silent, which made a missing `storage` permission look
        // exactly like a button that does nothing.
        console.error('[LinkLens] could not read the blocked URL', error)
      } finally {
        // Set even on failure, so a failed read settles the control rather than
        // leaving Go Back permanently dimmed for an unrelated reason.
        if (!cancelled) setLoaded(true)
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

  // Firefox only. A DNR-redirected tab has no session history entry on gecko —
  // measured at window.history.length 1 — so with no recorded previous page
  // there is genuinely nowhere to go back to, and the control says so instead
  // of doing nothing. Chromium still pushes an entry for the redirect, so its
  // tabs.goBack has the New Tab Page behind it and stays enabled.
  const canGoBack = loaded && (previousUrl !== null || !isFirefoxLike)

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
      // JSON.stringify because logcat renders a plain object as
      // "[object Object]". '->' rather than an arrow for the same reason:
      // logcat is latin-1, so a UTF-8 arrow comes through as mojibake.
      console.log('[LinkLens] proceed ->', JSON.stringify({
        hostname,
        permanent: dontWarn,
        pending,
      }))
      await api.runtime.sendMessage({
        action: 'proceed',
        domain: hostname,
        permanent: dontWarn,
      })
      console.log('[LinkLens] rule installed, navigating')

      // replace() rather than assign() so the interstitial does not sit in
      // history — pressing back from the page would return to it.
      window.location.replace(blockedUrl)
    } catch (error) {
      console.error('[LinkLens] could not lift the block', error)
      setPending(false)
    }
  }

  const goBack = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    console.log('[LinkLens] goBack ->', JSON.stringify({
      tabId,
      historyLength: window.history.length,
      previousUrl,
    }))

    // A page this tab actually loaded earlier. Deterministic, and it is the only
    // route that works on gecko.
    try {
      if (previousUrl) {
        window.location.assign(previousUrl)

        return
      }

      // Chromium only. The DNR redirect pushes a session entry there, leaving
      // the New Tab Page behind the interstitial, so tabs.goBack has somewhere
      // to go. Firefox replaces the entry instead and collapses the tab to a
      // single history entry — measured at window.history.length 1 — so
      // goBack would be a correct no-op. The anchor disables the control in
      // that state rather than letting it fail silently.
      if (isFirefoxLike || tabId === null) return

      await api.tabs.goBack(tabId)
      console.log('[LinkLens] goBack -> tabs.goBack')
    } catch (error) {
      // Without this the rejection vanished: the handler is async and wired
      // through `void`, so a failure looked identical to a no-op.
      console.error('[LinkLens] goBack failed', error)
    }
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
            className={`button button--solid button--lg${canGoBack ? '' : ' button--disabled'}`}
            href={canGoBack ? (previousUrl ?? undefined) : undefined}
            aria-disabled={!canGoBack || undefined}
            onClick={(event) => {
              // An anchor cannot be truly disabled, and `href` was dropped so it
              // leaves the tab order and stops previewing a destination that
              // goes nowhere. The click has to be suppressed here instead.
              if (!canGoBack) {
                event.preventDefault()

                return
              }

              void goBack(event)
            }}
            title={canGoBack ? (previousUrl ?? undefined) : undefined}
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