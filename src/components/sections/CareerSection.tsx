import { JP_SERIF, DISPLAY, SERIF } from '../../constants/fonts'
import { DARK_WOOD, INK_BLACK, DEEP_BROWN, MEDIUM_WOOD } from '../../constants/colors'
import { SectionHeader } from '../scroll/SectionHeader'
import { TimelineDot } from '../scroll/TimelineDot'
import { memo } from 'react'
import { ROLES } from './data'

export const CareerSection = memo(function CareerSection() {
  return (
    <section style={{
      minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', scrollSnapAlign: 'start',
      padding: '24px clamp(16px, 5vw, 40px)',
    }}>
      <SectionHeader kanji="経歴" english="Career" />

      <div style={{ maxWidth: '540px', margin: '0 auto', position: 'relative', paddingLeft: 'clamp(20px, 5vw, 28px)' }}>
        <div style={{ position: 'absolute', left: 'clamp(4px, 1.5vw, 5px)', top: 8, bottom: 8, width: '1px', background: 'linear-gradient(to bottom, #8B1A1A, rgba(139,26,26,0.15))' }} />

        {ROLES.map((role, i) => (
          <div key={i} style={{ position: 'relative', marginBottom: '20px' }}>
            <TimelineDot active={i === 0} />
            <div style={{
              padding: '14px 16px',
              background: i === 0 ? 'rgba(139,26,26,0.04)' : 'rgba(92,74,42,0.03)',
              borderLeft: `2px solid ${i === 0 ? '#8B1A1A' : 'rgba(92,74,42,0.25)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                <h3 style={{
                  fontFamily: DISPLAY,
                  fontSize: 'clamp(15px, 1.7vw, 19px)', color: INK_BLACK,
                  fontWeight: '700', margin: 0,
                }}>{role.title}</h3>
                <span style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(11px, 1.2vw, 13px)', color: MEDIUM_WOOD,
                  fontStyle: 'italic',
                }}>{role.period}</span>
              </div>
              <p style={{
                fontFamily: JP_SERIF,
                fontSize: 'clamp(10px, 1.1vw, 12px)', color: DARK_WOOD,
                letterSpacing: '1px', margin: '4px 0 8px', opacity: 0.8,
              }}>{role.org}</p>
              <ul style={{ margin: 0, paddingLeft: '14px' }}>
                {role.points.map((pt, j) => (
                  <li key={j} style={{
                    fontFamily: SERIF,
                    fontSize: 'clamp(13px, 1.4vw, 15px)', color: DEEP_BROWN,
                    lineHeight: 1.6, marginBottom: '2px',
                  }}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
})
