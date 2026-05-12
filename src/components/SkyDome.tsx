import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { seededRandom } from '../utils/random'


/* ── Sky gradient shader ── */

const SKY_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SKY_FRAGMENT = `
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec3 zenith = vec3(0.06, 0.05, 0.14);
    vec3 midtone = vec3(0.04, 0.035, 0.10);
    vec3 horizon = vec3(0.015, 0.012, 0.04);

    float t = clamp(vUv.y * 1.8, 0.0, 1.0);
    vec3 col = mix(zenith, midtone, smoothstep(0.0, 0.5, t));
    col = mix(col, horizon, smoothstep(0.5, 1.0, t));

    gl_FragColor = vec4(col, uOpacity);
  }
`

/* ── Moon glow texture ── */

function createMoonGlowTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  const cx = size / 2
  const cy = size / 2

  const grad = ctx.createRadialGradient(cx, cy, size * 0.2, cx, cy, size / 2)
  grad.addColorStop(0, 'rgba(190, 45, 35, 0.28)')
  grad.addColorStop(0.35, 'rgba(145, 25, 20, 0.10)')
  grad.addColorStop(0.7, 'rgba(70, 12, 10, 0.03)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.premultiplyAlpha = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

let _moonGlowTex: THREE.CanvasTexture | null = null

function getMoonGlowTexture() {
  _moonGlowTex ??= createMoonGlowTexture()
  return _moonGlowTex
}

/* ── Vignette alpha mask ── */

let _vignetteTex: THREE.CanvasTexture | null = null

function getVignetteTexture() {
  if (_vignetteTex) return _vignetteTex
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const cy = size / 2
  const grad = ctx.createRadialGradient(cx, cy, size * 0.32, cx, cy, size * 0.48)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.8, 'rgba(255,255,255,1)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  _vignetteTex = new THREE.CanvasTexture(canvas)
  _vignetteTex.minFilter = THREE.LinearFilter
  _vignetteTex.magFilter = THREE.LinearFilter
  return _vignetteTex
}

/* ── Star shaders ── */

const STAR_VERTEX = `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    float twinkle = 0.45 + sin(uTime * aSpeed + aPhase) * 0.22;
    vAlpha = twinkle;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelRatio * (180.0 / -mvPosition.z);
  }
`

const STAR_FRAGMENT = `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord * 2.0 - 1.0);
    float glow = exp(-d * d * 4.5);
    float alpha = glow * vAlpha;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`

/* ── Star data generation ── */

const STAR_COUNT = 180
const STAR_RADIUS = 27
const MOON_DIST = 20
const MOON_THETA = 1.38
const MOON_PHI = 4.85

function generateStarData() {
  const rng = seededRandom(99)
  const phiSpread = 2.0

  const positions = new Float32Array(STAR_COUNT * 3)
  const colors = new Float32Array(STAR_COUNT * 3)
  const sizes = new Float32Array(STAR_COUNT)
  const phases = new Float32Array(STAR_COUNT)
  const speeds = new Float32Array(STAR_COUNT)

  for (let i = 0; i < STAR_COUNT; i++) {
    let theta = MOON_THETA + (rng() - 0.5) * 0.35
    if (theta > 1.48) theta = 1.44 + rng() * 0.04
    if (theta < 0.8) theta = 0.8 + rng() * 0.04
    const phi = MOON_PHI + (rng() - 0.5) * phiSpread

    positions[i * 3] = STAR_RADIUS * Math.sin(theta) * Math.cos(phi)
    positions[i * 3 + 1] = STAR_RADIUS * Math.cos(theta)
    positions[i * 3 + 2] = STAR_RADIUS * Math.sin(theta) * Math.sin(phi)

    const tint = rng()
    if (tint < 0.6) {
      colors[i * 3] = 0.88
      colors[i * 3 + 1] = 0.86
      colors[i * 3 + 2] = 0.94
    } else if (tint < 0.85) {
      colors[i * 3] = 0.72
      colors[i * 3 + 1] = 0.74
      colors[i * 3 + 2] = 0.92
    } else {
      colors[i * 3] = 0.96
      colors[i * 3 + 1] = 0.84
      colors[i * 3 + 2] = 0.62
    }

    sizes[i] = 0.4 + rng() * 1.4
    phases[i] = rng() * Math.PI * 2
    speeds[i] = 0.15 + rng() * 1.2
  }

  return { positions, colors, sizes, phases, speeds }
}

export function SkyDome({ progressRef }: { progressRef: RefObject<number> }) {
  const { gl } = useThree()

  /* Sky dome */
  const skyMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: SKY_VERTEX,
    fragmentShader: SKY_FRAGMENT,
    uniforms: { uOpacity: { value: 0 } },
    side: THREE.BackSide,
    depthWrite: false,
    transparent: true,
  }), [])

  /* Moon */
  const moonPos = useMemo(() => new THREE.Vector3(
    MOON_DIST * Math.sin(MOON_THETA) * Math.cos(MOON_PHI),
    MOON_DIST * Math.cos(MOON_THETA),
    MOON_DIST * Math.sin(MOON_THETA) * Math.sin(MOON_PHI),
  ), [])

  const moonTex = useTexture('/images/bloodMoon.webp')
  moonTex.colorSpace = THREE.SRGBColorSpace
  const moonGlowTex = useMemo(() => getMoonGlowTexture(), [])
  const vignetteTex = useMemo(() => getVignetteTexture(), [])
  const moonLightPos = useMemo(() => moonPos.clone().multiplyScalar(0.7), [moonPos])

  /* Stars */
  const starGeo = useMemo(() => {
    const data = generateStarData()
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(data.positions, 3))
    geo.setAttribute('aColor', new THREE.BufferAttribute(data.colors, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(data.sizes, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(data.phases, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(data.speeds, 1))
    return geo
  }, [])

  const starMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: STAR_VERTEX,
    fragmentShader: STAR_FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [gl])

  const skyMatRef = useRef(skyMat)
  const starMatRef = useRef(starMat)

  useFrame((_state, delta) => {
    const reveal = THREE.MathUtils.smoothstep(progressRef.current, 0.0, 0.22)
    skyMatRef.current.uniforms.uOpacity.value = reveal
    ;(starMatRef.current.uniforms.uTime.value as number) += delta
    starMatRef.current.uniforms.uOpacity.value = reveal
  })

  return (
    <group>
      <mesh renderOrder={-1000} material={skyMat}>
        <sphereGeometry args={[28, 32, 32]} />
      </mesh>

      <sprite position={moonPos} scale={[8.5, 8.5, 1]} renderOrder={-998}>
        <spriteMaterial
          map={moonGlowTex}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <sprite position={moonPos} scale={[4.5, 4.5, 1]} renderOrder={-997}>
        <spriteMaterial
          map={moonTex}
          alphaMap={vignetteTex}
          transparent
          depthWrite={false}
        />
      </sprite>

      <pointLight position={moonLightPos} intensity={1.4} color="#cc3322" distance={35} decay={1.8} />

      <points geometry={starGeo} material={starMat} renderOrder={-999} />
    </group>
  )
}
