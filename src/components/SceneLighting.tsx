export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.42} color="#9CB2D3" />
      <directionalLight position={[4, 7, 3]} intensity={0.62} color="#FFDDB0" />
      <directionalLight position={[-5, 4, 4]} intensity={0.22} color="#7F98B8" />
      <hemisphereLight intensity={0.58} color="#93A9C8" groundColor="#1A2028" />
      <directionalLight position={[0, 7, -7]} intensity={0.18} color="#5C6C84" />

      <spotLight position={[0, 2.6, 2.4]} angle={0.58} penumbra={0.82} intensity={3.1} color="#FFC980" distance={12} />

      <spotLight position={[0, 0.2, 4]} angle={1.1} penumbra={0.9} intensity={1.55} color="#B8D0F0" distance={18} />

      <fog attach="fog" args={['#12182a', 2.0, 20]} />
    </>
  )
}
