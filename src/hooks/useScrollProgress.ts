import { useState, useEffect, useRef } from 'react'

export function useScrollProgress(scrollHeightVh = 400) {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(0)
  const cachedScrollHeight = useRef(0)

  useEffect(() => {
    document.body.style.height = `${String(scrollHeightVh)}vh`

    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        const maxScroll = cachedScrollHeight.current || document.documentElement.scrollHeight - window.innerHeight
        cachedScrollHeight.current = maxScroll
        if (maxScroll <= 0) {
          setProgress(0)
          return
        }
        const p = window.scrollY / maxScroll
        setProgress(Math.min(1, Math.max(0, p)))
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    requestAnimationFrame(() => {
      onScroll()
    })

    return () => {
      document.body.style.height = ''
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [scrollHeightVh])

  return progress
}
