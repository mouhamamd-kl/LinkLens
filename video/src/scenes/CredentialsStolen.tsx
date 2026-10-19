import React from 'react'
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion'
import {Backdrop, Caption} from '../components/Chrome'
import {BrowserFrame, Cursor} from '../components/Browser'
import {FakeLogin} from '../components/Panel'
import {alpha, fadeIn, typed} from '../lib/anim'
import {color, font} from '../theme'

/**
 * ACT 2 — the trap pays off.
 *
 * The click, the typing, the handover. The address bar carries the only clue in
 * the whole sequence, and it is small — that is the argument the video is making.
 */

const EMAIL = 'jordan.reyes@gmail.com'
const PASSWORD = 'Tr0ub4dor&3'

/** Field centres inside the FakeLogin card, in composition coordinates. */
const EMAIL_POS = {x: 960, y: 569}
const PASS_POS = {x: 960, y: 645}
const SIGNIN_POS = {x: 960, y: 703}

export const CredentialsStolen: React.FC = () => {
  const frame = useCurrentFrame()

  const browserIn = fadeIn(frame, 12, 34)
  const urlCallout = fadeIn(frame, 62, 24)

  // Typing windows.
  const emailText = typed(frame, EMAIL, 2, 78)
  const passwordChars = Math.floor(Math.max(0, frame - 142) / 2)
  const passText = frame < 142 ? '' : '•'.repeat(Math.min(PASSWORD.length, passwordChars))

  const clicked = frame >= 224
  const flash = clicked ? interpolate(frame, [224, 246, 276, 320], [0, 1, 0.85, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }) : 0

  const bannerAt = fadeIn(frame, 250, 22)

  return (
    <AbsoluteFill>
      <Backdrop tone="clean" seed={2} />

      {/* Browser */}
      <div
        style={{
          position: 'absolute',
          left: (1920 - 1560) / 2,
          top: (1080 - 880) / 2,
          opacity: browserIn,
          transform: `scale(${0.97 + browserIn * 0.03})`,
        }}
      >
        <BrowserFrame
          url="https://acme-corp-secure.com/verify/login"
          urlState="neutral"
          title="Sign in — Acme Corp"
          appear={1}
        >
          <FakeLogin email={emailText} showPassword={passText.length > 0} password={passText} />
        </BrowserFrame>
      </div>

      {/* Cursor: click the CTA offscreen -> land on email -> password -> sign in */}
      <Cursor
        path={[
          {x: 960, y: 380},
          EMAIL_POS,
          PASS_POS,
          SIGNIN_POS,
        ]}
        times={[12, 78, 142, 224]}
        clicks={[224]}
      />

      {/* The one clue: the lookalike domain, called out */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 300,
          top: 160,
          opacity: urlCallout,
          transform: `translateY(${(1 - urlCallout) * -10}px)`,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 20px',
            borderRadius: 999,
            background: color.grey[50],
            boxShadow: `0 10px 30px -8px ${alpha(color.shadow, 0.3)}, 0 0 0 1.5px ${color.orange[500]}`,
            fontFamily: font,
            fontSize: 17,
            fontWeight: 600,
            color: color.grey[800],
          }}
        >
          <span style={{color: color.orange[500], fontSize: 20}}>!</span>
          <span>
            The only difference: <span style={{color: color.orange[500]}}>-secure.com</span>
          </span>
        </div>
        {/* pointer down to the address bar */}
        <div
          style={{
            width: 2,
            height: 58,
            margin: '0 auto',
            background: color.orange[500],
          }}
        />
      </div>

      {/* Stolen banner */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: alpha(color.red[500], flash * 0.9),
          opacity: bannerAt,
          zIndex: 80,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
          <ShieldBroken size={96} />
          <div
            style={{
              fontFamily: font,
              fontSize: 58,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#fff',
              textAlign: 'center',
            }}
          >
            Your password is now theirs.
          </div>
          <div
            style={{
              fontFamily: font,
              fontSize: 22,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.85)',
            }}
          >
            Credentials sent to acme-corp-secure.com
          </div>
        </div>
      </div>

      <Caption
        lines={[
          'One click. Thirty seconds.',
          '!And your credentials are gone! — the page looked *identical*.',
        ]}
        start={30}
        stagger={1.4}
        size={42}
        bottom={104}
      />
    </AbsoluteFill>
  )
}

const ShieldBroken: React.FC<{size?: number}> = ({size = 90}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2.6l7.2 2.8v6.1c0 4.5-3 8.3-7.2 9.9-4.2-1.6-7.2-5.4-7.2-9.9V5.4L12 2.6z"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M4.2 3.4l15.6 17.2" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
  </svg>
)
