import { memo, useCallback } from 'react'
import { useHaptics } from '../hooks/useHaptics'

interface UIOverlayProps {
  muted: boolean
  onToggleMute: () => void
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {muted ? (
        <>
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </>
      ) : (
        <>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" opacity={0.5} />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </>
      )}
    </svg>
  )
}

function UIOverlay({ muted, onToggleMute }: UIOverlayProps) {
  const { supported: hapticsSupported, vibrateGentle } = useHaptics()

  const onToggle = useCallback(() => {
    vibrateGentle()
    onToggleMute()
  }, [onToggleMute, vibrateGentle])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          pointerEvents: 'auto',
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: muted ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)',
          transition: 'all 0.2s ease',
        }}
        aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      >
        <SpeakerIcon muted={muted} />
      </button>

      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.2)',
          fontSize: '0.7rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        <div>Fidget Cube</div>
        {!hapticsSupported && (
          <div style={{ marginTop: 8, letterSpacing: '0.12em', fontSize: '0.6rem', opacity: 0.7 }}>
            Haptics not supported on this device/browser
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(UIOverlay)
