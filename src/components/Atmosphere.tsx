import { Sparkles } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { seededRandom } from '../utils/random'
import { get2dContext } from '../utils/canvas'
import type { FlameData, RedSpiritsProps } from '../types'

function createGoGlyphTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = get2dContext(canvas)
  ctx.clearRect(0, 0, size, size)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = "bold 82px 'Noto Serif JP', 'Yu Mincho', serif"
  ctx.lineWidth = 8
  ctx.strokeStyle = 'rgba(24, 0, 48, 0.95)'
  ctx.fillStyle = '#a55cff'
  ctx.shadowColor = 'rgba(165, 92, 255, 0.85)'
  ctx.shadowBlur = 18
  ctx.strokeText('ゴ', size / 2, size / 2 + 2)
  ctx.fillText('ゴ', size / 2, size / 2 + 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.premultiplyAlpha = false
  return tex
}

const goGlyphTexture = createGoGlyphTexture()

// ── BlueSpirits: batched into a single GPU Points system ──

const SPIRIT_VERTEX_SHADER = `
  uniform float uTime;
  attribute float aScale;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aOpacity;
  varying float vOpacity;

  void main() {
    vec3 pos = position;
    float t = uTime;

    // Float / drift
    pos.y += sin(t * aSpeed * 0.45 + aPhase) * 0.06;
    pos.x += sin(t * 0.25 + aPhase) * 0.12;
    pos.z += cos(t * 0.2 + aPhase) * 0.1;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aScale * (400.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    float flicker = 1.0 + sin(t * 6.0 + aPhase) * 0.12;
    vOpacity = aOpacity * flicker;
  }
`

const SPIRIT_FRAGMENT_SHADER = `
  uniform sampler2D uMap;
  varying float vOpacity;

  void main() {
    vec2 uv = gl_PointCoord;
    uv.y = 1.0 - uv.y;
    vec4 tex = texture2D(uMap, uv);
    if (tex.a < 0.05) discard;
    gl_FragColor = vec4(tex.rgb, tex.a * vOpacity);
  }
`

function generateFlameData(): FlameData[] {
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

export function BlueSpirits({ active = true }: { active?: boolean }) {
  const flames = useMemo(() => generateFlameData(), [])
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(flames.length * 3)
    const scales = new Float32Array(flames.length)
    const phases = new Float32Array(flames.length)
    const speeds = new Float32Array(flames.length)
    const opacities = new Float32Array(flames.length)

    for (let i = 0; i < flames.length; i++) {
      const f = flames[i]
      positions[i * 3] = f.basePosition.x
      positions[i * 3 + 1] = f.basePosition.y
      positions[i * 3 + 2] = f.basePosition.z
      scales[i] = f.scale
      phases[i] = f.phase
      speeds[i] = f.speed
      opacities[i] = 0.55
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))

    const mat = new THREE.ShaderMaterial({
      vertexShader: SPIRIT_VERTEX_SHADER,
      fragmentShader: SPIRIT_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uMap: { value: goGlyphTexture },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    return { geometry: geo, material: mat }
  }, [flames])

  useFrame((state) => {
    if (!active) return
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <points geometry={geometry} visible={active}>
      <primitive object={material} ref={materialRef} attach="material" />
    </points>
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

function RedFlameSprite({ position, active }: { position: THREE.Vector3; active: boolean }) {
  const spriteRef = useRef<THREE.Sprite>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  const data = useMemo(
    () => ({
      basePosition: position.clone(),
      speed:
        0.6 +
        seededRandom(Math.floor((position.x * 13 + position.y * 17 + position.z * 19) * 1000))() *
          0.8,
      phase:
        seededRandom(Math.floor((position.x * 23 + position.y * 29 + position.z * 31) * 1000))() *
        Math.PI *
        2,
      scale:
        0.18 +
        seededRandom(Math.floor((position.x * 37 + position.y * 41 + position.z * 43) * 1000))() *
          0.12,
    }),
    [position],
  )

  useFrame((state) => {
    if (!active) return
    if (!spriteRef.current || !lightRef.current) return
    const t = state.clock.elapsedTime

    const glowY = Math.sin(t * data.speed * 0.45 + data.phase) * 0.15
    const glowX = Math.sin(t * 0.28 + data.phase) * 0.2
    const glowZ = Math.cos(t * 0.24 + data.phase) * 0.18

    spriteRef.current.position.set(glowX, glowY, glowZ)
    lightRef.current.position.set(glowX, glowY, glowZ)

    const flicker =
      1 + Math.sin(t * 7 + data.phase) * 0.18 + Math.sin(t * 11 + data.phase * 1.3) * 0.06
    spriteRef.current.scale.setScalar(data.scale * flicker * 2.4)

    lightRef.current.intensity = 3.4 + Math.sin(t * 6 + data.phase) * 0.95
  })

  return (
    <group position={[data.basePosition.x, data.basePosition.y, data.basePosition.z]} visible={active}>
      <sprite ref={spriteRef}>
        <spriteMaterial
          map={redGlowTexture}
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <pointLight ref={lightRef} color="#FF6B35" intensity={3.4} distance={5.5} decay={2} />
    </group>
  )
}

export function RedSpirits({ positions, active = true }: RedSpiritsProps & { active?: boolean }) {
  return (
    <group visible={active}>
      {positions.map((pos, i) => (
        <RedFlameSprite key={`red-flame-${String(i)}`} position={new THREE.Vector3(...pos)} active={active} />
      ))}
    </group>
  )
}
