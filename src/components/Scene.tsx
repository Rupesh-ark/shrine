import { Suspense, useEffect, useState } from 'react'
import { Bvh, ContactShadows } from '@react-three/drei'
import { useCameraAnimation } from '../hooks/useCameraAnimation'
import type { SceneProps } from '../types'
import { BlueSpirits, Fireflies } from './Atmosphere'
import { HouseModel } from './HouseModel'
import { ShaderPrecompiler } from './ShaderPrecompiler'
import { SkyDome } from './SkyDome'
import { FallingParticles } from './Particles'
import { GroundMist } from './Mist'
import { SceneLighting } from './SceneLighting'
import { TerrainGround } from './TerrainGround'

const GROUND_HEIGHT = 6

export function Scene({ progress, onHouseReady, entered }: SceneProps) {
  const { groundCenterY, overlayBaseY, handleBounds, handleScrollFocus } = useCameraAnimation(progress, entered)
  const [modelReady, setModelReady] = useState(false)
  const [shadersReady, setShadersReady] = useState(false)

  useEffect(() => {
    if (modelReady && shadersReady) {
      onHouseReady?.()
    }
  }, [modelReady, shadersReady, onHouseReady])

  return (
    <Bvh firstHitOnly>
      <SceneLighting />

      <SkyDome progress={progress} />

      {/* Ground volume */}
      <mesh position={[0, groundCenterY, 0]}>
        <boxGeometry args={[200, GROUND_HEIGHT, 200]} />
        <meshStandardMaterial color="#182229" roughness={1} />
      </mesh>

      {/* Irregular terrain overlays */}
      <TerrainGround overlayBaseY={overlayBaseY} />

      <Suspense fallback={null}>
        <HouseModel onBounds={handleBounds} onScrollFocus={handleScrollFocus} progress={progress} onReady={() => { setModelReady(true); }} />
      </Suspense>

      <ShaderPrecompiler enabled={modelReady} onDone={() => { setShadersReady(true); }} />

      <ContactShadows
        position={[0, overlayBaseY, 0]}
        opacity={0.72}
        scale={24}
        blur={2}
        far={4}
        color="#06090d"
      />

      <Fireflies />
      <BlueSpirits />
      <FallingParticles />
      <GroundMist />
    </Bvh>
  )
}
