import { JP_SERIF } from '../../constants/fonts'
import type { ScrollSection } from '../../types'
import { useIsMobile } from '../../hooks/useMobile'

interface SideNavProps {
  activeIndex: number
  onNavigate: (index: number) => void
  sections: ScrollSection[]
}

export function SideNav({ activeIndex, onNavigate, sections }: SideNavProps) {
  const isMobile = useIsMobile()
  if (isMobile) return null
  return (
    <div style={{
      position: 'fixed',
      right: 'clamp(14px, 2vw, 28px)',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex', flexDirection: 'column', gap: '18px',
      alignItems: 'center',
      padding: '18px 10px',
      background: 'rgba(20,14,8,0.55)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderRadius: '12px',
      border: '1px solid rgba(139,26,26,0.25)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      zIndex: 30,
    }}>
      <div style={{
        position: 'absolute', left: '50%', top: '28px', bottom: '28px',
        width: '1px', transform: 'translateX(-50%)',
        background: 'linear-gradient(to bottom, rgba(139,26,26,0.4), rgba(139,26,26,0.1), rgba(139,26,26,0.4))',
      }} />
      {sections.map((s, i) => (
        <button
          key={s.id}
          onClick={() => { onNavigate(i) }}
          title={s.en}
          style={{
            all: 'unset', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            position: 'relative', zIndex: 2,
          }}
        >
          <div style={{
            width: i === activeIndex ? 12 : 8,
            height: i === activeIndex ? 12 : 8,
            borderRadius: '50%',
            background: i === activeIndex ? '#8B1A1A' : 'rgba(139,26,26,0.15)',
            border: `2px solid ${i === activeIndex ? '#8B1A1A' : 'rgba(139,26,26,0.45)'}`,
            transition: 'all 0.3s ease',
            boxShadow: i === activeIndex
              ? '0 0 0 4px rgba(139,26,26,0.2), 0 0 12px rgba(139,26,26,0.35)'
              : '0 0 0 2px rgba(139,26,26,0.08)',
          }} />
          <span style={{
            fontFamily: JP_SERIF,
            fontSize: i === activeIndex ? '11px' : '9px',
            color: i === activeIndex ? '#8B1A1A' : 'rgba(196,167,125,0.6)',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
            opacity: i === activeIndex ? 1 : 0.7,
            fontWeight: i === activeIndex ? 700 : 400,
            transition: 'all 0.3s ease',
            textShadow: i === activeIndex ? '0 0 8px rgba(139,26,26,0.4)' : 'none',
          }}>{s.label}</span>
        </button>
      ))}
    </div>
  )
}
