import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader = new GLTFLoader()

export function loadModel(path: string): Promise<GLTF> {
  return loader.loadAsync(path)
}
