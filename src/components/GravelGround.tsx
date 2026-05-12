import { useMemo } from 'react'
import * as THREE from 'three'
import { getToonGradientMap } from '../utils/toon'

const BOWL_RADIUS = 20
const FLAT_RADIUS = 8
const CURVE_STRENGTH = 0.008
const RADIAL_SEGMENTS = 48
const ANGULAR_SEGMENTS = 96
const GRAVEL_COLOR = '#14181e'

function createBowlGeometry(): THREE.BufferGeometry {
  const vertCount = (RADIAL_SEGMENTS + 1) * ANGULAR_SEGMENTS
  const positions = new Float32Array(vertCount * 3)
  const indices: number[] = []

  for (let ri = 0; ri <= RADIAL_SEGMENTS; ri++) {
    const r = (ri / RADIAL_SEGMENTS) * BOWL_RADIUS
    const d = Math.max(0, r - FLAT_RADIUS)
    const y = -CURVE_STRENGTH * d * d

    for (let ai = 0; ai < ANGULAR_SEGMENTS; ai++) {
      const angle = (ai / ANGULAR_SEGMENTS) * Math.PI * 2
      const idx = ri * ANGULAR_SEGMENTS + ai
      positions[idx * 3] = r * Math.cos(angle)
      positions[idx * 3 + 1] = y
      positions[idx * 3 + 2] = r * Math.sin(angle)
    }
  }

  for (let ri = 0; ri < RADIAL_SEGMENTS; ri++) {
    for (let ai = 0; ai < ANGULAR_SEGMENTS; ai++) {
      const curr = ri * ANGULAR_SEGMENTS + ai
      const next = ri * ANGULAR_SEGMENTS + (ai + 1) % ANGULAR_SEGMENTS
      const bot = (ri + 1) * ANGULAR_SEGMENTS + ai
      const botNext = (ri + 1) * ANGULAR_SEGMENTS + (ai + 1) % ANGULAR_SEGMENTS
      indices.push(curr, next, bot)
      indices.push(next, botNext, bot)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

export function GravelGround() {
  const geometry = useMemo(() => createBowlGeometry(), [])
  const material = useMemo(() => new THREE.MeshToonMaterial({
    color: GRAVEL_COLOR,
    gradientMap: getToonGradientMap(),
  }), [])

  return (
    <mesh
      geometry={geometry}
      position={[0, 0, 0]}
      material={material}
      receiveShadow
    />
  )
}
