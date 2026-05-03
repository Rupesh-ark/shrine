import { useMemo } from 'react'

interface HeroOverlayProps {
  progress: number
}

export function HeroOverlay({ progress }: HeroOverlayProps) {
  const fade = useMemo(() => {
    if (progress < 0.02) return 1
    if (progress > 0.18) return 0
    return 1 - (progress - 0.02) / (0.18 - 0.02)
  }, [progress])

  const lift = useMemo(() => {
    if (progress < 0.02) return 0
    if (progress > 0.18) return -24
    return -((progress - 0.02) / (0.18 - 0.02)) * 24
  }, [progress])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: isMobile ? 'clamp(32px, 6vh, 64px)' : 'clamp(48px, 8vh, 120px)',
        paddingLeft: isMobile ? '20px' : '0',
        paddingRight: isMobile ? '20px' : '0',
        pointerEvents: fade < 0.1 ? 'none' : 'auto',
        opacity: fade,
        transform: `translateY(${String(lift)}px)`,
        transition: 'opacity 0.1s linear',
      }}
    >
      <h1
        style={{
          fontFamily: "'Playfair Display', 'IM Fell English', Georgia, serif",
          fontSize: 'clamp(36px, 6vw, 80px)',
          fontWeight: 700,
          fontStyle: 'italic',
          color: '#E8DCC8',
          textShadow: '0 2px 20px rgba(0,0,0,0.6), 0 0 60px rgba(200,160,100,0.15)',
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
          color: '#C4A77D',
          letterSpacing: isMobile ? '2px' : '4px',
          textTransform: 'uppercase',
          marginTop: isMobile ? '12px' : '16px',
          textShadow: '0 1px 8px rgba(0,0,0,0.5)',
          textWrap: 'balance',
          textAlign: 'center',
          maxWidth: '100%',
        }}
      >
        Generalist · Builder · Curious
      </p>
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
