import { useCallback, useMemo, useRef } from 'react'

type VibrationPattern = number | number[]

export function useHaptics() {
  const supported = useMemo(() => {
    if (typeof window === 'undefined') return false
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
  }, [])

  const lastPulseAtMs = useRef(0)

  const pulse = useCallback(
    (pattern: VibrationPattern, minIntervalMs = 45) => {
      if (!supported) return false

      // Some browsers silently drop frequent vibration requests.
      const now = performance.now()
      if (now - lastPulseAtMs.current < minIntervalMs) return false
      lastPulseAtMs.current = now

      try {
        return navigator.vibrate(pattern)
      } catch {
        return false
      }
    },
    [supported],
  )

  // NOTE: Very short pulses (<10ms) are often ignored on devices that do support vibration.
  const vibrateShort = useCallback(() => pulse(20, 40), [pulse])
  const vibrateMedium = useCallback(() => pulse(35, 55), [pulse])
  const vibrateLong = useCallback(() => pulse([25, 10, 45], 90), [pulse])
  const vibrateGentle = useCallback(() => pulse(12, 70), [pulse])

  return { supported, vibrateShort, vibrateMedium, vibrateLong, vibrateGentle }
}
