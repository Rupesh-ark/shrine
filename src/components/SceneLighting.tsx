export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.24} color="#C6D7EF" />
      <hemisphereLight intensity={0.42} color="#B9D2F0" groundColor="#141820" />
      <directionalLight position={[5, 8, 4]} intensity={1.1} color="#FFE0B4" />
      <directionalLight position={[-4, 5, 5]} intensity={0.35} color="#8FB1D8" />
      <spotLight position={[0, 3.2, 3.2]} angle={0.46} penumbra={0.45} intensity={2.6} color="#FFC97A" distance={16} />
      <spotLight position={[0, 1.3, -4]} angle={0.72} penumbra={0.55} intensity={0.85} color="#A5C7F2" distance={20} />
      <fog attach="fog" args={['#10131C', 2.5, 18]} />
    </>
  )
}
