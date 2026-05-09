import { memo } from 'react'

interface MusicOverlayProps {
  muted: boolean
  onToggleMute: () => void
}

function MusicOverlayComponent({ muted, onToggleMute }: MusicOverlayProps) {
  return (
    <button
      onClick={onToggleMute}
      aria-label={`音楽 · ${muted ? 'Off' : 'On'}`}
      style={{
        all: 'unset',
        position: 'fixed',
        bottom: 'clamp(16px, 2.5vh, 28px)',
        left: 'clamp(16px, 2.5vw, 28px)',
        zIndex: 20,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: 'rgba(20,14,8,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '10px',
        border: '1px solid rgba(139,26,26,0.25)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        transition: 'opacity 0.3s ease',
        opacity: 0.9,
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget
        btn.style.opacity = '1'
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget
        btn.style.opacity = '0.9'
      }}
    >
      {/* Sound icon */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={muted ? 'rgba(196,167,125,0.5)' : '#C4A77D'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'stroke 0.3s ease' }}
      >
        {muted ? (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </>
        ) : (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </>
        )}
      </svg>

      {/* Label */}
      <span
        style={{
          fontFamily: "'Noto Serif JP', 'Yu Mincho', serif",
          fontSize: '11px',
          color: muted ? 'rgba(196,167,125,0.5)' : '#C4A77D',
          letterSpacing: '2px',
          transition: 'color 0.3s ease',
        }}
      >
        {muted ? '音楽 · Off' : '音楽 · On'}
      </span>
    </button>
  )
}

export const MusicOverlay = memo(MusicOverlayComponent)
