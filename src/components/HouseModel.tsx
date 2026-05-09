import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useGLTF, Environment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Box3, Vector3 } from 'three'
import type { Group, Material, Mesh } from 'three'
import type { GLTF } from 'three-stdlib'
import type {
  HouseModelProps,
  MaterialRule,
  PrefixMaterialRule,
  ScreenParticle,
} from '../types'
import { RedSpirits } from './Atmosphere'
import { TableWithCushions, TABLE_OFFSET_Z } from './Table'
import { SCROLL_LIFT, SCROLL_OFFSET_X, SCROLL_OFFSET_Z, TableScroll } from './TableScroll'
import { createToonMaterial } from '../utils/toon'

const CACHE_BUST = import.meta.env.VITE_BUILD_HASH ? `?v=${String(import.meta.env.VITE_BUILD_HASH)}` : ''
const MODEL_URL = `/models/final_house/house.glb${CACHE_BUST}`
const TARGET_HEIGHT = 3.8
const GROUND_Y = -1.38
const TARGET_FRONT_Z = 0.3

const EXACT_COLORS: Record<string, MaterialRule> = {
  // Big stone lantern bases (tōrō)
  zen_shrine_001_01: { color: '#4A4A50', roughness: 0.92, metalness: 0.05 },
  zen_shrine_001_02: { color: '#4A4A50', roughness: 0.92, metalness: 0.05 },
  // Single column
  zen_shrine_column_001: { color: '#4A3020', roughness: 0.8, metalness: 0.0, variation: 0.12 },
  // Single step stone
  zen_shrine_stepstone_001_10: { color: '#4A4A50', roughness: 0.9, metalness: 0.05 },
  // Hanging lantern lamp (paper)
  zen_shrine_lantern_v001_001: { color: '#E8DCC8', roughness: 1, metalness: 0.0 },
  // Hanging lantern thread
  zen_shrine_lantern_v001_003: { color: '#D4C5A9', roughness: 0.95, metalness: 0.0 },
  // Hanging lantern rod (v001 and v002 variants)
  zen_shrine_lantern_v001_005: { color: '#5C4033', roughness: 0.85, metalness: 0.0 },
  zen_shrine_lantern_v002_005: { color: '#5C4033', roughness: 0.85, metalness: 0.0 },
  // Ground pieces (base structure)
  zen_shrine_ground_001_01: { color: '#A09890', roughness: 0.95, metalness: 0.0, variation: 0.1 },
  zen_shrine_ground_001_02: { color: '#A09890', roughness: 0.95, metalness: 0.0, variation: 0.1 },
  zen_shrine_ground_001_03: { color: '#A09890', roughness: 0.95, metalness: 0.0, variation: 0.1 },
}

const PREFIX_COLORS: PrefixMaterialRule[] = [
  // Small hanging paper lanterns
  { prefix: 'cocoonimo_lantern_round', color: '#C4322D', roughness: 1, metalness: 0.0 },

  { prefix: 'zen_shrine_roof', color: '#1A2230', roughness: 0.85, metalness: 0.02, variation: 0.12 },
  { prefix: 'oni', color: '#C9A24A', emissive: '#D7B86A', emissiveIntensity: 0.12, roughness: 0.48, metalness: 0.55 },
  { prefix: 'shrine_rocks', color: '#A2978A', roughness: 0.97, metalness: 0.0, variation: 0.14 },
  { prefix: 'zen_shrine_frame_top', color: '#4C3020', roughness: 0.9, metalness: 0.0, variation: 0.16 },
  { prefix: 'zen_shrine_floor', color: '#A28263', roughness: 0.82, metalness: 0.0, variation: 0.2 },
  { prefix: 'zen_shrine_reiling', color: '#73523A', roughness: 0.88, metalness: 0.0, variation: 0.15 },
  { prefix: 'shrine_veranda_reiling', color: '#73523A', roughness: 0.88, metalness: 0.0, variation: 0.15 },
  { prefix: 'zen_shrine_stairs', color: '#826243', roughness: 0.82, metalness: 0.0, variation: 0.16 },
  { prefix: 'shoji_door', color: '#75553D', roughness: 0.88, metalness: 0.0 },
  { prefix: 'nw_tatami', color: '#D1BF91', roughness: 0.94, metalness: 0.0, variation: 0.12 },
]

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return h
}

