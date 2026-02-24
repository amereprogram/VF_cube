import { useRef, useMemo, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDrag } from '../hooks/useDrag'
import { useCubeInteraction } from '../hooks/useCubeInteraction'
import { COLORS } from '../utils/constants'

const TEETH = 12
const OUTER_R = 0.55
const INNER_R = 0.42
const TOOTH_ANGLE = (Math.PI * 2) / TEETH

function createGearShape(): THREE.Shape {
  const shape = new THREE.Shape()
  const points = TEETH * 4

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2
    const isOuter = i % 4 === 1 || i % 4 === 2
    const r = isOuter ? OUTER_R : INNER_R
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()

  const hole = new THREE.Path()
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2
    if (i === 0) hole.moveTo(Math.cos(a) * 0.06, Math.sin(a) * 0.06)
    else hole.lineTo(Math.cos(a) * 0.06, Math.sin(a) * 0.06)
  }
  shape.holes.push(hole)

  return shape
}

interface RotatingGearProps {
  onInteraction?: () => void
}

function RotatingGear({ onInteraction }: RotatingGearProps) {
  const { triggerGearTick } = useCubeInteraction()
  const gearRef = useRef<THREE.Mesh>(null!)
  const rotationRef = useRef(0)
  const velocityRef = useRef(0)
  const isDragging = useRef(false)
  const lastTickSlot = useRef(0)
  const glowRef = useRef(0)

  const geometry = useMemo(() => {
    const shape = createGearShape()
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 2,
    })
  }, [])

  const startDrag = useDrag()

  useFrame((_, delta) => {
    if (!isDragging.current) {
      velocityRef.current *= 0.96
      rotationRef.current += velocityRef.current * delta
    }

    gearRef.current.rotation.z = rotationRef.current

    glowRef.current *= 0.94
    const mat = gearRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = glowRef.current

    const currentSlot = Math.floor(rotationRef.current / TOOTH_ANGLE)
    if (currentSlot !== lastTickSlot.current && (isDragging.current || Math.abs(velocityRef.current) > 0.3)) {
      lastTickSlot.current = currentSlot
      triggerGearTick()
      glowRef.current = 1.5
    }
  })

  const handlePointerDown = (e: any) => {
    isDragging.current = true
    onInteraction?.()

    startDrag(
      e,
      (dx) => {
        const delta = dx * 0.008
        velocityRef.current = delta * 60
        rotationRef.current += delta
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

      <mesh
        ref={gearRef}
        geometry={geometry}
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        castShadow
      >
        <meshStandardMaterial
          color={COLORS.gearMetal}
          metalness={0.9}
          roughness={0.25}
          emissive={COLORS.accent}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Center axle */}
      <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.06, 16]} />
        <meshStandardMaterial color="#555" metalness={0.95} roughness={0.2} />
      </mesh>
    </group>
  )
}

export default memo(RotatingGear)
