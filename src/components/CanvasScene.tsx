import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor, Preload } from '@react-three/drei'
import { Scene } from './Scene'
import { PostProcessing } from './PostProcessing'
import type { SceneProps } from '../types'

function getCamera() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  return {
    position: isMobile ? ([0, 7.5, 1.5] as const) : ([0, 7.0, 1.5] as const),
    fov: isMobile ? 62 : 50,
  }
}

export default function CanvasScene({ progress, onHouseReady, entered }: SceneProps) {
  const [dpr, setDpr] = useState(1.5)

  return (
    <Canvas
      camera={{ position: [...getCamera().position], fov: getCamera().fov }}
      dpr={[1, dpr]}
      gl={{ antialias: true, powerPreference: 'high-performance', premultipliedAlpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
      style={{ position: 'fixed', inset: 0 }}
      frameloop={entered ? 'always' : 'never'}
      performance={{ min: 0.5 }}
    >
      <color attach="background" args={['#111625']} />
      <PerformanceMonitor
        factor={1}
        flipflops={3}
        onChange={({ factor }) => {
          const nextDpr = Math.min(1.5, Math.max(1, Math.round((1 + factor * 0.5) * 10) / 10))
          setDpr(nextDpr)
        }}
        onFallback={() => { setDpr(1); }}
      />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <Preload all />
      <Scene progress={progress} onHouseReady={onHouseReady} entered={entered} />
      <PostProcessing />
    </Canvas>
  )
}
