import { JP_SERIF, SERIF } from '../../constants/fonts'
import { CRIMSON, DARK_WOOD, DEEP_BROWN } from '../../constants/colors'
import { SectionHeader } from '../scroll/SectionHeader'

export function AboutSection() {
  return (
    <section style={{
      height: '100%', minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', scrollSnapAlign: 'start',
      padding: '32px 40px',
    }}>
      <SectionHeader kanji="略歴" english="About" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '520px', margin: '0 auto' }}>
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
            src="/images/Rupesh_Pandey.webp"
            alt="Rupesh Pandey"
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

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Edinburgh, UK', 'MSc 2026', 'Bizom · 3 yrs', 'Builder'].map(tag => (
            <span key={tag} style={{
              fontFamily: JP_SERIF,
              fontSize: '11px', color: DARK_WOOD,
              border: '1px solid rgba(92,74,42,0.35)', padding: '4px 14px',
              letterSpacing: '1px',
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
