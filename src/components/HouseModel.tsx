import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
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
import { InteriorDecor } from './InteriorDecor'
import { createToonMaterial } from '../utils/toon'
import { seededRandom } from '../utils/random'

const CACHE_BUST = import.meta.env.VITE_BUILD_HASH ? `?v=${String(import.meta.env.VITE_BUILD_HASH)}` : ''
const MODEL_URL = `/models/final_house/house.glb${CACHE_BUST}`
const TARGET_HEIGHT = 3.8
const GROUND_Y = -1.38
const TARGET_FRONT_Z = 0.3
const DOOR_OPEN_START_PROGRESS = 0.603
const DOOR_OPEN_END_PROGRESS = 0.78
const DOOR_RITUAL_CRACK_PROGRESS = 0.68
const SEAL_POP_PROGRESS = 0.739
const SEAL_POP_END_PROGRESS = 0.805
const INTERIOR_VISIBLE_PROGRESS = 0.6

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

function drawBloodSeal(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  ritualProgress: number,
  crackProgress: number,
) {
  const cx = w * 0.5
  const cy = h * 0.46
  const pulse = 0.5 + Math.sin(t * 8.5) * 0.5
  const sealAlpha = THREE.MathUtils.clamp(0.18 + ritualProgress * 0.75 + pulse * ritualProgress * 0.25, 0, 1)
  const sealSize = 74 + pulse * 6 + ritualProgress * 10

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-0.08 + Math.sin(t * 0.7) * 0.015)

  const glow = ctx.createRadialGradient(0, 0, sealSize * 0.1, 0, 0, sealSize * 1.25)
  glow.addColorStop(0, `rgba(190, 18, 18, ${String(0.2 * sealAlpha)})`)
  glow.addColorStop(0.45, `rgba(130, 8, 8, ${String(0.16 * sealAlpha)})`)
  glow.addColorStop(1, 'rgba(30, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(-sealSize * 1.5, -sealSize * 1.5, sealSize * 3, sealSize * 3)

  ctx.globalAlpha = sealAlpha
  ctx.strokeStyle = '#a81212'
  ctx.lineWidth = 5
  ctx.strokeRect(-sealSize * 0.48, -sealSize * 0.48, sealSize * 0.96, sealSize * 0.96)

  ctx.lineWidth = 2
  ctx.strokeStyle = '#ff2a1f'
  ctx.strokeRect(-sealSize * 0.36, -sealSize * 0.36, sealSize * 0.72, sealSize * 0.72)

  ctx.beginPath()
  ctx.arc(0, 0, sealSize * 0.26, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, -sealSize * 0.34)
  ctx.lineTo(0, sealSize * 0.34)
  ctx.moveTo(-sealSize * 0.28, 0)
  ctx.lineTo(sealSize * 0.28, 0)
  ctx.stroke()

  ctx.strokeStyle = '#3a0202'
  ctx.lineWidth = 3
  const dripAlpha = sealAlpha * (0.35 + ritualProgress * 0.5)
  ctx.globalAlpha = dripAlpha
  for (let i = 0; i < 6; i++) {
    const x = -sealSize * 0.35 + i * sealSize * 0.14
    const drip = 12 + Math.sin(t * 1.6 + i) * 5 + ritualProgress * 24
    ctx.beginPath()
    ctx.moveTo(x, sealSize * 0.46)
    ctx.lineTo(x + Math.sin(i * 2.1) * 5, sealSize * 0.46 + drip)
    ctx.stroke()
  }

  if (crackProgress > 0) {
    ctx.globalAlpha = THREE.MathUtils.clamp(crackProgress * 1.1, 0, 1)
    ctx.strokeStyle = '#ff4a32'
    ctx.lineWidth = 2.5
    const cracks = [
      [[0, -sealSize * 0.48], [10, -24], [-5, -5], [16, 22], [6, sealSize * 0.48]],
      [[-sealSize * 0.48, -8], [-28, -2], [-10, 6], [-sealSize * 0.15, 28]],
      [[sealSize * 0.46, 12], [32, 8], [16, -6], [24, -26]],
    ]
    for (const crack of cracks) {
      ctx.beginPath()
      crack.forEach(([x, y], index) => {
        const px = x * crackProgress
        const py = y * crackProgress
        if (index === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.stroke()
    }
  }

  ctx.restore()
  ctx.globalAlpha = 1
}

function createSealTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.premultiplyAlpha = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

function updateSealTexture(
  texture: THREE.CanvasTexture,
  t: number,
  ritualProgress: number,
  openProgress: number,
) {
  const canvas = texture.image as HTMLCanvasElement
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  const crackProgress = THREE.MathUtils.clamp(
    (ritualProgress - ((DOOR_RITUAL_CRACK_PROGRESS - DOOR_OPEN_START_PROGRESS) / (DOOR_OPEN_END_PROGRESS - DOOR_OPEN_START_PROGRESS))) / 0.28,
    0,
    1,
  )
  const fadeOut = 1 - THREE.MathUtils.smoothstep(openProgress, 0.42, 0.82)

  ctx.clearRect(0, 0, w, h)
  ctx.globalAlpha = fadeOut
  drawBloodSeal(ctx, w, h, t, ritualProgress, crackProgress)
  ctx.globalAlpha = 1
  texture.needsUpdate = true
}

function animateScreenParticles(
  particles: ScreenParticle[],
  t: number,
  canvas: HTMLCanvasElement,
  texture: THREE.CanvasTexture,
  ritualProgress: number,
  openProgress: number,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  const sway = Math.sin(t * 0.35) * 6
  const pulse = Math.sin(t * 9) * 0.5 + 0.5
  const bloodLift = ritualProgress * 0.16 + pulse * ritualProgress * 0.08

  // Dark warm base (slightly lifted so red can pop)
  ctx.fillStyle = '#1c1111'
  ctx.fillRect(0, 0, w, h)

  // Deep crimson vignette
  const breath = Math.sin(t * 0.2) * 0.05 + 0.18
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.95)
  grad.addColorStop(0, `rgba(80, 10, 10, ${String(breath)})`)
  grad.addColorStop(0.5, `rgba(40, 6, 6, ${String(breath * 0.5)})`)
  grad.addColorStop(1, 'rgba(10, 2, 2, 0.4)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  if (ritualProgress > 0) {
    ctx.fillStyle = `rgba(135, 3, 3, ${String(bloodLift)})`
    ctx.fillRect(0, 0, w, h)
  }

  // Faint paper grain
  ctx.globalAlpha = 0.06
  ctx.strokeStyle = '#4a2828'
  ctx.lineWidth = 1
  for (let y = 0; y < h; y += 8) {
    ctx.beginPath()
    ctx.moveTo(0, y + Math.sin(y * 0.25) * 2)
    for (let x = 0; x < w; x += 5) {
      ctx.lineTo(x, y + Math.sin((x + y) * 0.06) * 2)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Blood bamboo stalks — brightened for contrast
  const stalks = [
    { x: 0.18, w: 6, h: 0.72, lean: 0.04 },
    { x: 0.24, w: 5, h: 0.85, lean: -0.02 },
    { x: 0.32, w: 7, h: 0.68, lean: 0.03 },
    { x: 0.42, w: 4.5, h: 0.78, lean: -0.03 },
    { x: 0.52, w: 6.5, h: 0.65, lean: 0.05 },
    { x: 0.62, w: 5, h: 0.82, lean: -0.04 },
    { x: 0.72, w: 6, h: 0.7, lean: 0.02 },
    { x: 0.82, w: 4.5, h: 0.75, lean: -0.02 },
  ]

  for (const s of stalks) {
    const sx = w * s.x + sway * s.lean * 30
    const sw = s.w
    const sh = h * s.h
    const sy = h - sh * 0.15

    // Outer glow for each stalk
    ctx.fillStyle = 'rgba(140, 16, 16, 0.25)'
    ctx.fillRect(sx - sw / 2 - 2, sy - sh, sw + 4, sh)

    ctx.fillStyle = `rgba(185, 18, 18, ${String(0.82 + ritualProgress * 0.18)})`
    ctx.fillRect(sx - sw / 2, sy - sh, sw, sh)

    // Joint rings
    ctx.fillStyle = 'rgba(90, 10, 10, 0.95)'
    for (let j = 0; j < 5; j++) {
      const jy = sy - sh * (0.15 + j * 0.18)
      ctx.fillRect(sx - sw / 2 - 1, jy, sw + 2, 1.5)
    }
  }

  // Distant bamboo leaves — brightened
  const clusters = [
    { x: 0.15, y: 0.22, r: 18 },
    { x: 0.28, y: 0.18, r: 22 },
    { x: 0.45, y: 0.25, r: 16 },
    { x: 0.58, y: 0.15, r: 20 },
    { x: 0.72, y: 0.22, r: 18 },
    { x: 0.85, y: 0.19, r: 15 },
  ]

  for (const c of clusters) {
    const cx = w * c.x + Math.sin(t * 0.4 + c.x * 5) * 5
    const cy = h * c.y + Math.cos(t * 0.35 + c.y * 4) * 4
    const cr = c.r * (1 + Math.sin(t * 0.8 + c.x * 3) * 0.08)

    ctx.fillStyle = 'rgba(170, 24, 24, 0.7)'
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + t * 0.2 + c.x
      ctx.beginPath()
      ctx.ellipse(
        cx + Math.cos(angle) * cr * 0.5,
        cy + Math.sin(angle) * cr * 0.3,
        cr * 0.35,
        cr * 0.12,
        angle + Math.PI / 4,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
  }

  // Falling embers
  for (const p of particles) {
    const drift = Math.sin(t * 0.6 + p.life * 0.06) * 0.8
    p.x += p.vx + drift
    p.y += p.vy
    p.life++

    if (p.life > p.maxLife || p.y < -30) {
      p.x = Math.random() * w
      p.y = h + 30
      p.life = 0
      p.maxLife = 60 + Math.floor(Math.random() * 80)
    }

    const fadeIn = Math.min(1, p.life / 15)
    const fadeOut = Math.min(1, (p.maxLife - p.life) / 15)
    const alpha = fadeIn * fadeOut * (1 + ritualProgress * 0.45)

    const angle = (p.life * 0.08 + p.x * 0.01) % (Math.PI * 2)
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(angle)

    // Ember glow
    ctx.globalAlpha = alpha * 0.35
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(0, 0, p.r * 3.5, 0, Math.PI * 2)
    ctx.fill()

    // Ember core
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#ffe0c0'
    ctx.beginPath()
    ctx.ellipse(0, 0, p.r * 1.2, p.r * 0.8, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  if (openProgress > 0.65) {
    ctx.fillStyle = `rgba(12, 3, 3, ${String((openProgress - 0.65) * 0.55)})`
    ctx.fillRect(0, 0, w, h)
  }

  texture.needsUpdate = true
}

export function HouseModel({
  onBounds,
  onScrollFocus,
  progressRef,
  onReady,
  maxPointLights = Infinity,
  showRedSpirits = true,
}: HouseModelProps) {
  const { scene: loadedScene } = useGLTF(MODEL_URL, '/draco/') as GLTF
  const scene = useMemo(() => loadedScene.clone(true), [loadedScene])
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
  const sealTextureRef = useRef<THREE.CanvasTexture | null>(null)
  const sealMeshRef = useRef<THREE.Mesh>(null)
  const sealMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const sealBurstRef = useRef<THREE.Points>(null)
  const sealBurstMaterialRef = useRef<THREE.PointsMaterial>(null)
  const [sealPlane, setSealPlane] = useState<{
    position: [number, number, number]
    width: number
    height: number
    texture: THREE.CanvasTexture
  } | null>(null)
  const sealBurstGeometry = useMemo(() => {
    const count = 56
    const rng = seededRandom(739)
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const jitter = 0.4 + rng() * 0.6
      positions[i * 3] = Math.cos(angle) * jitter
      positions[i * 3 + 1] = Math.sin(angle) * jitter
      positions[i * 3 + 2] = (rng() - 0.5) * 0.03
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])
  const interiorGroupRef = useRef<THREE.Group>(null)
  const lastScreenUpdateRef = useRef(0)
  const doorAnimationCompleteRef = useRef(false)

  useEffect(() => {
    onReady?.()
  }, [onReady])

  useLayoutEffect(() => {
    const ownedMaterials: THREE.Material[] = []
    const ownedTextures: THREE.Texture[] = []

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
        const toon = createToonMaterial(mat)
        ownedMaterials.push(toon)
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
      const screenBounds = new Box3()
      let hasScreenBounds = false
      for (const mesh of screenMeshes) {
        mesh.updateWorldMatrix(true, false)
        const meshBounds = new Box3().setFromObject(mesh)
        if (!hasScreenBounds) {
          screenBounds.copy(meshBounds)
          hasScreenBounds = true
        } else {
          screenBounds.union(meshBounds)
        }
      }

      let sealPlaneData: { position: [number, number, number]; width: number; height: number } | null = null
      if (hasScreenBounds && groupRef.current) {
        const screenCenter = new Vector3()
        const screenSize = new Vector3()
        screenBounds.getCenter(screenCenter)
        screenBounds.getSize(screenSize)
        groupRef.current.worldToLocal(screenCenter)
        sealPlaneData = {
          position: [screenCenter.x, screenCenter.y, screenCenter.z + 0.012],
          width: Math.max(0.18, screenSize.x * 0.42),
          height: Math.max(0.18, screenSize.y * 0.42),
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 512
      screenCanvasRef.current = canvas

      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.premultiplyAlpha = false
      ownedTextures.push(texture)
      screenTextureRef.current = texture

      const sealTexture = createSealTexture()
      ownedTextures.push(sealTexture)
      sealTextureRef.current = sealTexture
      if (sealPlaneData) {
        setSealPlane({ ...sealPlaneData, texture: sealTexture })
      }

      const particles: typeof screenParticlesRef.current = []
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * 256,
          y: Math.random() * 512,
          r: 2 + Math.random() * 4,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.3 - Math.random() * 0.8,
          life: Math.floor(Math.random() * 100),
          maxLife: 60 + Math.floor(Math.random() * 80),
          color: Math.random() > 0.5 ? '#e04020' : '#ff8844',
        })
      }
      screenParticlesRef.current = particles

      for (const mesh of screenMeshes) {
        const basicMat = new THREE.MeshBasicMaterial({
          map: texture,
          color: new THREE.Color('#ffffff'),
        })
        ownedMaterials.push(basicMat)
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
      screenCanvasRef.current = null
      screenTextureRef.current = null
      sealTextureRef.current = null
      setSealPlane(null)
      screenParticlesRef.current = []
      doorRefs.current = []
      ownedMaterials.forEach((material) => {
        material.dispose()
      })
      ownedTextures.forEach((texture) => {
        texture.dispose()
      })
    }
  }, [onBounds, onScrollFocus, scene])

  useFrame((state) => {
    const progress = progressRef?.current ?? 0

    const openProgress = THREE.MathUtils.clamp(
      (progress - DOOR_OPEN_START_PROGRESS) / (DOOR_OPEN_END_PROGRESS - DOOR_OPEN_START_PROGRESS),
      0,
      1,
    )
    if (openProgress < 1) {
      doorAnimationCompleteRef.current = false
    }
    if (!doorAnimationCompleteRef.current) {
      animateDoors(doorRefs.current, openProgress)
      if (openProgress >= 1) {
        doorAnimationCompleteRef.current = doorRefs.current.every(
          (door) => Math.abs(door.mesh.position.x - door.openX) < 0.001,
        )
      }
    }

    const canvas = screenCanvasRef.current
    const texture = screenTextureRef.current
    const particles = screenParticlesRef.current
    const sealTexture = sealTextureRef.current
    if (!canvas || !texture || particles.length === 0 || progress >= 0.82) return

    // Throttle 2D canvas animation to ~15 FPS to reduce main-thread pressure
    const now = performance.now()
    if (now - lastScreenUpdateRef.current < 100) return
    lastScreenUpdateRef.current = now

    animateScreenParticles(particles, state.clock.elapsedTime, canvas, texture, openProgress, openProgress)
    if (sealTexture) {
      updateSealTexture(sealTexture, state.clock.elapsedTime, openProgress, openProgress)
    }

    const popProgress = THREE.MathUtils.clamp(
      (progress - SEAL_POP_PROGRESS) / (SEAL_POP_END_PROGRESS - SEAL_POP_PROGRESS),
      0,
      1,
    )
    const sealVisible = progress < SEAL_POP_END_PROGRESS
    if (sealMeshRef.current) {
      sealMeshRef.current.visible = sealVisible
      const popScale = 1 + popProgress * 0.55
      sealMeshRef.current.scale.setScalar(popScale)
    }
    if (sealMaterialRef.current) {
      sealMaterialRef.current.opacity = sealVisible ? 1 - THREE.MathUtils.smoothstep(popProgress, 0.2, 1) : 0
    }
    if (sealBurstRef.current) {
      sealBurstRef.current.visible = popProgress > 0 && popProgress < 1
      sealBurstRef.current.scale.setScalar(0.06 + popProgress * 0.22)
    }
    if (sealBurstMaterialRef.current) {
      sealBurstMaterialRef.current.opacity = popProgress > 0 && popProgress < 1 ? 1 - popProgress : 0
      sealBurstMaterialRef.current.size = 0.012 + popProgress * 0.014
    }

    if (interiorGroupRef.current) {
      interiorGroupRef.current.visible = progress >= INTERIOR_VISIBLE_PROGRESS
    }
  })

  return (
    <group ref={groupRef} rotation={[0, 0, 0]}>
      <primitive object={scene} />
      {lanternLights.slice(0, maxPointLights).map((light, index) => (
        <pointLight
          key={`lantern-light-${String(index)}`}
          position={light.pos}
          intensity={light.intensity}
          color={light.color}
          distance={light.distance}
          decay={2}
        />
      ))}
      {maxPointLights > 0 && (
        <pointLight
          position={[0, 2.8, 0]}
          intensity={1.35}
          color="#FFD7A3"
          distance={8}
          decay={2}
        />
      )}
      {showRedSpirits && oniPositions.length > 0 && <RedSpirits positions={oniPositions} />}
      {sealPlane && (
        <group position={sealPlane.position}>
          <mesh ref={sealMeshRef}>
            <planeGeometry args={[sealPlane.width, sealPlane.height]} />
            <meshBasicMaterial
              ref={sealMaterialRef}
              map={sealPlane.texture}
              transparent
              opacity={1}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <points ref={sealBurstRef} geometry={sealBurstGeometry} visible={false}>
            <pointsMaterial
              ref={sealBurstMaterialRef}
              color="#ff2a22"
              size={0.012}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </points>
        </group>
      )}
      <group ref={interiorGroupRef}>
        <TableWithCushions floorY={tableFloorY} centerZ={tableCenterZ} />
        <TableScroll floorY={tableFloorY} tableZ={tableCenterZ - TABLE_OFFSET_Z} progressRef={progressRef} />
        <InteriorDecor floorY={tableFloorY} centerZ={tableCenterZ} progressRef={progressRef} />
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_URL, '/draco/')
