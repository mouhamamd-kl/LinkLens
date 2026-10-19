import { api } from './webapi'

/**
 * Block counters and the recent-activity log.
 *
 * A block is only ever reported by the interstitial, which is reachable solely
 * through the declarativeNetRequest redirect. Nothing upstream of that knows
 * whether a navigation was blocked — webNavigation.onBeforeNavigate fires for
 * every http navigation, blocked or not — so the interstitial is the source.
 */

const TOTAL_KEY = 'stats:total'
const SESSION_KEY = 'stats:session'
const ACTIVITY_KEY = 'activity'

/** Capped so storage cannot grow without bound. */
const ACTIVITY_LIMIT = 25

export interface ActivityEntry {
  url: string
  at: number
}

export interface BlockStats {
  session: number
  total: number
}

/*
 * Read-modify-write on two storage keys would lose an increment if two tabs
 * were blocked at the same moment, so writes are serialised. The chain holds
 * the tail rather than the head, and a failed task must not break the chain
 * for the tasks behind it.
 */
let queue: Promise<unknown> = Promise.resolve()

function serialise<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.catch(() => undefined)

  return run
}

export async function recordBlock(url: string): Promise<void> {
  return serialise(async () => {
    const at = Date.now()

    // Session counter lives in storage.session, which the browser clears on
    // shutdown — which is what "in this session" has to mean. The lifetime
    // counter has to outlive that.
    const session = await api.storage.session.get(SESSION_KEY)
    const sessionCount = (session[SESSION_KEY] as number | undefined) ?? 0

    const local = await api.storage.local.get([TOTAL_KEY, ACTIVITY_KEY])
    const total = (local[TOTAL_KEY] as number | undefined) ?? 0
    const activity = (local[ACTIVITY_KEY] as ActivityEntry[] | undefined) ?? []

    await api.storage.session.set({ [SESSION_KEY]: sessionCount + 1 })
    await api.storage.local.set({
      [TOTAL_KEY]: total + 1,
      [ACTIVITY_KEY]: [{ url, at }, ...activity].slice(0, ACTIVITY_LIMIT),
    })
  })
}

export async function getStats(): Promise<BlockStats> {
  const [session, local] = await Promise.all([
    api.storage.session.get(SESSION_KEY),
    api.storage.local.get(TOTAL_KEY),
  ])

  return {
    session: (session[SESSION_KEY] as number | undefined) ?? 0,
    total: (local[TOTAL_KEY] as number | undefined) ?? 0,
  }
}

export async function getActivity(): Promise<ActivityEntry[]> {
  const stored = await api.storage.local.get(ACTIVITY_KEY)

  return (stored[ACTIVITY_KEY] as ActivityEntry[] | undefined) ?? []
}

/**
 * The page title is not available for a blocked URL: the redirect consumes the
 * navigation in the network stack, so nothing ever renders and there is no
 * title to read. The hostname is the most honest label available.
 */
export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

/**
 * Defangs a URL so it cannot survive being forwarded as a live link.
 *
 * The abuse-desk convention: break the host's dots. youtube.com becomes
 * youtube[.]com — inert as a URL, still readable by someone who needs to
 * recognise it. A blocked URL is routinely pasted into a chat to ask "is this
 * real?", and without this the warning is the thing that makes the link live.
 *
 * Only the host is touched. The scheme and path are inert without a host, so
 * defanging them would cost readability for nothing.
 */
export function defangUrl(url: string): string {
  const schemeEnd = url.indexOf('://')

  if (schemeEnd === -1) return url

  const scheme = url.slice(0, schemeEnd + 3)
  const rest = url.slice(schemeEnd + 3)

  // Stop at the path/query/fragment so only the authority is rewritten.
  const boundary = rest.search(/[/?#]/)
  const authority = boundary === -1 ? rest : rest.slice(0, boundary)
  const tail = boundary === -1 ? '' : rest.slice(boundary)

  // Userinfo, if present, is not part of the host.
  const at = authority.lastIndexOf('@')
  const userinfo = at === -1 ? '' : authority.slice(0, at + 1)
  const host = at === -1 ? authority : authority.slice(at + 1)

  return `${scheme}${userinfo}${host.replace(/\./g, '[.]')}${tail}`
}

/** Matches the "2 min ago" shape the panel was drawn with. */
export function relativeTime(at: number, now = Date.now()): string {
  const minutes = Math.round((now - at) / 60_000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.round(minutes / 60)

  if (hours < 24) return `${hours} hr ago`

  const days = Math.round(hours / 24)

  return `${days} day${days === 1 ? '' : 's'} ago`
}