import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

export function ShaderPrecompiler({ enabled, onDone }: { enabled: boolean; onDone?: () => void }) {
  const { gl, scene, camera } = useThree()
  const compiledRef = useRef(false)

  useEffect(() => {
    if (!enabled || compiledRef.current) return
    compiledRef.current = true

    // Defer one frame so the entry-gate CSS animation isn't blocked
    const id = requestAnimationFrame(() => {
      gl.compile(scene, camera)
      onDone?.()
    })

    return () => { cancelAnimationFrame(id); }
  }, [enabled, gl, scene, camera, onDone])

  return null
}
