import { JP_SERIF, DISPLAY, SERIF } from '../../constants/fonts'
import { CRIMSON, INK_BLACK, DEEP_BROWN, MEDIUM_WOOD } from '../../constants/colors'
import { SectionHeader } from '../scroll/SectionHeader'
import { PROJECTS } from './data'

export function ProjectsSection() {
  return (
    <section style={{
      height: '100%', minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', scrollSnapAlign: 'start',
      padding: '24px 40px',
    }}>
      <SectionHeader kanji="作品" english="Projects" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '560px', margin: '0 auto' }}>
        {PROJECTS.map((proj, i) => (
          <div key={proj.name} style={{ position: 'relative' }}>
            {/* Decorative brush-stroke rule */}
            <div style={{
              height: '1px',
              background: `linear-gradient(to right, rgba(139,26,26,0.35) 0%, rgba(139,26,26,0.08) 60%, transparent 100%)`,
              marginBottom: '14px',
              width: i === 0 ? '100%' : '72%',
              transition: 'width 0.6s ease',
            }} />

            {/* Year — subtle, floating */}
            <span style={{
              position: 'absolute', top: '0px', right: '0px',
              fontFamily: JP_SERIF,
              fontSize: '10px', color: MEDIUM_WOOD, letterSpacing: '2px', opacity: 0.55,
            }}>{proj.year}</span>

            <h3 style={{
              fontFamily: DISPLAY,
              fontSize: 'clamp(16px, 1.8vw, 20px)', color: INK_BLACK,
              fontWeight: '700', margin: '0 0 8px', paddingRight: '42px',
            }}>
              {proj.link ? (
                <a
                  href={proj.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: CRIMSON,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderBottom: '1px solid rgba(139,26,26,0.25)',
                    transition: 'color 0.3s ease, border-color 0.3s ease, gap 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#A01010'
                    e.currentTarget.style.borderColor = 'rgba(139,26,26,0.7)'
                    e.currentTarget.style.gap = '9px'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = CRIMSON
                    e.currentTarget.style.borderColor = 'rgba(139,26,26,0.25)'
                    e.currentTarget.style.gap = '6px'
                  }}
                >
                  {proj.name}
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, opacity: 0.7 }}
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ) : (
                proj.name
              )}
            </h3>

            <p style={{
              fontFamily: SERIF,
              fontSize: 'clamp(13px, 1.4vw, 16px)', color: DEEP_BROWN,
              lineHeight: 1.65, margin: '0 0 12px',
            }}>{proj.desc}</p>

            {/* Hanko-style tags */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {proj.tags.map(t => (
                <span key={t} style={{
                  fontFamily: `${JP_SERIF}, monospace`,
                  fontSize: '10px', color: '#8B1A1A',
                  padding: '3px 10px', letterSpacing: '1px',
                  background: 'rgba(139,26,26,0.08)',
                  borderRadius: '2px',
                  userSelect: 'none',
                }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
