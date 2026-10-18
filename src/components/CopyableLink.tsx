import React from 'react'
import {CheckIcon, LinkIcon} from './icons'
import './CopyableLink.css'

interface CopyableLinkProps {
  /** Written to the clipboard. */
  value: string
  /** Displayed beside the button; may be shorter than `value`. */
  label: string
  resetAfter?: number
}

/*
 * The icon button inside the panel's URL strip (Figma 171:1164).
 *
 * Only the 16x16 icon is clickable — the text beside it stays plain text so a
 * truncated URL can still be selected and copied by hand. On success the icon
 * swaps to a checkmark and reverts after `resetAfter`.
 *
 * The visually hidden status region exists because an icon swap announces
 * nothing to a screen reader; role="status" already implies aria-live="polite",
 * so it is not repeated.
 */
export default function CopyableLink({
  value,
  label,
  resetAfter = 2000,
}: CopyableLinkProps) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      /* Clipboard rejected (focus, permission). Leave the affordance alone
         rather than flashing a success state that did not happen. */
      return
    }

    setCopied(true)

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), resetAfter)
  }

  return (
    <>
      <button
        type="button"
        className="copy-link_button"
        data-copied={copied}
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy blocked link'}
      >
        {copied ? <CheckIcon size={16} /> : <LinkIcon size={16} />}
      </button>

      <span className="copy-link_text">{label}</span>

      <span className="copy-link_status" role="status">
        {copied ? 'Link copied' : ''}
      </span>
    </>
  )
}