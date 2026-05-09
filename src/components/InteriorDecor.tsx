import * as THREE from 'three'
import { memo, useMemo } from 'react'
import { useTexture } from '@react-three/drei'

interface InteriorDecorProps {
  floorY: number
  centerZ: number
}

function InteriorDecorInner({ floorY, centerZ }: InteriorDecorProps) {
  const rawTex = useTexture('/images/right.webp')

  const scrollTex = useMemo(() => {
    const t = rawTex.clone()
    t.needsUpdate = true
    return t
  }, [rawTex])

  const leftScrollTex = useMemo(() => {
    const t = rawTex.clone()
    t.repeat.set(-1, 1)
    t.offset.set(1, 0)
    t.needsUpdate = true
    return t
  }, [rawTex])

  const tableZ = centerZ - 0.8

  return (
    <group>
      {/* ── Hanging scroll (kakemono) on back wall — no rods ── */}
      <group position={[0.20, floorY + 0.6, centerZ - 1.68]}>
        {/* Silk mounting backing */}
        <mesh>
          <boxGeometry args={[0.30, 0.42, 0.006]} />
          <meshStandardMaterial color="#2A1E14" roughness={0.9} />
        </mesh>
        {/* Image inset */}
        <mesh position={[0, 0, 0.003]}>
          <boxGeometry args={[0.22, 0.28, 0.008]} />
          <meshStandardMaterial map={scrollTex} roughness={0.85} />
        </mesh>
      </group>

      <group position={[-0.20, floorY + 0.6, centerZ - 1.68]}>
        {/* Silk mounting backing */}
        <mesh>
          <boxGeometry args={[0.30, 0.42, 0.006]} />
          <meshStandardMaterial color="#2A1E14" roughness={0.9} />
        </mesh>
        {/* Image inset */}
        <mesh position={[0, 0, 0.003]}>
          <boxGeometry args={[0.22, 0.28, 0.008]} />
          <meshStandardMaterial map={leftScrollTex} roughness={0.85} />
        </mesh>
      </group>

      {/* ── Incense burner on table — original position ── */}
      <group position={[0.15, floorY + 0.175, tableZ - 0.06]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.032, 0.025, 16]} />
          <meshStandardMaterial color="#3A2E24" roughness={0.5} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0.018, 0]}>
          <cylinderGeometry args={[0.022, 0.028, 0.02, 16]} />
          <meshStandardMaterial color="#2A2018" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.04, 0]} rotation={[0.15, 0, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 0.06, 6]} />
          <meshStandardMaterial color="#5C4A3A" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.07, 0.004]}>
          <sphereGeometry args={[0.004, 8, 8]} />
          <meshBasicMaterial color="#FF6622" />
        </mesh>
      </group>

      {/* ── Tea set on table — original position ── */}
      <group position={[-0.16, floorY + 0.175, tableZ + 0.05]}>
        <mesh position={[0, 0.025, 0]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#4A3020" roughness={0.55} />
        </mesh>
        <mesh position={[0.025, 0.03, 0]} rotation={[0, 0, -0.8]}>
          <cylinderGeometry args={[0.006, 0.009, 0.03, 8]} />
          <meshStandardMaterial color="#4A3020" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.052, 0]}>
          <cylinderGeometry args={[0.02, 0.022, 0.008, 16]} />
          <meshStandardMaterial color="#5C4030" roughness={0.5} />
        </mesh>
        <mesh position={[-0.035, 0.03, 0]}>
          <torusGeometry args={[0.015, 0.004, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#4A3020" roughness={0.55} />
        </mesh>
      </group>

      {/* ── Stacked books in back-left corner — deeper inside ── */}
      <group position={[-0.75, floorY, centerZ - 1.2]}>
        <mesh position={[0, 0.025, 0]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.18, 0.05, 0.14]} />
          <meshStandardMaterial color="#5C2A2A" roughness={0.85} />
        </mesh>
        <mesh position={[0.01, 0.06, 0.01]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[0.16, 0.04, 0.12]} />
          <meshStandardMaterial color="#3A2A1E" roughness={0.85} />
        </mesh>
        <mesh position={[-0.01, 0.09, -0.01]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.15, 0.035, 0.11]} />
          <meshStandardMaterial color="#4A3A2A" roughness={0.85} />
        </mesh>
      </group>

      {/* ── Small floor lantern — deeper inside, right side ── */}
      <group position={[0.70, floorY, centerZ - 1.4]}>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.05, 0.055, 0.08, 8]} />
          <meshStandardMaterial color="#3A3028" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.12, 8]} />
          <meshStandardMaterial color="#F5E6D3" transparent opacity={0.85} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <cylinderGeometry args={[0.045, 0.035, 0.025, 8]} />
          <meshStandardMaterial color="#3A3028" roughness={0.7} />
        </mesh>
        <pointLight position={[0, 0.14, 0]} intensity={0.4} color="#ff624d" distance={1.5} decay={1} />
      </group>

      {/* ── Folded fabric — deeper inside, right side ── */}
      <group position={[0, floorY + 0.015, centerZ - 1.4]}>
        <mesh position={[0, 0.015, 0]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.25, 0.03, 0.18]} />
          <meshStandardMaterial color="#6B1A1A" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.032, 0]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.26, 0.004, 0.04]} />
          <meshStandardMaterial color="#8B6914" roughness={0.85} />
        </mesh>
      </group>
    </group>
  )
}

export const InteriorDecor = memo(InteriorDecorInner)
