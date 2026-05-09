import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { seededRandom } from '../utils/random'

const PARTICLE_COUNT = 180
const AREA_SIZE = 18

export function FallingParticles() {
  const meshRef = useRef<THREE.Points>(null)

  const { positions, speeds, phases } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const speeds = new Float32Array(PARTICLE_COUNT)
    const phases = new Float32Array(PARTICLE_COUNT)
    const rng = seededRandom(17)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (rng() - 0.5) * AREA_SIZE
      positions[i * 3 + 1] = rng() * 7 - 0.5
      positions[i * 3 + 2] = (rng() - 0.5) * AREA_SIZE
      speeds[i] = 0.08 + rng() * 0.2
      phases[i] = rng() * Math.PI * 2
    }

    return { positions, speeds, phases }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useFrame((state) => {
    if (!meshRef.current) return
    const posAttr = meshRef.current.geometry.attributes.position
    const posArray = posAttr.array as Float32Array
    const t = state.clock.elapsedTime

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posArray[i * 3 + 1] -= speeds[i] * 0.012

      posArray[i * 3] += Math.sin(t * 0.5 + phases[i]) * 0.002
      posArray[i * 3 + 2] += Math.cos(t * 0.3 + phases[i]) * 0.002

      if (posArray[i * 3 + 1] < -1.8) {
        const rng = seededRandom(Math.floor((t + i) * 1000))
        posArray[i * 3 + 1] = 6.5 + rng() * 2
        posArray[i * 3] = (rng() - 0.5) * AREA_SIZE
        posArray[i * 3 + 2] = (rng() - 0.5) * AREA_SIZE
      }
    }

    posAttr.needsUpdate = true
  })

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        color="#F4DDCD"
        size={0.035}
        transparent
        opacity={0.42}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
