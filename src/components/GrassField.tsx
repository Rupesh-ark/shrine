import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getToonGradientMap } from '../utils/toon'
import { useQuality } from '../hooks/useMobile'
import { getFrequencyData } from '../hooks/useAudioAnalyser'

// ============================================================================
// VISUAL TUNING — adjust these to change grass appearance
// ============================================================================

const GRASS_COLOR = '#1a2e14'
const TUFT_HEIGHT_A = 0.5
const TUFT_HEIGHT_B = 0.42
const TUFT_BASE_WIDTH = 0.03
const TUFT_TIP_WIDTH = 0.008
const SCALE_MIN = 0.55
const SCALE_MAX = 0.9

const SPARK_COLOR = '#fbff28'
const SPARK_RADIUS = 0.04
const SPARK_EVERY_N = 15
const SPARK_Y_OFFSET = 0.25

// ============================================================================
// PLACEMENT TUNING — adjust ring bands, exclusion zones, and distribution
// ============================================================================

// Flat bowl centre (gravel ground flat area radius)
const FLAT_RADIUS = 8
const CURVE_STRENGTH = 0.008

// Each band: { inner, outer, angleStart, angleEnd, densityMul, offsetX, offsetZ }
// angleStart/End in radians (0 = +X, PI/2 = +Z front). Full circle = [0, 2*PI].
// densityMul: 1.0 = full, 0 = none (relative to base count).
// offsetX/offsetZ: shift this band relative to the global centre, applied BEFORE Y calculation.
const RING_BANDS: {
  inner: number
  outer: number
  angleStart: number
  angleEnd: number
  densityMul: number
  offsetX: number
  offsetZ: number
}[] = [
  { inner: 3, outer: 7, angleStart: 0, angleEnd: Math.PI * 2, densityMul: 1.0, offsetX: 0, offsetZ: 0 },
]

// Global centre shift applied AFTER per-band offset
const CENTRE_X = 0
const CENTRE_Z = -5.8

// Shrine building exclusion (rectangle in XZ, grass never grows inside)
const SHRINE_HALF_X = 4.5
const SHRINE_FRONT_Z = 3.5
const SHRINE_BACK_Z = -5.0

// Approach path (corridor from doors forward — grass is sparse here)
const PATH_HALF_WIDTH = 1.0
const PATH_MIN_Z = 0.3
const PATH_MAX_Z = 8.0
const PATH_KEEP_FRACTION = 0.25

// Front/back weighting: grass behind this Z line gets thinned
const BACK_THRESHOLD_Z = 2.0
const BACK_KEEP_FRACTION = 0.35

// Placement jitter
const JITTER_RADIUS = 0.8
const JITTER_ANGLE = 0.25

// Total base tuft count (scaled by quality.grassDensity and band densityMul)
const BASE_COUNT = 2500

// ============================================================================

function getGroundY(r: number): number {
  const d = Math.max(0, r - FLAT_RADIUS)
  return -CURVE_STRENGTH * d * d
}

function hash(i: number): number {
  let h = (i * 2654435761) | 0
  h = ((h ^ (h >> 16)) * 1597334677) | 0
  return (h >>> 0) / 0xFFFFFFFF
}

