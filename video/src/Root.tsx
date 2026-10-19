import React from 'react'
import {Composition} from 'remotion'
import {LinkLensVideo, TOTAL} from './LinkLensVideo'

const FPS = 30

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="LinkLensVideo"
      component={LinkLensVideo}
      durationInFrames={TOTAL}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
)
