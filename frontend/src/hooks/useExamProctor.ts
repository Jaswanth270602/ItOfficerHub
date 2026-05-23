import { useCallback, useEffect, useRef, useState } from 'react'

export type ViolationReason = 'fullscreen' | 'visibility' | 'manual'

export function useExamProctor(active: boolean, onViolation: (reason: ViolationReason) => void) {
  const violatedRef = useRef(false)
  const onViolationRef = useRef(onViolation)
  onViolationRef.current = onViolation

  const [isFullscreen, setIsFullscreen] = useState(false)

  const triggerViolation = useCallback((reason: ViolationReason) => {
    if (violatedRef.current || !active) return
    violatedRef.current = true
    onViolationRef.current(reason)
  }, [active])

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
      return true
    } catch {
      setIsFullscreen(!!document.fullscreenElement)
      return !!document.fullscreenElement
    }
  }, [])

  useEffect(() => {
    if (!active) return

    const onFullscreenChange = () => {
      const fs = !!document.fullscreenElement
      setIsFullscreen(fs)
      if (!fs) triggerViolation('fullscreen')
    }

    const onVisibility = () => {
      if (document.hidden) triggerViolation('visibility')
    }

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', onBeforeUnload)
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [active, triggerViolation])

  return { enterFullscreen, isFullscreen, triggerViolation }
}
