/*
 * Icons for the blocked page and side panel.
 *
 * Sized to the boxes their Figma instances occupy. Vector path data could not
 * be read back from Figma (the plugin session dropped mid-scan), so these are
 * reconstructions matching the measured geometry — swap in real exports if you
 * want pixel-exact glyphs.
 *
 * All inherit colour from their parent via currentColor.
 */

interface IconProps {
  size?: number
  className?: string
}

const box = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 20 20',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  className,
  'aria-hidden': true,
  focusable: false,
})

/* Leading icon on every Button instance — present in Figma but `visible: false`.
   Kept only so the variant can be re-enabled; nothing renders it today. */
export function InfoIcon({size = 20, className}: IconProps) {
  return (
    <svg {...box(size, className)}>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

export function DangerousIcon({size = 20, className}: IconProps) {
  return (
    <svg {...box(size, className)}>
      <path
        d="M10 2.5 18.5 17h-17L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 8.5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14.75" r="1" fill="currentColor" />
    </svg>
  )
}

export function ShieldIcon({size = 20, className}: IconProps) {
  return (
    <svg {...box(size, className)}>
      <path
        d="M10 1.75 3.5 4.5v5c0 4 2.7 7.2 6.5 8.75 3.8-1.55 6.5-4.75 6.5-8.75v-5L10 1.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CheckIcon({size = 20, className}: IconProps) {
  return (
    <svg {...box(size, className)}>
      <path
        d="m4 10.5 4 4 8-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SettingsIcon({size = 20, className}: IconProps) {
  return (
    <svg {...box(size, className)}>
      <circle cx="10" cy="10" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 1.5v2.25M10 16.25v2.25M18.5 10h-2.25M3.75 10H1.5M15.95 4.05l-1.6 1.6M5.65 14.35l-1.6 1.6M15.95 15.95l-1.6-1.6M5.65 5.65l-1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LinkIcon({size = 16, className}: IconProps) {
  return (
    <svg {...box(size, className)}>
      <path
        d="M8.5 11.5a3 3 0 0 0 4.24 0l2.5-2.5a3 3 0 0 0-4.24-4.24l-1 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11.5 8.5a3 3 0 0 0-4.24 0l-2.5 2.5a3 3 0 0 0 4.24 4.24l1-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ClockIcon({size = 16, className}: IconProps) {
  return (
    <svg {...box(size, className)}>
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 5.75V10l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronDownIcon({size = 20, className}: IconProps) {
  return (
    <svg {...box(size, className)}>
      <path d="m6.5 8.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}