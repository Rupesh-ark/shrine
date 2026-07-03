import { memo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { AdaptiveDpr, AdaptiveEvents, OrbitControls, PerformanceMonitor, Preload } from '@react-three/drei'
import { Scene } from './Scene'
import { PostProcessing } from './PostProcessing'
import type { SceneProps } from '../types'
import { useIsMobile, useQuality } from '../hooks/useMobile'
import { useDevKeyboard } from '../devtools'
import { setRendererStats } from '../devRendererStats'

function getCamera(isMobile: boolean) {
  return {
    position: isMobile ? ([0, 8.9, 1.5] as const) : ([0, 8.4, 1.5] as const),
    fov: isMobile ? 62 : 50,
  }
}

function RendererStatsProbe() {
  const { gl } = useThree()

  useEffect(() => {
    let lastUpdate = 0
    let rafId = 0

    const sample = (time: number) => {
      if (time - lastUpdate >= 500) {
        lastUpdate = time
        setRendererStats({
          calls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
          points: gl.info.render.points,
          lines: gl.info.render.lines,
          geometries: gl.info.memory.geometries,
          textures: gl.info.memory.textures,
          programs: gl.info.programs?.length ?? 0,
        })
      }
      rafId = requestAnimationFrame(sample)
    }

    rafId = requestAnimationFrame(sample)
    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [gl])

  useFrame(() => {
    gl.info.reset()
  }, -1000)

  return null
}

function CanvasScene({ onHouseReady, entered }: SceneProps) {
  const [dpr, setDpr] = useState(1.5)
  const isMobile = useIsMobile()
  const quality = useQuality()
  const camera = getCamera(isMobile)
  const { orbitEnabled, postEnabled } = useDevKeyboard()

  return (
    <Canvas
      camera={{ position: [...camera.position], fov: camera.fov }}
      dpr={[1, dpr]}
      gl={{ antialias: quality.level !== 'low', powerPreference: 'high-performance', premultipliedAlpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
        gl.outputColorSpace = THREE.SRGBColorSpace
        if (import.meta.env.DEV) {
          gl.info.autoReset = false
        }
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
      {import.meta.env.DEV && <RendererStatsProbe />}
      {orbitEnabled && <OrbitControls />}
      <Scene onHouseReady={onHouseReady} entered={entered} quality={quality} />
      {quality.bloom && postEnabled && <PostProcessing bloomIntensity={quality.bloomIntensity} />}
    </Canvas>
  )
}

export default memo(CanvasScene)
