import { memo } from 'react'
import CubeShell from './CubeShell'
import ClickyButtons from '../interactions/ClickyButtons'
import ToggleSwitch from '../interactions/ToggleSwitch'
import RotatingGear from '../interactions/RotatingGear'
import RollingBall from '../interactions/RollingBall'
import GlidingSlider from '../interactions/GlidingSlider'
import JoystickNub from '../interactions/JoystickNub'
import { CUBE_HALF } from '../utils/constants'

interface FidgetCubeProps {
  onInteraction?: () => void
}

function FidgetCube({ onInteraction }: FidgetCubeProps) {
  return (
    <group>
      <CubeShell />

      {/* Front face (+Z): Clicky Buttons */}
      <group position={[0, 0, CUBE_HALF]}>
        <ClickyButtons onInteraction={onInteraction} />
      </group>

      {/* Back face (-Z): Rotating Gear */}
      <group position={[0, 0, -CUBE_HALF]} rotation={[0, Math.PI, 0]}>
        <RotatingGear onInteraction={onInteraction} />
      </group>

      {/* Right face (+X): Toggle Switch */}
      <group position={[CUBE_HALF, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ToggleSwitch onInteraction={onInteraction} />
      </group>

      {/* Left face (-X): Joystick */}
      <group position={[-CUBE_HALF, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <JoystickNub onInteraction={onInteraction} />
      </group>

      {/* Top face (+Y): Rolling Ball */}
      <group position={[0, CUBE_HALF, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <RollingBall onInteraction={onInteraction} />
      </group>

      {/* Bottom face (-Y): Gliding Slider */}
      <group position={[0, -CUBE_HALF, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <GlidingSlider onInteraction={onInteraction} />
      </group>
    </group>
  )
}

export default memo(FidgetCube)
