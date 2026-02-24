import { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import UIOverlay from './components/UIOverlay'
import { audioEngine } from './audio/AudioEngine'
import { CAMERA_POSITION, CAMERA_FOV } from './utils/constants'

function WebGLFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        color: '#fff',
        textAlign: 'center',
        padding: '2rem',
        background: '#0a0a1a',
      }}
    >
      <div>
        <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>WebGL Not Supported</h1>
        <p style={{ opacity: 0.6 }}>
          Your browser or device does not support WebGL, which is required for this experience.
        </p>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a1a',
        color: '#fff',
        zIndex: 100,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid #222',
            borderTopColor: '#2ed1fc',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <p style={{ opacity: 0.5, fontSize: '0.85rem', letterSpacing: '0.1em' }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function checkWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function App() {
  const [muted, setMuted] = useState(false)

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m
      audioEngine.muted = next
      return next
    })
  }, [])

  if (!checkWebGL()) return <WebGLFallback />

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV, near: 0.1, far: 100 }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          style={{ background: '#0a0a1a' }}
        >
          <Scene />
        </Canvas>
      </Suspense>
      <UIOverlay muted={muted} onToggleMute={toggleMute} />
    </>
  )
}
