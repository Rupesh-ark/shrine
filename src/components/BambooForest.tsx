import { useGLTF, Clone } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'
import { createToonMaterial } from '../utils/toon'
import { useIsMobile } from '../hooks/useIsMobile'

const BAMBOO_URL = '/models/final_house/Bamboo.glb'
const SIZE_MULTIPLIER = 9
const DESKTOP_CULL_DIST = 22
const MOBILE_CULL_DIST = 16

interface BambooClump {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

/** Full layout with your tuned positions + density additions */
const rawClumps: BambooClump[] = [
  // ── Back wall (pushed to far left & right of house) ──
  { position: [-3.6, -1.38, -7.2], rotation: [0, 0.50, 0], scale: 0.16 },
  { position: [-2.8, -1.38, -7.0], rotation: [0, 1.20, 0], scale: 0.18 },
  { position: [-1.4, -1.38, -8.2], rotation: [0, -0.30, 0], scale: 0.20 },
  { position: [1.8, -1.38, -8.6], rotation: [0, 0.80, 0], scale: 0.19 },
  { position: [2.8, -1.38, -7.4], rotation: [0, -0.60, 0], scale: 0.17 },
  { position: [3.4, -1.38, -6.8], rotation: [0, 1.40, 0], scale: 0.15 },

  // ── Screen top-left corner ──
  { position: [-4.5, -1.38, -7.5], rotation: [0, 0.40, 0], scale: 0.26 },
  { position: [-5.0, -1.38, -6.5], rotation: [0, -0.60, 0], scale: 0.28 },
  { position: [-3.2, -1.38, -8.5], rotation: [0, 1.20, 0], scale: 0.24 },
  { position: [-6.5, -1.38, -7.0], rotation: [0, -0.20, 0], scale: 0.22 },
  { position: [-5.8, -1.38, -8.2], rotation: [0, 0.70, 0], scale: 0.20 },
  { position: [-3.8, -1.38, -9.2], rotation: [0, -0.40, 0], scale: 0.18 },

  // ── Screen top-right corner ──
  { position: [6.5, -1.38, -7.5], rotation: [0, -0.40, 0], scale: 0.26 },
  { position: [5.1, -1.38, -6.5], rotation: [0, 0.60, 0], scale: 0.28 },
  { position: [3.3, -1.38, -8.5], rotation: [0, -1.20, 0], scale: 0.24 },
  { position: [6.5, -1.38, -7.0], rotation: [0, 0.20, 0], scale: 0.22 },
  { position: [5.8, -1.38, -8.2], rotation: [0, -0.70, 0], scale: 0.20 },
  { position: [3.8, -1.38, -9.2], rotation: [0, 0.40, 0], scale: 0.18 },

  // ── Left flank ──
  { position: [-3.6, -1.38, -5.2], rotation: [0, 0.30, 0], scale: 0.16 },
  { position: [-4.6, -1.38, -4.2], rotation: [0, -0.80, 0], scale: 0.14 },
  { position: [-3.0, -1.38, -4.2], rotation: [0, 1.50, 0], scale: 0.18 },
  { position: [-4.2, -1.38, -3.0], rotation: [0, -0.40, 0], scale: 0.15 },
  { position: [-5.0, -1.38, -2.5], rotation: [0, 0.90, 0], scale: 0.13 },
  { position: [-2.8, -1.38, -3.5], rotation: [0, -1.10, 0], scale: 0.17 },

  // ── Right flank ──
  { position: [3.8, -1.38, -5.0], rotation: [0, -0.30, 0], scale: 0.19 },
  { position: [4.8, -1.38, -4.0], rotation: [0, 1.10, 0], scale: 0.17 },
  { position: [3.2, -1.38, -4.0], rotation: [0, -1.50, 0], scale: 0.21 },
  { position: [4.4, -1.38, -2.8], rotation: [0, 0.50, 0], scale: 0.18 },
  { position: [5.2, -1.38, -3.2], rotation: [0, 0.40, 0], scale: 0.16 },
  { position: [2.8, -1.38, -3.5], rotation: [0, -0.90, 0], scale: 0.20 },
  { position: [5.0, -1.38, -2.5], rotation: [0, 0.70, 0], scale: 0.14 },

  // ── Outer edges ──
  { position: [-5.4, -1.38, -3.6], rotation: [0, 0.20, 0], scale: 0.15 },
  { position: [5.6, -1.38, -3.4], rotation: [0, -0.20, 0], scale: 0.14 },
  { position: [-5.0, -1.38, -5.4], rotation: [0, 1.80, 0], scale: 0.13 },
  { position: [5.2, -1.38, -5.2], rotation: [0, -1.60, 0], scale: 0.13 },
  { position: [-6.2, -1.38, -4.8], rotation: [0, -0.30, 0], scale: 0.12 },
  { position: [6.2, -1.38, -4.5], rotation: [0, 0.50, 0], scale: 0.11 },

  // ── Far-right edge (asymmetric density) ──
  { position: [6.4, -1.38, -6.2], rotation: [0, -0.50, 0], scale: 0.11 },
  { position: [6.8, -1.38, -4.8], rotation: [0, 0.90, 0], scale: 0.10 },
  { position: [7.2, -1.38, -3.0], rotation: [0, -1.20, 0], scale: 0.10 },
  { position: [7.6, -1.38, -5.0], rotation: [0, 0.30, 0], scale: 0.12 },
  { position: [8.0, -1.38, -4.0], rotation: [0, -0.70, 0], scale: 0.11 },
  { position: [7.0, -1.38, -6.0], rotation: [0, 1.10, 0], scale: 0.09 },

  // ── Mid-left gaps ──
  { position: [-2.4, -1.38, -6.0], rotation: [0, -0.70, 0], scale: 0.13 },
  { position: [-5.2, -1.38, -6.8], rotation: [0, 0.40, 0], scale: 0.11 },
  { position: [-4.0, -1.38, -7.6], rotation: [0, -1.00, 0], scale: 0.12 },
  { position: [-7.5, -1.38, -5.0], rotation: [0, 0.60, 0], scale: 0.15 },

  // ── Mid-right gaps ──
  { position: [3.4, -1.38, -6.0], rotation: [0, 0.80, 0], scale: 0.13 },
  { position: [4.0, -1.38, -7.2], rotation: [0, -0.60, 0], scale: 0.12 },
  { position: [5.0, -1.38, -6.6], rotation: [0, 1.30, 0], scale: 0.11 },
  { position: [3.0, -1.38, -7.8], rotation: [0, -0.40, 0], scale: 0.14 },
  { position: [5.5, -1.38, -5.0], rotation: [0, 0.90, 0], scale: 0.12 },
  { position: [4.8, -1.38, -6.0], rotation: [0, -1.10, 0], scale: 0.13 },
  { position: [8.5, -1.38, -5.0], rotation: [0, -0.50, 0], scale: 0.15 },

  // ── Centre-back (pushed to sides) ──
  { position: [2.8, -1.38, -6.4], rotation: [0, 0.95, 0], scale: 0.13 },
  { position: [3.2, -1.38, -8.8], rotation: [0, 0.55, 0], scale: 0.12 },
  { position: [-2.8, -1.38, -6.8], rotation: [0, -0.25, 0], scale: 0.14 },
]

const DESKTOP_CLUMPS: BambooClump[] = rawClumps.map((c) => ({
  ...c,
  scale: c.scale * SIZE_MULTIPLIER,
}))

const MOBILE_CLUMPS: BambooClump[] = DESKTOP_CLUMPS.filter((_, i) => i % 2 === 0)

export function BambooForest() {
  const { scene: loadedScene } = useGLTF(BAMBOO_URL) as GLTF
  const scene = useMemo(() => loadedScene.clone(true), [loadedScene])
  const isMobile = useIsMobile()
  const camPos = useRef(new THREE.Vector3())
  const clumpPos = useRef(new THREE.Vector3())

  useLayoutEffect(() => {
    const ownedMaterials: THREE.Material[] = []

    scene.traverse((obj) => {
      if (obj.type !== 'Mesh') return
      const mesh = obj as THREE.Mesh
      const apply = (mat: THREE.Material) => {
        const toon = createToonMaterial(mat)
        toon.color.set('#8B0000')
        ownedMaterials.push(toon)
        return toon
      }
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(apply)
      } else {
        mesh.material = apply(mesh.material)
      }
    })

    return () => {
      ownedMaterials.forEach((material) => {
        material.dispose()
      })
    }
  }, [scene])

  const baseClumps = isMobile ? MOBILE_CLUMPS : DESKTOP_CLUMPS
  const cullDist = isMobile ? MOBILE_CULL_DIST : DESKTOP_CULL_DIST

  const clonesRef = useRef<(THREE.Group | null)[]>([])
  const lastCullRef = useRef(0)

  useFrame((state) => {
    const now = performance.now()
    if (now - lastCullRef.current < 400) return
    lastCullRef.current = now

    camPos.current.copy(state.camera.position)

    for (let i = 0; i < baseClumps.length; i++) {
      const clone = clonesRef.current[i]
      if (!clone) continue
      const c = baseClumps[i]
      clumpPos.current.set(c.position[0], c.position[1], c.position[2])
      clone.visible = camPos.current.distanceTo(clumpPos.current) < cullDist
    }
  })

  return (
    <>
      {baseClumps.map((clump, i) => (
        <Clone
          key={i}
          ref={(el: THREE.Group | null) => { clonesRef.current[i] = el; }}
          object={scene}
          position={clump.position}
          rotation={clump.rotation}
          scale={clump.scale}
        />
      ))}
    </>
  )
}

useGLTF.preload(BAMBOO_URL)
