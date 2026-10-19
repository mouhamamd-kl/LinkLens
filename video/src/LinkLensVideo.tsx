import React from 'react'
import {AbsoluteFill, Sequence} from 'remotion'
import {ColdOpen} from './scenes/ColdOpen'
import {CredentialsStolen} from './scenes/CredentialsStolen'
import {TheProblem} from './scenes/TheProblem'
import {Reveal} from './scenes/Reveal'
import {NetworkLayer} from './scenes/NetworkLayer'
import {BlockPageScene} from './scenes/BlockPageScene'
import {SidePanelScene} from './scenes/SidePanelScene'
import {ControlScene} from './scenes/ControlScene'
import {Proof} from './scenes/Proof'
import {Everywhere} from './scenes/Everywhere'
import {Close} from './scenes/Close'
import {color} from './theme'

/*
 * The cut. 5400 frames = 180s at 30fps.
 *
 * Scenes butt against each other with no crossfade on purpose — each one opens
 * or closes on its own colour, and a dissolve between two different framings
 * reads as a mistake rather than a transition.
 */
export const SCENES = [
  {id: 'cold-open', label: 'Act 1 — the email', from: 0, dur: 480, tone: color.purple[500]},
  {id: 'credentials-stolen', label: 'Act 2 — the theft', from: 480, dur: 360, tone: color.red[500]},
  {id: 'the-problem', label: 'Act 3 — the problem', from: 840, dur: 720, tone: color.purple[500]},
  {id: 'reveal', label: 'Act 4 — the reveal', from: 1560, dur: 360, tone: color.purple[600]},
  {id: 'network', label: 'Act 5.1 — network layer', from: 1920, dur: 660, tone: color.purple[500]},
  {id: 'block-page', label: 'Act 5.2 — block page', from: 2580, dur: 660, tone: color.purple[500]},
  {id: 'side-panel', label: 'Act 5.3 — side panel', from: 3240, dur: 720, tone: color.purple[500]},
  {id: 'control', label: 'Act 5.4 — override', from: 3960, dur: 480, tone: color.purple[500]},
  {id: 'proof', label: 'Act 6 — the proof', from: 4440, dur: 480, tone: color.purple[500]},
  {id: 'everywhere', label: 'Act 7 — reach', from: 4920, dur: 300, tone: color.purple[600]},
  {id: 'close', label: 'Act 8 — close', from: 5220, dur: 180, tone: color.purple[600]},
] as const

export const TOTAL = SCENES.reduce((max, s) => Math.max(max, s.from + s.dur), 0)

export const LinkLensVideo: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: color.bg}}>
    {SCENES.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.label}>
        <Scene id={s.id} />
      </Sequence>
    ))}
  </AbsoluteFill>
)

const Scene: React.FC<{id: (typeof SCENES)[number]['id']}> = ({id}) => {
  switch (id) {
    case 'cold-open':
      return <ColdOpen />
    case 'credentials-stolen':
      return <CredentialsStolen />
    case 'the-problem':
      return <TheProblem />
    case 'reveal':
      return <Reveal />
    case 'network':
      return <NetworkLayer />
    case 'block-page':
      return <BlockPageScene />
    case 'side-panel':
      return <SidePanelScene />
    case 'control':
      return <ControlScene />
    case 'proof':
      return <Proof />
    case 'everywhere':
      return <Everywhere />
    case 'close':
      return <Close />
    default:
      return null
  }
}
