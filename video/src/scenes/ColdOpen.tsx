import React from 'react'
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion'
import {Backdrop, Caption} from '../components/Chrome'
import {alpha} from '../lib/anim'
import {color, font, mono} from '../theme'

/**
 * ACT 1 — the trap.
 *
 * A routine-looking email, rendered as a real mail client. Nothing here is
 * alarmed or red: the whole point of the opening is that it looks fine.
 */

const W = 1300
const H = 820
const WIN_X = (1920 - W) / 2
const WIN_Y = (1080 - H) / 2 - 30

export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame()

  const winIn = interpolate(frame, [10, 46], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })

  const senderAt = interpolate(frame, [50, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  const subjectAt = interpolate(frame, [80, 112], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  const bodyAt = interpolate(frame, [112, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  const ctaAt = interpolate(frame, [150, 190], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  })

  // The CTA's attention pulse, deliberately subtle — it reads as ordinary UI.
  const pulse = 1 + Math.sin((frame - 190) / 14) * 0.012

  const row = (at: number) => ({
    opacity: at,
    transform: `translateY(${(1 - at) * 14}px)`,
  })

  return (
    <AbsoluteFill>
      <Backdrop tone="clean" seed={1} />

      <div
        style={{
          position: 'absolute',
          left: WIN_X,
          top: WIN_Y,
          width: W,
          height: H,
          borderRadius: 18,
          overflow: 'hidden',
          background: color.grey[50],
          boxShadow: `0 50px 120px -30px ${alpha(color.shadow, 0.32)}, 0 0 0 1px ${color.grey[300]}`,
          opacity: winIn,
          transform: `translateY(${(1 - winIn) * 30}px) scale(${0.98 + winIn * 0.02})`,
          fontFamily: font,
        }}
      >
        {/* mail toolbar */}
        <div
          style={{
            height: 66,
            background: color.grey[100],
            borderBottom: `1px solid ${color.grey[300]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 26px',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
            <span style={{fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: color.grey[800]}}>
              Mail
            </span>
            <span style={{fontSize: 14, fontWeight: 600, color: color.purple[500]}}>Inbox</span>
            <span style={{fontSize: 14, fontWeight: 500, color: color.grey[400]}}>Starred</span>
            <span style={{fontSize: 14, fontWeight: 500, color: color.grey[400]}}>Sent</span>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: color.grey[400],
              padding: '6px 14px',
              borderRadius: 14,
              background: color.grey[50],
              boxShadow: `inset 0 0 0 1px ${color.grey[300]}`,
            }}
          >
            Search
          </div>
        </div>

        {/* message */}
        <div style={{padding: '46px 62px', display: 'flex', flexDirection: 'column'}}>
          {/* sender */}
          <div style={{display: 'flex', alignItems: 'center', gap: 16, ...row(senderAt)}}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color.purple[300]}, ${color.purple[600]})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              A
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 3}}>
              <span style={{fontSize: 18, fontWeight: 700, color: color.grey[800], letterSpacing: '-0.01em'}}>
                Acme Account Services
              </span>
              <span style={{fontFamily: mono, fontSize: 13, color: color.grey[500]}}>
                no-reply@acme-corp-secure.com
              </span>
            </div>
            <span style={{marginLeft: 'auto', fontSize: 13, color: color.grey[400]}}>9:41 AM</span>
          </div>

          <h1
            style={{
              margin: '34px 0 0',
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: color.grey[800],
              ...row(subjectAt),
            }}
          >
            Action required: verify your account
          </h1>

          <p
            style={{
              margin: '22px 0 0',
              fontSize: 19,
              lineHeight: 1.65,
              fontWeight: 400,
              color: color.grey[600],
              maxWidth: 820,
              ...row(bodyAt),
            }}
          >
            We noticed a sign-in from a device we don&apos;t recognise. For the safety of
            your account, please confirm your details within 24 hours. Accounts that are
            not verified in time are automatically suspended.
          </p>

          {/* CTA — sits where the cursor will land */}
          {/*
            In normal flow, not absolute. An absolutely-positioned child here
            was being placed against this wrapper — `row()` gives the wrapper a
            transform, which makes it the containing block — so the button
            landed outside the window and was clipped away entirely.
          */}
          <div style={{marginTop: 46, alignSelf: 'center'}}>
            <div
              style={{
                width: 336,
                height: 64,
                borderRadius: 32,
                background: color.purple[500],
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                opacity: ctaAt,
                transform: `translateY(${(1 - ctaAt) * 16}px) scale(${pulse * (0.94 + ctaAt * 0.06)})`,
                boxShadow: `0 12px 30px -10px ${alpha(color.purple[500], 0.7)}`,
              }}
            >
              Continue to verification
            </div>
          </div>
        </div>
      </div>

      <Caption
        lines={['It starts with an email that looks ~completely routine~.']}
        start={116}
        stagger={1.4}
        size={44}
        bottom={110}
      />
    </AbsoluteFill>
  )
}
