import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  VignetteEffect,
  NoiseEffect,
  BlendFunction,
} from 'postprocessing'

export function PostProcessing({ bloomIntensity = 1.25 }: { bloomIntensity?: number }) {
  const composerRef = useRef<EffectComposer | null>(null)
  const { gl, scene, camera, size } = useThree()

  useEffect(() => {
    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(scene, camera))
    const noiseEffect = new NoiseEffect({
      blendFunction: BlendFunction.SOFT_LIGHT,
      premultiply: false,
    })
    noiseEffect.blendMode.setOpacity(0.07)
    composer.addPass(
      new EffectPass(
        camera,
        new BloomEffect({
          intensity: bloomIntensity,
          luminanceThreshold: 0.55,
          luminanceSmoothing: 0.75,
          mipmapBlur: true,
        }),
        new VignetteEffect({
          offset: 0.2,
          darkness: 0.35,
        }),
        noiseEffect,
      ),
    )

    composer.setSize(size.width, size.height)
    composerRef.current = composer

    return () => {
      composer.dispose()
    }
  }, [gl, scene, camera, size.width, size.height, bloomIntensity])

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height)
  }, [size])

  useFrame(() => {
    if (composerRef.current) {
      composerRef.current.render()
    }
  }, 1)

  return null
}