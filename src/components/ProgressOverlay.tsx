import { useMemo } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'

interface ProgressOverlayProps {
  progress: number
}

export function ProgressOverlay({ progress }: ProgressOverlayProps) {
  const isMobile = useIsMobile()

  const phase = useMemo(() => {
    if (progress < 0.05) return 'enter'
    if (progress < 0.88) return 'journey'
    if (progress < 0.98) return 'reveal'
    return 'end'
  }, [progress])

  const label = useMemo(() => {
    switch (phase) {
      case 'enter': return 'Scroll to enter'
      case 'journey': return 'Keep scrolling'
      case 'reveal': return 'Unfurling scroll…'
      case 'end': return 'Scroll up to exit'
    }
  }, [phase])

  const subLabel = useMemo(() => {
    switch (phase) {
      case 'enter': return '入る'
      case 'journey': return '進む'
      case 'reveal': return '開く'
      case 'end': return '戻る'
    }
  }, [phase])

  return (
    <div
      style={{
        position: 'fixed',
        right: isMobile ? '10px' : 'clamp(16px, 2.5vw, 32px)',
        top: 0,
        bottom: 0,
        zIndex: 9,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        width: isMobile ? '28px' : '40px',
      }}
    >
      {/* Track */}
      <div
        style={{
          position: 'relative',
          width: '1px',
          height: isMobile ? 'clamp(80px, 14vh, 140px)' : 'clamp(120px, 20vh, 200px)',
          background: 'linear-gradient(to bottom, transparent, rgba(196,167,125,0.25), transparent)',
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transformOrigin: 'top',
            transform: `scaleY(${String(Math.round(progress * 100) / 100)})`,
            background: 'linear-gradient(to bottom, rgba(196,167,125,0), rgba(196,167,125,0.6))',
            transition: 'transform 0.15s ease-out',
          }}
        />
        {/* Thumb / marker */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            transform: `translate(-50%, ${String(Math.round(progress * 100))}%)`,
            width: isMobile ? '4px' : '6px',
            height: isMobile ? '4px' : '6px',
            borderRadius: '50%',
            background: '#C4A77D',
            boxShadow: '0 0 8px rgba(196,167,125,0.5)',
            transition: 'transform 0.15s ease-out',
          }}
        />
      </div>

      {/* Labels */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        <span
          style={{
            fontFamily: "'Noto Serif JP', 'Yu Mincho', serif",
            fontSize: isMobile ? '9px' : '11px',
            color: '#C4A77D',
            letterSpacing: '3px',
            opacity: 0.85,
            textShadow: '0 1px 6px rgba(0,0,0,0.5)',
          }}
        >
          {subLabel}
        </span>
        {!isMobile && (
          <span
            style={{
              fontFamily: "'Playfair Display', 'IM Fell English', Georgia, serif",
              fontSize: '10px',
              fontStyle: 'italic',
              color: '#8A9AB0',
              letterSpacing: '1px',
              opacity: 0.7,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              marginTop: '6px',
            }}
          >
            {label}
          </span>
        )}
      </div>

      {/* Decorative top/bottom dots */}
      <div
        style={{
          position: 'absolute',
          top: `calc(50% - ${isMobile ? 'clamp(40px, 7vh, 70px)' : 'clamp(60px, 10vh, 100px)'} - 12px)`,
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: 'rgba(196,167,125,0.3)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: `calc(50% + ${isMobile ? 'clamp(40px, 7vh, 70px)' : 'clamp(60px, 10vh, 100px)'} + 12px)`,
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: 'rgba(196,167,125,0.3)',
        }}
      />
    </div>
  )
}
