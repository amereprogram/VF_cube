import { memo, useCallback, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import FidgetCube from './FidgetCube'
import { useDrag } from '../hooks/useDrag'

interface CubeRigProps {}

// Allow enough pitch to reach the top/bottom faces (>= 90°), but still keep interaction comfortable.
const MAX_PITCH = Math.PI / 2 + 0.15
const SNAP_AFTER_IDLE_MS = 260
const SNAP_SPEED_THRESHOLD = 0.07

const LOCAL_FACE_NORMALS = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
] as const

const WORLD_UP = new THREE.Vector3(0, 1, 0)

function CubeRig(_props: CubeRigProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const startDrag = useDrag()
  const { camera } = useThree()

  const q = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0.4, 0, 'YXZ')))
  const qTarget = useRef<THREE.Quaternion | null>(null)

  const vel = useRef({ yaw: 0, pitch: 0 })
  const isDragging = useRef(false)
  const lastInteractionAt = useRef(0)

  // Reusable temp objects to avoid per-frame allocations.
  const tmp = useRef({
    viewDir: new THREE.Vector3(),
    upProj: new THREE.Vector3(),
    right: new THREE.Vector3(),
    faceWorld: new THREE.Vector3(),
    candWorld: new THREE.Vector3(),
    projA: new THREE.Vector3(),
    projB: new THREE.Vector3(),
    cross: new THREE.Vector3(),
    qAlign: new THREE.Quaternion(),
    q1: new THREE.Quaternion(),
    qRoll: new THREE.Quaternion(),
    yawQ: new THREE.Quaternion(),
    pitchQ: new THREE.Quaternion(),
    euler: new THREE.Euler(0, 0, 0, 'YXZ'),
  })

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  }, [])

  const noteInteraction = useCallback(() => {
    lastInteractionAt.current = performance.now()
  }, [])

  const computeSnapTarget = useCallback(() => {
    const t = tmp.current

    // From cube origin -> camera.
    t.viewDir.copy(camera.position).normalize()
    if (t.viewDir.lengthSq() < 1e-6) return null

    // 1) Find which face is currently most toward the camera.
    let bestFace = 0
    let bestDot = -Infinity
    for (let i = 0; i < LOCAL_FACE_NORMALS.length; i++) {
      t.faceWorld.copy(LOCAL_FACE_NORMALS[i]).applyQuaternion(q.current)
      const d = t.faceWorld.dot(t.viewDir)
      if (d > bestDot) {
        bestDot = d
        bestFace = i
      }
    }

    // 2) Rotate so that face normal points exactly at the camera.
    t.faceWorld.copy(LOCAL_FACE_NORMALS[bestFace]).applyQuaternion(q.current).normalize()
    t.qAlign.setFromUnitVectors(t.faceWorld, t.viewDir)
    t.q1.copy(q.current).premultiply(t.qAlign).normalize()

    // 3) Choose an "up" around the view axis to avoid corner/roll snaps:
    // pick among the four edge directions adjacent to the face (orthogonal axes).
    // Project both candidate-up and world-up onto the view plane, choose best dot.
    t.projB.copy(WORLD_UP).addScaledVector(t.viewDir, -WORLD_UP.dot(t.viewDir))
    if (t.projB.lengthSq() < 1e-6) {
      // If camera is almost aligned with world up, rolling isn't meaningful.
      return new THREE.Quaternion().copy(t.q1)
    }
    t.projB.normalize()

    const faceAxis = bestFace >> 1 // 0=x,1=y,2=z
    const candidates =
      faceAxis === 0
        ? [LOCAL_FACE_NORMALS[2], LOCAL_FACE_NORMALS[3], LOCAL_FACE_NORMALS[4], LOCAL_FACE_NORMALS[5]]
        : faceAxis === 1
          ? [LOCAL_FACE_NORMALS[0], LOCAL_FACE_NORMALS[1], LOCAL_FACE_NORMALS[4], LOCAL_FACE_NORMALS[5]]
          : [LOCAL_FACE_NORMALS[0], LOCAL_FACE_NORMALS[1], LOCAL_FACE_NORMALS[2], LOCAL_FACE_NORMALS[3]]

    let bestUpDot = -Infinity
    let bestUpProjX = 0
    let bestUpProjY = 0
    let bestUpProjZ = 0

    for (let i = 0; i < candidates.length; i++) {
      t.candWorld.copy(candidates[i]).applyQuaternion(t.q1).normalize()
      t.projA.copy(t.candWorld).addScaledVector(t.viewDir, -t.candWorld.dot(t.viewDir))
      if (t.projA.lengthSq() < 1e-6) continue
      t.projA.normalize()
      const d = t.projA.dot(t.projB)
      if (d > bestUpDot) {
        bestUpDot = d
        bestUpProjX = t.projA.x
        bestUpProjY = t.projA.y
        bestUpProjZ = t.projA.z
      }
    }

    if (bestUpDot < -0.5) {
      // Very edge-casey, but avoid a huge roll if the best is still bad.
      return new THREE.Quaternion().copy(t.q1)
    }

    t.projA.set(bestUpProjX, bestUpProjY, bestUpProjZ).normalize()

    // Signed angle from projA -> projB around viewDir.
    t.cross.copy(t.projA).cross(t.projB)
    const sin = t.viewDir.dot(t.cross)
    const cos = THREE.MathUtils.clamp(t.projA.dot(t.projB), -1, 1)
    const angle = Math.atan2(sin, cos)

    t.qRoll.setFromAxisAngle(t.viewDir, angle)
    const out = new THREE.Quaternion().copy(t.q1).premultiply(t.qRoll).normalize()
    return out
  }, [camera])

  useFrame((_, delta) => {
    const nowMs = performance.now()
    const idleForMs = nowMs - lastInteractionAt.current

    if (!isDragging.current) {
      const t = tmp.current

      // Apply inertia (yaw around world up, pitch around camera-right).
      t.viewDir.copy(camera.position).normalize()
      t.right.set(0, 1, 0).cross(t.viewDir).normalize()
      if (t.right.lengthSq() < 1e-6) t.right.set(1, 0, 0)

      const yaw = vel.current.yaw * delta
      const pitch = vel.current.pitch * delta
      if (Math.abs(yaw) > 1e-6) {
        t.yawQ.setFromAxisAngle(WORLD_UP, yaw)
        q.current.premultiply(t.yawQ)
      }
      if (Math.abs(pitch) > 1e-6) {
        t.pitchQ.setFromAxisAngle(t.right, pitch)
        q.current.premultiply(t.pitchQ)
      }

      vel.current.yaw *= 0.92
      vel.current.pitch *= 0.92

      // Idle rotation.
      if (!reducedMotion && idleForMs > 1500) {
        t.yawQ.setFromAxisAngle(WORLD_UP, delta * 0.18)
        q.current.premultiply(t.yawQ)
      }

      // Clamp pitch by extracting a stable YXZ euler (keeps interaction comfortable).
      // NOTE: We do this before snapping so the user can still reach top/bottom faces.
      t.euler.setFromQuaternion(q.current, 'YXZ')
      t.euler.x = THREE.MathUtils.clamp(t.euler.x, -MAX_PITCH, MAX_PITCH)
      q.current.setFromEuler(t.euler)

      // Face snapping: only when motion is settled AND after a short idle delay,
      // so snapping doesn't fight small incremental drags.
      const speed = Math.abs(vel.current.yaw) + Math.abs(vel.current.pitch)
      if (speed < SNAP_SPEED_THRESHOLD && idleForMs > SNAP_AFTER_IDLE_MS) {
        if (!qTarget.current) qTarget.current = computeSnapTarget()
        if (qTarget.current) {
          q.current.slerp(qTarget.current, 1 - Math.exp(-10 * delta))
        }
      } else {
        qTarget.current = null
      }
    }

    groupRef.current.quaternion.copy(q.current)
  })

  const handleShellPointerDown = useCallback(
    (e: any) => {
      noteInteraction()
      isDragging.current = true
      qTarget.current = null

      startDrag(
        e,
        (dx: number, dy: number) => {
          // Drag right -> yaw. Drag down -> pitch (around camera-right axis).
          const sx = 0.006
          const sy = 0.006
          vel.current.yaw = (dx * sx) * 60
          vel.current.pitch = (dy * sy) * 60

          const t = tmp.current
          t.viewDir.copy(camera.position).normalize()
          t.right.set(0, 1, 0).cross(t.viewDir).normalize()
          if (t.right.lengthSq() < 1e-6) t.right.set(1, 0, 0)

          const yaw = dx * sx
          const pitch = dy * sy

          if (Math.abs(yaw) > 1e-6) {
            t.yawQ.setFromAxisAngle(WORLD_UP, yaw)
            q.current.premultiply(t.yawQ)
          }
          if (Math.abs(pitch) > 1e-6) {
            t.pitchQ.setFromAxisAngle(t.right, pitch)
            q.current.premultiply(t.pitchQ)
          }

          // Keep pitch in bounds while dragging too.
          t.euler.setFromQuaternion(q.current, 'YXZ')
          t.euler.x = THREE.MathUtils.clamp(t.euler.x, -MAX_PITCH, MAX_PITCH)
          q.current.setFromEuler(t.euler)
        },
        () => {
          isDragging.current = false
          noteInteraction()
        },
      )
    },
    [camera, noteInteraction, startDrag],
  )

  const handleShellPointerUp = useCallback(() => {
    isDragging.current = false
    noteInteraction()
  }, [noteInteraction])

  const handleShellPointerLeave = useCallback(() => {
    isDragging.current = false
  }, [])

  return (
    <group ref={groupRef}>
      <FidgetCube
        onInteraction={noteInteraction}
        onShellPointerDown={handleShellPointerDown}
        onShellPointerUp={handleShellPointerUp}
        onShellPointerLeave={handleShellPointerLeave}
      />
    </group>
  )
}

export default memo(CubeRig)

