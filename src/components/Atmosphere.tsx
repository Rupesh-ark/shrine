import { Sparkles } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { seededRandom } from '../utils/random'
import { get2dContext } from '../utils/canvas'
import type { FlameData, RedSpiritsProps } from '../types'

const flameTexture = new THREE.TextureLoader().load('/images/flame.png')
flameTexture.colorSpace = THREE.SRGBColorSpace

function createSoftGlowTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = get2dContext(canvas)
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(122, 222, 255, 1)')
  grad.addColorStop(0.35, 'rgba(122, 222, 255, 0.35)')
  grad.addColorStop(1, 'rgba(122, 222, 255, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.premultiplyAlpha = false
  return tex
}

const softGlowTexture = createSoftGlowTexture()

function generateFlames(): FlameData[] {
  const flames: FlameData[] = []
  const rng = seededRandom(42)

  // Upper spirits — floating above the roof
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2 + (rng() - 0.5) * 0.3
    const radius = 0.3 + rng() * 2.2
    flames.push({
      basePosition: new THREE.Vector3(
        Math.cos(angle) * radius,
        1.3 + rng() * 0.65,
        Math.sin(angle) * radius,
      ),
      speed: 0.3 + rng() * 0.5,
      phase: rng() * Math.PI * 2,
      scale: 0.035 + rng() * 0.055,
    })
  }

  // Surrounding spirits — around the house at lower heights
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2 + (rng() - 0.5) * 0.4
    const radius = 1.8 + rng() * 2.0
    flames.push({
      basePosition: new THREE.Vector3(
        Math.cos(angle) * radius,
        0.15 + rng() * 0.9,
        Math.sin(angle) * radius,
      ),
      speed: 0.25 + rng() * 0.4,
      phase: rng() * Math.PI * 2,
      scale: 0.025 + rng() * 0.045,
    })
  }

  return flames
}

function FlameSprite({ data }: { data: FlameData }) {
  const spriteRef = useRef<THREE.Sprite>(null)
  const glowRef = useRef<THREE.Sprite>(null)
  const featherRef = useRef<THREE.Sprite>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (!spriteRef.current || !glowRef.current || !featherRef.current || !lightRef.current) return
    const t = state.clock.elapsedTime

    // Outer glow: slow, wide drift (stationary halo)
    const glowY = data.basePosition.y + Math.sin(t * data.speed * 0.45 + data.phase) * 0.06
    const glowX = data.basePosition.x + Math.sin(t * 0.25 + data.phase) * 0.12
    const glowZ = data.basePosition.z + Math.cos(t * 0.2 + data.phase) * 0.1

    glowRef.current.position.set(glowX, glowY, glowZ)
    featherRef.current.position.set(glowX, glowY, glowZ)

    // Inner flame: tighter movement inside the halo
    const flameY = glowY + Math.sin(t * data.speed * 1.1 + data.phase + 1) * 0.03
    const flameX = glowX + Math.sin(t * 0.7 + data.phase + 2) * 0.02
    const flameZ = glowZ + Math.cos(t * 0.6 + data.phase + 3) * 0.016

    spriteRef.current.position.set(flameX, flameY, flameZ)
    lightRef.current.position.set(flameX, flameY, flameZ)

    // Flicker scale
    const flicker = 1 + Math.sin(t * 6 + data.phase) * 0.12
    spriteRef.current.scale.setScalar(data.scale * flicker)
    glowRef.current.scale.setScalar(data.scale * flicker * 2.4)
    featherRef.current.scale.setScalar(data.scale * flicker * 4.8)

    // Flicker light
    lightRef.current.intensity = 1.2 + Math.sin(t * 5 + data.phase) * 0.35
  })

  return (
    <group position={[data.basePosition.x, data.basePosition.y, data.basePosition.z]}>
      {/* Feather layer — radial gradient that softens PNG edges */}
      <sprite ref={featherRef}>
        <spriteMaterial
          map={softGlowTexture}
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      {/* Outer glow halo */}
      <sprite ref={glowRef}>
        <spriteMaterial
          map={flameTexture}
          color="#86D9F0"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      {/* Inner flame */}
      <sprite ref={spriteRef}>
        <spriteMaterial
          map={flameTexture}
          color="#B4F0FF"
          transparent
          opacity={0.58}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <pointLight ref={lightRef} color="#86D9F0" intensity={1.2} distance={2.2} decay={2} />
    </group>
  )
}

