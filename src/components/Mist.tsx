import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function GroundMist({ active = true, layers = 2 }: { active?: boolean; layers?: number }) {
  const primaryRef = useRef<THREE.Mesh>(null)
  const secondaryRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!active) return
    const t = state.clock.elapsedTime
    if (primaryRef.current) {
      primaryRef.current.position.y = -1.2 + Math.sin(t * 0.2) * 0.05
    }
    if (layers >= 2 && secondaryRef.current) {
      secondaryRef.current.position.y = -0.95 + Math.cos(t * 0.16) * 0.04
    }
  })

  return (
    <group visible={active}>
      <mesh ref={primaryRef} position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 36, 1, 1]} />
        <meshBasicMaterial
          color="#B7C9D6"
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {layers >= 2 && (
        <mesh ref={secondaryRef} position={[0, -0.95, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20, 1, 1]} />
          <meshBasicMaterial
            color="#D4C8B3"
            transparent
            opacity={0.08}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  )
}