function varyColor(baseColor: THREE.Color, amount: number, seed: number): THREE.Color {
  const c = baseColor.clone()
  const rng = ((seed * 9301 + 49297) % 233280) / 233280 - 0.5
  const hueShift = rng * amount * 0.15
  const brightShift = rng * amount * 0.25
  c.r = Math.max(0, Math.min(1, c.r + hueShift + brightShift))
  c.g = Math.max(0, Math.min(1, c.g + hueShift * 0.7 + brightShift))
  c.b = Math.max(0, Math.min(1, c.b + hueShift * 0.4 + brightShift))
  return c
}

function getMeshColor(name: string): MaterialRule | undefined {
  const lower = name.toLowerCase()
  //because of so many small compontens of that mesh with that name.
  if (lower.startsWith('shoji_door') && lower.endsWith('_02')) {
    return { color: '#E8DCC8', roughness: 0.95, metalness: 0.0, opacity: 0.82 }
  }

  if (lower in EXACT_COLORS) return EXACT_COLORS[lower]

  for (const rule of PREFIX_COLORS) {
    if (lower.startsWith(rule.prefix)) return rule
  }

  return undefined
}

function dedupePositions(
  positions: [number, number, number][],
  threshold = 0.6,
): [number, number, number][] {
  const clusters: { sum: Vector3; count: number }[] = []

  for (const p of positions) {
    const v = new Vector3(...p)
    let merged = false
    for (const c of clusters) {
      if (c.sum.distanceTo(v) < threshold) {
        c.sum.add(v)
        c.count++
        merged = true
        break
      }
    }
    if (!merged) {
      clusters.push({ sum: v.clone(), count: 1 })
    }
  }

  return clusters.map((c) => [
    c.sum.x / c.count,
    c.sum.y / c.count,
    c.sum.z / c.count,
  ])
}

function findObjectMesh(scene: THREE.Object3D, name: string): THREE.Mesh | undefined {
  const found = scene.getObjectByName(name)
  return found instanceof THREE.Mesh ? found : undefined
}

function findLowestTatamiY(scene: THREE.Object3D, group: THREE.Group, temp: THREE.Vector3): number | undefined {
  let lowest: number | undefined
  scene.traverse((obj: THREE.Object3D) => {
    if (obj.type !== 'Mesh') return
    if ((obj as Mesh).name.toLowerCase().startsWith('nw_tatami')) {
      obj.getWorldPosition(temp)
      group.worldToLocal(temp)
      if (lowest === undefined || temp.y < lowest) {
        lowest = temp.y
      }
    }
  })
  return lowest
}

function animateDoors(doors: { mesh: Mesh; closedX: number; openX: number }[], openProgress: number) {
  for (const door of doors) {
    const targetX = THREE.MathUtils.lerp(door.closedX, door.openX, openProgress)
    door.mesh.position.x = THREE.MathUtils.lerp(door.mesh.position.x, targetX, 0.1)
  }
}

