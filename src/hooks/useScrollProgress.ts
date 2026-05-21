import { useCallback, useEffect, useRef } from 'react'
import { useSyncExternalStore } from 'react'

type Listener = () => void

let _progress = 0
let _initialized = false
const _listeners = new Set<Listener>()
let _rafId = 0
let _cachedScrollHeight = 0
let _lastScrollHeightVh = 0

function _notify() {
  for (const fn of _listeners) fn()
}

function _readMaxScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  _cachedScrollHeight = maxScroll
  return maxScroll
}

function _updateProgress() {
  const maxScroll = _cachedScrollHeight || _readMaxScroll()
  if (maxScroll <= 0) {
    _progress = 0
    _notify()
    return
  }
  const p = window.scrollY / maxScroll
  _progress = Math.min(1, Math.max(0, p))
  _notify()
}

function _scheduleUpdate() {
  if (_rafId) return
  _rafId = requestAnimationFrame(() => {
    _rafId = 0
    _updateProgress()
  })
}

function _handleViewportChange() {
  _cachedScrollHeight = 0
  _scheduleUpdate()
}

function _init(scrollHeightVh: number) {
  if (_initialized && _lastScrollHeightVh === scrollHeightVh) return

  _lastScrollHeightVh = scrollHeightVh
  document.body.style.height = `${String(scrollHeightVh)}vh`

  if (_initialized) {
    _cachedScrollHeight = 0
    _scheduleUpdate()
    return
  }

  _initialized = true

  window.addEventListener('scroll', _scheduleUpdate, { passive: true })
  window.addEventListener('resize', _handleViewportChange)
  window.addEventListener('orientationchange', _handleViewportChange)
  _scheduleUpdate()
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

export function useProgressEffect(
  scrollHeightVh: number | undefined,
  callback: (progress: number) => void,
): void {
  if (scrollHeightVh !== undefined) _init(scrollHeightVh)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const sync = () => { callbackRef.current(_progress) }
    _listeners.add(sync)
    sync()
    return () => { _listeners.delete(sync) }
  }, [])
}