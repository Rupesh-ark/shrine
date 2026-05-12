import type { QualityTier } from '../hooks/useIsMobile'
import { DEFAULT_QUALITY } from '../hooks/useIsMobile'

export function SceneLighting({ quality = DEFAULT_QUALITY }: { quality?: QualityTier }) {
  const isLow = quality.level === 'low'

  return (
    <>
      <ambientLight intensity={0.08} color="#8A7A6A" />
      <hemisphereLight intensity={0.2} color="#3A3530" groundColor="#0E0C0C" />
      <directionalLight position={[5, 8, 4]} intensity={1.1} color="#FFE0B4" />
      {!isLow && <directionalLight position={[-4, 5, 5]} intensity={0.35} color="#8FB1D8" />}
      <spotLight position={[0, 3.2, 3.2]} angle={0.46} penumbra={0.45} intensity={2.6} color="#FFC97A" distance={16} />
      {!isLow && <spotLight position={[0, 1.3, -4]} angle={0.72} penumbra={0.55} intensity={0.45} color="#4A4040" distance={20} />}
      <fog attach="fog" args={['#100807', 1.8, 16]} />
    </>
  )
}