function createTuftGeometry(): THREE.BufferGeometry {
  const positions = new Float32Array([
    0, 0, -TUFT_BASE_WIDTH,   0, TUFT_HEIGHT_A, -TUFT_TIP_WIDTH,   0, 0, TUFT_BASE_WIDTH,
    0, 0, TUFT_BASE_WIDTH,     0, TUFT_HEIGHT_A, -TUFT_TIP_WIDTH,   0, TUFT_HEIGHT_A, TUFT_TIP_WIDTH,

    -TUFT_BASE_WIDTH, 0, 0,   -TUFT_TIP_WIDTH, TUFT_HEIGHT_B, 0,   TUFT_BASE_WIDTH, 0, 0,
    TUFT_BASE_WIDTH, 0, 0,    -TUFT_TIP_WIDTH, TUFT_HEIGHT_B, 0,   TUFT_TIP_WIDTH, TUFT_HEIGHT_B, 0,
  ])

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setIndex([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  geo.computeVertexNormals()
  return geo
}

interface TuftData {
  x: number
  z: number
  y: number
  rotation: number
  scale: number
}

function angleInsideSector(a: number, start: number, end: number): boolean {
  let na = a % (Math.PI * 2)
  if (na < 0) na += Math.PI * 2
  if (start <= end) return na >= start && na <= end
  return na >= start || na <= end
}

function generateTufts(targetCount: number): TuftData[] {
  const tufts: TuftData[] = []

  let totalWeight = 0
  for (const b of RING_BANDS) {
    const area = Math.max(0, b.outer * b.outer - b.inner * b.inner)
    totalWeight += area * b.densityMul
  }
  if (totalWeight === 0) return tufts

  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  let attempted = 0
  const maxAttempts = targetCount * 6

  while (tufts.length < targetCount && attempted < maxAttempts) {
    let bandPick = hash(attempted * 31 + 7) * totalWeight
    let bandIdx = 0
    for (let bi = 0; bi < RING_BANDS.length; bi++) {
      const area = Math.max(0, RING_BANDS[bi].outer * RING_BANDS[bi].outer - RING_BANDS[bi].inner * RING_BANDS[bi].inner)
      const w = area * RING_BANDS[bi].densityMul
      if (bandPick < w) { bandIdx = bi; break }
      bandPick -= w
    }

    const band = RING_BANDS[bandIdx]
    const rMin = band.inner
    const rMax = band.outer

    const t = hash(attempted * 37 + 13)
    const r = rMin + t * (rMax - rMin)
    const angle = attempted * goldenAngle

    const jitterR = (hash(attempted * 3 + 1) - 0.5) * JITTER_RADIUS * 2
    const jitterA = hash(attempted * 7 + 2) * JITTER_ANGLE * 2 - JITTER_ANGLE

    const rawAngle = angle + jitterA
    const dist = r + jitterR

    if (dist < rMin || dist > rMax) { attempted++; continue }
    if (!angleInsideSector(rawAngle, band.angleStart, band.angleEnd)) { attempted++; continue }

    const x = Math.cos(rawAngle) * dist + band.offsetX
    const z = Math.sin(rawAngle) * dist + band.offsetZ

    const finalX = x + CENTRE_X
    const finalZ = z + CENTRE_Z
    const finalDist = Math.sqrt(finalX * finalX + finalZ * finalZ)

    if (Math.abs(finalX) < SHRINE_HALF_X && finalZ > SHRINE_BACK_Z && finalZ < SHRINE_FRONT_Z) {
      attempted++
      continue
    }

    if (Math.abs(finalX) < PATH_HALF_WIDTH && finalZ > PATH_MIN_Z && finalZ < PATH_MAX_Z) {
      if (hash(attempted * 17 + 5) > PATH_KEEP_FRACTION) {
        attempted++
        continue
      }
    }

    if (finalZ > BACK_THRESHOLD_Z && hash(attempted * 19 + 6) > BACK_KEEP_FRACTION) {
      attempted++
      continue
    }

    tufts.push({
      x: finalX,
      z: finalZ,
      y: getGroundY(finalDist),
      rotation: hash(attempted * 11 + 3) * Math.PI * 2,
      scale: SCALE_MIN + hash(attempted * 13 + 4) * SCALE_MAX,
    })
    attempted++
  }

  return tufts
}

export function GrassField() {
  const quality = useQuality()

  const geometry = useMemo(() => createTuftGeometry(), [])
  const material = useMemo(() => new THREE.MeshToonMaterial({
    color: GRASS_COLOR,
    gradientMap: getToonGradientMap(),
  }), [])

  const tufts = useMemo(
    () => generateTufts(Math.floor(BASE_COUNT * quality.grassDensity)),
    [quality.grassDensity],
  )

  const sparkGeometry = useMemo(() => new THREE.SphereGeometry(SPARK_RADIUS, 8, 8), [])
  const sparkMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: SPARK_COLOR }), [])

  const sparks = useMemo(
    () => tufts.filter((_, i) => i % SPARK_EVERY_N === 0),
    [tufts],
  )

  const grassRef = useRef<THREE.InstancedMesh>(null)
  const sparkRef = useRef<THREE.InstancedMesh>(null)
  const dummyRef = useRef(new THREE.Object3D())

  useLayoutEffect(() => {
    const mesh = grassRef.current
    if (!mesh || tufts.length === 0) return

    const dummy = dummyRef.current
    for (let i = 0; i < tufts.length; i++) {
      const t = tufts[i]
      dummy.position.set(t.x, t.y, t.z)
      dummy.rotation.set(0, t.rotation, 0)
      dummy.scale.setScalar(t.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.count = tufts.length
    mesh.computeBoundingSphere()

    const sparkMesh = sparkRef.current
    if (sparkMesh && sparks.length > 0) {
      for (let i = 0; i < sparks.length; i++) {
        const t = sparks[i]
        dummy.position.set(t.x, t.y + SPARK_Y_OFFSET, t.z)
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        sparkMesh.setMatrixAt(i, dummy.matrix)
      }
      sparkMesh.instanceMatrix.needsUpdate = true
      sparkMesh.count = sparks.length
      sparkMesh.computeBoundingSphere()
    }
  }, [tufts, sparks])

  const dimColor = useMemo(() => new THREE.Color('#444444'), [])
  const brightColor = useMemo(() => new THREE.Color(SPARK_COLOR), [])
  const smoothedEnergyRef = useRef(0)

  useFrame(() => {
    const data = getFrequencyData()
    if (!data) return

    const raw = (data[0] + data[1] + data[2] + data[3]) / (4 * 255)
    smoothedEnergyRef.current += (raw - smoothedEnergyRef.current) * 0.12

    sparkMaterial.color.copy(dimColor).lerp(brightColor, smoothedEnergyRef.current)
  })

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
      sparkGeometry.dispose()
      sparkMaterial.dispose()
    }
  }, [geometry, material, sparkGeometry, sparkMaterial])

  return (
    <>
      <instancedMesh
        ref={grassRef}
        args={[geometry, material, tufts.length]}
        frustumCulled
      />
      <instancedMesh
        ref={sparkRef}
        args={[sparkGeometry, sparkMaterial, sparks.length]}
        frustumCulled
      />
    </>
  )
}
