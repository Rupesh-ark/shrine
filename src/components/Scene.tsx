import { Suspense, useCallback, useEffect, useState } from 'react'
import { Bvh, ContactShadows } from '@react-three/drei'
import { useCameraAnimation } from '../hooks/useCameraAnimation'
import { useProgressRef } from '../hooks/useScrollProgress'
import type { SceneProps } from '../types'
import { BlueSpirits, Fireflies } from './Atmosphere'
import { BambooForest } from './BambooForest'
import { HouseModel } from './HouseModel'
import { ShaderPrecompiler } from './ShaderPrecompiler'
import { SkyDome } from './SkyDome'
import { FallingParticles } from './Particles'
import { GroundMist } from './Mist'
import { SceneLighting } from './SceneLighting'
import { TerrainGround } from './TerrainGround'
import { getToonGradientMap } from '../utils/toon'
import { DEFAULT_QUALITY } from '../hooks/useIsMobile'
import type { QualityTier } from '../hooks/useIsMobile'

const GROUND_HEIGHT = 6

export function Scene({ onHouseReady, entered, quality = DEFAULT_QUALITY }: SceneProps & { quality?: QualityTier }) {
  const progressRef = useProgressRef()
  const { groundCenterY, overlayBaseY, handleBounds, handleScrollFocus } = useCameraAnimation(progressRef, entered)
  const [modelReady, setModelReady] = useState(false)
  const [shadersReady, setShadersReady] = useState(false)

  const handleModelReady = useCallback(() => {
    setModelReady(true)
  }, [])

  const handleShadersReady = useCallback(() => {
    setShadersReady(true)
  }, [])

  useEffect(() => {
    if (modelReady && shadersReady) {
      onHouseReady?.()
    }
  }, [modelReady, shadersReady, onHouseReady])

  return (
    <Bvh firstHitOnly>
      <SceneLighting quality={quality} />

      <SkyDome progressRef={progressRef} quality={quality} />

      {/* Ground volume */}
      <mesh position={[0, groundCenterY, 0]}>
        <boxGeometry args={[200, GROUND_HEIGHT, 200]} />
        <meshToonMaterial color="#182229" gradientMap={getToonGradientMap()} />
      </mesh>

      {/* Irregular terrain overlays */}
      <TerrainGround overlayBaseY={overlayBaseY} quality={quality} />

      <Suspense fallback={null}>
        <HouseModel onBounds={handleBounds} onScrollFocus={handleScrollFocus} progressRef={progressRef} onReady={handleModelReady} maxPointLights={quality.maxPointLights} showRedSpirits={quality.redSpirits} />
      </Suspense>

      <Suspense fallback={null}>
        <BambooForest quality={quality} />
      </Suspense>

      <ShaderPrecompiler enabled={modelReady} onDone={handleShadersReady} />

      {quality.contactShadows && (
        <ContactShadows
          position={[0, overlayBaseY, 0]}
          opacity={0.72}
          scale={24}
          blur={2}
          far={4}
          color="#06090d"
        />
      )}

      <Fireflies />
      {quality.level !== 'low' && <BlueSpirits />}
      <FallingParticles quality={quality} />
      <GroundMist layers={quality.mistLayers} />
    </Bvh>
  )
}
