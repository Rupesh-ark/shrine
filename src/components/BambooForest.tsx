import { useGLTF, Clone } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'
import { createToonMaterial } from '../utils/toon'

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

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  })

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return isMobile
}

export function BambooForest() {
  const { scene } = useGLTF(BAMBOO_URL) as GLTF
  const isMobile = useIsMobile()
  const camPos = useRef(new THREE.Vector3())
  const clumpPos = useRef(new THREE.Vector3())

  useLayoutEffect(() => {
    scene.traverse((obj) => {
      if (obj.type !== 'Mesh') return
      const mesh = obj as THREE.Mesh
      const apply = (mat: THREE.Material) => {
        const toon = createToonMaterial(mat.clone())
        toon.color.set('#8B0000')
        return toon
      }
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(apply)
      } else {
        mesh.material = apply(mesh.material)
      }
    })
  }, [scene])

  const baseClumps = isMobile ? MOBILE_CLUMPS : DESKTOP_CLUMPS
  const cullDist = isMobile ? MOBILE_CULL_DIST : DESKTOP_CULL_DIST

  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(
    () => new Set(baseClumps.map((_, i) => i)),
  )

  const lastCullRef = useRef(0)

  useFrame((state) => {
    const now = performance.now()
    if (now - lastCullRef.current < 400) return
    lastCullRef.current = now

    camPos.current.copy(state.camera.position)
    const next = new Set<number>()

    for (let i = 0; i < baseClumps.length; i++) {
      const c = baseClumps[i]
      clumpPos.current.set(c.position[0], c.position[1], c.position[2])
      if (camPos.current.distanceTo(clumpPos.current) < cullDist) {
        next.add(i)
      }
    }

    setVisibleIndices((prev) => {
      if (prev.size === next.size) {
        let same = true
        for (const v of next) {
          if (!prev.has(v)) {
            same = false
            break
          }
        }
        if (same) return prev
      }
      return next
    })
  })

  return (
    <>
      {baseClumps.map((clump, i) =>
        visibleIndices.has(i) ? (
          <Clone
            key={i}
            object={scene}
            position={clump.position}
            rotation={clump.rotation}
            scale={clump.scale}
          />
        ) : null,
      )}
    </>
  )
}

useGLTF.preload(BAMBOO_URL)
