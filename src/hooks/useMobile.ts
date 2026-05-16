import { createContext, useContext } from 'react'

export interface QualityTier {
  level: 'high' | 'medium' | 'low'
  starCount: number
  particleCount: number
  bambooDensity: number
  terrainSegments: [number, number, number]
  contactShadows: boolean
  bloom: boolean
  bloomIntensity: number
  maxPointLights: number
  screenFps: number
  mistLayers: number
  redSpirits: boolean
  grassDensity: number
}

interface MobileContextValue {
  isMobile: boolean
  quality: QualityTier
}

export const MobileContext = createContext<MobileContextValue | null>(null)

export function useIsMobile() {
  const ctx = useContext(MobileContext)
  if (!ctx) throw new Error('useIsMobile must be used within <MobileProvider>')
  return ctx.isMobile
}

export function useQuality() {
  const ctx = useContext(MobileContext)
  if (!ctx) throw new Error('useQuality must be used within <MobileProvider>')
  return ctx.quality
}
