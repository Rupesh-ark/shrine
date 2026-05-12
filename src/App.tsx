import { lazy, startTransition, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useScrollProgress } from './hooks/useScrollProgress'
import { HeroOverlay } from './components/HeroOverlay'
import { ProgressOverlay } from './components/ProgressOverlay'
import { MusicOverlay } from './components/MusicOverlay'
import { EntryGate } from './components/EntryGate'
import { GRAIN_URL } from './constants/grain'
import { useIsMobile } from './hooks/useIsMobile'

const CanvasScene = lazy(() => import('./components/CanvasScene'))
const ScrollOverlay = lazy(() =>
  import('./components/ScrollOverlay').then((module) => ({ default: module.ScrollOverlay })),
)

function initAudio(audioRef: React.RefObject<HTMLAudioElement | null>, analyserRef: React.RefObject<AnalyserNode | null>, muted: boolean) {
  if (analyserRef.current) return

  const audio = new Audio('/music/errrie.mp3')
  audio.loop = true
  audio.volume = 0.45
  audio.preload = 'none'
  audio.muted = muted
  audioRef.current = audio

  const ctx = new AudioContext()
  void ctx.resume().catch((error: unknown) => {
    console.warn('AudioContext resume failed', error)
  })
  const source = ctx.createMediaElementSource(audio)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 64
  analyser.smoothingTimeConstant = 0.8
  source.connect(analyser)
  analyser.connect(ctx.destination)
  analyserRef.current = analyser

  audio.play().catch(() => {
    console.warn('Audio autoplay blocked — user interaction required')
  })
}

export function App() {
  const [muted, setMuted] = useState(false)
  const [entered, setEntered] = useState(false)
  const [houseReady, setHouseReady] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioStartedRef = useRef(false)
  const progress = useScrollProgress(800)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (entered) {
      void import('./components/ScrollOverlay')
    }
  }, [entered])

  const handleHouseReady = useCallback(() => {
    setHouseReady(true)
  }, [])

  const handleEnter = useCallback(() => {
    if (!audioStartedRef.current) {
      audioStartedRef.current = true
      initAudio(audioRef, analyserRef, muted)
    }

    requestAnimationFrame(() => {
      startTransition(() => {
        setEntered(true)
      })
    })
  }, [muted])

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      if (audioRef.current) {
        audioRef.current.muted = next
      }
      return next
    })
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, isolation: 'isolate' }}>
      <EntryGate onEnter={handleEnter} ready={houseReady} />
      <Suspense fallback={null}>
        <CanvasScene progress={progress} onHouseReady={handleHouseReady} entered={entered} />
      </Suspense>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 5,
          opacity: 0.016,
          mixBlendMode: 'soft-light',
          backgroundImage: GRAIN_URL,
          backgroundSize: '560px 560px',
        }}
      />

      <div
        aria-hidden
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: '28vh',
          pointerEvents: 'none',
          zIndex: 4,
          opacity: 1 - Math.min(1, progress / 0.12),
          background: 'linear-gradient(to top, #111625 0%, #111625 35%, transparent 100%)',
          transition: 'opacity 0.1s linear',
        }}
      />
      {/* Mobile corner vignette — softens house edges during ortho phase */}
      {isMobile && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 3,
            opacity: Math.max(0, 1 - progress / 0.22),
            background: `
              radial-gradient(ellipse at 50% 50%, transparent 55%, #111625 100%),
              radial-gradient(ellipse at 50% 70%, transparent 50%, #111625 90%)
            `,
          }}
        />
      )}
      <HeroOverlay progress={progress} />
      {import.meta.env.DEV && <ProgressOverlay progress={progress} />}
      <Suspense fallback={null}>
        {entered ? <ScrollOverlay progress={progress} /> : null}
      </Suspense>
      <MusicOverlay muted={muted} onToggleMute={handleToggleMute} />
    </div>
  )
}
