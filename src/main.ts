import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { scene, camera, renderer } from './scene'
import { createLights } from './scene/lights'
import { createTorus } from './components/Torus'

createLights(scene)

const { mesh: torus, animate: animateTorus } = createTorus()
scene.add(torus)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05

function tick() {
  requestAnimationFrame(tick)

  animateTorus()
  controls.update()
  renderer.render(scene, camera)
}

tick()
