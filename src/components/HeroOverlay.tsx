import { useRef, useState } from 'react'
import { useIsMobile } from '../hooks/useMobile'
import { useProgressEffect } from '../hooks/useScrollProgress'

export function HeroOverlay() {
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useProgressEffect(undefined, (p) => {
    if (!visible) return
    const el = containerRef.current
    if (!el) return

    if (p > 0.2) {
      setVisible(false)
      return
    }

    const fade = p < 0.02 ? 1 : p > 0.18 ? 0 : 1 - (p - 0.02) / 0.16
    const lift = p < 0.02 ? 0 : p > 0.18 ? -24 : -((p - 0.02) / 0.16) * 24

    el.style.opacity = String(fade)
    el.style.transform = `translateY(${String(lift)}px)`
    el.style.pointerEvents = fade < 0.1 ? 'none' : 'auto'
  })

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: isMobile ? 'clamp(44px, 8vh, 76px)' : 'clamp(72px, 12vh, 150px)',
        paddingLeft: isMobile ? '20px' : '0',
        paddingRight: isMobile ? '20px' : '0',
      }}
    >
      <div
        style={{
          padding: isMobile ? '12px 24px' : '20px 48px',
          borderRadius: '12px',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 70%)',
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', 'IM Fell English', Georgia, serif",
            fontSize: 'clamp(36px, 6vw, 80px)',
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#F5E6D3',
            textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 4px 30px rgba(0,0,0,0.6), 0 0 80px rgba(200,160,100,0.2)',
            WebkitTextStroke: '1px rgba(0,0,0,0.35)',
            margin: 0,
            letterSpacing: '1px',
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          Rupesh Pandey
        </h1>
        <p
          style={{
            fontFamily: "'Noto Serif JP', 'Yu Mincho', 'Georgia', serif",
            fontSize: isMobile ? 'clamp(11px, 3vw, 14px)' : 'clamp(14px, 1.6vw, 20px)',
            color: '#D4B896',
            letterSpacing: isMobile ? '2px' : '4px',
            textTransform: 'uppercase',
            marginTop: isMobile ? '12px' : '16px',
            textShadow: '0 1px 6px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.5)',
            textWrap: 'balance',
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          Generalist · Builder · Curious
        </p>
      </div>
      <div
        style={{
          marginTop: isMobile ? '32px' : '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: isMobile ? '11px' : '12px',
            color: '#8A9AB0',
            letterSpacing: '2px',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}
        >
          Scroll down
        </span>
        <div
          style={{
            width: '1px',
            height: isMobile ? '24px' : '32px',
            background: 'linear-gradient(to bottom, #8A9AB0, transparent)',
            animation: 'heroBounce 2s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes heroBounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(8px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}