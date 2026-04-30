import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'

export function App() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 30], fov: 75, near: 0.1, far: 1000 }}
      gl={{ antialias: true }}
      style={{ position: 'fixed', inset: 0 }}
    >
      <color attach="background" args={['#0a0a1a']} />
      <Scene />
    </Canvas>
  )
}
