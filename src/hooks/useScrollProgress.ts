import { useState, useEffect } from 'react'

export function useScrollProgress(scrollHeightVh = 400) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    document.body.style.height = `${String(scrollHeightVh)}vh`

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) {
        setProgress(0)
        return
      }
      const p = window.scrollY / maxScroll
      setProgress(Math.min(1, Math.max(0, p)))
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      document.body.style.height = ''
      window.removeEventListener('scroll', onScroll)
    }
  }, [scrollHeightVh])

  return progress
}
