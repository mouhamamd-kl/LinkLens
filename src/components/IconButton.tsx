import type {ReactNode} from 'react'
import './IconButton.css'

interface IconButtonProps {
  /** 36 in the panel header; the Figma `Button icon` component. */
  size?: number
  children: ReactNode
  label: string
  onClick?: () => void
}

/*
 * IconButton — Figma component `Button icon` (162:452).
 * 36x36, padding 8/12, itemSpacing 8, centre/centre, cornerRadius 4.
 */
export default function IconButton({size = 36, children, label, onClick}: IconButtonProps) {
  return (
    <button
      type="button"
      className="icon-button"
      style={{width: size, height: size}}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}