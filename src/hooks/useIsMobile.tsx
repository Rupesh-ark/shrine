import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const MOBILE_QUERY = '(max-width: 767px)'

function getIsMobile() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_QUERY).matches
}

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
}

const HIGH_QUALITY: QualityTier = {
  level: 'high',
  starCount: 12000,
  particleCount: 180,
  bambooDensity: 1,
  terrainSegments: [100, 80, 64],
  contactShadows: true,
  bloom: true,
  bloomIntensity: 1.25,
  maxPointLights: 3,
  screenFps: 15,
  mistLayers: 2,
  redSpirits: true,
}

const MEDIUM_QUALITY: QualityTier = {
  level: 'medium',
  starCount: 6000,
  particleCount: 90,
  bambooDensity: 0.5,
  terrainSegments: [60, 48, 40],
  contactShadows: true,
  bloom: true,
  bloomIntensity: 1.0,
  maxPointLights: 3,
  screenFps: 12,
  mistLayers: 2,
  redSpirits: true,
}

const LOW_QUALITY: QualityTier = {
  level: 'low',
  starCount: 3000,
  particleCount: 45,
  bambooDensity: 0.25,
  terrainSegments: [40, 32, 24],
  contactShadows: false,
  bloom: false,
  bloomIntensity: 0,
  maxPointLights: 1,
  screenFps: 10,
  mistLayers: 1,
  redSpirits: false,
}

function detectTier(isMobile: boolean): QualityTier {
  if (typeof window === 'undefined') return HIGH_QUALITY

  const cores: number = navigator.hardwareConcurrency
  const memory: number = (navigator as unknown as Record<string, unknown>).deviceMemory as number | undefined ?? 4
  const dpr: number = window.devicePixelRatio

  if (isMobile || cores <= 4 || memory <= 2 || dpr <= 1) {
    return cores <= 2 || memory <= 2 ? LOW_QUALITY : MEDIUM_QUALITY
  }

  return HIGH_QUALITY
}

export const DEFAULT_QUALITY: QualityTier = HIGH_QUALITY

interface MobileContextValue {
  isMobile: boolean
  quality: QualityTier
}

const MobileContext = createContext<MobileContextValue | null>(null)

export function MobileProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(getIsMobile)
  const [quality] = useState(() => detectTier(getIsMobile()))

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const handleChange = () => { setIsMobile(mq.matches) }
    mq.addEventListener('change', handleChange)
    return () => { mq.removeEventListener('change', handleChange) }
  }, [])

  return (
    <MobileContext.Provider value={{ isMobile, quality }}>
      {children}
    </MobileContext.Provider>
  )
}

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