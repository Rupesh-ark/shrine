import type { Box3, Vector3 } from 'three'
import type { Mesh } from 'three'
import type { RefObject } from 'react'

export interface HouseModelProps {
  onBounds?: (bounds: Box3) => void
  onScrollFocus?: (position: Vector3) => void
  progressRef?: RefObject<number>
  onReady?: () => void
  maxPointLights?: number
  showRedSpirits?: boolean
}

export interface DoorAnimData {
  mesh: Mesh
  initialX: number
  closedX: number
}

export interface MaterialRule {
  color: string
  emissive?: string
  emissiveIntensity?: number
  roughness?: number
  metalness?: number
  variation?: number
  opacity?: number
}

export interface PrefixMaterialRule extends MaterialRule {
  prefix: string
}

export interface ScreenParticle {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
}

export interface LanternLightData {
  pos: [number, number, number]
  intensity: number
  distance: number
  color: string
}

export interface TableWithCushionsProps {
  floorY: number
  centerZ: number
}

export interface TableScrollProps {
  floorY: number
  tableZ: number
  progressRef?: RefObject<number>
}

export interface FlameData {
  basePosition: Vector3
  speed: number
  phase: number
  scale: number
}

export interface RedSpiritsProps {
  positions: [number, number, number][]
}

export interface SkyDomeProps {
  progress: number
  active?: boolean
  quality?: QualityTier
}

export interface SceneProps {
  onHouseReady?: () => void
  entered?: boolean
  quality?: QualityTier
}

export type QualityTier = import('./hooks/useIsMobile').QualityTier  // eslint-disable-line @typescript-eslint/consistent-type-imports

// Hook types
export interface ShootingState {
  active: boolean
  x: number
  y: number
  z: number
  vx: number
  vy: number
  timer: number
  nextSpawn: number
}

export interface ScrollSection {
  id: string
  label: string
  en: string
}
