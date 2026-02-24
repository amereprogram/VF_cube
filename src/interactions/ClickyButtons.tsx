import { useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCubeInteraction } from '../hooks/useCubeInteraction'
import { COLORS } from '../utils/constants'

const BUTTON_LAYOUT: { pos: [number, number]; color: string }[] = [
  { pos: [0, 0], color: COLORS.buttonRed },
  { pos: [0, 0.38], color: COLORS.buttonBlue },
  { pos: [0.38, 0], color: COLORS.buttonGreen },
  { pos: [0, -0.38], color: COLORS.buttonYellow },
  { pos: [-0.38, 0], color: COLORS.buttonPurple },
]

interface ButtonProps {
  x: number
  y: number
  color: string
  onPress: () => void
}

function Button({ x, y, color, onPress }: ButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const pressed = useRef(0)
  const target = useRef(0)
  const glow = useRef(0)

  useFrame((_, delta) => {
    pressed.current += (target.current - pressed.current) * Math.min(1, delta * 22)
    meshRef.current.position.z = 0.04 - pressed.current * 0.035

    glow.current *= 0.9
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = glow.current
  })

  return (
    <mesh
      ref={meshRef}
      position={[x, y, 0.04]}
      rotation={[Math.PI / 2, 0, 0]}
      onPointerDown={(e) => {
        e.stopPropagation()
        target.current = 1
        glow.current = 2
        onPress()
      }}
      onPointerUp={() => { target.current = 0 }}
      onPointerLeave={() => { target.current = 0 }}
      castShadow
    >
      <cylinderGeometry args={[0.11, 0.12, 0.06, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.85}
        metalness={0.05}
        emissive={color}
        emissiveIntensity={0}
      />
    </mesh>
  )
}

interface ClickyButtonsProps {
  onInteraction?: () => void
}

function ClickyButtons({ onInteraction }: ClickyButtonsProps) {
  const { triggerClick } = useCubeInteraction()

  const handlePress = () => {
    triggerClick()
    onInteraction?.()
  }

  return (
    <group>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshStandardMaterial color={COLORS.facePanel} roughness={0.95} metalness={0.05} />
      </mesh>

      {BUTTON_LAYOUT.map((btn, i) => (
        <Button
          key={i}
          x={btn.pos[0]}
          y={btn.pos[1]}
          color={btn.color}
          onPress={handlePress}
        />
      ))}
    </group>
  )
}

export default memo(ClickyButtons)
