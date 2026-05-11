import { SERIF } from '../../constants/fonts'
import { INK_BLACK, MEDIUM_WOOD } from '../../constants/colors'
import { SectionHeader } from '../scroll/SectionHeader'
import { memo } from 'react'
import { EDUCATION } from './data'
import { useIsMobile } from '../../hooks/useIsMobile'

export const EducationSection = memo(function EducationSection() {
  const isMobile = useIsMobile()

  return (
    <section style={{
      minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', scrollSnapAlign: 'start',
      padding: isMobile ? '18px 14px' : '24px clamp(16px, 5vw, 40px)',
    }}>
      <SectionHeader kanji="学歴" english="Education" />
      <div style={{ maxWidth: '540px', margin: '0 auto', width: '100%' }}>
        {EDUCATION.map((ed, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'baseline',
            gap: isMobile ? '4px' : '8px',
            padding: isMobile ? '12px 0' : '10px 0',
            borderBottom: i < EDUCATION.length - 1 ? '1px solid rgba(92,74,42,0.12)' : 'none',
          }}>
            <span style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '12px' : 'clamp(13px, 1.5vw, 16px)',
              color: INK_BLACK, fontWeight: '600', lineHeight: 1.35,
              maxWidth: isMobile ? '72%' : 'auto',
            }}>{ed.school}</span>
            <span style={{
              fontFamily: SERIF,
              fontSize: isMobile ? '10px' : 'clamp(11px, 1.2vw, 14px)',
              color: MEDIUM_WOOD, fontStyle: 'italic',
              whiteSpace: isMobile ? 'normal' : 'nowrap',
              marginLeft: isMobile ? 0 : '8px',
              lineHeight: 1.35,
            }}>{ed.place} · {ed.year}</span>
          </div>
        ))}
      </div>
    </section>
  )
})
