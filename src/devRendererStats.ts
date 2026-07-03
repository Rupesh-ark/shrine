import { useSyncExternalStore } from 'react'

export interface RendererStats {
  calls: number
  triangles: number
  points: number
  lines: number
  geometries: number
  textures: number
  programs: number
}

const EMPTY_STATS: RendererStats = {
  calls: 0,
  triangles: 0,
  points: 0,
  lines: 0,
  geometries: 0,
  textures: 0,
  programs: 0,
}

let _stats = EMPTY_STATS
const _listeners = new Set<() => void>()

function _subscribe(listener: () => void) {
  _listeners.add(listener)
  return () => { _listeners.delete(listener) }
}

function _getSnapshot() {
  return _stats
}

export function setRendererStats(next: RendererStats) {
  if (!import.meta.env.DEV) return
  if (
    _stats.calls === next.calls &&
    _stats.triangles === next.triangles &&
    _stats.points === next.points &&
    _stats.lines === next.lines &&
    _stats.geometries === next.geometries &&
    _stats.textures === next.textures &&
    _stats.programs === next.programs
  ) {
    return
  }

  _stats = next
  for (const listener of _listeners) listener()
}

export function useRendererStats() {
  return useSyncExternalStore(_subscribe, _getSnapshot, () => EMPTY_STATS)
}
