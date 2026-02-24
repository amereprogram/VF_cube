import { useCallback } from 'react'
import { useAudio } from './useAudio'
import { useHaptics } from './useHaptics'

export function useCubeInteraction() {
  const audio = useAudio()
  const haptics = useHaptics()

  const triggerClick = useCallback(() => {
    audio.init()
    audio.playClick()
    haptics.vibrateShort()
  }, [audio, haptics])

  const triggerToggle = useCallback(() => {
    audio.init()
    audio.playToggle()
    haptics.vibrateLong()
  }, [audio, haptics])

  const triggerGearTick = useCallback(() => {
    audio.init()
    audio.playGearTick()
    haptics.vibrateGentle()
  }, [audio, haptics])

  const triggerRoll = useCallback(() => {
    audio.init()
    audio.playRoll()
    haptics.vibrateGentle()
  }, [audio, haptics])

  const triggerSlide = useCallback(
    (pos: number) => {
      audio.init()
      audio.playSlide(pos)
      haptics.vibrateGentle()
    },
    [audio, haptics],
  )

  const triggerJoystick = useCallback(() => {
    audio.init()
    audio.playJoystick()
    haptics.vibrateMedium()
  }, [audio, haptics])

  return { triggerClick, triggerToggle, triggerGearTick, triggerRoll, triggerSlide, triggerJoystick }
}
