import React from 'react'
import './Toggle.css'

interface ToggleProps {
  checked: boolean
  onChange?: (checked: boolean) => void
  label: string
  /** Dims the control and suppresses the click — used while state is loading. */
  disabled?: boolean
}

/*
 * Toggle — Figma component `.SwitchButton` (162:350).
 * 128x68, cornerRadius 96, fill Surface/action, border Border/action,
 * padding 8, itemSpacing 20, end-aligned, with a 48x48 Surface/default knob.
 *
 * That is far larger than a conventional switch; it is reproduced as authored.
 */
export default function Toggle({checked, onChange, label, disabled = false}: ToggleProps) {
  const classes = [
    'toggle',
    checked ? 'toggle--on' : 'toggle--off',
    disabled ? 'toggle--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      aria-label={label}
      className={classes}
      disabled={disabled}
      onClick={() => {
        // Belt and braces: the `disabled` attribute already suppresses this,
        // but the guard keeps the handler honest if it is ever wired elsewhere.
        if (disabled) return
        onChange?.(!checked)
      }}
    >
      <span className="toggle_knob" />
    </button>
  )
}