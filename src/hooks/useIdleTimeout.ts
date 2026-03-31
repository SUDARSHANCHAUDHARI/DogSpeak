import { useCallback, useEffect, useRef } from 'react'

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const

export function useIdleTimeout(onIdle: () => void, timeoutMs: number, enabled: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onIdleRef = useRef(onIdle)

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (enabled && timeoutMs > 0) {
      timerRef.current = setTimeout(() => onIdleRef.current(), timeoutMs)
    }
  }, [enabled, timeoutMs])

  useEffect(() => {
    onIdleRef.current = onIdle
  })

  useEffect(() => {
    if (!enabled || timeoutMs <= 0) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    reset()
    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      EVENTS.forEach(e => window.removeEventListener(e, reset))
    }
  }, [enabled, timeoutMs, reset])
}
