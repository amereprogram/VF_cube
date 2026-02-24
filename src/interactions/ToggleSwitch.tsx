import { useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCubeInteraction } from '../hooks/useCubeInteraction'
import { COLORS } from '../utils/constants'

interface ToggleSwitchProps {
  onInteraction?: () => void
}

const colorOn = new THREE.Color(COLORS.switchOn)
const colorOff = new THREE.Color(COLORS.switchOff)

function ToggleSwitch({ onInteraction }: ToggleSwitchProps) {
  const { triggerToggle } = useCubeInteraction()
  const leverRef = useRef<THREE.Mesh>(null!)
  const trackRef = useRef<THREE.Mesh>(null!)
  const indicatorRef = useRef<THREE.Mesh>(null!)
  const toggledRef = useRef(false)
  const currentX = useRef(-0.25)
  const glowRef = useRef(0)

  useFrame((_, delta) => {
    const targetX = toggledRef.current ? 0.25 : -0.25
    currentX.current += (targetX - currentX.current) * Math.min(1, delta * 14)
    leverRef.current.position.x = currentX.current

    const targetColor = toggledRef.current ? colorOn : colorOff
    const mat = indicatorRef.current.material as THREE.MeshStandardMaterial
    mat.color.lerp(targetColor, Math.min(1, delta * 8))
    mat.emissive.lerp(targetColor, Math.min(1, delta * 8))

    glowRef.current *= 0.92
    mat.emissiveIntensity = glowRef.current * 0.6
  })

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    toggledRef.current = !toggledRef.current
    glowRef.current = 3
    triggerToggle()
    onInteraction?.()
  }

  return (
    <group>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshStandardMaterial color={COLORS.facePanel} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Track body */}
      <mesh ref={trackRef} position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[0.7, 0.28, 0.04]} />
        <meshStandardMaterial color={COLORS.switchBody} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Track groove highlight */}
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[0.6, 0.16, 0.005]} />
        <meshStandardMaterial color="#2a2a2e" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Lever knob */}
      <mesh
        ref={leverRef}
        position={[-0.25, 0, 0.06]}
        onPointerDown={handleClick}
        castShadow
      >
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.15} metalness={0.15} />
      </mesh>

      {/* Status indicator */}
      <mesh ref={indicatorRef} position={[0, -0.3, 0.01]}>
        <circleGeometry args={[0.04, 32]} />
        <meshStandardMaterial
          color={COLORS.switchOff}
          emissive={COLORS.switchOff}
          emissiveIntensity={0}
          roughness={0.5}
        />
      </mesh>

      {/* Labels */}
      <mesh position={[-0.45, 0, 0.01]}>
        <circleGeometry args={[0.02, 16]} />
        <meshStandardMaterial color="#555" roughness={0.8} />
      </mesh>
      <mesh position={[0.45, 0, 0.01]}>
        <circleGeometry args={[0.02, 16]} />
        <meshStandardMaterial color="#555" roughness={0.8} />
      </mesh>
    </group>
  )
}

export default memo(ToggleSwitch)
