import { useEffect, useState, type ReactNode } from 'react'
import type { QualityTier } from './useMobile'
import { MobileContext } from './useMobile'

const MOBILE_QUERY = '(max-width: 767px)'

function getIsMobile() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_QUERY).matches
}

export type { QualityTier }

const HIGH_QUALITY: QualityTier = {
  level: 'high',
  starCount: 12000,
  particleCount: 300,
  bambooDensity: 1,
  terrainSegments: [100, 80, 64],
  contactShadows: true,
  bloom: true,
  bloomIntensity: 1.25,
  maxPointLights: 3,
  screenFps: 15,
  mistLayers: 2,
  redSpirits: true,
  grassDensity: 1,
}

const MEDIUM_QUALITY: QualityTier = {
  level: 'medium',
  starCount: 6000,
  particleCount: 150,
  bambooDensity: 0.5,
  terrainSegments: [60, 48, 40],
  contactShadows: true,
  bloom: true,
  bloomIntensity: 1.0,
  maxPointLights: 3,
  screenFps: 12,
  mistLayers: 2,
  redSpirits: true,
  grassDensity: 0.5,
}

const LOW_QUALITY: QualityTier = {
  level: 'low',
  starCount: 3000,
  particleCount: 80,
  bambooDensity: 0.25,
  terrainSegments: [40, 32, 24],
  contactShadows: false,
  bloom: false,
  bloomIntensity: 0,
  maxPointLights: 1,
  screenFps: 10,
  mistLayers: 1,
  redSpirits: false,
  grassDensity: 0.25,
}

function detectTier(isMobile: boolean): QualityTier {
  if (typeof window === 'undefined') return HIGH_QUALITY

  const nav = navigator as unknown as { deviceMemory?: number; hardwareConcurrency?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const dpr = window.devicePixelRatio
  const connection = (navigator as unknown as {
    connection?: {
      downlink?: number
      effectiveType?: string
      rtt?: number
      saveData?: boolean
    }
  }).connection
  const constrainedNetwork =
    connection?.saveData === true ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g' ||
    connection?.effectiveType === '3g' ||
    (connection?.downlink !== undefined && connection.downlink <= 2) ||
    (connection?.rtt !== undefined && connection.rtt >= 300)

  if (constrainedNetwork) return LOW_QUALITY

  if (isMobile) {
    return cores <= 4 || memory <= 4 || dpr >= 2 ? LOW_QUALITY : MEDIUM_QUALITY
  }

  if (cores <= 4 || memory <= 2 || dpr <= 1) {
    return cores <= 2 || memory <= 2 ? LOW_QUALITY : MEDIUM_QUALITY
  }

  return HIGH_QUALITY
}

export const DEFAULT_QUALITY: QualityTier = HIGH_QUALITY

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
