import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

export function Torus() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.x += 0.005
    ref.current.rotation.y += 0.0075
  })

  return (
    <mesh ref={ref}>
      <torusGeometry args={[10, 3, 16, 100]} />
      <meshStandardMaterial color="#6c63ff" roughness={0.2} metalness={0.3} />
    </mesh>
  )
}
