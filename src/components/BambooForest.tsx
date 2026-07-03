import { useGLTF } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'
import { createToonMaterial } from '../utils/toon'
import type { QualityTier } from '../hooks/useIsMobile'

const BAMBOO_URL = '/models/final_house/Bamboo.glb'
const SIZE_MULTIPLIER = 9

interface BambooClump {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

interface BambooForestProps {
  active?: boolean
  visible?: boolean
  quality: QualityTier
}

const rawClumps: BambooClump[] = [
  { position: [-3.6, 0, -7.2], rotation: [0, 0.50, 0], scale: 0.16 },
  { position: [-2.8, 0, -7.0], rotation: [0, 1.20, 0], scale: 0.18 },
  { position: [-1.4, 0, -8.2], rotation: [0, -0.30, 0], scale: 0.20 },
  { position: [1.8, 0, -8.6], rotation: [0, 0.80, 0], scale: 0.19 },
  { position: [2.8, 0, -7.4], rotation: [0, -0.60, 0], scale: 0.17 },
  { position: [3.4, 0, -6.8], rotation: [0, 1.40, 0], scale: 0.15 },
  { position: [-4.5, 0, -7.5], rotation: [0, 0.40, 0], scale: 0.26 },
  { position: [-5.0, 0, -6.5], rotation: [0, -0.60, 0], scale: 0.28 },
  { position: [-3.2, 0, -8.5], rotation: [0, 1.20, 0], scale: 0.24 },
  { position: [-6.5, 0, -7.0], rotation: [0, -0.20, 0], scale: 0.22 },
  { position: [-5.8, 0, -8.2], rotation: [0, 0.70, 0], scale: 0.20 },
  { position: [-3.8, 0, -9.2], rotation: [0, -0.40, 0], scale: 0.18 },
  { position: [6.5, 0, -7.5], rotation: [0, -0.40, 0], scale: 0.26 },
  { position: [5.1, 0, -6.5], rotation: [0, 0.60, 0], scale: 0.28 },
  { position: [3.3, 0, -8.5], rotation: [0, -1.20, 0], scale: 0.24 },
  { position: [6.5, 0, -7.0], rotation: [0, 0.20, 0], scale: 0.22 },
  { position: [5.8, 0, -8.2], rotation: [0, -0.70, 0], scale: 0.20 },
  { position: [3.8, 0, -9.2], rotation: [0, 0.40, 0], scale: 0.18 },
  { position: [-3.6, 0, -5.2], rotation: [0, 0.30, 0], scale: 0.16 },
  { position: [-4.6, 0, -4.2], rotation: [0, -0.80, 0], scale: 0.14 },
  { position: [-3.0, 0, -4.2], rotation: [0, 1.50, 0], scale: 0.18 },
  { position: [-4.2, 0, -3.0], rotation: [0, -0.40, 0], scale: 0.15 },
  { position: [-5.0, 0, -2.5], rotation: [0, 0.90, 0], scale: 0.13 },
  { position: [-2.8, 0, -3.5], rotation: [0, -1.10, 0], scale: 0.17 },
  { position: [3.8, 0, -5.0], rotation: [0, -0.30, 0], scale: 0.19 },
  { position: [4.8, 0, -4.0], rotation: [0, 1.10, 0], scale: 0.17 },
  { position: [3.2, 0, -4.0], rotation: [0, -1.50, 0], scale: 0.21 },
  { position: [4.4, 0, -2.8], rotation: [0, 0.50, 0], scale: 0.18 },
  { position: [5.2, 0, -3.2], rotation: [0, 0.40, 0], scale: 0.16 },
  { position: [2.8, 0, -3.5], rotation: [0, -0.90, 0], scale: 0.20 },
  { position: [5.0, 0, -2.5], rotation: [0, 0.70, 0], scale: 0.14 },
  { position: [-5.4, 0, -3.6], rotation: [0, 0.20, 0], scale: 0.15 },
  { position: [5.6, 0, -3.4], rotation: [0, -0.20, 0], scale: 0.14 },
  { position: [-5.0, 0, -5.4], rotation: [0, 1.80, 0], scale: 0.13 },
  { position: [5.2, 0, -5.2], rotation: [0, -1.60, 0], scale: 0.13 },
  { position: [-6.2, 0, -4.8], rotation: [0, -0.30, 0], scale: 0.12 },
  { position: [6.2, 0, -4.5], rotation: [0, 0.50, 0], scale: 0.11 },
  { position: [6.4, 0, -6.2], rotation: [0, -0.50, 0], scale: 0.11 },
  { position: [6.8, 0, -4.8], rotation: [0, 0.90, 0], scale: 0.10 },
  { position: [7.2, 0, -3.0], rotation: [0, -1.20, 0], scale: 0.10 },
  { position: [7.6, 0, -5.0], rotation: [0, 0.30, 0], scale: 0.12 },
  { position: [8.0, 0, -4.0], rotation: [0, -0.70, 0], scale: 0.11 },
  { position: [7.0, 0, -6.0], rotation: [0, 1.10, 0], scale: 0.09 },
  { position: [-2.4, 0, -6.0], rotation: [0, -0.70, 0], scale: 0.13 },
  { position: [-5.2, 0, -6.8], rotation: [0, 0.40, 0], scale: 0.11 },
  { position: [-4.0, 0, -7.6], rotation: [0, -1.00, 0], scale: 0.12 },
  { position: [-7.5, 0, -5.0], rotation: [0, 0.60, 0], scale: 0.15 },
  { position: [3.4, 0, -6.0], rotation: [0, 0.80, 0], scale: 0.13 },
  { position: [4.0, 0, -7.2], rotation: [0, -0.60, 0], scale: 0.12 },
  { position: [5.0, 0, -6.6], rotation: [0, 1.30, 0], scale: 0.11 },
  { position: [3.0, 0, -7.8], rotation: [0, -0.40, 0], scale: 0.14 },
  { position: [5.5, 0, -5.0], rotation: [0, 0.90, 0], scale: 0.12 },
  { position: [4.8, 0, -6.0], rotation: [0, -1.10, 0], scale: 0.13 },
  { position: [8.5, 0, -5.0], rotation: [0, -0.50, 0], scale: 0.15 },
  { position: [2.8, 0, -6.4], rotation: [0, 0.95, 0], scale: 0.13 },
  { position: [3.2, 0, -8.8], rotation: [0, 0.55, 0], scale: 0.12 },
  { position: [-2.8, 0, -6.8], rotation: [0, -0.25, 0], scale: 0.14 },
]

const DESKTOP_CLUMPS: BambooClump[] = rawClumps.map((c) => ({
  ...c,
  scale: c.scale * SIZE_MULTIPLIER,
}))

const tempPosition = new THREE.Vector3()
const tempEuler = new THREE.Euler()
const tempQuaternion = new THREE.Quaternion()
const tempScale = new THREE.Vector3()

function buildInstancedMeshes(
  gltfScene: THREE.Group,
  clumps: BambooClump[],
): { meshes: THREE.InstancedMesh[]; matrices: THREE.Matrix4[]; ownedMaterials: THREE.Material[] } {
  const sourceMeshes: THREE.Mesh[] = []
  gltfScene.traverse((obj) => {
    if (obj.type === 'Mesh') sourceMeshes.push(obj as THREE.Mesh)
  })

  const ownedMaterials: THREE.Material[] = []
  const instancedMeshes: THREE.InstancedMesh[] = []
  const matrices: THREE.Matrix4[] = []

  for (const c of clumps) {
    tempPosition.set(c.position[0], c.position[1], c.position[2])
    tempEuler.set(c.rotation[0], c.rotation[1], c.rotation[2])
    tempQuaternion.setFromEuler(tempEuler)
    tempScale.setScalar(c.scale)
    const m = new THREE.Matrix4().compose(tempPosition, tempQuaternion, tempScale)
    matrices.push(m)
  }

  for (const sourceMesh of sourceMeshes) {
    const geometry = sourceMesh.geometry.clone()
    geometry.applyMatrix4(sourceMesh.matrix)

    const toon = createToonMaterial(sourceMesh.material as THREE.Material)
    toon.color.set('#8B0000')
    ownedMaterials.push(toon)

    const instancedMesh = new THREE.InstancedMesh(geometry, toon, clumps.length)
    instancedMesh.frustumCulled = true
    for (let i = 0; i < clumps.length; i++) {
      instancedMesh.setMatrixAt(i, matrices[i])
    }
    instancedMesh.instanceMatrix.needsUpdate = true
    instancedMeshes.push(instancedMesh)
  }

  return { meshes: instancedMeshes, matrices, ownedMaterials }
}

export function BambooForest({ active = true, visible = true, quality }: BambooForestProps) {
  const { scene: loadedScene } = useGLTF(BAMBOO_URL, '/draco/') as GLTF
  const groupRef = useRef<THREE.Group>(null)
  const meshesRef = useRef<THREE.InstancedMesh[]>([])

  const filteredClumps = useMemo(() => {
    if (quality.bambooDensity >= 1) return DESKTOP_CLUMPS
    const step = Math.max(1, Math.round(1 / quality.bambooDensity))
    return DESKTOP_CLUMPS.filter((_, i) => i % step === 0)
  }, [quality.bambooDensity])

  useLayoutEffect(() => {
    const clonedScene = loadedScene.clone(true)
    const { meshes, ownedMaterials } = buildInstancedMeshes(clonedScene, filteredClumps)
    meshesRef.current = meshes

    const group = groupRef.current
    if (!group) return
    while (group.children.length > 0) {
      group.remove(group.children[0])
    }
    for (const mesh of meshes) {
      group.add(mesh)
    }

    const g = groupRef.current
    return () => {
      for (const mesh of meshes) {
        mesh.dispose()
        if (g) g.remove(mesh)
      }
      ownedMaterials.forEach((m) => { m.dispose() })
    }
  }, [loadedScene, filteredClumps])

  return <group ref={groupRef} visible={active && visible} />
}
