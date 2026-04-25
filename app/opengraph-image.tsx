import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Tend — AI Home Assistant Platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#34d399',
            letterSpacing: '-2px',
            marginBottom: 20,
          }}
        >
          Tend
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: '#f8fafc',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: 28,
            maxWidth: 900,
          }}
        >
          AI Home Assistant Platform
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: 24,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 820,
            lineHeight: 1.5,
          }}
        >
          Proactive maintenance reminders, instant warranty answers, and conversational onboarding — all over SMS. No app required.
        </div>

        {/* Bottom badge */}
        <div
          style={{
            marginTop: 48,
            padding: '10px 28px',
            borderRadius: 999,
            border: '1.5px solid #34d399',
            color: '#34d399',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          SMS-NATIVE · NO APP · MULTI-TENANT
        </div>
      </div>
    ),
    { ...size }
  )
}
