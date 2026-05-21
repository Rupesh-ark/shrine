import { JP_SERIF, DISPLAY } from '../../constants/fonts'

interface SectionHeaderProps {
  kanji: string
  english: string
}

export function SectionHeader({ kanji, english }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.8vw, 18px)', marginBottom: 'clamp(24px, 3.5vw, 42px)', justifyContent: 'center' }}>
      <div style={{ height: '1px', width: 'clamp(32px, 6vw, 140px)', background: 'linear-gradient(to right, transparent, #8B6914)' }} />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{
          fontFamily: JP_SERIF,
          fontSize: 'clamp(11px, 1.2vw, 13px)',
          color: '#8B6914',
          letterSpacing: '3px',
          opacity: 0.85,
        }}>{kanji}</span>
        <h2 style={{
          fontFamily: DISPLAY,
          fontSize: 'clamp(28px, 3.8vw, 46px)',
          color: '#8B1A1A',
          fontWeight: '700',
          fontStyle: 'italic',
          letterSpacing: '1px',
          margin: 0,
          lineHeight: 1,
        }}>{english}</h2>
      </div>
      <div style={{ height: '1px', width: 'clamp(32px, 6vw, 140px)', background: 'linear-gradient(to left, transparent, #8B6914)' }} />
    </div>
  )
}
