import { JP_SERIF, DISPLAY, SERIF } from '../../constants/fonts'
import { CRIMSON, DARK_WOOD, DEEP_BROWN, PARCHMENT } from '../../constants/colors'
import { SectionHeader } from '../scroll/SectionHeader'
import { Seal } from '../scroll/Seal'

export function ContactSection() {
  return (
    <section style={{
      height: '100%', minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      scrollSnapAlign: 'start', padding: '32px 40px', textAlign: 'center',
    }}>
      <SectionHeader kanji="連絡" english="Contact" />

      <p style={{
        fontFamily: SERIF,
        fontSize: 'clamp(17px, 1.8vw, 22px)', color: DEEP_BROWN,
        maxWidth: '420px', lineHeight: 1.7, margin: '0 0 32px', fontStyle: 'italic',
      }}>
        Have a project in mind, or just want to say hello?
      </p>

      <a href="mailto:pandeyrupesh00@gmail.com"
        style={{
          fontFamily: DISPLAY,
          fontSize: 'clamp(14px, 1.6vw, 18px)', color: PARCHMENT,
          background: CRIMSON, textDecoration: 'none',
          padding: '14px 36px', display: 'inline-block',
          letterSpacing: '0.5px', marginBottom: '20px',
          boxShadow: `0 4px 20px rgba(139,26,26,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
          transition: 'all 0.2s ease',
        }}>
        pandeyrupesh00@gmail.com
      </a>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
        {[
          { href: 'https://github.com/Rupesh-ark', label: 'GitHub' },
          { href: 'https://www.linkedin.com/in/ssh-rupesh/', label: 'LinkedIn' },
        ].map(link => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
            style={{
              fontFamily: JP_SERIF,
              fontSize: 'clamp(12px, 1.3vw, 15px)', color: DARK_WOOD,
              textDecoration: 'none', border: `1.5px solid ${DARK_WOOD}`,
              padding: '8px 24px', letterSpacing: '1px',
              transition: 'all 0.2s ease',
            }}>{link.label}</a>
        ))}
      </div>

      <div style={{ animation: 'seal-stamp 0.5s ease-out 0.3s both' }}>
        <Seal text="感謝" rotate={5} size={76} />
      </div>
      <p style={{
        fontFamily: SERIF, fontStyle: 'italic',
        fontSize: 'clamp(11px, 1.1vw, 13px)', color: DARK_WOOD,
        marginTop: '18px', opacity: 0.6, letterSpacing: '2px',
      }}>Edinburgh, UK · Thank you for visiting</p>

      {/* Exit scroll — back to scene */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          all: 'unset',
          marginTop: '28px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          opacity: 0.55,
          transition: 'opacity 0.3s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.55' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CRIMSON} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 3 18 9" />
          <path d="M12 3v12" />
          <path d="M5 21h14" />
        </svg>
        <span style={{
          fontFamily: JP_SERIF,
          fontSize: '11px', color: CRIMSON, letterSpacing: '3px',
        }}>表紙へ戻る</span>
        <span style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: '10px', color: DARK_WOOD, letterSpacing: '1px',
        }}>Back to start</span>
      </button>
    </section>
  )
}
