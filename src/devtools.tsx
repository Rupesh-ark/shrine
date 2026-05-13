import { type RefObject, useEffect, useRef, useSyncExternalStore } from 'react'
import { ProgressOverlay } from './components/ProgressOverlay'

// ── Module-level state ──────────────────────────────────────────
// Shared across the R3F Canvas boundary without globals on window.

let _orbitEnabled = false
const _orbitListeners = new Set<() => void>()

function _notifyOrbit() {
  for (const fn of _orbitListeners) fn()
}

let _postEnabled = true
const _postListeners = new Set<() => void>()

function _notifyPost() {
  for (const fn of _postListeners) fn()
}

// ── Subscription helpers ────────────────────────────────────────

function _subscribeOrbit(listener: () => void) {
  _orbitListeners.add(listener)
  return () => { _orbitListeners.delete(listener) }
}

function _subscribePost(listener: () => void) {
  _postListeners.add(listener)
  return () => { _postListeners.delete(listener) }
}

// ── Read-only hooks ─────────────────────────────────────────────

export function useDevOrbit(): boolean {
  return useSyncExternalStore(_subscribeOrbit, () => _orbitEnabled)
}

export function useDevOrbitRef(): RefObject<boolean> {
  const ref = useRef(_orbitEnabled)
  useEffect(() => {
    const sync = () => { ref.current = _orbitEnabled }
    _orbitListeners.add(sync)
    return () => { _orbitListeners.delete(sync) }
  }, [])
  return ref
}

export function useDevPost(): boolean {
  return useSyncExternalStore(_subscribePost, () => _postEnabled)
}

// ── Keyboard shortcut hook (Shift+O / Shift+P) ─────────────────

export function useDevKeyboard(): { orbitEnabled: boolean; postEnabled: boolean } {
  const orbitEnabled = useSyncExternalStore(_subscribeOrbit, () => _orbitEnabled)
  const postEnabled = useSyncExternalStore(_subscribePost, () => _postEnabled)

  useEffect(() => {
    if (!import.meta.env.DEV) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'O') {
        _orbitEnabled = !_orbitEnabled
        _notifyOrbit()
      }
      if (e.shiftKey && e.key === 'P') {
        _postEnabled = !_postEnabled
        _notifyPost()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [])

  return { orbitEnabled, postEnabled }
}

// ── Dev-only overlay wrapper ────────────────────────────────────

export function DevOverlay() {
  if (!import.meta.env.DEV) return null
  return <ProgressOverlay />
}
