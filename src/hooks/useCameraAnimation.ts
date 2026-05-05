import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const OUTSIDE_Z = 5
const INSIDE_Z = -1.5
const SCROLL_Z = -1.8
const BASE_Y = 1.1
const INTRO_Y = 2.75
const DEFAULT_GROUND_TOP_Y = -1.35
const CAMERA_TRANSITION_END = 0.18
const INTRO_LOOK_AT_Y_BIAS = 0.30
const GROUND_HEIGHT = 6

function blendProjectionMatrices(
  target: THREE.Matrix4,
  from: THREE.Matrix4,
  to: THREE.Matrix4,
  t: number,
) {
  const targetElements = target.elements
  const fromElements = from.elements
  const toElements = to.elements

  for (let i = 0; i < 16; i++) {
    targetElements[i] = fromElements[i] + (toElements[i] - fromElements[i]) * t
  }

  return target
}

export function useCameraAnimation(progress: number) {
  const [houseBounds, setHouseBounds] = useState<THREE.Box3 | null>(null)
  const scrollFocusRef = useRef<THREE.Vector3 | null>(null)
  const orthoProjectionRef = useRef(new THREE.Matrix4())
  const perspectiveProjectionRef = useRef(new THREE.Matrix4())
  const blendedProjectionRef = useRef(new THREE.Matrix4())
  const timeRef = useRef(0)

  const handleBounds = useCallback((bounds: THREE.Box3) => {
    setHouseBounds(bounds.clone())
  }, [])

  const handleScrollFocus = useCallback((position: THREE.Vector3) => {
    scrollFocusRef.current = position.clone()
  }, [])

  const groundTopY = houseBounds?.min.y ?? DEFAULT_GROUND_TOP_Y
  const groundCenterY = groundTopY - GROUND_HEIGHT / 2
  const overlayBaseY = groundTopY + 0.01

  const houseFrame = useMemo(() => {
    if (!houseBounds) return null

    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    houseBounds.getCenter(center)
    houseBounds.getSize(size)

    return { center, size }
  }, [houseBounds])

  const scrollLookAt = useMemo(
    () => new THREE.Vector3(0, BASE_Y, 0),
    [],
  )

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--resume-origin-x', '50%')
    root.style.setProperty('--resume-origin-y', '50%')

    return () => {
      root.style.removeProperty('--resume-origin-x')
      root.style.removeProperty('--resume-origin-y')
    }
  }, [])

  useFrame((state, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    const focus = scrollFocusRef.current
    const camera = state.camera as THREE.PerspectiveCamera

    // Debug: log camera position at progress = 0 on first few frames
    if (progress === 0 && timeRef.current < 0.1) {
      // eslint-disable-next-line no-console
      console.log('Camera pos:', camera.position.toArray(), 'houseBounds:', houseBounds?.min.y.toFixed(2) ?? 'null')
    }

    const entryT = THREE.MathUtils.smoothstep(progress, 0.0, 0.55)
    const portalT = THREE.MathUtils.smoothstep(progress, 0.56, 0.84)
    const cameraBlendT = THREE.MathUtils.smoothstep(progress, 0.0, CAMERA_TRANSITION_END)

    const focusZ = focus ? focus.z + 0.15 : SCROLL_Z
    const focusY = focus ? focus.y + 0.35 : BASE_Y
    const entryZ = THREE.MathUtils.lerp(OUTSIDE_Z, INSIDE_Z, entryT)
    const targetZ = THREE.MathUtils.lerp(entryZ, focusZ, portalT)

    const isMobile = state.size.width < 768
    const mobileIntroYOffset = isMobile ? 0.6 : 0
    const doorSafeY = BASE_Y + 0.25
    const approachDoorT = THREE.MathUtils.smoothstep(progress, 0.0, 0.30)
    const yAtDoor = THREE.MathUtils.lerp(INTRO_Y + mobileIntroYOffset, doorSafeY, approachDoorT)
    const settleYT = THREE.MathUtils.smoothstep(progress, 0.50, 0.82)
    const targetY = THREE.MathUtils.lerp(yAtDoor, focusY, settleYT)
    const scrollLookAtTarget = focus
      ? focus.clone().add(new THREE.Vector3(0, -0.15, 0.02))
      : scrollLookAt
    const introLookAtTarget = houseFrame
      ? houseFrame.center.clone().add(new THREE.Vector3(0, houseFrame.size.y * (isMobile ? 0.05 : INTRO_LOOK_AT_Y_BIAS), 0))
      : scrollLookAtTarget
    const lookAtTarget = introLookAtTarget.clone().lerp(scrollLookAtTarget, cameraBlendT)

    const settleT = THREE.MathUtils.smoothstep(progress, 0.78, 0.95)
    const introMotionT = THREE.MathUtils.smoothstep(progress, 0.03, 0.2)
    const breatheX = Math.sin(t * 0.4) * 0.015 * introMotionT * (1 - settleT)
    const breatheY = Math.sin(t * 0.6 + 1) * 0.008 * introMotionT * (1 - settleT)

    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      focus ? focus.x + breatheX : breatheX,
      delta * 2,
    )

    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      delta * 3,
    )
    if (focus) {
      state.camera.position.z = Math.max(state.camera.position.z, focusZ)
    }
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      targetY + breatheY,
      delta * 3,
    )

    state.camera.lookAt(lookAtTarget)
    state.camera.updateMatrixWorld()
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert()

    camera.aspect = state.size.width / state.size.height
    camera.updateProjectionMatrix()

    const cameraDistance = camera.position.distanceTo(lookAtTarget)
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * cameraDistance
    const halfWidth = halfHeight * camera.aspect

    orthoProjectionRef.current.makeOrthographic(
      -halfWidth,
      halfWidth,
      halfHeight,
      -halfHeight,
      camera.near,
      camera.far,
    )
    perspectiveProjectionRef.current.copy(camera.projectionMatrix)
    blendProjectionMatrices(
      blendedProjectionRef.current,
      orthoProjectionRef.current,
      perspectiveProjectionRef.current,
      cameraBlendT,
    )
    camera.projectionMatrix.copy(blendedProjectionRef.current)
    camera.projectionMatrixInverse.copy(blendedProjectionRef.current).invert()

    if (focus) {
      const projected = focus.clone().project(state.camera)
      const projectedOriginX = THREE.MathUtils.clamp((projected.x * 0.5 + 0.5) * 100, 0, 100)
      const projectedOriginY = THREE.MathUtils.clamp(((-projected.y) * 0.5 + 0.5) * 100, 0, 100)
      const centerT = THREE.MathUtils.smoothstep(progress, 0.5, 0.85)
      const originX = THREE.MathUtils.lerp(projectedOriginX, 50, centerT)
      const originY = THREE.MathUtils.lerp(projectedOriginY, 50, centerT)
      document.documentElement.style.setProperty('--resume-origin-x', `${String(originX)}%`)
      document.documentElement.style.setProperty('--resume-origin-y', `${String(originY)}%`)
    }
  })

  return {
    groundTopY,
    groundCenterY,
    overlayBaseY,
    handleBounds,
    handleScrollFocus,
  }
}
