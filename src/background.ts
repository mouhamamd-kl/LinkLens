import { api } from './lib/webapi'
import { startRulesSync } from './lib/rules'

console.log(
  '[From the background context] Hello from the background worker/script!'
)

// Registers the onInstalled / onStartup / alarms listeners for the remote
// ruleset. Declared before the browser-detection constants because the sync
// logic has to be live regardless of which engine this bundle targets.
startRulesSync()

// Named one by one so the bundler can fold each build down to a single
// branch. waterfox and librewolf are gecko, and used to fall to chromium.
const isFirefoxLike =
  import.meta.env.EXTENSION_PUBLIC_BROWSER === 'firefox' ||
  import.meta.env.EXTENSION_PUBLIC_BROWSER === 'waterfox' ||
  import.meta.env.EXTENSION_PUBLIC_BROWSER === 'librewolf' ||
  import.meta.env.EXTENSION_PUBLIC_BROWSER === 'gecko-based'

const isSafariLike =
  import.meta.env.EXTENSION_PUBLIC_BROWSER === 'safari' ||
  import.meta.env.EXTENSION_PUBLIC_BROWSER === 'webkit-based'

//instead of all this nonesense

// first we are defining the consts for working with them
// the BLOCKED_KEY_PREFIX is for saving tabs urls so when we are blocking the page 
// and we want the url for it but the url in the page is the extension 
// so we save it in the session which is so much easy

const BLOCKED_KEY_PREFIX = 'blocked:'

// the rules.json file have ids for the websites we are blocking 
const BYPASS_ID_BASE = 900_000
const BYPASS_ID_RANGE = 90_000

/*
 * @types/chrome declares ResourceType and RuleActionType as string *enums*,
 * which reject the plain string literals. The literals have to be what we send:
 * Firefox exposes no RuleActionType enum at all, so reading `RuleActionType.ALLOW`
 * there threw "can't access property ALLOW" and the bypass rule was never built.
 * The enum members are these same strings, so Chrome accepts them too.
 *
 * This alias exists so the literals stay typo-checked without depending on an
 * enum that only exists on one of the two engines.
 */
type ResourceTypeValue =
  | 'main_frame'
  | 'sub_frame'
  | 'script'
  | 'image'
  | 'xmlhttprequest'

// the block key tab 
function blockedKey(tabId: number): string {
  return `${BLOCKED_KEY_PREFIX}${tabId}`
}

/** when we want to allow a website so we do make an Id for it . */
function bypassRuleId(domain: string): number {
  let hash = 0
  for (const char of domain) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0
  }
  return BYPASS_ID_BASE + (Math.abs(hash) % BYPASS_ID_RANGE)
}

chrome.webNavigation?.onBeforeNavigate.addListener((details) => {
  // frameId 0 is the top-level navigation; subframes are not the blocked page.
  if (details.frameId !== 0) return
  if (!/^https?:/.test(details.url)) return

  void chrome.storage.session.set({
    [blockedKey(details.tabId)]: { url: details.url, at: Date.now() },
  })
})

/*
 * Remembers the last real web page each tab was on, so the interstitial can
 * show where "Go Back to safety" would land.
 *
 * onCommitted rather than onBeforeNavigate: a committed URL is one that
 * actually loaded. The blocked URL is redirected and never commits, and the
 * interstitial is a chrome-extension:// URL that fails the scheme test below,
 * so neither overwrites the value.
 */
const LAST_PAGE_KEY_PREFIX = 'lastPage:'

function lastPageKey(tabId: number): string {
  return `${LAST_PAGE_KEY_PREFIX}${tabId}`
}

chrome.webNavigation?.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return
  if (!/^https?:/.test(details.url)) return

  console.log('[LinkLens] lastPage', details.tabId, details.url)

  void chrome.storage.session.set({
    [lastPageKey(details.tabId)]: details.url,
  })
})

chrome.tabs.onRemoved.addListener((tabId) => {
  void chrome.storage.session.remove(blockedKey(tabId))
  void chrome.storage.session.remove(lastPageKey(tabId))
})

