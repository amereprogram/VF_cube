import { useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDrag } from '../hooks/useDrag'
import { useCubeInteraction } from '../hooks/useCubeInteraction'
import { COLORS } from '../utils/constants'

const TRACK_RADIUS = 0.45
const BALL_RADIUS = 0.09

interface RollingBallProps {
  onInteraction?: () => void
}

function RollingBall({ onInteraction }: RollingBallProps) {
  const { triggerRoll } = useCubeInteraction()
  const ballRef = useRef<THREE.Mesh>(null!)
  const angleRef = useRef(0)
  const velocityRef = useRef(0)
  const isDragging = useRef(false)
  const lastSoundTime = useRef(0)
  const glowRef = useRef(0)

  const startDrag = useDrag()

  useFrame((state, delta) => {
    if (!isDragging.current) {
      velocityRef.current *= 0.985
      angleRef.current += velocityRef.current * delta
    }

    const x = Math.cos(angleRef.current) * TRACK_RADIUS
    const y = Math.sin(angleRef.current) * TRACK_RADIUS
    ballRef.current.position.set(x, y, BALL_RADIUS + 0.02)

    ballRef.current.rotation.z = -angleRef.current * (TRACK_RADIUS / BALL_RADIUS)

    if (Math.abs(velocityRef.current) > 0.3) {
      const now = state.clock.elapsedTime
      if (now - lastSoundTime.current > 0.09) {
        triggerRoll()
        lastSoundTime.current = now
        glowRef.current = 0.8
      }
    }

    glowRef.current *= 0.93
    const mat = ballRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = glowRef.current
  })

  const handlePointerDown = (e: any) => {
    isDragging.current = true
    onInteraction?.()

    startDrag(
      e,
      (dx, dy) => {
        const movement = (dx - dy) * 0.006
        velocityRef.current = movement * 60
        angleRef.current += movement
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

      {/* Circular track */}
      <mesh position={[0, 0, 0.01]}>
        <torusGeometry args={[TRACK_RADIUS, 0.035, 16, 64]} />
        <meshStandardMaterial
          color={COLORS.ballTrack}
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>

      {/* Track inner guide ring */}
      <mesh position={[0, 0, 0.01]}>
        <torusGeometry args={[TRACK_RADIUS - 0.08, 0.008, 8, 64]} />
        <meshStandardMaterial color="#2a2a2e" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Track outer guide ring */}
      <mesh position={[0, 0, 0.01]}>
        <torusGeometry args={[TRACK_RADIUS + 0.08, 0.008, 8, 64]} />
        <meshStandardMaterial color="#2a2a2e" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Ball */}
      <mesh
        ref={ballRef}
        position={[TRACK_RADIUS, 0, BALL_RADIUS + 0.02]}
        onPointerDown={handlePointerDown}
        castShadow
      >
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color={COLORS.ball}
          roughness={0.25}
          metalness={0.15}
          emissive={COLORS.ball}
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  )
}

export default memo(RollingBall)
