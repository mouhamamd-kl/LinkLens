import type {ReactNode} from 'react'
import './Card.css'

interface CardProps {
  /** Figma's counterAxisAlignItems varies per card — some hug content, some centre. */
  align?: 'start' | 'center'
  children: ReactNode
}

/*
 * Card — the panel's surface container (Figma frames 164:528, 162:421,
 * 163:483, 163:473). All four share: fill Surface/default, cornerRadius 10,
 * padding 12, itemSpacing 16. Width is not fixed — it is the 299px the 319px
 * panel has left after its own 10px gutters.
 */
export default function Card({align = 'start', children}: CardProps) {
  return (
    <section className={`card card--${align}`}>
      {children}
    </section>
  )
}

/** The 1px rule used between stats and under the warning card. */
export function Divider({vertical = false}: {vertical?: boolean}) {
  return <hr className={vertical ? 'divider divider--vertical' : 'divider'} />
}