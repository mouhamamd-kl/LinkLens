import React from 'react'
import './Toggle.css'

interface ToggleProps {
  checked: boolean
  onChange?: (checked: boolean) => void
  label: string
}

/*
 * Toggle — Figma component `.SwitchButton` (162:350).
 * 128x68, cornerRadius 96, fill Surface/action, border Border/action,
 * padding 8, itemSpacing 20, end-aligned, with a 48x48 Surface/default knob.
 *
 * That is far larger than a conventional switch; it is reproduced as authored.
 */
export default function Toggle({checked, onChange, label}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={checked ? 'toggle toggle--on' : 'toggle toggle--off'}
      onClick={() => onChange?.(!checked)}
    >
      <span className="toggle_knob" />
    </button>
  )
}