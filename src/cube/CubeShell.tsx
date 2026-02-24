import { memo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { CUBE_SIZE, CUBE_RADIUS, COLORS } from '../utils/constants'

type CubeShellProps = {
  onPointerDown?: (e: any) => void
  onPointerUp?: (e: any) => void
  onPointerLeave?: (e: any) => void
}

function CubeShell(props: CubeShellProps) {
  return (
    <RoundedBox
      args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]}
      radius={CUBE_RADIUS}
      smoothness={4}
      castShadow
      receiveShadow
      {...props}
    >
      <meshStandardMaterial
        color={COLORS.body}
        metalness={0.85}
        roughness={0.35}
      />
    </RoundedBox>
  )
}

export default memo(CubeShell)
