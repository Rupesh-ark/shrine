import { memo, useState, useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

interface EntryGateProps {
  onEnter: () => void
  ready?: boolean
}

type Phase = 'appear' | 'waiting' | 'idle' | 'spreading' | 'filled' | 'fading' | 'done'

const GATE_BG = '#F7F0DC'
const LANTERN_RED = '#8B1A1A'
const LANTERN_CORE = '#C42020'
const AMBER = '#1A0F08'
const BLOOD_SHADOW = '#2A0505'
const BLOOD_DARK = '#4A0A0A'
const BLOOD_MID = LANTERN_RED
const BLOOD_SHEEN = '#F8C7B8'
const DROP_BASE_GRADIENT = 'entry-gate-drop-base'
const DROP_HIGHLIGHT_GRADIENT = 'entry-gate-drop-highlight'
const DROP_SHADOW_GRADIENT = 'entry-gate-drop-shadow'
type OrbitGlyphStyle = CSSProperties & { '--orbit-angle': string }

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

      {/* === BLOOD INK SPREAD === */}

      {/* Primary central blot */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '80vmin',
        height: '80vmin',
        transform: `translate(-50%, -50%) scale(${String(blotchScale)})`,
        background: `radial-gradient(circle at 45% 40%, ${BLOOD_SHADOW}ee 0%, ${BLOOD_DARK}dd 35%, ${BLOOD_MID}aa 65%, transparent 100%)`,
        borderRadius: '43% 57% 52% 48% / 48% 43% 57% 52%',
        filter: 'blur(12px)',
        transition: 'transform 1.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
      }} />

      {/* Secondary blot */}
      <div style={{
        position: 'absolute',
        left: '45%',
        top: '45%',
        width: '60vmin',
        height: '60vmin',
        transform: `translate(-50%, -50%) scale(${String(secondaryScale)})`,
        background: `radial-gradient(circle at 55% 55%, ${BLOOD_DARK}ee 0%, ${BLOOD_MID}cc 50%, transparent 100%)`,
        borderRadius: '58% 42% 48% 52% / 52% 58% 42% 48%',
        filter: 'blur(16px)',
        transition: 'transform 1.5s cubic-bezier(0.22, 0.61, 0.36, 1) 0.1s',
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
      }} />

      {/* Tertiary blot */}
      <div style={{
        position: 'absolute',
        left: '55%',
        top: '55%',
        width: '55vmin',
        height: '55vmin',
        transform: `translate(-50%, -50%) scale(${String(tertiaryScale)})`,
        background: `radial-gradient(circle at 40% 45%, ${BLOOD_SHADOW}dd 0%, ${BLOOD_DARK}bb 60%, transparent 100%)`,
        borderRadius: '48% 52% 58% 42% / 42% 48% 52% 58%',
        filter: 'blur(20px)',
        transition: 'transform 1.6s cubic-bezier(0.22, 0.61, 0.36, 1) 0.15s',
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
      }} />

      {/* Edge bleed — top */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '-10%',
        width: '70vmin',
        height: '50vmin',
        transform: `translate(-50%, 0) scale(${String(edgeScale)})`,
        background: `radial-gradient(ellipse at center, ${BLOOD_DARK}dd 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(24px)',
        transition: 'transform 1.8s cubic-bezier(0.22, 0.61, 0.36, 1) 0.2s',
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
      }} />

      {/* Edge bleed — bottom */}
      <div style={{
        position: 'absolute',
        left: '50%',
        bottom: '-10%',
        width: '65vmin',
        height: '45vmin',
        transform: `translate(-50%, 0) scale(${String(edgeScale)})`,
        background: `radial-gradient(ellipse at center, ${BLOOD_SHADOW}cc 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(28px)',
        transition: 'transform 1.7s cubic-bezier(0.22, 0.61, 0.36, 1) 0.25s',
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
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
          background: BLOOD_SHADOW,
          borderRadius: `${String(40 + (i % 3) * 10)}% ${String(60 - (i % 3) * 10)}% ${String(50 + (i % 2) * 10)}% ${String(50 - (i % 2) * 10)}%`,
          filter: 'blur(1px)',
          transition: `transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) ${String(dot.d + 0.3)}s`,
          pointerEvents: 'none',
          mixBlendMode: 'multiply',
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
	          width: '152px',
	          height: '152px',
	          filter: 'drop-shadow(0 0 18px rgba(139,26,26,0.16))',
	        }}>
	          {(isIdle || isWaiting) && (
	            <div
              aria-hidden
	              style={{
	                position: 'absolute',
	                left: '50%',
	                top: '50%',
	                width: '176px',
	                height: '176px',
	                transform: 'translate(-50%, -50%)',
	                transformOrigin: '50% 50%',
	                pointerEvents: 'none',
	                zIndex: 0,
	              }}
	            >
	              {Array.from({ length: 18 }, (_, i) => {
	                const angle = i * 20
	                return (
	                  <div
	                    key={i}
	                    style={{
	                      position: 'absolute',
	                      left: '50%',
	                      top: '50%',
	                      '--orbit-angle': `${String(angle)}deg`,
	                      transform: `translate(-50%, -50%) rotate(${String(angle)}deg) translateY(-78px)`,
	                      animation: 'menaceGlyphOrbit 4.8s linear infinite',
	                      fontFamily: "'Noto Serif JP', 'Yu Mincho', serif",
	                      fontSize: '24px',
	                      fontWeight: 900,
                      letterSpacing: 0,
                      color: '#a00d0d',
                      WebkitTextStroke: '1px rgba(42,5,5,0.55)',
	                      textShadow: '0 0 12px rgba(139,26,26,0.5), 0 2px 0 rgba(42,5,5,0.42)',
	                      opacity: 0.78,
		                    } as OrbitGlyphStyle}
                  >
                    ゴ
                  </div>
                )
              })}
            </div>
          )}
          {/* Ambient glow */}
	          <div style={{
	            position: 'absolute',
	            left: '50%',
	            top: '50%',
	            width: '118px',
	            height: '118px',
	            transform: 'translate(-50%, -50%)',
	            borderRadius: '50%',
	            background: `radial-gradient(circle at 50% 42%, ${LANTERN_RED}24 0%, transparent 70%)`,
	            animation: isIdle ? 'dropGlow 4.5s ease-in-out infinite' : 'none',
          }} />

          <svg
            viewBox="0 0 84 112"
            width="76"
            height="102"
            aria-hidden
	              style={{
	              position: 'absolute',
	              left: '50%',
	              top: '50%',
	              display: 'block',
	              overflow: 'visible',
	              zIndex: 1,
	              transformOrigin: '50% 50%',
	              animation: isIdle ? 'dropSquish 5s ease-in-out infinite' : 'none',
	              transform: (isIdle || isWaiting) ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0)',
	              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
	            }}
	          >
            <defs>
              <radialGradient id={DROP_BASE_GRADIENT} cx="34%" cy="26%" r="76%">
                <stop offset="0%" stopColor={BLOOD_SHEEN} />
                <stop offset="34%" stopColor={LANTERN_CORE} />
                <stop offset="72%" stopColor={LANTERN_RED} />
                <stop offset="100%" stopColor={BLOOD_SHADOW} />
              </radialGradient>
              <radialGradient id={DROP_HIGHLIGHT_GRADIENT} cx="28%" cy="22%" r="34%">
                <stop offset="0%" stopColor="rgba(255,250,240,0.95)" />
                <stop offset="55%" stopColor="rgba(255,250,240,0.32)" />
                <stop offset="100%" stopColor="rgba(255,250,240,0)" />
              </radialGradient>
              <radialGradient id={DROP_SHADOW_GRADIENT} cx="62%" cy="66%" r="52%">
                <stop offset="0%" stopColor="rgba(42,5,5,0)" />
                <stop offset="78%" stopColor="rgba(42,5,5,0.16)" />
                <stop offset="100%" stopColor="rgba(42,5,5,0.52)" />
              </radialGradient>
            </defs>

            <g transform="rotate(180 42 56)">
              <path
                d="M41 6C52 6 62 13 67 23C71 31 72 41 69 50C66 59 60 68 54 75C49 81 46 88 43 98C42 102 41 107 41 112C41 107 40 102 39 98C36 88 33 81 28 75C22 68 16 59 13 50C10 41 11 31 15 23C20 13 30 6 41 6Z"
                fill={`url(#${DROP_BASE_GRADIENT})`}
              />
              <ellipse cx="30" cy="22" rx="8" ry="5" fill={`url(#${DROP_HIGHLIGHT_GRADIENT})`} opacity="0.9" />
              <ellipse cx="50" cy="63" rx="14" ry="18" fill={`url(#${DROP_SHADOW_GRADIENT})`} opacity="0.55" />
              <path
                d="M41 6C48 7 55 11 59 18C54 16 49 15 45 14C42 13 40 13 37 14C33 15 28 16 23 18C27 11 34 7 41 6Z"
                fill="rgba(255,255,255,0.06)"
              />
            </g>
          </svg>
        </div>

        {/* Text */}
	        <div style={{
	          marginTop: '12px',
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
            {isWaiting ? 'Preparing contract...' : 'Touch to begin'}
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
        @keyframes dropGlow {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.08); opacity: 1; }
        }
	        @keyframes dropSquish {
	          0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
	          25% { transform: translate(-50%, -50%) scale(1.02, 0.98) rotate(-1deg); }
	          50% { transform: translate(-50%, -50%) scale(0.98, 1.04) rotate(1deg); }
	          75% { transform: translate(-50%, -50%) scale(1.03, 0.99) rotate(-0.5deg); }
	        }
	        @keyframes menaceGlyphOrbit {
	          from {
	            transform: translate(-50%, -50%) rotate(var(--orbit-angle)) translateY(-78px);
	          }
	          to {
	            transform: translate(-50%, -50%) rotate(calc(var(--orbit-angle) + 360deg)) translateY(-78px);
	          }
	        }
	      `}</style>
    </div>
  )
}

export const EntryGate = memo(EntryGateComponent)
