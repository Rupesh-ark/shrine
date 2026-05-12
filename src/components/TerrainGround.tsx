import { useMemo } from 'react'
import * as THREE from 'three'
import { getToonGradientMap } from '../utils/toon'
import type { QualityTier } from '../hooks/useIsMobile'
import { DEFAULT_QUALITY } from '../hooks/useIsMobile'

function hash2D(ix: number, iy: number): number {
  let h = (ix * 374761393 + iy * 668265263) | 0
  h = ((h ^ (h >> 13)) * 1274126177) | 0
  return ((h ^ (h >> 16)) >>> 0) / 0xffffffff
}

function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)

  const n00 = hash2D(ix, iy)
  const n10 = hash2D(ix + 1, iy)
  const n01 = hash2D(ix, iy + 1)
  const n11 = hash2D(ix + 1, iy + 1)

  return (n00 * (1 - sx) + n10 * sx) * (1 - sy)
    + (n01 * (1 - sx) + n11 * sx) * sy
}

function fbm(x: number, y: number, octaves = 4): number {
  let val = 0
  let amp = 1
  let freq = 1
  let max = 0
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise(x * freq, y * freq)
    max += amp
    amp *= 0.5
    freq *= 2
  }
  return val / max
}

interface TerrainGroundProps {
  overlayBaseY: number
  quality?: QualityTier
}

export function TerrainGround({ overlayBaseY, quality = DEFAULT_QUALITY }: TerrainGroundProps) {
  const segs = quality.terrainSegments
  const seg0 = segs[0]
  const seg1 = segs[1]
  const seg2 = segs[2]
  const layers = useMemo(() => {
    const createLayer = (
      width: number,
      depth: number,
      segments: number,
      amplitude: number,
      flatRadius: number,
      noiseScale: number,
      offsetX: number,
      offsetZ: number,
    ): THREE.BufferGeometry => {
      const geo = new THREE.PlaneGeometry(width, depth, segments, segments)
      geo.rotateX(-Math.PI / 2)

      const pos = geo.attributes.position
      const halfW = width / 2
      const halfD = depth / 2

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i)
        const z = pos.getZ(i)

        const nx = Math.abs(x) / halfW
        const nz = Math.abs(z) / halfD
        const edgeDist = Math.max(nx, nz)

        const flatNorm = Math.min(1, edgeDist / flatRadius)
        const factor = Math.pow(flatNorm, 2.2) * Math.pow(flatNorm, 0.8)

        const n = fbm((x + offsetX) * noiseScale, (z + offsetZ) * noiseScale, 4)
        const displacement = (n - 0.42) * amplitude * factor
        pos.setY(i, pos.getY(i) + displacement)
      }

      geo.computeVertexNormals()
      return geo
    }

    return [
      {
        geometry: createLayer(80, 80, seg0, 1.6, 0.25, 0.12, 0, 0),
        color: '#1e2c36',
        opacity: 0.65,
        offsetY: 0,
        offsetZ: 2,
      },
      {
        geometry: createLayer(60, 50, seg1, 1.1, 0.3, 0.16, 40, 25),
        color: '#263842',
        opacity: 0.35,
        offsetY: 0.003,
        offsetZ: -8,
      },
      {
        geometry: createLayer(45, 35, seg2, 0.7, 0.35, 0.2, -25, -15),
        color: '#2e424d',
        opacity: 0.28,
        offsetY: 0.006,
        offsetZ: 5,
      },
    ]
  }, [seg0, seg1, seg2])

  return (
    <>
      {layers.map((layer, i) => (
        <mesh
          key={i}
          position={[0, overlayBaseY + layer.offsetY, layer.offsetZ]}
          geometry={layer.geometry}
        >
          <meshToonMaterial
            color={layer.color}
            gradientMap={getToonGradientMap()}
            transparent={layer.opacity < 1}
            opacity={layer.opacity}
          />
        </mesh>
      ))}
    </>
  )
}