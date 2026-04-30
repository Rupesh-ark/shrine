import * as THREE from 'three'

export function createTorus() {
  const geometry = new THREE.TorusGeometry(10, 3, 16, 100)
  const material = new THREE.MeshStandardMaterial({
    color: 0x6c63ff,
    roughness: 0.2,
    metalness: 0.3,
  })
  const mesh = new THREE.Mesh(geometry, material)

  function animate() {
    mesh.rotation.x += 0.005
    mesh.rotation.y += 0.0075
  }

  return { mesh, animate }
}
