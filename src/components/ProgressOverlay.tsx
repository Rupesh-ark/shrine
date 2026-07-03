import { useMemo, useRef, useState, useEffect } from 'react'
import { useIsMobile } from '../hooks/useMobile'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { useRendererStats } from '../devRendererStats'

function useFps() {
  const [fps, setFps] = useState(0)
  const frames = useRef(0)
  const last = useRef(0)

  useEffect(() => {
    last.current = performance.now()
    let raf: number
    const tick = () => {
      frames.current++
      const now = performance.now()
      if (now - last.current >= 500) {
        setFps(Math.round(frames.current / ((now - last.current) / 1000)))
        frames.current = 0
        last.current = now
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(raf) }
  }, [])

  return fps
}

export function ProgressOverlay() {
  const isMobile = useIsMobile()
  const fps = useFps()
  const rendererStats = useRendererStats()
  const progress = useScrollProgress()
  const progressLabel = progress.toFixed(3)

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
      <div
        style={{
          position: 'fixed',
          top: isMobile ? '12px' : '16px',
          left: isMobile ? '12px' : '16px',
          zIndex: 11,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          minWidth: isMobile ? '92px' : '112px',
          padding: isMobile ? '8px 10px' : '10px 12px',
          border: '1px solid rgba(196,167,125,0.22)',
          borderRadius: '10px',
          background: 'linear-gradient(180deg, rgba(10,12,18,0.78), rgba(10,12,18,0.62))',
          boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: "'Noto Serif JP', 'Yu Mincho', serif",
            fontSize: isMobile ? '9px' : '10px',
            letterSpacing: '1.8px',
            textTransform: 'uppercase',
            color: '#8A9AB0',
            opacity: 0.86,
          }}
        >
          Progress
        </span>
        <span
          style={{
            fontFamily: "'Playfair Display', 'IM Fell English', Georgia, serif",
            fontSize: isMobile ? '20px' : '24px',
            lineHeight: 1,
            color: '#F5E6D3',
            textShadow: '0 1px 8px rgba(0,0,0,0.45)',
          }}
        >
          {progressLabel}
        </span>
        <span
          style={{
            fontFamily: "'Noto Serif JP', 'Yu Mincho', serif",
            fontSize: isMobile ? '9px' : '10px',
            letterSpacing: '1.4px',
            color: '#C4A77D',
            opacity: 0.88,
          }}
        >
          {phase} · {subLabel}
        </span>
        <span
          style={{
            fontFamily: "'Playfair Display', 'IM Fell English', Georgia, serif",
            fontSize: isMobile ? '13px' : '15px',
            lineHeight: 1,
            color: fps < 30 ? '#e84040' : fps < 50 ? '#c4a77d' : '#6abf69',
            textShadow: '0 1px 6px rgba(0,0,0,0.4)',
          }}
        >
          {fps} FPS
        </span>
        <span
          style={{
            fontFamily: "'Noto Serif JP', 'Yu Mincho', serif",
            fontSize: isMobile ? '8px' : '9px',
            letterSpacing: '1px',
            color: '#C4A77D',
            opacity: 0.86,
          }}
        >
          {rendererStats.calls} calls · {rendererStats.triangles.toLocaleString()} tris
        </span>
        {!isMobile && (
          <span
            style={{
              fontFamily: "'Noto Serif JP', 'Yu Mincho', serif",
              fontSize: '8px',
              letterSpacing: '1px',
              color: '#8A9AB0',
              opacity: 0.78,
            }}
          >
            {rendererStats.geometries} geo · {rendererStats.textures} tex · {rendererStats.programs} programs
          </span>
        )}
      </div>

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
