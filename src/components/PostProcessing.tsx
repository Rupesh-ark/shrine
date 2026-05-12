import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
} from 'postprocessing'

export function PostProcessing({ bloomIntensity = 1.25 }: { bloomIntensity?: number }) {
  const composerRef = useRef<EffectComposer | null>(null)
  const bloomRef = useRef<BloomEffect | null>(null)
  const { gl, scene, camera, size } = useThree()

  useEffect(() => {
    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(scene, camera))

    const bloom = new BloomEffect({
      intensity: bloomIntensity,
      luminanceThreshold: 0.55,
      luminanceSmoothing: 0.75,
      mipmapBlur: true,
    })
    bloomRef.current = bloom

    composer.addPass(
      new EffectPass(camera, bloom),
    )

    composer.setSize(size.width, size.height)
    composerRef.current = composer

    return () => {
      composer.dispose()
      composerRef.current = null
      bloomRef.current = null
    }
  }, [gl, scene, camera]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height)
  }, [size.width, size.height])

  useEffect(() => {
    if (bloomRef.current) {
      bloomRef.current.intensity = bloomIntensity
    }
  }, [bloomIntensity])

  useFrame(() => {
    if (composerRef.current) {
      composerRef.current.render()
    }
  }, 1)

  return null
}