import { DISPLAY, SERIF } from '../../constants/fonts'
import { CRIMSON, DARK_WOOD, INK_BLACK, DEEP_BROWN } from '../../constants/colors'
import { SectionHeader } from '../scroll/SectionHeader'
import { memo } from 'react'
import { SKILLS } from './data'

const LEVEL_SIZE = ['12px', '14px', '16px']
const LEVEL_OPACITY = [0.65, 0.82, 1]

export const SkillsSection = memo(function SkillsSection() {
  return (
    <section style={{
      minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', scrollSnapAlign: 'start',
      padding: '24px 40px',
    }}>
      <SectionHeader kanji="技術" english="Skills" />

      <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: '13px', color: DARK_WOOD, marginBottom: '24px', opacity: 0.7, letterSpacing: '1px',
        }}>Larger text = higher proficiency</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {SKILLS.map(sk => (
            <span key={sk.name} style={{
              fontFamily: DISPLAY,
              fontSize: LEVEL_SIZE[sk.level - 1],
              color: sk.level === 3 ? INK_BLACK : sk.level === 2 ? DEEP_BROWN : DARK_WOOD,
              opacity: LEVEL_OPACITY[sk.level - 1],
              border: `${sk.level === 3 ? '1.5' : '1'}px solid rgba(92,74,42,${String(sk.level === 3 ? 0.4 : 0.2)})`,
              padding: sk.level === 3 ? '6px 16px' : '4px 12px',
              background: sk.level === 3 ? 'rgba(139,26,26,0.05)' : 'transparent',
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}>{sk.name}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '28px' }}>
          {(['Familiar', 'Proficient', 'Strong'] as const).map((label, lvl) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: (lvl + 1) * 2 + 4, height: (lvl + 1) * 2 + 4, borderRadius: '50%', background: CRIMSON, opacity: LEVEL_OPACITY[lvl] }} />
              <span style={{ fontFamily: SERIF, fontSize: '12px', color: DARK_WOOD, fontStyle: 'italic' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})
