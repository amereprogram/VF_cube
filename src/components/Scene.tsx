import { Suspense } from 'react'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import CubeRig from '../cube/CubeRig'

export default function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} color="#b0c4de" />
      <directionalLight
        position={[5, 8, 3]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <directionalLight position={[-3, 4, -5]} intensity={0.25} color="#6699ff" />
      <spotLight position={[0, 6, 0]} angle={0.5} penumbra={0.5} intensity={0.4} />
      <hemisphereLight args={['#bdd7ff', '#0a0500', 0.3]} />

      <Suspense fallback={null}>
        <Environment preset="studio" background={false} />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={false}
        minDistance={3}
        maxDistance={8}
        dampingFactor={0.05}
        enableDamping
      />

      <CubeRig />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.7}
          luminanceSmoothing={0.4}
          intensity={0.6}
        />
      </EffectComposer>
    </>
  )
}
