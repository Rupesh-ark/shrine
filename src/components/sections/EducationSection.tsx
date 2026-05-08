import { SERIF } from '../../constants/fonts'
import { INK_BLACK, MEDIUM_WOOD } from '../../constants/colors'
import { SectionHeader } from '../scroll/SectionHeader'
import { memo } from 'react'
import { EDUCATION } from './data'

export const EducationSection = memo(function EducationSection() {
  return (
    <section style={{
      minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', scrollSnapAlign: 'start',
      padding: '24px clamp(16px, 5vw, 40px)',
    }}>
      <SectionHeader kanji="学歴" english="Education" />
      <div style={{ maxWidth: '540px', margin: '0 auto', width: '100%' }}>
        {EDUCATION.map((ed, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '10px 0', borderBottom: i < EDUCATION.length - 1 ? '1px solid rgba(92,74,42,0.12)' : 'none',
          }}>
            <span style={{
              fontFamily: SERIF,
              fontSize: 'clamp(13px, 1.5vw, 16px)', color: INK_BLACK, fontWeight: '600',
            }}>{ed.school}</span>
            <span style={{
              fontFamily: SERIF,
              fontSize: 'clamp(11px, 1.2vw, 14px)', color: MEDIUM_WOOD, fontStyle: 'italic',
              whiteSpace: 'nowrap', marginLeft: '8px',
            }}>{ed.place} · {ed.year}</span>
          </div>
        ))}
      </div>
    </section>
  )
})
