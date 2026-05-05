import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollProgress } from './hooks/useScrollProgress'
import { Scene } from './components/Scene'
import { PostProcessing } from './components/PostProcessing'
import { ScrollOverlay } from './components/ScrollOverlay'
import { HeroOverlay } from './components/HeroOverlay'
import { TransitionOverlay } from './components/TransitionOverlay'
import { ProgressOverlay } from './components/ProgressOverlay'
import { MusicOverlay } from './components/MusicOverlay'
import { EntryGate } from './components/EntryGate'
import { GRAIN_URL } from './constants/grain'

function getFov() {
  if (typeof window === 'undefined') return 50
  return window.innerWidth < 768 ? 90 : 50
}

function initAudio(audioRef: React.RefObject<HTMLAudioElement | null>, analyserRef: React.RefObject<AnalyserNode | null>, muted: boolean) {
  if (analyserRef.current) return

  const audio = new Audio('/music/piano.mp3')
  audio.loop = true
  audio.volume = 0.45
  audio.preload = 'auto'
  audio.muted = muted
  audioRef.current = audio

  const ctx = new AudioContext()
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
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const progress = useScrollProgress(400)
  const audioStartedRef = useRef(false)

  const handleEnter = () => {
    if (audioStartedRef.current) return
    audioStartedRef.current = true
    initAudio(audioRef, analyserRef, muted)
  }

  const handleToggleMute = () => {
    setMuted((prev) => {
      const next = !prev
      if (audioRef.current) {
        audioRef.current.muted = next
      }
      return next
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, isolation: 'isolate' }}>
      <EntryGate onEnter={handleEnter} />
      <Canvas
        camera={{ position: [0, 2.85, 4], fov: getFov() }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance', premultipliedAlpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.08
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
        style={{ position: 'fixed', inset: 0 }}
      >
        <color attach="background" args={['#111625']} />
        <Scene progress={progress} />
        <PostProcessing />
      </Canvas>
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
      {/* Bottom gradient to hide ground plane — fades as we scroll */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: '35vh',
          pointerEvents: 'none',
          zIndex: 4,
          opacity: 1 - Math.min(1, progress / 0.15),
          background: 'linear-gradient(to top, #111625 0%, #111625 40%, transparent 100%)',
          transition: 'opacity 0.1s linear',
        }}
      />
      <HeroOverlay progress={progress} />
      <ProgressOverlay progress={progress} />
      <TransitionOverlay progress={progress} />
      <ScrollOverlay progress={progress} />
      <MusicOverlay muted={muted} onToggleMute={handleToggleMute} />
    </div>
  )
}
