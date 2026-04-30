import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'
import { Torus } from './Torus'

export function Scene() {
  return (
    <>
      <ambientLight intensity={2} color="#404060" />
      <pointLight position={[10, 10, 10]} intensity={150} />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
        minDistance={10}
        maxDistance={80}
      />

      <Torus />
    </>
  )
}