export function BlueSpirits() {
  const flames = useMemo(() => generateFlames(), [])

  return (
    <group>
      {flames.map((f, i) => (
        <FlameSprite key={`flame-${String(i)}`} data={f} />
      ))}
    </group>
  )
}

export function Fireflies() {
  return <Sparkles count={40} scale={8} size={3} speed={0.22} opacity={0.35} color="#F3D79B" />
}

function createRedGlowTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = get2dContext(canvas)
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(255, 122, 66, 1)')
  grad.addColorStop(0.4, 'rgba(255, 95, 40, 0.42)')
  grad.addColorStop(1, 'rgba(255, 20, 0, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.premultiplyAlpha = false
  return tex
}

const redGlowTexture = createRedGlowTexture()

function RedFlameSprite({ position }: { position: THREE.Vector3 }) {
  const spriteRef = useRef<THREE.Sprite>(null)
  const glowRef = useRef<THREE.Sprite>(null)
  const featherRef = useRef<THREE.Sprite>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const warmLightRef = useRef<THREE.PointLight>(null)

  const data = useMemo(() => ({
    basePosition: position.clone(),
    speed: 0.6 + seededRandom(Math.floor((position.x * 13 + position.y * 17 + position.z * 19) * 1000))() * 0.8,
    phase: seededRandom(Math.floor((position.x * 23 + position.y * 29 + position.z * 31) * 1000))() * Math.PI * 2,
    scale: 0.18 + seededRandom(Math.floor((position.x * 37 + position.y * 41 + position.z * 43) * 1000))() * 0.12,
  }), [position])

  useFrame((state) => {
    if (!spriteRef.current || !glowRef.current || !featherRef.current || !lightRef.current || !warmLightRef.current) return
    const t = state.clock.elapsedTime

    // Local offsets from group origin (group is already at basePosition)
    const glowY = Math.sin(t * data.speed * 0.45 + data.phase) * 0.15
    const glowX = Math.sin(t * 0.28 + data.phase) * 0.2
    const glowZ = Math.cos(t * 0.24 + data.phase) * 0.18

    glowRef.current.position.set(glowX, glowY, glowZ)
    featherRef.current.position.set(glowX, glowY, glowZ)

    // Tighter flame movement inside the glow
    const flameY = glowY + Math.sin(t * data.speed * 1.2 + data.phase + 1) * 0.06
    const flameX = glowX + Math.sin(t * 0.8 + data.phase + 2) * 0.04
    const flameZ = glowZ + Math.cos(t * 0.7 + data.phase + 3) * 0.03

    spriteRef.current.position.set(flameX, flameY, flameZ)
    lightRef.current.position.set(flameX, flameY, flameZ)
    warmLightRef.current.position.set(flameX, flameY - 0.15, flameZ)

    // Aggressive flicker
    const flicker = 1 + Math.sin(t * 7 + data.phase) * 0.18 + Math.sin(t * 11 + data.phase * 1.3) * 0.06
    spriteRef.current.scale.setScalar(data.scale * flicker)
    glowRef.current.scale.setScalar(data.scale * flicker * 2.2)
    featherRef.current.scale.setScalar(data.scale * flicker * 5.0)

    // Strong pulsing light to illuminate the gold oni
    lightRef.current.intensity = 3.4 + Math.sin(t * 6 + data.phase) * 0.95
    warmLightRef.current.intensity = 1.4 + Math.sin(t * 4.5 + data.phase + 2) * 0.45
  })

  return (
    <group position={[data.basePosition.x, data.basePosition.y, data.basePosition.z]}>
      <sprite ref={featherRef}>
        <spriteMaterial
          map={redGlowTexture}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <sprite ref={glowRef}>
        <spriteMaterial
          map={flameTexture}
          color="#FF5A2D"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <sprite ref={spriteRef}>
        <spriteMaterial
          map={flameTexture}
          color="#FFD38A"
          transparent
          opacity={0.72}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      {/* Main fire light — illuminates the oni */}
      <pointLight ref={lightRef} color="#FF6B35" intensity={3.4} distance={5.5} decay={2} />
      {/* Warm under-glow for gold reflection */}
      <pointLight ref={warmLightRef} color="#FFD08A" intensity={1.4} distance={3.5} decay={2} />
    </group>
  )
}

export function RedSpirits({ positions }: RedSpiritsProps) {
  return (
    <group>
      {positions.map((pos, i) => (
        <RedFlameSprite
          key={`red-flame-${String(i)}`}
          position={new THREE.Vector3(...pos)}
        />
      ))}
    </group>
  )
}
