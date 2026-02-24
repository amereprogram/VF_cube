import { useCallback } from 'react'
import { audioEngine } from '../audio/AudioEngine'

export function useAudio() {
  const init = useCallback(() => audioEngine.init(), [])
  const playClick = useCallback(() => audioEngine.playClick(), [])
  const playToggle = useCallback(() => audioEngine.playToggle(), [])
  const playGearTick = useCallback(() => audioEngine.playGearTick(), [])
  const playRoll = useCallback(() => audioEngine.playRoll(), [])
  const playSlide = useCallback((pos: number) => audioEngine.playSlide(pos), [])
  const playJoystick = useCallback(() => audioEngine.playJoystick(), [])

  return { init, playClick, playToggle, playGearTick, playRoll, playSlide, playJoystick }
}
