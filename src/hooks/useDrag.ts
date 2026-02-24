import { useRef, useCallback, useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export function useDrag() {
  const { gl } = useThree()
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  const startDrag = useCallback(
    (
      e: { stopPropagation: () => void; nativeEvent?: PointerEvent },
      onDrag: (dx: number, dy: number) => void,
      onEnd?: () => void,
    ) => {
      e.stopPropagation()

      let lastX = e.nativeEvent?.clientX ?? 0
      let lastY = e.nativeEvent?.clientY ?? 0

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - lastX
        const dy = ev.clientY - lastY
        lastX = ev.clientX
        lastY = ev.clientY
        onDrag(dx, dy)
      }

      const onUp = () => {
        gl.domElement.removeEventListener('pointermove', onMove)
        gl.domElement.removeEventListener('pointerup', onUp)
        cleanupRef.current = null
        onEnd?.()
      }

      cleanupRef.current = onUp
      gl.domElement.addEventListener('pointermove', onMove)
      gl.domElement.addEventListener('pointerup', onUp)
    },
    [gl],
  )

  return startDrag
}
