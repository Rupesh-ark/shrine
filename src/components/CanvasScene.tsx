import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Scene } from './Scene'
import { PostProcessing } from './PostProcessing'
import type { SceneProps } from '../types'

function getCamera() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  return {
    position: isMobile ? ([0, 2.5, 3.2] as const) : ([0, 2.65, 2.6] as const),
    fov: isMobile ? 62 : 50,
  }
}

export default function CanvasScene({ progress, onHouseReady }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [...getCamera().position], fov: getCamera().fov }}
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
      <Scene progress={progress} onHouseReady={onHouseReady} />
      <PostProcessing />
    </Canvas>
  )
}
