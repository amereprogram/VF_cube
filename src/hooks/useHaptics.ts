import { useCallback } from 'react'

function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export function useHaptics() {
  const vibrateShort = useCallback(() => vibrate(15), [])
  const vibrateMedium = useCallback(() => vibrate(30), [])
  const vibrateLong = useCallback(() => vibrate([20, 10, 40]), [])
  const vibrateGentle = useCallback(() => vibrate(8), [])

  return { vibrateShort, vibrateMedium, vibrateLong, vibrateGentle }
}
