import React from 'react'
import type {ReactNode} from 'react'
import {ChevronDownIcon} from './icons'
import './Section.css'

interface SectionProps {
  icon: ReactNode
  title: string
  /** Trailing control, e.g. the "view all" link on Recent activity. */
  action?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

/*
 * Section — the panel's collapsible card body, covering Figma frames 165:990
 * (Recent blocked links) and 163:474 (Recent activity). Both carry a
 * chevron_drop_down caret, which implies collapsibility, so it collapses.
 *
 * The body animates via grid-template-rows 0fr -> 1fr rather than a measured
 * height, so nothing has to know the content's pixel size.
 */
export default function Section({
  icon,
  title,
  action,
  defaultOpen = true,
  children,
}: SectionProps) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <div className="section" data-open={open}>
      <div className="section_header">
        {icon}
        <h2 className="section_title">{title}</h2>
        {action}
        <button
          type="button"
          className="section_toggle"
          aria-expanded={open}
          aria-label={`${open ? 'Collapse' : 'Expand'} ${title}`}
          onClick={() => setOpen(!open)}
        >
          <ChevronDownIcon size={24} />
        </button>
      </div>

      <div className="section_body">
        <div className="section_body_inner">{children}</div>
      </div>
    </div>
  )
}