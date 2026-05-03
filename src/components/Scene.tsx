import { Suspense } from 'react'
import { ContactShadows } from '@react-three/drei'
import { useCameraAnimation } from '../hooks/useCameraAnimation'
import type { SceneProps } from '../types'
import { BlueSpirits, Fireflies } from './Atmosphere'
import { HouseModel } from './HouseModel'
import { SkyDome } from './SkyDome'
import { FallingParticles } from './Particles'
import { GroundMist } from './Mist'
import { SceneLighting } from './SceneLighting'

const GROUND_HEIGHT = 6

export function Scene({ progress }: SceneProps) {
  const { groundTopY, groundCenterY, overlayBaseY, handleBounds, handleScrollFocus } = useCameraAnimation(progress)

  return (
    <>
      <SceneLighting />

      <SkyDome progress={progress} />

      {/* Ground volume */}
      <mesh position={[0, groundCenterY, 0]}>
        <boxGeometry args={[200, GROUND_HEIGHT, 200]} />
        <meshStandardMaterial color="#182229" roughness={1} />
      </mesh>
      {/* Ground variation overlays */}
      <mesh position={[0, overlayBaseY, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 120]} />
        <meshStandardMaterial color="#22323a" roughness={1} transparent opacity={0.52} />
      </mesh>
      <mesh position={[0, overlayBaseY + 0.005, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[180, 80]} />
        <meshStandardMaterial color="#2b3942" roughness={1} transparent opacity={0.34} />
      </mesh>
      <mesh position={[0, overlayBaseY + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 60]} />
        <meshStandardMaterial color="#31424a" roughness={1} transparent opacity={0.28} />
      </mesh>

      <mesh position={[0, groundTopY + 0.2, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 10, 1, 1]} />
        <meshBasicMaterial color="#39505d" transparent opacity={0.1} depthWrite={false} />
      </mesh>

      <Suspense fallback={null}>
        <HouseModel onBounds={handleBounds} onScrollFocus={handleScrollFocus} progress={progress} />
      </Suspense>

      <ContactShadows
        position={[0, overlayBaseY, 0]}
        opacity={0.72}
        scale={36}
        blur={3.5}
        far={5}
        color="#06090d"
      />

      <Fireflies />
      <BlueSpirits />
      <FallingParticles />
      <GroundMist />
    </>
  )
}
