import { useState, useEffect, useRef } from 'react'

export function useScrollProgress(scrollHeightVh = 400) {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(0)
  const cachedScrollHeight = useRef(0)

  useEffect(() => {
    document.body.style.height = `${String(scrollHeightVh)}vh`
    cachedScrollHeight.current = 0

    const readMaxScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      cachedScrollHeight.current = maxScroll
      return maxScroll
    }

    const updateProgress = () => {
      const maxScroll = cachedScrollHeight.current || readMaxScroll()
      if (maxScroll <= 0) {
        setProgress(0)
        return
      }
      const p = window.scrollY / maxScroll
      setProgress(Math.min(1, Math.max(0, p)))
    }

    const scheduleUpdate = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        updateProgress()
      })
    }

    const handleViewportChange = () => {
      cachedScrollHeight.current = 0
      scheduleUpdate()
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('orientationchange', handleViewportChange)
    scheduleUpdate()

    return () => {
      document.body.style.height = ''
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('orientationchange', handleViewportChange)
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      cachedScrollHeight.current = 0
    }
  }, [scrollHeightVh])

  return progress
}