function animateScreenParticles(
  particles: ScreenParticle[],
  t: number,
  canvas: HTMLCanvasElement,
  texture: THREE.CanvasTexture,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height

  // Warm lantern-lit background
  ctx.fillStyle = '#1a0e06'
  ctx.fillRect(0, 0, w, h)

  // Breathing radial glow — warm lantern core
  const breath = Math.sin(t * 0.4) * 0.08 + 0.32
  const grad = ctx.createRadialGradient(w / 2, h * 0.35, 0, w / 2, h * 0.35, w * 1.1)
  grad.addColorStop(0, `rgba(220, 160, 60, ${String(breath)})`)
  grad.addColorStop(0.5, `rgba(180, 100, 30, ${String(breath * 0.35)})`)
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Floating warm light pools
  ctx.globalCompositeOperation = 'screen'
  for (let i = 0; i < 3; i++) {
    const nx = ((Math.sin(t * 0.08 + i * 2.1) * 0.5 + 0.5) * w * 1.4) - w * 0.2
    const ny = ((Math.cos(t * 0.06 + i * 1.7) * 0.5 + 0.5) * h * 1.2) - h * 0.1
    const nr = 50 + Math.sin(t * 0.12 + i) * 18
    const ngrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr)
    ngrad.addColorStop(0, 'rgba(200, 140, 40, 0.12)')
    ngrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = ngrad
    ctx.fillRect(0, 0, w, h)
  }
  ctx.globalCompositeOperation = 'source-over'

  // Rice-paper grain lines
  ctx.globalAlpha = 0.04
  ctx.strokeStyle = '#D4AC6E'
  ctx.lineWidth = 1
  for (let y = 0; y < h; y += 6) {
    ctx.beginPath()
    ctx.moveTo(0, y + Math.sin(y * 0.3) * 2)
    for (let x = 0; x < w; x += 4) {
      ctx.lineTo(x, y + Math.sin((x + y) * 0.08) * 2)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Draw particles with glow
  for (const p of particles) {
    const drift = Math.sin(t * 0.5 + p.life * 0.03) * 0.6
    p.x += p.vx + drift
    p.y += p.vy
    p.life++

    if (p.life > p.maxLife || p.y < -30) {
      p.x = Math.random() * w
      p.y = h + 30
      p.life = 0
      p.maxLife = 50 + Math.floor(Math.random() * 70)
    }

    const fadeIn = Math.min(1, p.life / 15)
    const fadeOut = Math.min(1, (p.maxLife - p.life) / 15)
    const alpha = fadeIn * fadeOut

    const rgb = parseInt(p.color.slice(1), 16)
    const r = (rgb >> 16) & 255
    const g = (rgb >> 8) & 255
    const b = rgb & 255

    // Soft warm glow halo
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
    glow.addColorStop(0, `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(alpha * 0.6)})`)
    glow.addColorStop(0.5, `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(alpha * 0.15)})`)
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
    ctx.fill()

    // Ember core
    ctx.fillStyle = `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(alpha)})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r * 0.7, 0, Math.PI * 2)
    ctx.fill()

    // Bright center
    ctx.fillStyle = `rgba(255, 220, 210, ${String(alpha * 0.85)})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r * 0.25, 0, Math.PI * 2)
    ctx.fill()
  }

  const sparkleCount = 4
  for (let i = 0; i < sparkleCount; i++) {
    const sx = ((Math.sin(t * 0.3 + i * 3.7) * 0.5 + 0.5) * w * 0.8) + w * 0.1
    const sy = ((Math.cos(t * 0.25 + i * 2.3) * 0.5 + 0.5) * h * 0.8) + h * 0.1
    const pulse = Math.sin(t * 2.5 + i * 1.9) * 0.5 + 0.5
    const size = 3 + pulse * 6

    const sgrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 2)
    sgrad.addColorStop(0, `rgba(255, 90, 50, ${String(pulse * 0.8)})`)
    sgrad.addColorStop(0.4, `rgba(200, 40, 20, ${String(pulse * 0.25)})`)
    sgrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = sgrad
    ctx.beginPath()
    ctx.arc(sx, sy, size * 2, 0, Math.PI * 2)
    ctx.fill()
  }

  texture.needsUpdate = true
}

