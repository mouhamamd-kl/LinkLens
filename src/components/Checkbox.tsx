import React from 'react'
import {CheckIcon} from './icons'
import './Checkbox.css'

interface CheckboxProps {
  label: string
  /** Figma shows the checked state (purple fill + check mark). */
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
}

/*
 * Checkbox — Figma instance I169:1078;49:284 inside the "CheckBox Label"
 * wrapper 169:1078.
 * Box: 36x36, padding 8, itemSpacing 10, cornerRadius 4, strokeWeight 1.
 * Wrapper: horizontal, itemSpacing 12, centre-aligned, label at Regular 16/20.
 */
export default function Checkbox({label, defaultChecked = true, onChange}: CheckboxProps) {
  const [checked, setChecked] = React.useState(defaultChecked)

  const toggle = () => {
    const next = !checked
    setChecked(next)
    onChange?.(next)
  }

  return (
    <label className="checkbox">
      <input
        type="checkbox"
        className="checkbox_input"
        checked={checked}
        onChange={toggle}
      />
      <span className="checkbox_box" aria-hidden="true">
        {checked ? <CheckIcon size={20} /> : null}
      </span>
      <span className="checkbox_label">{label}</span>
    </label>
  )
}