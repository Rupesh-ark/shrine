import * as THREE from 'three'

const canvas = document.getElementById('bg') as HTMLCanvasElement

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0a0a1a)

const sizes = { width: window.innerWidth, height: window.innerHeight }

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000,
)
camera.position.setZ(30)

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

function onResize() {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
}

window.addEventListener('resize', onResize)

export { scene, camera, renderer, sizes }
