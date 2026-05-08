import { useRef, useState, useEffect } from 'react'
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
  const isFullyRevealed = revealProgress >= 1
  const isVisible = progress >= 0.85

  const scrollRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (!isVisible) return

    const el = scrollRef.current
    if (!el) return

    let startY = 0
    let startScrollTop = 0

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
      startScrollTop = el.scrollTop
    }

    const onTouchMove = (e: TouchEvent) => {
      const deltaY = startY - e.touches[0].clientY
      const atTop = startScrollTop <= 0 && deltaY < 0
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight && deltaY > 0
      if (atTop || atBottom) return
      e.preventDefault()
      el.scrollTop = startScrollTop + deltaY
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
    }
  }, [isVisible])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const updateThumb = () => {
      const thumb = thumbRef.current
      if (!thumb) return
      const { scrollTop, scrollHeight, clientHeight } = el
      const trackH = thumb.parentElement?.clientHeight ?? 0
      const ratio = clientHeight / scrollHeight
      const thumbH = Math.max(24, trackH * ratio)
      const maxScroll = scrollHeight - clientHeight
      const maxThumbTop = trackH - thumbH
      const top = maxScroll > 0 ? (scrollTop / maxScroll) * maxThumbTop : 0
      thumb.style.height = `${String(thumbH)}px`
      thumb.style.top = `${String(top)}px`
      thumb.style.opacity = scrollHeight > clientHeight ? '1' : '0'
    }
    el.addEventListener('scroll', updateThumb, { passive: true })
    const ro = new ResizeObserver(updateThumb)
    ro.observe(el)
    updateThumb()
    return () => {
      el.removeEventListener('scroll', updateThumb)
      ro.disconnect()
    }
  }, [])

  if (!isVisible) return null

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
      ...(isFullyRevealed
        ? {
            background: '#1E160E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }
        : {
            clipPath: `circle(${String(clipRadius)}% at var(--resume-origin-x, 50%) var(--resume-origin-y, 50%))`,
            WebkitClipPath: `circle(${String(clipRadius)}% at var(--resume-origin-x, 50%) var(--resume-origin-y, 50%))`,
            background: '#1E160E',
            overflow: 'hidden',
          }),
      pointerEvents: 'auto',
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
          style={{
            flex: 1,
            minHeight: 0,
            background: 'linear-gradient(160deg, #F7F0DC 0%, #EDE4CC 40%, #E6DAC0 100%)',
            position: 'relative',
            overflowY: 'scroll',
            overflowX: 'hidden',
            margin: '2px 0',
            boxShadow: 'inset 0 0 60px rgba(120,100,70,0.18)',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            willChange: 'transform',
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

          <div style={{
            position: 'relative',
            zIndex: 3,
            padding: '0 clamp(16px, 5vw, 40px)',
          }}>
            {SECTION_COMPONENTS.map((Section, i) => (
              <div key={i} ref={el => { sectionRefs.current[i] = el }} style={{ scrollSnapAlign: 'start' }}>
                <Section />
              </div>
            ))}
          </div>
        </div>

        {/* Custom scroll track + thumb */}
        <div style={{
          position: 'absolute',
          right: '8px',
          top: '40px',
          bottom: '40px',
          width: '6px',
          borderRadius: '3px',
          background: 'rgba(139,26,26,0.08)',
          pointerEvents: 'none',
          zIndex: 20,
          overflow: 'hidden',
        }}>
          <div
            ref={thumbRef}
            style={{
              position: 'absolute',
              left: 0,
              width: '6px',
              borderRadius: '3px',
              background: 'rgba(139,26,26,0.35)',
              transition: 'opacity 0.2s',
            }}
          />
        </div>

        {revealProgress > 0.9 && (
          <SideNav activeIndex={activeSection} onNavigate={navigateToSection} sections={SECTIONS} />
        )}

        <WoodBar position="bottom" />
      </div>
    </div>
  )
}