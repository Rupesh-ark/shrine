import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { seededRandom } from '../utils/random'
import { get2dContext } from '../utils/canvas'
import type { QualityTier } from '../hooks/useIsMobile'
import { DEFAULT_QUALITY } from '../hooks/useIsMobile'

const FALL_HEIGHT = 8.5
const TOP_PADDING = 3.0
const BOTTOM_Y = -1.8
const LOOP_HEIGHT = FALL_HEIGHT + TOP_PADDING

const SAKURA_COLORS = [
  [1.0, 0.72, 0.78],
  [1.0, 0.80, 0.82],
  [0.98, 0.69, 0.73],
  [1.0, 0.84, 0.87],
  [0.95, 0.65, 0.72],
]

function createPetalTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = get2dContext(canvas)
  ctx.clearRect(0, 0, size, size)

  const cx = size / 2
  const cy = size / 2
  const w = size * 0.22
  const h = size * 0.38

  const grad = ctx.createRadialGradient(cx, cy - h * 0.2, 0, cx, cy, h)
  grad.addColorStop(0, 'rgba(255, 220, 230, 1)')
  grad.addColorStop(0.5, 'rgba(255, 183, 197, 0.9)')
  grad.addColorStop(1, 'rgba(255, 143, 163, 0)')

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.moveTo(cx, cy - h)
  ctx.bezierCurveTo(cx - w * 0.6, cy - h * 0.4, cx - w, cy + h * 0.1, cx, cy + h * 0.45)
  ctx.bezierCurveTo(cx + w, cy + h * 0.1, cx + w * 0.6, cy - h * 0.4, cx, cy - h)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgba(255, 160, 180, 0.3)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(cx, cy - h * 0.3)
  ctx.lineTo(cx, cy + h * 0.25)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.premultiplyAlpha = false
  return tex
}

const petalTexture = createPetalTexture()

const FALLING_VERTEX_SHADER = `
  uniform float uTime;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aOpacity;
  attribute float aRotation;
  attribute float aSize;
  attribute vec3 aColor;
  varying float vOpacity;
  varying float vRotation;
  varying vec3 vColor;

  void main() {
    vec3 pos = position;
    float t = uTime;

    float loop = ${LOOP_HEIGHT.toFixed(1)};
    float topPad = ${TOP_PADDING.toFixed(1)};
    float bottom = ${BOTTOM_Y.toFixed(1)};
    float fall = ${FALL_HEIGHT.toFixed(1)};

    float y = mod(pos.y - t * aSpeed * 0.012 + loop * 0.5, loop) - topPad * 0.5;

    pos.y = y;
    pos.x += sin(t * 0.5 + aPhase) * 0.15;
    pos.z += cos(t * 0.3 + aPhase) * 0.1;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * (400.0 / -mvPosition.z);

    float normalizedY = (y - bottom) / fall;
    float distFromTop = 1.0 - normalizedY;
    float fadeIn = smoothstep(0.0, 0.1, distFromTop);
    float fadeOut = smoothstep(0.0, 0.08, normalizedY);
    vOpacity = fadeIn * fadeOut * aOpacity;
    vRotation = aRotation + t * (0.8 + aSpeed * 3.0);
    vColor = aColor;
  }
`

const FALLING_FRAGMENT_SHADER = `
  uniform sampler2D uMap;
  varying float vOpacity;
  varying float vRotation;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float c = cos(vRotation);
    float s = sin(vRotation);
    uv = vec2(c * uv.x + s * uv.y, -s * uv.x + c * uv.y) + vec2(0.5);

    vec4 tex = texture2D(uMap, uv);
    if (tex.a < 0.05) discard;
    gl_FragColor = vec4(vColor * tex.rgb, tex.a * vOpacity);
  }
`

export function FallingParticles({ active = true, quality = DEFAULT_QUALITY }: { active?: boolean; quality?: QualityTier }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const PARTICLE_COUNT = quality.particleCount

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const speeds = new Float32Array(PARTICLE_COUNT)
    const phases = new Float32Array(PARTICLE_COUNT)
    const opacities = new Float32Array(PARTICLE_COUNT)
    const rotations = new Float32Array(PARTICLE_COUNT)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const rng = seededRandom(17)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (rng() - 0.5) * 9
      positions[i * 3 + 1] = (rng() * LOOP_HEIGHT) - TOP_PADDING * 0.5
      positions[i * 3 + 2] = rng() * 7 - 2
      speeds[i] = 0.06 + rng() * 0.14
      phases[i] = rng() * Math.PI * 2
      opacities[i] = 0.6 + rng() * 0.35
      rotations[i] = rng() * Math.PI * 2
      sizes[i] = 0.08 + rng() * 0.12
      const colorIdx = Math.floor(rng() * SAKURA_COLORS.length)
      colors[i * 3] = SAKURA_COLORS[colorIdx][0]
      colors[i * 3 + 1] = SAKURA_COLORS[colorIdx][1]
      colors[i * 3 + 2] = SAKURA_COLORS[colorIdx][2]
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))
    geo.setAttribute('aRotation', new THREE.BufferAttribute(rotations, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.ShaderMaterial({
      vertexShader: FALLING_VERTEX_SHADER,
      fragmentShader: FALLING_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uMap: { value: petalTexture },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    return { geometry: geo, material: mat }
  }, [PARTICLE_COUNT])

  useFrame((state) => {
    if (!active || !materialRef.current) return
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <points geometry={geometry} visible={active}>
      <primitive object={material} ref={materialRef} attach="material" />
    </points>
  )
}