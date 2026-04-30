import * as THREE from 'three'

export function createLights(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight(0x404060, 2)
  scene.add(ambient)

  const point = new THREE.PointLight(0xffffff, 150)
  point.position.set(10, 10, 10)
  scene.add(point)

  return { ambient, point }
}
