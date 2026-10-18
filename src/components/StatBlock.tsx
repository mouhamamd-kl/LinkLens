import './StatBlock.css'

interface StatBlockProps {
  label: string
  value: string
}

/*
 * StatBlock — the "Blocked In This Session / 20" pair (162:436).
 * Vertical stack, itemSpacing 12, centre/centre, 125x44.
 * Label is paragraph overline 10/16 in #29272B; value is paragraph xsm 12/16
 * SemiBold in #161516. Label comes first in the Figma child order.
 */
export default function StatBlock({label, value}: StatBlockProps) {
  return (
    <div className="stat">
      <span className="stat_label">{label}</span>
      <span className="stat_value">{value}</span>
    </div>
  )
}