type WebApi = typeof chrome

/*
 * Firefox exposes promise-based WebExtension APIs under `browser`; Chromium
 * exposes them under `chrome`.
 *
 * The `chrome` namespace also exists in Firefox as a porting aid, but under
 * Manifest V2 it is callback-only: those methods return `undefined` rather than
 * a promise, so `await chrome.tabs.query(...)` resolves immediately with
 * `undefined` instead of waiting. Destructuring that result then throws.
 * Promise support was only added to the `chrome` namespace in MV3.
 *
 * Prefer this over calling `chrome.` directly anywhere the result is awaited.
 * Callbacks, event listeners and fire-and-forget writes behave identically in
 * both namespaces, so those can stay on `chrome.`.
 */
export const api: WebApi =
  (globalThis as { browser?: WebApi }).browser ?? chrome