export function HouseModel({ onBounds, onScrollFocus, progress = 0, onReady }: HouseModelProps) {
  const { scene } = useGLTF(MODEL_URL, '/draco/') as GLTF
  const groupRef = useRef<Group>(null)
  const [lanternLights, setLanternLights] = useState<
    {
      pos: [number, number, number]
      intensity: number
      distance: number
      color: string
    }[]
  >([])
  const [oniPositions, setOniPositions] = useState<[number, number, number][]>([])
  const [tableFloorY, setTableFloorY] = useState(0.46)
  const [tableCenterZ, setTableCenterZ] = useState(0)
  const doorRefs = useRef<{ mesh: Mesh; closedX: number; openX: number }[]>([])
  const screenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const screenTextureRef = useRef<THREE.CanvasTexture | null>(null)
  const screenParticlesRef = useRef<ScreenParticle[]>([])
  const lastScreenUpdateRef = useRef(0)

  useEffect(() => {
    onReady?.()
  }, [onReady])

  useLayoutEffect(() => {
    scene.position.set(0, 0, 0)
    scene.scale.setScalar(1)

    let box = new Box3().setFromObject(scene)
    const size = new Vector3()
    box.getSize(size)

    const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1
    scene.scale.setScalar(scale)

    box = new Box3().setFromObject(scene)
    const center = new Vector3()
    box.getCenter(center)
    scene.position.set(-center.x, -box.min.y, -center.z)

    // Color-correct meshes by name
    scene.traverse((obj: THREE.Object3D) => {
      if (obj.type !== 'Mesh') return
      const mesh = obj as Mesh

      const rule = getMeshColor(mesh.name)
      if (!rule) return

      const apply = (mat: Material) => {
        const toon = createToonMaterial(mat.clone())
        const base = new THREE.Color(rule.color)
        if (rule.variation && rule.variation > 0) {
          const seed = hashString(mesh.name)
          toon.color.copy(varyColor(base, rule.variation, seed))
        } else {
          toon.color.copy(base)
        }
        if (rule.emissive) {
          toon.emissive.set(rule.emissive)
          toon.emissiveIntensity = rule.emissiveIntensity ?? 0
        }
        if (rule.opacity !== undefined) {
          toon.opacity = rule.opacity
          toon.transparent = rule.opacity < 1.0
        }
        return toon
      }

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(apply)
      } else {
        mesh.material = apply(mesh.material)
      }
    })

    
    const doors: { mesh: Mesh; closedX: number; openX: number }[] = []
    const SLIDE_DISTANCE = 0.35
    scene.traverse((obj: THREE.Object3D) => {
      if (obj.type !== 'Mesh') return
      const mesh = obj as Mesh
      const name = mesh.name.toLowerCase()

      if (name.startsWith('shoji_door_002')) {
        const closedX = mesh.position.x
        const openX = closedX - SLIDE_DISTANCE
        doors.push({ mesh, closedX, openX })
      } else if (name.startsWith('shoji_door_003')) {
        const closedX = mesh.position.x
        const openX = closedX + SLIDE_DISTANCE
        doors.push({ mesh, closedX, openX })
      }
    })
    doorRefs.current = doors

    const screenMeshes: THREE.Mesh[] = []
    scene.traverse((obj: THREE.Object3D) => {
      if (obj.type !== 'Mesh') return
      const mesh = obj as THREE.Mesh
      if (mesh.name === 'shoji_door_002001_02' || mesh.name === 'shoji_door_003001_02') {
        screenMeshes.push(mesh)
      }
    })

    if (screenMeshes.length > 0) {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 512
      screenCanvasRef.current = canvas

      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.premultiplyAlpha = false
      screenTextureRef.current = texture

      const particles: typeof screenParticlesRef.current = []
      for (let i = 0; i < 120; i++) {
        particles.push({
          x: Math.random() * 256,
          y: Math.random() * 512,
          r: 1.5 + Math.random() * 6,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -0.4 - Math.random() * 1.4,
          life: Math.floor(Math.random() * 100),
          maxLife: 60 + Math.floor(Math.random() * 80),
          color: Math.random() > 0.35 ? '#e04030' : '#ffc8a0',
        })
      }
      screenParticlesRef.current = particles

      for (const mesh of screenMeshes) {
        const basicMat = new THREE.MeshBasicMaterial({
          map: texture,
          color: new THREE.Color('#ffffff'),
        })
        mesh.material = basicMat
      }
    }

    if (groupRef.current) {
      const depth = box.max.z - box.min.z
      groupRef.current.position.set(0, GROUND_Y, TARGET_FRONT_Z - depth / 2)
      groupRef.current.updateWorldMatrix(true, true)

      const worldBounds = new Box3().setFromObject(groupRef.current)
      const visualBounds = new Box3()
      const hasVisualBounds = { value: false }
      const excludedNameTokens = [
        'collision',
        'collider',
        'bounds',
        'bound',
        'proxy',
        'helper',
        'pivot',
        'trigger',
      ]

      scene.traverse((obj: THREE.Object3D) => {
        if (obj.type !== 'Mesh') return
        if (!obj.visible) return

        const name = obj.name.toLowerCase()
        if (excludedNameTokens.some((token) => name.includes(token))) return

        const mesh = obj as Mesh

        if (!mesh.geometry.boundingBox) {
          mesh.geometry.computeBoundingBox()
        }

        const geomBox = mesh.geometry.boundingBox
        if (!geomBox) return

        const meshBox = geomBox.clone()
        meshBox.applyMatrix4(mesh.matrixWorld)

        if (!hasVisualBounds.value) {
          visualBounds.copy(meshBox)
          hasVisualBounds.value = true
        } else {
          visualBounds.union(meshBox)
        }
      })

      const boundsCb: ((bounds: THREE.Box3) => void) | undefined = onBounds
      if (boundsCb) {
        boundsCb(hasVisualBounds.value ? visualBounds : worldBounds)
      }

      // Extract lantern light positions (small + big)
      const rawPositions: {
        pos: [number, number, number]
        height: number
      }[] = []
      const temp = new Vector3()

      scene.traverse((obj: THREE.Object3D) => {
        if (obj.type !== 'Mesh') return
        const mesh = obj as Mesh
        const name = mesh.name.toLowerCase()
        // Only add point lights for big stone tōrō (hollow chamber fire effect).
        // Hanging paper lanterns glow via emissive material only.
        if (!name.startsWith('zen_shrine_001')) return

        mesh.getWorldPosition(temp)
        groupRef.current?.worldToLocal(temp)

        // Move light into hollow chamber
        temp.y += 0.7

        rawPositions.push({ pos: [temp.x, temp.y, temp.z], height: 0 })
      })

      const clustered = dedupePositions(
        rawPositions.map((r) => r.pos),
        1.2,
      )

      const lights = clustered.map((pos) => ({
        pos,
        intensity: 1.0,
        distance: 3.2,
        color: '#FFB84D',
      }))

      setLanternLights(lights)

      const ORNAMENT_LOCALS: [number, number, number][] = [
        [-4.2429, 4.4451, -4.5121], // back-left
        [-4.2429, 4.4451, 4.5121],  // front-left
        [4.2429, 4.4451, -4.5121],  // back-right
        [4.2429, 4.4451, 4.5121],   // front-right
      ]

      const roofMesh: THREE.Mesh | undefined = findObjectMesh(scene, 'zen_shrine_roof_001_05')

      const oniPositionsExtracted: [number, number, number][] = []
      if (roofMesh) {
        const worldMatrix = roofMesh.matrixWorld
        for (const local of ORNAMENT_LOCALS) {
          const pos = new Vector3(...local)
          pos.applyMatrix4(worldMatrix)
          groupRef.current.worldToLocal(pos)
          pos.y += 0.25 // float closer to ornament
          oniPositionsExtracted.push([pos.x, pos.y, pos.z])
        }
      }

      setOniPositions(oniPositionsExtracted)

      const tatamiY: number | undefined = findLowestTatamiY(scene, groupRef.current, temp)
      if (tatamiY !== undefined) {
        setTableFloorY(tatamiY)
      }

      const boundsForTable = hasVisualBounds.value ? visualBounds : worldBounds
      const centerPos = new Vector3()
      boundsForTable.getCenter(centerPos)
      groupRef.current.worldToLocal(centerPos)
      setTableCenterZ(centerPos.z)

      const resolvedFloorY = tatamiY ?? GROUND_Y
      const scrollLocal = new Vector3(
        SCROLL_OFFSET_X,
        resolvedFloorY + 0.172 + SCROLL_LIFT,
        centerPos.z - TABLE_OFFSET_Z + SCROLL_OFFSET_Z,
      )
      const scrollWorld = scrollLocal.clone()
      groupRef.current.localToWorld(scrollWorld)
      onScrollFocus?.(scrollWorld)
    }

    return () => {
      scene.position.set(0, 0, 0)
      scene.scale.setScalar(1)
    }
  }, [onBounds, onScrollFocus, scene])

  useFrame((state) => {
    const openProgress = Math.min(1, Math.max(0, progress / 0.4))
    animateDoors(doorRefs.current, openProgress)

    const canvas = screenCanvasRef.current
    const texture = screenTextureRef.current
    const particles = screenParticlesRef.current
    if (!canvas || !texture || particles.length === 0) return

    // Throttle 2D canvas animation to ~15 FPS to reduce main-thread pressure
    const now = performance.now()
    if (now - lastScreenUpdateRef.current < 67) return
    lastScreenUpdateRef.current = now

    animateScreenParticles(particles, state.clock.elapsedTime, canvas, texture)
  })

  return (
    <group ref={groupRef} rotation={[0, 0, 0]}>
      <Environment files="/env/dikhololo_night_1k.hdr" environmentIntensity={0.26} />
      <primitive object={scene} />
      {lanternLights.map((light, index) => (
        <pointLight
          key={`lantern-light-${String(index)}`}
          position={light.pos}
          intensity={light.intensity}
          color={light.color}
          distance={light.distance}
          decay={2}
        />
      ))}
      <pointLight
        position={[0, 2.8, 0]}
        intensity={1.35}
        color="#FFD7A3"
        distance={8}
        decay={2}
      />
      {oniPositions.length > 0 && <RedSpirits positions={oniPositions} />}
      <TableWithCushions floorY={tableFloorY} centerZ={tableCenterZ} />
      <TableScroll floorY={tableFloorY} tableZ={tableCenterZ - TABLE_OFFSET_Z} />
    </group>
  )
}

useGLTF.preload(MODEL_URL, '/draco/')
