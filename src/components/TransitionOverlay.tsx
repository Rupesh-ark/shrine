import { useMemo } from 'react'

interface TransitionOverlayProps {
  progress: number
}

export function TransitionOverlay({ progress }: TransitionOverlayProps) {
  const fade = useMemo(() => {
    // Appears around 0.72, peaks at 0.82, gone by 0.90
    if (progress < 0.70) return 0
    if (progress < 0.78) return (progress - 0.70) / (0.78 - 0.70)
    if (progress < 0.84) return 1
    if (progress < 0.92) return 1 - (progress - 0.84) / (0.92 - 0.84)
    return 0
  }, [progress])

  if (fade <= 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: fade,
        background: 'radial-gradient(ellipse at center, rgba(10,8,6,0.0) 0%, rgba(10,8,6,0.65) 100%)',
      }}
    >
      <p
        style={{
          fontFamily: "'Noto Serif JP', 'Yu Mincho', serif",
          fontSize: 'clamp(16px, 2.2vw, 26px)',
          color: '#C4A77D',
          letterSpacing: '6px',
          textShadow: '0 2px 12px rgba(0,0,0,0.7)',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        履歴書を開く
      </p>
      <p
        style={{
          fontFamily: "'Playfair Display', 'IM Fell English', Georgia, serif",
          fontSize: 'clamp(12px, 1.2vw, 16px)',
          fontStyle: 'italic',
          color: '#8A9AB0',
          letterSpacing: '3px',
          marginTop: '12px',
          textShadow: '0 1px 8px rgba(0,0,0,0.6)',
        }}
      >
        Unfurling the scroll…
      </p>
      <div
        style={{
          marginTop: '28px',
          width: '120px',
          height: '1px',
          background: 'linear-gradient(to right, transparent, #C4A77D, transparent)',
          opacity: 0.5,
        }}
      />
    </div>
  )
}
