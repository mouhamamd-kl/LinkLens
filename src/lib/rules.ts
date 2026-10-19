import { api } from './webapi'

/**
 * Remote additions to the static ruleset declared in manifest.json.
 *
 * The static ruleset is active the instant the extension loads and needs no JS.
 * These are the rules that change without shipping a build, layered on top as
 * dynamic rules.
 */

// Dev URL: the Laravel rules API (php artisan serve). On-device testing with
// the Android phone can't reach 127.0.0.1 — swap in this machine's LAN IP.
const REMOTE_RULES_URL = 'http://127.0.0.1:8000/api/rules'

/** Floor before the server can ask us to check again. Matches uBO's 4 hours. */
const MIN_REFRESH_HOURS = 4
const REFRESH_HOURS = 12

/**
 * Id bands. bypassRuleId() in background.ts puts "Continue anyway" rules at
 * 900_000+, so remote rules live below that: a refresh can then remove exactly
 * its own rules without touching the sites a user chose to allow.
 *
 * Exported because the protection toggle has to clear the same band when it
 * switches protection off — updateEnabledRulesets only reaches static
 * rulesets, so the dynamic half has to be removed by hand.
 */
export const REMOTE_ID_MIN = 10_000
export const REMOTE_ID_MAX = 899_999

/**
 * Dynamic rule ceiling. 5000 is the cap that holds on every target: Chromium
 * allows MAX_NUMBER_OF_DYNAMIC_RULES at that number, and Firefox allowed
 * MAX_NUMBER_OF_DYNAMIC_AND_SESSION_RULES at it up to v127. A response larger
 * than this cannot be applied at all — updateDynamicRules rejects the whole
 * batch — so it is truncated and logged instead.
 */
const MAX_REMOTE_RULES = 5000

const ALARM = 'linklens:rules'
const ALARM_RETRY = 'linklens:rules:retry'

/** Firefox throttles alarms fired sooner than this, so scheduling is clamped. */
const ALARM_FLOOR_MIN = 5

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS

/** Shape of what is written to storage.local. Keys are storage keys verbatim. */
interface RulesState {
  'rules:count': number
  'rules:updatedAt': number
  'rules:etag': string | null
  'rules:hours': number
}

/**
 * updateDynamicRules is atomic — one invalid rule rejects the whole batch and
 * nothing is applied — so a single malformed rule would silently freeze every
 * future update. Drop the bad ones before they get there, renumber so
 * server-side ids can never land in the bypass band, and default priority to 1
 * because the "Continue anyway" allow rules rely on `allow` outranking
 * `redirect` at equal priority.
 */
function normalise(raw: unknown): chrome.declarativeNetRequest.Rule[] {
  if (!Array.isArray(raw)) return []

  const out: chrome.declarativeNetRequest.Rule[] = []

  for (const candidate of raw) {
    if (out.length >= MAX_REMOTE_RULES) break
    if (out.length >= REMOTE_ID_MAX - REMOTE_ID_MIN) break
    if (!candidate || typeof candidate !== 'object') continue

    const rule = candidate as chrome.declarativeNetRequest.Rule
    if (!rule.action?.type || !rule.condition?.urlFilter) continue

    out.push({
      ...rule,
      id: REMOTE_ID_MIN + out.length,
      priority: rule.priority ?? 1,
    })
  }

  return out
}

/**
 * Server-declared refresh interval, the way uBO reads `!expires:` from a list.
 * A bare-array payload has no room for it and always takes the default.
 */
function readRefreshHours(body: unknown): number {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return REFRESH_HOURS

  const declared = (body as { updateAfter?: unknown }).updateAfter
  const hours = typeof declared === 'number' ? declared : Number(declared)

  return Number.isFinite(hours) && hours > 0
    ? Math.max(hours, MIN_REFRESH_HOURS)
    : REFRESH_HOURS
}

