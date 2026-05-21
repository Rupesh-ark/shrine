import { JP_SERIF, DISPLAY, SERIF } from '../../constants/fonts'
import { DARK_WOOD, INK_BLACK, DEEP_BROWN, MEDIUM_WOOD } from '../../constants/colors'
import { SectionHeader } from '../scroll/SectionHeader'
import { TimelineDot } from '../scroll/TimelineDot'
import { memo } from 'react'
import { ROLES } from './data'
import { useIsMobile } from '../../hooks/useMobile'

export const CareerSection = memo(function CareerSection() {
  const isMobile = useIsMobile()

  return (
    <section style={{
      minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', scrollSnapAlign: 'start',
      padding: '24px clamp(16px, 5vw, 40px)',
    }}>
      <SectionHeader kanji="経歴" english="Career" />

      {isMobile ? (
      <div style={{ maxWidth: 'clamp(320px, 60vw, 600px)', margin: '0 auto', position: 'relative', paddingLeft: 'clamp(20px, 5vw, 28px)' }}>
        <div style={{ position: 'absolute', left: 'clamp(4px, 1.5vw, 5px)', top: 8, bottom: 8, width: '1px', background: 'linear-gradient(to bottom, #8B1A1A, rgba(139,26,26,0.15))' }} />

        {ROLES.map((role, i) => (
          <div key={i} style={{ position: 'relative', marginBottom: '20px' }}>
            <TimelineDot active={i === 0} />
            <div style={{
              padding: '14px 16px',
              background: i === 0 ? 'rgba(139,26,26,0.04)' : 'rgba(92,74,42,0.03)',
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
      ) : (
      <div style={{
        width: '100%',
        maxWidth: 'clamp(920px, 88vw, 1320px)',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 320px) minmax(0, 1fr)',
        gap: 'clamp(24px, 4vw, 64px)',
        alignItems: 'start',
      }}>
        <div style={{
          display: 'grid',
          gap: '14px',
          position: 'sticky',
          top: 'clamp(14px, 3vh, 24px)',
          alignSelf: 'start',
        }}>
          {[
            { label: 'Snapshot', value: '3 years across Bizom CEO office, data science, platform, and delivery.' },
            { label: 'Focus', value: 'BNPL integrations, analytics, review loops, and execution that survives real users.' },
            { label: 'Current', value: 'MSc Software Engineering at Heriot-Watt, expected 2026.' },
          ].map((item) => (
            <div key={item.label} style={{
              padding: '16px 18px',
              background: 'linear-gradient(180deg, rgba(255,248,235,0.58), rgba(255,248,235,0.18))',
              border: '1px solid rgba(139,26,26,0.12)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            }}>
              <p style={{
                fontFamily: JP_SERIF,
                fontSize: '11px',
                color: MEDIUM_WOOD,
                letterSpacing: '4px',
                margin: '0 0 10px',
                textTransform: 'uppercase',
              }}>{item.label}</p>
              <p style={{
                fontFamily: SERIF,
                fontSize: 'clamp(13px, 1.1vw, 15px)',
                color: DEEP_BROWN,
                lineHeight: 1.65,
                margin: 0,
              }}>{item.value}</p>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 'clamp(420px, 52vw, 760px)', margin: 0, position: 'relative', paddingLeft: 'clamp(22px, 3vw, 32px)' }}>
          <div style={{ position: 'absolute', left: 'clamp(4px, 1.5vw, 5px)', top: 8, bottom: 8, width: '1px', background: 'linear-gradient(to bottom, #8B1A1A, rgba(139,26,26,0.15))' }} />

          {ROLES.map((role, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: '22px' }}>
              <TimelineDot active={i === 0} />
              <div style={{
                padding: '18px 20px',
                background: i === 0 ? 'rgba(139,26,26,0.05)' : 'rgba(92,74,42,0.035)',
                border: '1px solid rgba(139,26,26,0.09)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                  <h3 style={{
                    fontFamily: DISPLAY,
                    fontSize: 'clamp(15px, 1.5vw, 20px)', color: INK_BLACK,
                    fontWeight: '700', margin: 0,
                  }}>{role.title}</h3>
                  <span style={{
                    fontFamily: SERIF,
                    fontSize: 'clamp(11px, 1vw, 13px)', color: MEDIUM_WOOD,
                    fontStyle: 'italic',
                  }}>{role.period}</span>
                </div>
                <p style={{
                  fontFamily: JP_SERIF,
                  fontSize: 'clamp(10px, 1vw, 12px)', color: DARK_WOOD,
                  letterSpacing: '1px', margin: '4px 0 8px', opacity: 0.8,
                }}>{role.org}</p>
                <ul style={{ margin: 0, paddingLeft: '14px' }}>
                  {role.points.map((pt, j) => (
                    <li key={j} style={{
                      fontFamily: SERIF,
                      fontSize: 'clamp(13px, 1.15vw, 15px)', color: DEEP_BROWN,
                      lineHeight: 1.6, marginBottom: '2px',
                    }}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </section>
  )
})
