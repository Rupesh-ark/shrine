import { useMemo } from 'react'
import * as THREE from 'three'
import type { TableScrollProps } from '../types'

const parchmentColor = '#EDE4CC'
const inkColor = '#1A0F08'
const sealColor = '#8B1A1A'
const woodDark = '#2F251D'

export const SCROLL_OFFSET_X = 0.01
export const SCROLL_OFFSET_Z = -0.01
export const SCROLL_LIFT = 0.002

function createParchmentTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  const w = 768
  const h = 512
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  // Base parchment
  ctx.fillStyle = parchmentColor
  ctx.fillRect(0, 0, w, h)

  // Soft vignette edge
  const edgeGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.6)
  edgeGrad.addColorStop(0, 'rgba(0,0,0,0)')
  edgeGrad.addColorStop(0.7, 'rgba(140,120,90,0.08)')
  edgeGrad.addColorStop(1, 'rgba(90,70,50,0.25)')
  ctx.fillStyle = edgeGrad
  ctx.fillRect(0, 0, w, h)

  // Grain noise
  for (let i = 0; i < 15000; i++) {
    const gx = Math.random() * w
    const gy = Math.random() * h
    ctx.fillStyle = `rgba(140,120,90,${String(Math.random() * 0.05)})`
    ctx.fillRect(gx, gy, 1, 1)
  }

  // Fiber lines
  for (let i = 0; i < 600; i++) {
    const gx = Math.random() * w
    const gy = Math.random() * h
    const len = 2 + Math.random() * 12
    ctx.strokeStyle = `rgba(140,120,90,${String(Math.random() * 0.08)})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(gx, gy)
    ctx.lineTo(gx + len, gy + (Math.random() - 0.5) * 2)
    ctx.stroke()
  }

  // Ink bleed guide lines
  ctx.save()
  ctx.globalAlpha = 0.22
  ctx.strokeStyle = '#3B2A1E'
  ctx.lineWidth = 2
  for (let i = 1; i <= 3; i++) {
    const y = (h / 4) * i
    ctx.beginPath()
    ctx.moveTo(w * 0.08, y)
    ctx.lineTo(w * 0.92, y)
    ctx.stroke()
  }
  ctx.restore()

  // Calligraphy
  ctx.fillStyle = inkColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = "bold 56px 'NinjaKage', 'Noto Serif JP', serif"
  ctx.globalAlpha = 0.8
  ctx.fillText('履 歴 書', w / 2, h * 0.28)
  ctx.globalAlpha = 1
  ctx.font = "normal 30px 'Crimson Pro', serif"
  ctx.fillText('Rupesh Pandey', w / 2, h * 0.48)
  ctx.font = "normal 22px 'Crimson Pro', serif"
 

  // Red seal
  ctx.save()
  ctx.translate(w * 0.82, h * 0.74)
  ctx.rotate(-0.14)
  ctx.strokeStyle = sealColor
  ctx.lineWidth = 6
  ctx.strokeRect(-26, -26, 52, 52)
  ctx.fillStyle = sealColor
  ctx.font = "bold 22px 'NinjaKage', 'Noto Serif JP', serif"
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('承認', 0, 2)
  ctx.restore()

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.premultiplyAlpha = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

export function TableScroll({ floorY, tableZ }: TableScrollProps) {
  const parchmentTex = useMemo(() => createParchmentTex(), [])

  const tableSurfaceY = floorY + 0.172
  const scrollW = 0.18
  const scrollD = 0.22
  const paperThickness = 0.006
  const rodRadius = 0.005
  const rodLength = scrollW + 0.03
  const rodY = 0.01
  const rodInset = scrollD * 0.52

  return (
    <group
      position={[SCROLL_OFFSET_X, tableSurfaceY + SCROLL_LIFT, tableZ + SCROLL_OFFSET_Z]}
      rotation={[0.01, -0.015, -0.025]}
    >
      {/* Soft contact shadow */}
      <mesh position={[0, -0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[scrollW + 0.05, scrollD + 0.04]} />
        <meshStandardMaterial color="#120c08" transparent opacity={0.16} depthWrite={false} />
      </mesh>

      {/* Parchment body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[scrollW, paperThickness, scrollD]} />
        <meshStandardMaterial map={parchmentTex} roughness={0.92} />
      </mesh>

      {/* End wraps */}
      <mesh position={[0, paperThickness * 0.5 + 0.001, -rodInset]}>
        <boxGeometry args={[scrollW * 0.95, 0.004, 0.018]} />
        <meshStandardMaterial color={parchmentColor} roughness={0.96} />
      </mesh>
      <mesh position={[0, paperThickness * 0.5 + 0.001, rodInset]}>
        <boxGeometry args={[scrollW * 0.95, 0.004, 0.018]} />
        <meshStandardMaterial color={parchmentColor} roughness={0.96} />
      </mesh>

      {/* Top and bottom rods */}
      <mesh position={[0, rodY, -rodInset]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[rodRadius, rodRadius, rodLength, 18]} />
        <meshStandardMaterial color={woodDark} roughness={0.55} />
      </mesh>
      <mesh position={[0, rodY, rodInset]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[rodRadius, rodRadius, rodLength, 18]} />
        <meshStandardMaterial color={woodDark} roughness={0.55} />
      </mesh>
    </group>
  )
}
