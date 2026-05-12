import { useCallback, useEffect, useRef } from 'react'
import { useSyncExternalStore } from 'react'

type Listener = () => void

let _progress = 0
let _initialized = false
const _listeners = new Set<Listener>()
let _rafId = 0
let _cachedScrollHeight = 0

function _notify() {
  for (const fn of _listeners) fn()
}

function _init(scrollHeightVh: number) {
  if (_initialized) return
  _initialized = true

  document.body.style.height = `${String(scrollHeightVh)}vh`

  const readMaxScroll = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    _cachedScrollHeight = maxScroll
    return maxScroll
  }

  const updateProgress = () => {
    const maxScroll = _cachedScrollHeight || readMaxScroll()
    if (maxScroll <= 0) {
      _progress = 0
      _notify()
      return
    }
    const p = window.scrollY / maxScroll
    _progress = Math.min(1, Math.max(0, p))
    _notify()
  }

  const scheduleUpdate = () => {
    if (_rafId) return
    _rafId = requestAnimationFrame(() => {
      _rafId = 0
      updateProgress()
    })
  }

  const handleViewportChange = () => {
    _cachedScrollHeight = 0
    scheduleUpdate()
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', handleViewportChange)
  window.addEventListener('orientationchange', handleViewportChange)
  scheduleUpdate()
}

export function useScrollProgress(scrollHeightVh = 400): number {
  _init(scrollHeightVh)

  const subscribe = useCallback((listener: Listener) => {
    _listeners.add(listener)
    return () => { _listeners.delete(listener) }
  }, [])

  return useSyncExternalStore(subscribe, () => _progress)
}

export function useProgressRef() {
  const ref = useRef(_progress)

  useEffect(() => {
    const sync = () => { ref.current = _progress }
    _listeners.add(sync)
    sync()
    return () => { _listeners.delete(sync) }
  }, [])

  return ref
}
