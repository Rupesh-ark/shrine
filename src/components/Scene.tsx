import { Suspense, useCallback, useEffect, useState } from 'react'
import { Bvh } from '@react-three/drei'
import { useCameraAnimation } from '../hooks/useCameraAnimation'
import { useProgressRef } from '../hooks/useScrollProgress'
import type { SceneProps } from '../types'
import { BlueSpirits, Fireflies } from './Atmosphere'
import { BambooForest } from './BambooForest'
import { HouseModel } from './HouseModel'
import { ShaderPrecompiler } from './ShaderPrecompiler'
import { SkyDome } from './SkyDome'
import { FallingParticles } from './Particles'
import { GravelGround } from './GravelGround'
import { SceneLighting } from './SceneLighting'
import { DEFAULT_QUALITY } from '../hooks/useIsMobile'
import type { QualityTier } from '../hooks/useIsMobile'

export function Scene({ onHouseReady, entered, quality = DEFAULT_QUALITY }: SceneProps & { quality?: QualityTier }) {
  const progressRef = useProgressRef()
  const { handleBounds, handleScrollFocus } = useCameraAnimation(progressRef, entered)
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
      <SkyDome progressRef={progressRef} />
      <GravelGround />

      <Suspense fallback={null}>
        <HouseModel onBounds={handleBounds} onScrollFocus={handleScrollFocus} progressRef={progressRef} onReady={handleModelReady} maxPointLights={quality.maxPointLights} showRedSpirits={quality.redSpirits} />
      </Suspense>

      <Suspense fallback={null}>
        <BambooForest quality={quality} />
      </Suspense>

      <ShaderPrecompiler enabled={modelReady} onDone={handleShadersReady} />

      <Fireflies />
      {quality.level !== 'low' && <BlueSpirits />}
      <FallingParticles quality={quality} />
    </Bvh>
  )
}
