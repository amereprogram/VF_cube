import { useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDrag } from '../hooks/useDrag'
import { useCubeInteraction } from '../hooks/useCubeInteraction'
import { COLORS } from '../utils/constants'

const MAX_TILT = 0.35

interface JoystickNubProps {
  onInteraction?: () => void
}

function JoystickNub({ onInteraction }: JoystickNubProps) {
  const { triggerJoystick } = useCubeInteraction()
  const stickRef = useRef<THREE.Group>(null!)
  const nubRef = useRef<THREE.Mesh>(null!)
  const tiltX = useRef(0)
  const tiltY = useRef(0)
  const targetX = useRef(0)
  const targetY = useRef(0)
  const isDragging = useRef(false)
  const glowRef = useRef(0)
  const wasActive = useRef(false)

  const startDrag = useDrag()

  useFrame((_, delta) => {
    if (!isDragging.current) {
      targetX.current *= 0.88
      targetY.current *= 0.88
    }

    tiltX.current += (targetX.current - tiltX.current) * Math.min(1, delta * 14)
    tiltY.current += (targetY.current - tiltY.current) * Math.min(1, delta * 14)

    stickRef.current.rotation.x = -tiltY.current
    stickRef.current.rotation.z = -tiltX.current

    const wasActiveNow = Math.abs(tiltX.current) > 0.02 || Math.abs(tiltY.current) > 0.02
    if (wasActive.current && !wasActiveNow && !isDragging.current) {
      triggerJoystick()
    }
    wasActive.current = wasActiveNow

    glowRef.current *= 0.93
    if (nubRef.current) {
      const mat = nubRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = glowRef.current
    }
  })

  const handlePointerDown = (e: any) => {
    isDragging.current = true
    glowRef.current = 0.6
    onInteraction?.()

    startDrag(
      e,
      (dx, dy) => {
        targetX.current = Math.max(-MAX_TILT, Math.min(MAX_TILT, targetX.current + dx * 0.004))
        targetY.current = Math.max(-MAX_TILT, Math.min(MAX_TILT, targetY.current + dy * 0.004))
        glowRef.current = 0.4
      },
      () => {
        isDragging.current = false
        triggerJoystick()
      },
    )
  }

  return (
    <group>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshStandardMaterial color={COLORS.facePanel} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Base ring */}
      <mesh position={[0, 0, 0.01]}>
        <torusGeometry args={[0.3, 0.04, 16, 32]} />
        <meshStandardMaterial
          color={COLORS.joystickBase}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Base plate */}
      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[0.26, 32]} />
        <meshStandardMaterial color="#222226" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Directional markers */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, 0.005]}
        >
          <circleGeometry args={[0.015, 8]} />
          <meshStandardMaterial color="#444" roughness={0.8} />
        </mesh>
      ))}

      {/* Stick group (tilts as a unit) */}
      <group ref={stickRef} position={[0, 0, 0.015]}>
        {/* Stick shaft */}
        <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.04, 0.14, 16]} />
          <meshStandardMaterial color="#444" metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Nub top */}
        <mesh
          ref={nubRef}
          position={[0, 0, 0.15]}
          onPointerDown={handlePointerDown}
          castShadow
        >
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshStandardMaterial
            color={COLORS.joystickNub}
            roughness={0.85}
            metalness={0.05}
            emissive={COLORS.accent}
            emissiveIntensity={0}
          />
        </mesh>
      </group>
    </group>
  )
}

export default memo(JoystickNub)
