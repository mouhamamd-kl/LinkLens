import type {ReactNode} from 'react'
import './Button.css'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps {
  /**
   * `outline` is a white surface with a purple border; `solid` fills purple;
   * `ghost` is borderless and transparent — Figma 164:664 ("view details")
   * carries no fill and no stroke, so that is the authored state.
   */
  variant?: 'outline' | 'solid' | 'ghost'
  size?: ButtonSize
  icon?: ReactNode
  children?: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  /** Used when the action depends on data the page has not resolved yet. */
  disabled?: boolean
  /** Set on the unlabelled Figma 165:925 placeholder so it stays out of the tab order. */
  'aria-hidden'?: boolean
  tabIndex?: number
  'aria-label'?: string
}

/*
 * The Figma Button component, in all four sizes it is instantiated at across
 * the two surfaces:
 *
 *   lg  193x46 / 180x46  blocked page,            pad 12/24, r24, SemiBold 12/16
 *   md  275x38           panel warning card,       pad 8/12,  r24, SemiBold 12/16
 *   sm  124x30           panel "Continue anyway",  pad 4/6,   r24, Regular  10/16
 *   xs  72x20            panel "view details",     pad 2/8,   r4,  Regular  10/16
 *
 * The leading `info` slot exists on every instance but is `visible: false`
 * throughout the design, so it is not exposed here.
 */
export default function Button({
  variant = 'outline',
  size = 'lg',
  icon,
  children,
  onClick,
  type = 'button',
  disabled,
  tabIndex,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`button button--${variant} button--${size}`}
      onClick={onClick}
      disabled={disabled}
      tabIndex={tabIndex}
      {...rest}
    >
      <span className="button_label">{children}</span>
      {icon}
    </button>
  )
}