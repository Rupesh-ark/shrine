import { memo, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { AdaptiveDpr, AdaptiveEvents, OrbitControls, PerformanceMonitor, Preload } from '@react-three/drei'
import { Scene } from './Scene'
import { PostProcessing } from './PostProcessing'
import type { SceneProps } from '../types'
import { useIsMobile, useQuality } from '../hooks/useIsMobile'

function getCamera(isMobile: boolean) {
  return {
    position: isMobile ? ([0, 8.9, 1.5] as const) : ([0, 8.4, 1.5] as const),
    fov: isMobile ? 62 : 50,
  }
}

function CanvasScene({ onHouseReady, entered }: SceneProps) {
  const [dpr, setDpr] = useState(1.5)
  const [orbitEnabled, setOrbitEnabled] = useState(false)
  const [postEnabled, setPostEnabled] = useState(true)
  const isMobile = useIsMobile()
  const quality = useQuality()
  const camera = getCamera(isMobile)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'O') {
        setOrbitEnabled(prev => {
          const next = !prev
          ;(window as unknown as Record<string, unknown>).__debugOrbit = next
          return next
        })
      }
      if (e.shiftKey && e.key === 'P') {
        setPostEnabled(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Canvas
      camera={{ position: [...camera.position], fov: camera.fov }}
      dpr={[1, dpr]}
      gl={{ antialias: quality.level !== 'low', powerPreference: 'high-performance', premultipliedAlpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
      style={{ position: 'fixed', inset: 0 }}
      frameloop={entered ? 'always' : 'never'}
      performance={{ min: quality.level === 'low' ? 0.4 : 0.5 }}
    >
      <color attach="background" args={['#0a0808']} />
      <PerformanceMonitor
        factor={1}
        flipflops={3}
        onChange={({ factor }) => {
          const maxDpr = quality.level === 'low' ? 1 : 1.5
          const nextDpr = Math.min(maxDpr, Math.max(1, Math.round((1 + factor * 0.5) * 10) / 10))
          setDpr(nextDpr)
        }}
        onFallback={() => { setDpr(1); }}
      />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <Preload all />
      {orbitEnabled && <OrbitControls />}
      <Scene onHouseReady={onHouseReady} entered={entered} quality={quality} />
      {quality.bloom && postEnabled && <PostProcessing bloomIntensity={quality.bloomIntensity} />}
    </Canvas>
  )
}

export default memo(CanvasScene)