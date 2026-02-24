import { memo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { CUBE_SIZE, CUBE_RADIUS, COLORS } from '../utils/constants'

function CubeShell() {
  return (
    <RoundedBox
      args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]}
      radius={CUBE_RADIUS}
      smoothness={4}
      castShadow
      receiveShadow
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