// `api`, not `chrome`: Firefox's chrome.* namespace is callback-only under MV2,
// so a listener registered on it would not surface its returned promise and the
// page's sendMessage would resolve before the rule below was installed.
api.runtime.onMessage.addListener(async (message) => {
  if (!message || message.action !== 'proceed') return

  const { domain, permanent } = message as { domain: string; permanent: boolean }
  const ruleId = bypassRuleId(domain)
  console.log('[LinkLens] install bypass', { ruleId, domain, permanent })

  const dnr = api.declarativeNetRequest

  // Mirrors every resourceType the blocking rule in rules.json covers. A
  // main_frame-only allow would let the document through with its images and
  // XHR still blocked, so the page would load broken.
  const resourceTypes = [
    'main_frame',
    'sub_frame',
    'script',
    'image',
    'xmlhttprequest',
  ] satisfies ResourceTypeValue[]

  // One cast, at assembly. See ResourceTypeValue above for why the literals
  // cannot be typed as the enums directly.
  const rule = {
    id: ruleId,
    // `allow` outranks `redirect` at equal priority, so no bump is needed.
    priority: 1,
    action: { type: 'allow' },
    condition: { urlFilter: `||${domain}^`, resourceTypes },
  } as unknown as chrome.declarativeNetRequest.Rule

  const update = permanent ? dnr.updateDynamicRules : dnr.updateSessionRules

  // remove-then-add keeps repeat clicks idempotent. Session rules already die
  // with the browser, so there is no expiry timer — and a setTimeout could not
  // survive service-worker termination anyway.
  //
  // Awaited, and in the promise form rather than the callback form. The page
  // navigates the instant sendMessage resolves, so the rule has to exist by
  // then. A callback version returned immediately and the first click landed
  // back on the interstitial because the rule was still being installed.
  try {
    await update({ removeRuleIds: [ruleId], addRules: [rule] })
    console.log('[LinkLens] bypass installed', ruleId)
  } catch (error) {
    console.error('[LinkLens] bypass rule failed', error)
  }
})

// …after the existing listeners
startRulesSync()

// Safari has no side panel surface, so the sidebar page opens in a tab.
let sidebarTabId: number | undefined

function openSidebarTab() {
  const url = chrome.runtime.getURL('sidebar/index.html')

  const openNewTab = () => {
    chrome.tabs.create({ url }, (tab) => {
      sidebarTabId = tab?.id
    })
  }

  // A repeat click focuses the tab already opened instead of a new copy.
  const knownTabId = sidebarTabId

  if (knownTabId === undefined) {
    openNewTab()

    return
  }

  chrome.tabs.update(knownTabId, { active: true }, (tab) => {
    if (chrome.runtime.lastError || !tab) {
      openNewTab()

      return
    }

    // Selecting a tab in another window leaves that window behind the one the
    // user is looking at, so raise it too.
    chrome.windows?.update(tab.windowId, { focused: true })
  })
}

if (isFirefoxLike) {
  // Firefox refuses sidebarAction.open() outside a user input handler, and a
  // message listener is not one, so the toolbar click is the only route.
  browser.browserAction.onClicked.addListener(() => {
    void (async () => {
      // Firefox for Android has no sidebar surface at all: the sidebar_action
      // manifest key is ignored and sidebarAction is undefined, so calling it
      // throws rather than degrading. Reuse the tab fallback Safari uses.
      const { os } = await browser.runtime.getPlatformInfo()
      if (os === 'android') {
        openSidebarTab()

        return
      }

      browser.sidebarAction.open()
    })()
  })
}

if (isSafariLike) {
  // Safari never had setPanelBehavior, so the toolbar click needs a listener.
  chrome.action?.onClicked.addListener(() => {
    openSidebarTab()
  })

  chrome.runtime.onMessage.addListener((message) => {
    if (!message || message.type !== 'openSidebar') return

    openSidebarTab()
  })
}

if (!isFirefoxLike && !isSafariLike) {
  // setPanelBehavior only affects FUTURE action clicks, registering it
  // inside onClicked would swallow the first toolbar click.
  chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true })

  // The side panel API only exists in Chromium. Firefox opens the sidebar in
  // the listener above, so this listener is compiled out of gecko builds.
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (!message || message.type !== 'openSidebar') return

    // Every line here runs synchronously on purpose. sidePanel.open() is only
    // allowed inside the user gesture that the content-script click carries, and
    // a tabs.query callback outlives it: the panel then silently refuses to open.
    // sender.tab is the tab the click came from, so no lookup is needed at all.
    chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true })

    const tabId = sender.tab?.id
    if (!chrome.sidePanel?.open || tabId === undefined) return

    try {
      chrome.sidePanel?.open({ tabId })
    } catch (error) {
      console.error(error)
    }
  })
}