/** One sync at a time: onInstalled, onStartup and the alarm can all fire in
 * the same tick, and each duplicate re-downloads the list and churns every
 * installed rule. Later callers join the run already in flight. */
let inFlight: Promise<void> | null = null

export function syncRules(): Promise<void> {
  if (inFlight) return inFlight

  inFlight = runSync().finally(() => {
    inFlight = null
  })

  return inFlight
}

async function runSync(): Promise<void> {
  // api, not chrome: under Manifest V2 on Firefox the chrome.* namespace is
  // callback-only and returns undefined, so destructuring the result throws and
  // — with the caller doing `void syncRules()` — becomes an unhandled rejection
  // that never reaches the retry below.
  const stored = await api.storage.local.get(['rules:etag', 'rules:hours'])
  const etag = (stored['rules:etag'] as string | undefined) ?? null

  let refreshHours = REFRESH_HOURS

  try {
    const res = await fetch(REMOTE_RULES_URL, {
      headers: etag ? { 'If-None-Match': etag } : {},
      // Force the conditional request to reach the server rather than being
      // answered from the HTTP cache.
      cache: 'no-cache',
    })

    // Unchanged. Returning before touching DNR is the point of the ETag: no
    // rule churn, so no re-evaluation of in-flight requests.
    if (res.status === 304) return

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const body = await res.json()

    // The server sends { updateAfter, rules }; a bare array is still
    // accepted so a hand-authored file keeps working.
    const list: unknown[] = Array.isArray(body)
      ? body
      : Array.isArray((body as { rules?: unknown } | null)?.rules)
        ? (body as { rules: unknown[] }).rules
        : []

    const rules = normalise(list)

    // An empty or unusable response would otherwise be applied and wipe a
    // working ruleset. Treat it as a failure so the current one survives.
    if (rules.length === 0) throw new Error('no usable rules in response')

    if (list.length > rules.length) {
      console.warn(
        `[rules] response of ${list.length} exceeds the ${MAX_REMOTE_RULES}-rule cap; ` +
          `${list.length - rules.length} were dropped`,
      )
    }

    const existing = await api.declarativeNetRequest.getDynamicRules()
    // Band filter is the point: the user's "Continue anyway" allows sit above
    // REMOTE_ID_MAX and must survive every refresh.
    const stale = existing
      .filter((rule) => rule.id >= REMOTE_ID_MIN && rule.id <= REMOTE_ID_MAX)
      .map((rule) => rule.id)

    await api.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: stale,
      addRules: rules,
    })

    refreshHours = readRefreshHours(body)

    await api.storage.local.set({
      'rules:etag': res.headers.get('etag'),
      'rules:hours': refreshHours,
      'rules:count': rules.length,
      'rules:updatedAt': Date.now(),
    } satisfies RulesState)

    console.log('[rules] applied', rules.length)
  } catch (error) {
    // The previous ruleset stays installed. Retry shortly rather than waiting
    // out the full interval — a fresh install that failed here would otherwise
    // leave the remote set empty until the next scheduled sync.
    console.warn('[rules] sync failed, keeping current rules', error)
    chrome.alarms.create(ALARM_RETRY, { delayInMinutes: 5 })

    return
  }

  const due = Date.now() + refreshHours * HOUR_MS

  chrome.alarms.create(ALARM, {
    when: Math.max(due, Date.now() + ALARM_FLOOR_MIN * MINUTE_MS),
  })
}

export function startRulesSync(): void {
  chrome.runtime.onInstalled.addListener(({ reason }) => {
    // chrome_update and browser_update do not change the server's rules.
    if (reason !== 'install' && reason !== 'update') return

    void syncRules()
  })

  // Alarms do not persist across browser sessions (MDN), so without this the
  // sync silently stops after the first browser restart.
  chrome.runtime.onStartup.addListener(() => void syncRules())

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM || alarm.name === ALARM_RETRY) void syncRules()
  })
}