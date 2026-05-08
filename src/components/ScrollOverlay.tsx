import { useRef, useState, useEffect, useMemo } from 'react'
import { GRAIN_URL } from '../constants/grain'
import type { ScrollSection } from '../types'
import { WoodBar } from './scroll/WoodBar'
import { SideNav } from './scroll/SideNav'
import { AmbientParticles } from './scroll/AmbientParticles'
import { HeroSection } from './sections/HeroSection'
import { AboutSection } from './sections/AboutSection'
import { CareerSection } from './sections/CareerSection'
import { EducationSection } from './sections/EducationSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'
import { ContactSection } from './sections/ContactSection'

const SECTIONS: ScrollSection[] = [
  { id: 'hero',     label: '表紙', en: 'Cover'   },
  { id: 'about',    label: '略歴', en: 'About'   },
  { id: 'career',    label: '経歴', en: 'Career'   },
  { id: 'education', label: '学歴', en: 'Education' },
  { id: 'projects',  label: '作品', en: 'Projects'    },
  { id: 'skills',   label: '技術', en: 'Skills'  },
  { id: 'contact',  label: '連絡', en: 'Contact' },
]

const SECTION_COMPONENTS = [
  HeroSection,
  AboutSection,
  CareerSection,
  EducationSection,
  ProjectsSection,
  SkillsSection,
  ContactSection,
]

export function ScrollOverlay({ progress }: { progress: number }) {
  const revealStart = 0.88
  const revealEnd = 1
  const revealProgress = Math.min(1, Math.max(0, (progress - revealStart) / (revealEnd - revealStart)))

  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target as HTMLDivElement)
            if (idx !== -1) setActiveSection(idx)
          }
        })
      },
      { root: container, threshold: 0.5 }
    )
    sectionRefs.current.forEach(el => { if (el) observer.observe(el) })
    return () => { observer.disconnect() }
  }, [revealProgress])

  const isMobile = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, [])
  const isFullyRevealed = revealProgress >= 1

  if (progress < 0.85) return null

  const eased = 1 - Math.pow(1 - revealProgress, 3)
  const clipRadius = eased * 145
  const innerScale = 0.88 + eased * 0.12

  const navigateToSection = (idx: number) => {
    const el = sectionRefs.current[idx]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10,
      clipPath: `circle(${String(clipRadius)}% at var(--resume-origin-x, 50%) var(--resume-origin-y, 50%))`,
      WebkitClipPath: `circle(${String(clipRadius)}% at var(--resume-origin-x, 50%) var(--resume-origin-y, 50%))`,
      pointerEvents: revealProgress > 0.95 ? 'auto' : 'none',
      background: '#1E160E',
      overflow: 'hidden',
      ...(isFullyRevealed ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}),
    }}>
      {/* Background layers */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(64,44,28,0.7) 0%, rgba(30,22,14,0.95) 70%, #100B06 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 119px, rgba(196,167,125,0.04) 119px, rgba(196,167,125,0.04) 120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(6,4,2,0.7) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', mixBlendMode: 'soft-light', backgroundImage: GRAIN_URL, backgroundSize: '560px 560px' }} />
      <AmbientParticles />

      {/* Main scroll */}
      <div style={{
        width: 'min(92vw, 720px)',
        height: 'min(92vh, 1100px)',
        display: 'flex', flexDirection: 'column',
        ...isFullyRevealed
          ? { position: 'relative', opacity: 1 }
          : {
              position: 'absolute',
              left: 'var(--resume-origin-x, 50%)',
              top: 'var(--resume-origin-y, 50%)',
              transform: `translate(-50%, -50%) scale(${String(innerScale)})`,
              transformOrigin: 'center',
              opacity: revealProgress,
            },
        minHeight: 0,
      }}>
        <WoodBar position="top" />

        {/* Paper body */}
        <div
          ref={scrollRef}
          className="scroll-paper"
          style={{
            flex: 1,
            minHeight: 0,
            background: 'linear-gradient(160deg, #F7F0DC 0%, #EDE4CC 40%, #E6DAC0 100%)',
            position: 'relative', overflowY: 'auto', overflowX: 'hidden',
            margin: '2px 0',
            boxShadow: 'inset 0 0 60px rgba(120,100,70,0.18)',
          scrollSnapType: isMobile ? 'none' : 'y mandatory', overscrollBehaviorY: 'contain',
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(139,26,26,0.25) transparent',
            userSelect: 'text',
            willChange: 'scroll-position',
          }}
        >
          {/* Paper grain overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.09, pointerEvents: 'none', zIndex: 1,
            backgroundImage: GRAIN_URL,
            backgroundSize: '300px 300px', mixBlendMode: 'multiply',
          }} />

          {/* Edge shadows for depth */}
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '8px', background: 'linear-gradient(to right, rgba(0,0,0,0.08), transparent)', pointerEvents: 'none', zIndex: 2 }} />
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '8px', background: 'linear-gradient(to left, rgba(0,0,0,0.08), transparent)', pointerEvents: 'none', zIndex: 2 }} />

          {/* Sections */}
          <div style={{ position: 'relative', zIndex: 3 }}>
            {SECTION_COMPONENTS.map((Section, i) => (
              <div key={i} ref={el => { sectionRefs.current[i] = el }} style={isMobile ? undefined : { scrollSnapAlign: 'start' }}>
                <Section />
              </div>
            ))}
          </div>


        </div>

        {revealProgress > 0.9 && (
          <SideNav activeIndex={activeSection} onNavigate={navigateToSection} sections={SECTIONS} />
        )}

        <WoodBar position="bottom" />
      </div>
      <style>{`
        .scroll-paper::-webkit-scrollbar {
          width: 5px;
        }
        .scroll-paper::-webkit-scrollbar-track {
          background: transparent;
          border-left: 1px solid rgba(139,26,26,0.06);
        }
        .scroll-paper::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(139,26,26,0.18), rgba(139,26,26,0.30));
          border-radius: 3px;
        }
        .scroll-paper::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(139,26,26,0.28), rgba(139,26,26,0.42));
        }
      `}</style>
    </div>
  )
}
