import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { seededRandom } from '../utils/random'
import { get2dContext } from '../utils/canvas'
import type { ShootingState, SkyDomeProps } from '../types'

function createStarfieldTexture() {
  const W = 4096
  const H = 2048
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = get2dContext(canvas)

  // Deep night base
  ctx.fillStyle = '#03040a'
  ctx.fillRect(0, 0, W, H)

  // Subtle radial glow (distant light pollution / galactic core)
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.65, 0, W * 0.5, H * 0.65, H * 0.9)
  glow.addColorStop(0, 'rgba(14, 24, 50, 0.22)')
  glow.addColorStop(0.5, 'rgba(8, 16, 34, 0.10)')
  glow.addColorStop(1, 'rgba(3, 4, 10, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // Spectral colour weights
  const spectra = [
    { r: 175, g: 196, b: 255, w: 0.06 }, // O  – blue
    { r: 200, g: 216, b: 255, w: 0.14 }, // B  – blue-white
    { r: 225, g: 235, b: 255, w: 0.20 }, // A  – white
    { r: 255, g: 250, b: 240, w: 0.28 }, // F  – yellow-white
    { r: 255, g: 230, b: 190, w: 0.18 }, // G  – yellow
    { r: 255, g: 200, b: 160, w: 0.10 }, // K  – orange
    { r: 255, g: 170, b: 150, w: 0.04 }, // M  – red
  ]
  const totalW = spectra.reduce((s, c) => s + c.w, 0)

  const rng = seededRandom(42)
  const pickSpectrum = () => {
    let roll = rng() * totalW
    for (const s of spectra) {
      roll -= s.w
      if (roll <= 0) return s
    }
    return spectra[3]
  }

  // Background field stars
  const fieldCount = 14000
  for (let i = 0; i < fieldCount; i++) {
    const x = rng() * W
    const y = rng() * H

    const magRoll = rng()
    let size: number
    let alpha: number
    if (magRoll < 0.90) {
      // dim
      size = rng() * 0.9 + 0.35
      alpha = rng() * 0.30 + 0.12
    } else if (magRoll < 0.98) {
      // medium
      size = rng() * 1.4 + 0.9
      alpha = rng() * 0.35 + 0.35
    } else {
      // bright
      size = rng() * 2.2 + 1.4
      alpha = rng() * 0.25 + 0.65
    }

    const c = pickSpectrum()
    ctx.fillStyle = `rgba(${String(c.r)},${String(c.g)},${String(c.b)},${String(alpha)})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  // Milky Way band — denser, fainter, near the equator
  const mwCount = 8000
  for (let i = 0; i < mwCount; i++) {
    const x = rng() * W
    // Gaussian cluster around equator (canvas middle)
    const v = 0.5 + (rng() - 0.5) * 0.38
    const y = v * H

    const distFromEquator = Math.abs(v - 0.5) * 2 // 0 at equator, 1 at edge of band
    const density = Math.exp(-distFromEquator * distFromEquator * 5)
    if (rng() > density) continue

    const size = rng() * 1.0 + 0.25
    const alpha = rng() * 0.15 + 0.04
    ctx.fillStyle = `rgba(195, 205, 240, ${String(alpha)})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  // Very bright stars with diffraction glow
  for (let i = 0; i < 70; i++) {
    const x = rng() * W
    const y = rng() * H
    const c = pickSpectrum()

    const glowR = 10 + rng() * 8
    const g = ctx.createRadialGradient(x, y, 0, x, y, glowR)
    g.addColorStop(0, `rgba(${String(c.r)},${String(c.g)},${String(c.b)},0.55)`)
    g.addColorStop(0.12, `rgba(${String(c.r)},${String(c.g)},${String(c.b)},0.18)`)
    g.addColorStop(1, `rgba(${String(c.r)},${String(c.g)},${String(c.b)},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - glowR, y - glowR, glowR * 2, glowR * 2)

    ctx.fillStyle = `rgba(${String(c.r)},${String(c.g)},${String(c.b)},0.95)`
    ctx.beginPath()
    ctx.arc(x, y, 1.1, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.premultiplyAlpha = false
  texture.anisotropy = 16
  return texture
}

/* ───────── shooting star logic (from old Stars.tsx) ───────── */

export function SkyDome({ progress }: SkyDomeProps) {
  const texture = useMemo(() => createStarfieldTexture(), [])

  const domeRef = useRef<THREE.Mesh>(null)
  const shootingStarRef = useRef<THREE.Mesh>(null)
  const shootingTrailRef = useRef<THREE.Mesh>(null)

  const shootingState = useRef<ShootingState>({
    active: false,
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    timer: 0,
    nextSpawn: 1.2,
  })

  useFrame((_state, delta) => {
    // Reveal stars as we transition from orthographic to perspective camera
    // (ortho phase ~= 0 … 0.18; fade fully in by 0.22)
    const reveal = THREE.MathUtils.smoothstep(progress, 0.0, 0.22)

    if (domeRef.current) {
      const mat = domeRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = reveal
      mat.transparent = reveal < 1
    }

    const s = shootingState.current
    s.timer += delta

    // Suppress shooting stars until the sky is visible
    if (!s.active && s.timer >= s.nextSpawn && reveal > 0.5) {
      s.active = true
      s.x = (Math.random() - 0.5) * 28
      s.y = Math.random() * 5 + 5.5
      s.z = -10 - Math.random() * 8
      s.vx = (Math.random() - 0.3) * 4.5
      s.vy = -(Math.random() * 1.8 + 0.9)
      s.timer = 0
    }

    if (s.active && shootingStarRef.current && shootingTrailRef.current) {
      s.x += s.vx * delta
      s.y += s.vy * delta

      shootingStarRef.current.visible = true
      shootingTrailRef.current.visible = true
      shootingStarRef.current.position.set(s.x, s.y, s.z)
      shootingTrailRef.current.position.set(
        s.x - s.vx * 0.05,
        s.y - s.vy * 0.05,
        s.z,
      )

      const falloff = Math.max(0, Math.min(1, s.y / 3))
      const headMat = shootingStarRef.current.material as THREE.MeshBasicMaterial
      const trailMat = shootingTrailRef.current.material as THREE.MeshBasicMaterial
      headMat.opacity = falloff * reveal
      trailMat.opacity = falloff * 0.4 * reveal

      if (s.y < -1 || s.x < -18 || s.x > 18) {
        s.active = false
        s.nextSpawn = Math.random() * 2.0 + 0.6
        s.timer = 0
        shootingStarRef.current.visible = false
        shootingTrailRef.current.visible = false
      }
    }
  })

  return (
    <group>
      {/* Sky sphere — large enough to never clip the camera */}
      <mesh ref={domeRef} renderOrder={-1000}>
        <sphereGeometry args={[60, 64, 64]} />
        <meshBasicMaterial
          map={texture}
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Shooting star head */}
      <mesh ref={shootingStarRef} visible={false}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      {/* Shooting star trail */}
      <mesh ref={shootingTrailRef} visible={false}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial
          color="#A8C0F0"
          transparent
          opacity={0.34}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
    </group>
  )
}
