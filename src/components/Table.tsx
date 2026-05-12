import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Vector3 } from 'three'
import type { GLTF } from 'three-stdlib'
import type { TableWithCushionsProps } from '../types'

const TABLE_URL = '/models/table/table_with_cusions.glb'
const TABLE_HEIGHT = 0.3
export const TABLE_OFFSET_Z = 0.8

export function TableWithCushions({ floorY, centerZ }: TableWithCushionsProps) {
  const { scene } = useGLTF(TABLE_URL, '/draco/') as GLTF

  const centeredScene = useMemo(() => {
    const clone = scene.clone()

    const box = new Box3().setFromObject(clone)
    const size = new Vector3()
    box.getSize(size)
    const center = new Vector3()
    box.getCenter(center)

    const scale = size.y > 0 ? TABLE_HEIGHT / size.y : 0.02
    clone.scale.setScalar(scale)

    const scaledBox = new Box3().setFromObject(clone)
    const scaledCenter = new Vector3()
    scaledBox.getCenter(scaledCenter)

    clone.position.set(-scaledCenter.x, -scaledBox.min.y, -scaledCenter.z)
    clone.rotation.set(0, 0, 0)
    clone.updateMatrix()

    return clone
  }, [scene])

  return (
    <group
      position={[0, floorY, centerZ - TABLE_OFFSET_Z]}
      rotation={[0, 0, 0]}
    >
      <primitive object={centeredScene} />
    </group>
  )
}
