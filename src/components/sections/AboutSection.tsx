import { SERIF } from '../../constants/fonts'
import { CRIMSON, DARK_WOOD, DEEP_BROWN } from '../../constants/colors'
import { memo } from 'react'
import { SectionHeader } from '../scroll/SectionHeader'
import { useIsMobile } from '../../hooks/useMobile'

export const AboutSection = memo(function AboutSection() {
  const isMobile = useIsMobile()

  return (
    <section style={{
      minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', scrollSnapAlign: 'start',
      padding: '32px clamp(16px, 5vw, 40px)',
	    }}>
	      <SectionHeader kanji="略歴" english="About" />
	      {isMobile ? (
	      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: 'clamp(320px, 60vw, 580px)', margin: '0 auto' }}>
	        <div style={{ position: 'relative', flexShrink: 0 }}>
	          <div style={{
            position: 'absolute', top: '-6px', left: '-6px',
            width: '18px', height: '18px',
            borderLeft: `2px solid ${CRIMSON}`, borderTop: `2px solid ${CRIMSON}`,
            opacity: 0.5, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '-6px', right: '-6px',
            width: '18px', height: '18px',
            borderRight: `2px solid ${CRIMSON}`, borderTop: `2px solid ${CRIMSON}`,
            opacity: 0.5, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-6px', left: '-6px',
            width: '18px', height: '18px',
            borderLeft: `2px solid ${CRIMSON}`, borderBottom: `2px solid ${CRIMSON}`,
            opacity: 0.5, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-6px', right: '-6px',
            width: '18px', height: '18px',
            borderRight: `2px solid ${CRIMSON}`, borderBottom: `2px solid ${CRIMSON}`,
            opacity: 0.5, pointerEvents: 'none',
          }} />

          <img
            src="/images/Rupesh_Pandey-480.webp"
            alt="Rupesh Pandey"
            width={480}
            height={470}
            loading="lazy"
            decoding="async"
            style={{
              height: 'clamp(180px, 26vh, 240px)',
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              display: 'block',
              borderRadius: '2px',
              boxShadow: `0 4px 20px rgba(0,0,0,0.18), 0 0 0 1px rgba(139,26,26,0.15), 0 0 0 5px rgba(139,26,26,0.04)`,
            }}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: SERIF,
            fontSize: 'clamp(16px, 1.9vw, 21px)', color: DEEP_BROWN,
            lineHeight: 1.8, margin: '0 0 16px',
          }}>
            Generalist engineer with{' '}
            <a href="https://bizom.in" target="_blank" rel="noopener noreferrer"
              style={{ color: CRIMSON, textDecoration: 'none', borderBottom: `1px solid rgba(139,26,26,0.4)` }}>
              3 years at Bizom
            </a>
            {' '}spanning data science, platform engineering, and the CEO&apos;s office.
          </p>
          <p style={{
            fontFamily: SERIF,
            fontSize: 'clamp(16px, 1.9vw, 21px)', color: DEEP_BROWN,
            lineHeight: 1.8, margin: 0,
          }}>
            Pursuing an MSc in Software Engineering at{' '}
            <span style={{ color: DARK_WOOD, fontStyle: 'italic' }}>Heriot-Watt University</span>,
            expected 2026. I bridge big-picture thinking with hands-on execution.
	          </p>
	        </div>
	      </div>
	      ) : (
	      <div style={{
	        width: '100%',
	        maxWidth: 'clamp(920px, 88vw, 1320px)',
	        margin: '0 auto',
	        display: 'grid',
	        gridTemplateColumns: 'minmax(320px, 380px) minmax(0, 1fr)',
	        gap: 'clamp(28px, 4vw, 72px)',
	        alignItems: 'center',
	      }}>
	        <div style={{ position: 'relative', flexShrink: 0, justifySelf: 'center' }}>
	          <div style={{
            position: 'absolute', top: '-6px', left: '-6px',
            width: '18px', height: '18px',
            borderLeft: `2px solid ${CRIMSON}`, borderTop: `2px solid ${CRIMSON}`,
            opacity: 0.5, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '-6px', right: '-6px',
            width: '18px', height: '18px',
            borderRight: `2px solid ${CRIMSON}`, borderTop: `2px solid ${CRIMSON}`,
            opacity: 0.5, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-6px', left: '-6px',
            width: '18px', height: '18px',
            borderLeft: `2px solid ${CRIMSON}`, borderBottom: `2px solid ${CRIMSON}`,
            opacity: 0.5, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-6px', right: '-6px',
            width: '18px', height: '18px',
            borderRight: `2px solid ${CRIMSON}`, borderBottom: `2px solid ${CRIMSON}`,
            opacity: 0.5, pointerEvents: 'none',
          }} />

          <img
            src="/images/Rupesh_Pandey-480.webp"
            alt="Rupesh Pandey"
            width={480}
            height={470}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              maxWidth: 'clamp(320px, 30vw, 420px)',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              borderRadius: '2px',
              boxShadow: `0 4px 20px rgba(0,0,0,0.18), 0 0 0 1px rgba(139,26,26,0.15), 0 0 0 5px rgba(139,26,26,0.04)`,
            }}
          />
        </div>

        <div style={{ display: 'grid', gap: '22px', alignItems: 'start' }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{
              fontFamily: SERIF,
              fontSize: 'clamp(17px, 1.9vw, 21px)', color: DEEP_BROWN,
              lineHeight: 1.8, margin: '0 0 16px',
            }}>
              Generalist engineer with{' '}
              <a href="https://bizom.in" target="_blank" rel="noopener noreferrer"
                style={{ color: CRIMSON, textDecoration: 'none', borderBottom: `1px solid rgba(139,26,26,0.4)` }}>
                3 years at Bizom
              </a>
              {' '}spanning data science, platform engineering, and the CEO&apos;s office.
            </p>
            <p style={{
              fontFamily: SERIF,
              fontSize: 'clamp(17px, 1.9vw, 21px)', color: DEEP_BROWN,
              lineHeight: 1.8, margin: 0,
            }}>
              Pursuing an MSc in Software Engineering at{' '}
              <span style={{ color: DARK_WOOD, fontStyle: 'italic' }}>Heriot-Watt University</span>,
              expected 2026. I bridge big-picture thinking with hands-on execution.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '14px',
          }}>
            {[
              { label: 'Role', value: 'Generalist engineer' },
              { label: 'Experience', value: '3 years at Bizom' },
              { label: 'Study', value: 'MSc, 2026' },
              { label: 'Base', value: 'Edinburgh, UK' },
            ].map((item) => (
              <div key={item.label} style={{
                padding: '14px 16px',
                background: 'rgba(255,248,235,0.55)',
                border: '1px solid rgba(139,26,26,0.12)',
                boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
              }}>
                <p style={{
                  fontFamily: SERIF,
                  fontSize: '11px',
                  color: CRIMSON,
                  letterSpacing: '3px',
                  margin: '0 0 8px',
                  textTransform: 'uppercase',
                }}>{item.label}</p>
                <p style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(13px, 1.2vw, 15px)',
                  color: DEEP_BROWN,
                  margin: 0,
                  lineHeight: 1.45,
                }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

	      </div>
	      )}
	    </section>
  )
})
