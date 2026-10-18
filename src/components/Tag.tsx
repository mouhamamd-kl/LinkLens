import './Tag.css'

interface TagProps {
  /**
   * Maps onto the Figma `Alias` ramps via the `Mapped` layer. The warning tag
   * in both surfaces uses `error` (red-50 surface, red-500 label).
   */
  tone?: 'error' | 'warning' | 'success' | 'information' | 'neutral'
  /** `lg` is the blocked page's 209x32 tag; `sm` is the panel's 20px pill. */
  size?: 'lg' | 'sm'
  weight?: 'regular' | 'semibold'
  /** Figma instances disagree on this — the panel's warning tag is r12, its activity tags r4. */
  radius?: number
  children: string
}

/*
 * Tag — Figma component "Priority Option".
 *
 *   lg  209x32  pad 4/8   r4   SemiBold 20/24   blocked page
 *   sm  109x20  pad 2/6   r12  SemiBold 10/16   panel warning card
 *   sm  106x20  pad 2/6   r4   Regular  10/16   panel activity rows
 *
 * The 8x8 status dot present on every instance is `visible: false` throughout,
 * so it is not rendered.
 */
export default function Tag({
  tone = 'error',
  size = 'lg',
  weight = 'semibold',
  radius,
  children,
}: TagProps) {
  const style = radius == null ? undefined : { borderRadius: radius }

  return (
    <span
      className={`tag tag--${tone} tag--${size} tag--${weight}`}
      style={style}
    >
      {children}
    </span>
  )
}