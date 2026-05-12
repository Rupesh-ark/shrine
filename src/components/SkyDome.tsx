import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { seededRandom } from '../utils/random'
import type { QualityTier } from '../hooks/useIsMobile'

/* ── Nebula background shader ── */

const NEBULA_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const NEBULA_FRAGMENT = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.008;

    float equator = smoothstep(0.35, 0.0, abs(uv.y - 0.5));

    float n1 = fbm(uv * 3.0 + vec2(t, t * 0.7));
    float n2 = fbm(uv * 5.0 - vec2(t * 1.1, t * 0.6) + n1);

    vec3 baseSpace = vec3(0.008, 0.006, 0.006);
    vec3 cloud1 = vec3(0.02, 0.015, 0.015);
    vec3 cloud2 = vec3(0.015, 0.012, 0.012);
    vec3 band = vec3(0.018, 0.014, 0.014);

    vec3 col = baseSpace;
    col += cloud1 * n1 * 0.15;
    col += cloud2 * n2 * 0.12;
    col += band * equator * (n1 * n2) * 0.4;

    gl_FragColor = vec4(col, uOpacity);
  }
`

/* ── Star field shaders ── */

const STAR_RADIUS = 55

const STAR_VERTEX = `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute float aPhase;
  attribute float aTwinkleSpeed;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    float t = uTime * aTwinkleSpeed + aPhase;
    float wave = sin(t) * 0.5 + 0.5;
    float flash = pow(wave, 12.0) * 1.8;
    float base = 0.2 + wave * 0.35;
    vAlpha = base + flash;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float dist = length(mvPosition.xyz);
    gl_PointSize = aSize * uPixelRatio * (500.0 / dist) * (0.6 + vAlpha * 0.4);
  }
`

const STAR_FRAGMENT_SIMPLE = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord * 2.0 - 1.0);
    float core = exp(-d * d * 12.0);
    float alpha = core * vAlpha;
    if (alpha < 0.02) discard;
    vec3 finalColor = mix(vColor, vec3(1.0), core * 0.6);
    gl_FragColor = vec4(finalColor, alpha);
  }
`

const STAR_FRAGMENT_FULL = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float d = length(uv);

    float rayX = exp(-abs(uv.x) * 35.0) * exp(-abs(uv.y) * 1.2);
    float rayY = exp(-abs(uv.y) * 35.0) * exp(-abs(uv.x) * 1.2);
    float rays = (rayX + rayY) * 0.85;

    float core = exp(-d * d * 18.0);
    float halo = exp(-d * d * 4.0) * 0.35;

    float alpha = (rays + core + halo) * vAlpha;
    alpha *= smoothstep(1.0, 0.25, d);

    if (alpha < 0.02) discard;

    vec3 finalColor = mix(vColor, vec3(1.0), core * 0.8);
    gl_FragColor = vec4(finalColor, alpha);
  }
`

function generateStarData(count: number) {
  const rng = seededRandom(42)

  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)
  const twinkleSpeeds = new Float32Array(count)

  // Spectral colour weights (same as original SkyDome)
  const spectra = [
    { r: 0.69, g: 0.77, b: 1.00, w: 0.06 }, // O  – blue
    { r: 0.78, g: 0.85, b: 1.00, w: 0.14 }, // B  – blue-white
    { r: 0.88, g: 0.92, b: 1.00, w: 0.20 }, // A  – white
    { r: 1.00, g: 0.98, b: 0.94, w: 0.28 }, // F  – yellow-white
    { r: 1.00, g: 0.90, b: 0.75, w: 0.18 }, // G  – yellow
    { r: 1.00, g: 0.78, b: 0.63, w: 0.10 }, // K  – orange
    { r: 1.00, g: 0.67, b: 0.59, w: 0.04 }, // M  – red
  ]
  const totalW = spectra.reduce((s, c) => s + c.w, 0)

  const pickSpectrum = () => {
    let roll = rng() * totalW
    for (const s of spectra) {
      roll -= s.w
      if (roll <= 0) return s
    }
    return spectra[3]
  }

  for (let i = 0; i < count; i++) {
    // Sphere distribution
    const r = STAR_RADIUS * Math.cbrt(rng())
    const theta = rng() * Math.PI * 2
    const phi = Math.acos(2 * rng() - 1)

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)

    const s = pickSpectrum()
    colors[i * 3] = s.r
    colors[i * 3 + 1] = s.g
    colors[i * 3 + 2] = s.b

    // Size distribution: mostly tiny, few bigger
    const magRoll = rng()
    if (magRoll < 0.90) {
      sizes[i] = rng() * 1.5 + 0.8
    } else if (magRoll < 0.98) {
      sizes[i] = rng() * 2.5 + 2.0
    } else {
      sizes[i] = rng() * 4.0 + 3.5
    }

    phases[i] = rng() * Math.PI * 2
    twinkleSpeeds[i] = rng() * 2.5 + 0.4
  }

  return { positions, colors, sizes, phases, twinkleSpeeds }
}

/* ── Shooting star state (unchanged logic) ── */

interface ShootingState {
  active: boolean
  x: number
  y: number
  z: number
  vx: number
  vy: number
  timer: number
  nextSpawn: number
}

export function SkyDome({ progress, active = true, quality }: { progress: number; active?: boolean; quality: QualityTier }) {
  const { gl } = useThree()
  const starCount = quality.starCount

  /* Nebula dome */
  const nebulaMatRef = useRef<THREE.ShaderMaterial | null>(null)
  nebulaMatRef.current ??= new THREE.ShaderMaterial({
    vertexShader: NEBULA_VERTEX,
    fragmentShader: NEBULA_FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    },
    side: THREE.BackSide,
    depthWrite: false,
    transparent: true,
  })

  const starFragmentShader = quality.level === 'low' ? STAR_FRAGMENT_SIMPLE : STAR_FRAGMENT_FULL

  /* Star field */
  const starDataRef = useRef<ReturnType<typeof generateStarData> | null>(null)
  starDataRef.current ??= generateStarData(starCount)

  const starGeoRef = useRef<THREE.BufferGeometry | null>(null)
  const starMatRef = useRef<THREE.ShaderMaterial | null>(null)
  starGeoRef.current ??= (() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(starDataRef.current.positions, 3))
    geo.setAttribute('aColor', new THREE.BufferAttribute(starDataRef.current.colors, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(starDataRef.current.sizes, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(starDataRef.current.phases, 1))
    geo.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(starDataRef.current.twinkleSpeeds, 1))
    return geo
  })()
  starMatRef.current ??= new THREE.ShaderMaterial({
    vertexShader: STAR_VERTEX,
    fragmentShader: starFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  /* Shooting stars */
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
  const shootingStarRef = useRef<THREE.Mesh>(null)
  const shootingTrailRef = useRef<THREE.Mesh>(null)

  useFrame((_state, delta) => {
    const reveal = THREE.MathUtils.smoothstep(progress, 0.0, 0.22)

    const nMat = nebulaMatRef.current
    const sMat = starMatRef.current
    if (nMat) {
      if (active) {
        ;(nMat.uniforms.uTime.value as number) += delta
      }
      nMat.uniforms.uOpacity.value = reveal
    }
    if (sMat && active) {
      ;(sMat.uniforms.uTime.value as number) += delta
    }

    if (!active) return

    const s = shootingState.current
    s.timer += delta

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
      <mesh renderOrder={-1000} material={nebulaMatRef.current}>
        <sphereGeometry args={[60, 32, 32]} />
      </mesh>

      <points geometry={starGeoRef.current} material={starMatRef.current} renderOrder={-999} />

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
