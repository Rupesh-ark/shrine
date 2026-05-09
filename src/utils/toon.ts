import * as THREE from 'three'
import {
  DEEP_BROWN,
  DARK_WOOD,
  GROUND_DARK,
  INK_BLACK,
  MEDIUM_WOOD,
  PAPER,
  PARCHMENT,
  SKY_DEEP,
} from '../constants/colors'

let toonGradientMap: THREE.CanvasTexture | null = null

type ToonCompatibleMaterial = THREE.Material & {
  color?: THREE.Color
  map?: THREE.Texture | null
  alphaMap?: THREE.Texture | null
  aoMap?: THREE.Texture | null
  aoMapIntensity?: number
  bumpMap?: THREE.Texture | null
  bumpScale?: number
  displacementMap?: THREE.Texture | null
  displacementScale?: number
  displacementBias?: number
  emissive?: THREE.Color
  emissiveIntensity?: number
  emissiveMap?: THREE.Texture | null
  lightMap?: THREE.Texture | null
  lightMapIntensity?: number
  normalMap?: THREE.Texture | null
  normalMapType?: THREE.NormalMapTypes
  normalScale?: THREE.Vector2
  transparent?: boolean
  opacity?: number
  alphaTest?: number
  depthTest?: boolean
  depthWrite?: boolean
  side?: THREE.Side
}

function drawGradientBands(ctx: CanvasRenderingContext2D, width: number) {
  const bands = [SKY_DEEP, GROUND_DARK, INK_BLACK, DARK_WOOD, DEEP_BROWN, MEDIUM_WOOD, PARCHMENT, PAPER]
  const bandWidth = width / bands.length

  bands.forEach((color, index) => {
    ctx.fillStyle = color
    ctx.fillRect(Math.floor(index * bandWidth), 0, Math.ceil(bandWidth) + 1, 1)
  })
}

export function getToonGradientMap() {
  if (toonGradientMap) return toonGradientMap

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 1

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  drawGradientBands(ctx, canvas.width)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true

  toonGradientMap = texture
  return texture
}

export function createToonMaterial(source: THREE.Material) {
  const toon = new THREE.MeshToonMaterial({ gradientMap: getToonGradientMap() })
  const typed = source as ToonCompatibleMaterial

  if (typed.color?.isColor) toon.color.copy(typed.color)
  if (typed.map) toon.map = typed.map
  if (typed.alphaMap) toon.alphaMap = typed.alphaMap
  if (typed.aoMap) toon.aoMap = typed.aoMap
  if (typed.aoMapIntensity !== undefined) toon.aoMapIntensity = typed.aoMapIntensity
  if (typed.bumpMap) toon.bumpMap = typed.bumpMap
  if (typed.bumpScale !== undefined) toon.bumpScale = typed.bumpScale
  if (typed.displacementMap) toon.displacementMap = typed.displacementMap
  if (typed.displacementScale !== undefined) toon.displacementScale = typed.displacementScale
  if (typed.displacementBias !== undefined) toon.displacementBias = typed.displacementBias
  if (typed.emissive?.isColor) toon.emissive.copy(typed.emissive)
  if (typed.emissiveIntensity !== undefined) toon.emissiveIntensity = typed.emissiveIntensity
  if (typed.emissiveMap) toon.emissiveMap = typed.emissiveMap
  if (typed.lightMap) toon.lightMap = typed.lightMap
  if (typed.lightMapIntensity !== undefined) toon.lightMapIntensity = typed.lightMapIntensity
  if (typed.normalMap) toon.normalMap = typed.normalMap
  if (typed.normalMapType !== undefined) toon.normalMapType = typed.normalMapType
  if (typed.normalScale) toon.normalScale.copy(typed.normalScale)
  toon.transparent = source.transparent
  toon.opacity = source.opacity
  toon.alphaTest = source.alphaTest
  toon.depthTest = source.depthTest
  toon.depthWrite = source.depthWrite
  toon.side = source.side

  toon.name = source.name
  toon.userData = { ...source.userData }
  toon.needsUpdate = true
  return toon
}
