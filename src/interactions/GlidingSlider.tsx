import { useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDrag } from '../hooks/useDrag'
import { useCubeInteraction } from '../hooks/useCubeInteraction'
import { COLORS } from '../utils/constants'

const TRACK_WIDTH = 1.1
const THUMB_RANGE = TRACK_WIDTH / 2 - 0.1

interface GlidingSliderProps {
  onInteraction?: () => void
}

function GlidingSlider({ onInteraction }: GlidingSliderProps) {
  const { triggerSlide } = useCubeInteraction()
  const thumbRef = useRef<THREE.Mesh>(null!)
  const posRef = useRef(0) // -1 to 1
  const isDragging = useRef(false)
  const lastSoundTime = useRef(0)
  const glowRef = useRef(0)

  const startDrag = useDrag()

  useFrame((state) => {
    thumbRef.current.position.x = posRef.current * THUMB_RANGE

    glowRef.current *= 0.93
    const mat = thumbRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = glowRef.current

    if (isDragging.current) {
      const now = state.clock.elapsedTime
      if (now - lastSoundTime.current > 0.06) {
        triggerSlide((posRef.current + 1) / 2)
        lastSoundTime.current = now
      }
    }
  })

  const handlePointerDown = (e: any) => {
    isDragging.current = true
    glowRef.current = 0.6
    onInteraction?.()

    startDrag(
      e,
      (dx) => {
        posRef.current = Math.max(-1, Math.min(1, posRef.current + dx * 0.005))
        glowRef.current = 0.5
      },
      () => {
        isDragging.current = false
      },
    )
  }

  return (
    <group>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshStandardMaterial color={COLORS.facePanel} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Track body */}
      <mesh position={[0, 0, 0.015]} castShadow>
        <boxGeometry args={[TRACK_WIDTH, 0.06, 0.025]} />
        <meshStandardMaterial color={COLORS.sliderTrack} metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Track groove */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[TRACK_WIDTH - 0.08, 0.02, 0.005]} />
        <meshStandardMaterial color="#222" roughness={0.9} metalness={0.2} />
      </mesh>

      {/* Tick marks */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.08, 0.005]}>
          <boxGeometry args={[0.008, 0.03, 0.005]} />
          <meshStandardMaterial color="#444" roughness={0.8} />
        </mesh>
      ))}

      {/* End caps */}
      <mesh position={[-TRACK_WIDTH / 2, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.025, 16]} />
        <meshStandardMaterial color={COLORS.sliderTrack} metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[TRACK_WIDTH / 2, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.025, 16]} />
        <meshStandardMaterial color={COLORS.sliderTrack} metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Thumb */}
      <mesh
        ref={thumbRef}
        position={[0, 0, 0.04]}
        onPointerDown={handlePointerDown}
        castShadow
      >
        <boxGeometry args={[0.14, 0.18, 0.06]} />
        <meshStandardMaterial
          color={COLORS.sliderThumb}
          roughness={0.2}
          metalness={0.2}
          emissive={COLORS.sliderThumb}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Thumb grip lines */}
      {[-0.02, 0, 0.02].map((y, i) => (
        <mesh key={i} position={[0, y, 0.072]}>
          <boxGeometry args={[0.08, 0.008, 0.002]} />
          <meshStandardMaterial color="#1a6a8a" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export default memo(GlidingSlider)
