import { memo, useState, useEffect, useRef } from 'react'

interface EntryGateProps {
  onEnter: () => void
  ready?: boolean
}

type Phase = 'appear' | 'waiting' | 'idle' | 'spreading' | 'filled' | 'fading' | 'done'

const SCENE_BG = '#1A0F08'
const GATE_BG = '#F7F0DC'
const LANTERN_RED = '#8B1A1A'
const LANTERN_CORE = '#C42020'
const AMBER = '#1A0F08'

function EntryGateComponent({ onEnter, ready = false }: EntryGateProps) {
  const [phase, setPhase] = useState<Phase>('appear')
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase((prev) => {
        if (prev !== 'appear') return prev
        return ready ? 'idle' : 'waiting'
      })
    }, 800)
    const currentTimeouts = [...timeoutsRef.current, t]
    timeoutsRef.current = currentTimeouts
    return () => {
      currentTimeouts.forEach(clearTimeout)
    }
  }, [ready])

  const effectivePhase: Phase = phase === 'waiting' && ready ? 'idle' : phase

  const handleClick = () => {
    if (effectivePhase !== 'idle') return
    onEnter()
    setPhase('spreading')
    timeoutsRef.current.push(setTimeout(() => { setPhase('filled'); }, 1200))
    timeoutsRef.current.push(setTimeout(() => { setPhase('fading'); }, 1800))
    timeoutsRef.current.push(setTimeout(() => { setPhase('done'); }, 2800))
  }

  if (effectivePhase === 'done') return null

  const isSpreading = effectivePhase === 'spreading'
  const isFilled = effectivePhase === 'filled'
  const isFading = effectivePhase === 'fading'
  const isIdle = effectivePhase === 'idle'
  const isWaiting = effectivePhase === 'waiting'
  const isAppearing = effectivePhase === 'appear'

  const spreading = isSpreading || isFilled || isFading
  const blotchScale = spreading ? 4 : 0
  const secondaryScale = spreading ? 3.5 : 0
  const tertiaryScale = spreading ? 3.2 : 0
  const edgeScale = spreading ? 2.5 : 0
  const dotScale = spreading ? 1 : 0

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        cursor: isIdle ? 'pointer' : 'default',
        opacity: isFading ? 0 : 1,
        transition: isFading ? 'opacity 1.2s ease-in-out' : 'none',
        pointerEvents: isIdle ? 'auto' : 'none',
        overflow: 'hidden',
        background: GATE_BG,
      }}
    >
      {/* Paper grain vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse at 50% 30%, rgba(196,167,125,0.15) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 100%, rgba(92,74,42,0.12) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />

      {/* === DARK INK BLOTS (match scene color) === */}

      {/* Primary central blot */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '80vmin',
        height: '80vmin',
        transform: `translate(-50%, -50%) scale(${String(blotchScale)})`,
        background: `radial-gradient(circle at 45% 40%, ${SCENE_BG}ee 0%, ${SCENE_BG}dd 35%, ${SCENE_BG}aa 65%, transparent 100%)`,
        borderRadius: '43% 57% 52% 48% / 48% 43% 57% 52%',
        filter: 'blur(12px)',
        transition: 'transform 1.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
        pointerEvents: 'none',
      }} />

      {/* Secondary blot */}
      <div style={{
        position: 'absolute',
        left: '45%',
        top: '45%',
        width: '60vmin',
        height: '60vmin',
        transform: `translate(-50%, -50%) scale(${String(secondaryScale)})`,
        background: `radial-gradient(circle at 55% 55%, ${SCENE_BG}ee 0%, ${SCENE_BG}cc 50%, transparent 100%)`,
        borderRadius: '58% 42% 48% 52% / 52% 58% 42% 48%',
        filter: 'blur(16px)',
        transition: 'transform 1.5s cubic-bezier(0.22, 0.61, 0.36, 1) 0.1s',
        pointerEvents: 'none',
      }} />

      {/* Tertiary blot */}
      <div style={{
        position: 'absolute',
        left: '55%',
        top: '55%',
        width: '55vmin',
        height: '55vmin',
        transform: `translate(-50%, -50%) scale(${String(tertiaryScale)})`,
        background: `radial-gradient(circle at 40% 45%, ${SCENE_BG}dd 0%, ${SCENE_BG}bb 60%, transparent 100%)`,
        borderRadius: '48% 52% 58% 42% / 42% 48% 52% 58%',
        filter: 'blur(20px)',
        transition: 'transform 1.6s cubic-bezier(0.22, 0.61, 0.36, 1) 0.15s',
        pointerEvents: 'none',
      }} />

      {/* Edge bleed — top */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '-10%',
        width: '70vmin',
        height: '50vmin',
        transform: `translate(-50%, 0) scale(${String(edgeScale)})`,
        background: `radial-gradient(ellipse at center, ${SCENE_BG}dd 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(24px)',
        transition: 'transform 1.8s cubic-bezier(0.22, 0.61, 0.36, 1) 0.2s',
        pointerEvents: 'none',
      }} />

      {/* Edge bleed — bottom */}
      <div style={{
        position: 'absolute',
        left: '50%',
        bottom: '-10%',
        width: '65vmin',
        height: '45vmin',
        transform: `translate(-50%, 0) scale(${String(edgeScale)})`,
        background: `radial-gradient(ellipse at center, ${SCENE_BG}cc 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(28px)',
        transition: 'transform 1.7s cubic-bezier(0.22, 0.61, 0.36, 1) 0.25s',
        pointerEvents: 'none',
      }} />

      {/* Fine splatter dots */}
      {[
        { x: '48%', y: '48%', s: 1.2, d: 0.1 },
        { x: '52%', y: '47%', s: 0.9, d: 0.15 },
        { x: '46%', y: '53%', s: 1.0, d: 0.2 },
        { x: '54%', y: '52%', s: 0.8, d: 0.25 },
        { x: '50%', y: '44%', s: 0.7, d: 0.3 },
        { x: '44%', y: '50%', s: 0.6, d: 0.35 },
        { x: '56%', y: '48%', s: 0.5, d: 0.4 },
        { x: '47%', y: '56%', s: 0.7, d: 0.45 },
      ].map((dot, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: dot.x,
          top: dot.y,
          width: `${String(dot.s * 24)}px`,
          height: `${String(dot.s * 24)}px`,
          transform: `translate(-50%, -50%) scale(${String(dotScale)})`,
          background: SCENE_BG,
          borderRadius: `${String(40 + (i % 3) * 10)}% ${String(60 - (i % 3) * 10)}% ${String(50 + (i % 2) * 10)}% ${String(50 - (i % 2) * 10)}%`,
          filter: 'blur(1px)',
          transition: `transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) ${String(dot.d + 0.3)}s`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* === CENTER CONTENT === */}

      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isAppearing ? 0 : isSpreading || isFilled || isFading ? 0 : 1,
        transform: isAppearing || isSpreading ? 'scale(0.92)' : 'scale(1)',
        transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
        pointerEvents: 'none',
      }}>
        {/* Red 3D Sphere */}
        <div style={{
          position: 'relative',
          width: '64px',
          height: '64px',
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute',
            inset: '-28px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${LANTERN_RED}22 0%, transparent 65%)`,
            animation: isIdle ? 'sphereBreathe 4s ease-in-out infinite' : 'none',
          }} />

          {/* The sphere — layered for 3D depth */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            position: 'relative',
            transform: (isIdle || isWaiting) ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            {/* Base sphere body */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${LANTERN_CORE} 0%, ${LANTERN_RED} 35%, #8B1515 70%, #3A0A0A 100%)`,
              boxShadow: `inset -6px -6px 14px rgba(0,0,0,0.5), inset 4px 4px 10px rgba(255,200,180,0.25), 0 0 20px ${LANTERN_RED}44`,
            }} />

            {/* Specular highlight — sharp */}
            <div style={{
              position: 'absolute',
              top: '18%',
              left: '26%',
              width: '22%',
              height: '16%',
              borderRadius: '50%',
              background: 'rgba(255,245,230,0.7)',
              filter: 'blur(1px)',
              transform: 'rotate(-20deg)',
            }} />

            {/* Secondary softer highlight */}
            <div style={{
              position: 'absolute',
              top: '28%',
              left: '20%',
              width: '36%',
              height: '26%',
              borderRadius: '50%',
              background: 'rgba(255,220,200,0.18)',
              filter: 'blur(4px)',
              transform: 'rotate(-15deg)',
            }} />

            {/* Rim light — opposite side */}
            <div style={{
              position: 'absolute',
              bottom: '12%',
              right: '16%',
              width: '30%',
              height: '24%',
              borderRadius: '50%',
              background: 'rgba(255,150,140,0.15)',
              filter: 'blur(5px)',
              transform: 'rotate(20deg)',
            }} />

            {/* Core inner glow */}
            <div style={{
              position: 'absolute',
              top: '32%',
              left: '32%',
              width: '28%',
              height: '22%',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              filter: 'blur(6px)',
            }} />
          </div>
        </div>

        {/* Text */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
        }}>
          <p style={{
            fontFamily: "'Noto Serif JP', 'Yu Mincho', serif",
            fontSize: 'clamp(18px, 2.2vw, 26px)',
            color: '#1A0F08',
            letterSpacing: '8px',
            margin: 0,
            fontWeight: 700,
            opacity: 0.95,
          }}>
            {isWaiting ? '準備中' : '始める'}
          </p>
          <p style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(11px, 1.1vw, 13px)',
            fontStyle: 'italic',
            color: '#5C4A2A',
            letterSpacing: '3px',
            margin: 0,
          }}>
            {isWaiting ? 'Preparing shrine...' : 'Touch to begin'}
          </p>
        </div>
      </div>

      {/* Decorative corner accents */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        width: '48px',
        height: '48px',
        borderLeft: `1px solid ${AMBER}18`,
        borderTop: `1px solid ${AMBER}18`,
        opacity: (isIdle || isWaiting) ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        width: '48px',
        height: '48px',
        borderRight: `1px solid ${AMBER}18`,
        borderBottom: `1px solid ${AMBER}18`,
        opacity: (isIdle || isWaiting) ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: 'none',
      }} />

      {/* Keyframes */}
      <style>{`
        @keyframes sumiPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes sphereBreathe {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.06); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export const EntryGate = memo(EntryGateComponent)
