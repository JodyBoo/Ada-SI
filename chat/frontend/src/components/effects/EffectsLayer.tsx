import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../state/store'
import { spawnConfetti } from './confetti'
import { playUnlockSound } from './unlockSound'
import { SkillUnlockModal } from './SkillUnlockModal'

export function EffectsLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const celebration = useAppStore((s) => s.celebration)
  const clearCelebration = useAppStore((s) => s.clearCelebration)
  const clearRecentlyUnlockedTool = useAppStore((s) => s.clearRecentlyUnlockedTool)
  const lastCelebrationId = useRef<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    if (!celebration) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearCelebration()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [celebration, clearCelebration])

  useEffect(() => {
    if (!celebration || celebration.id === lastCelebrationId.current) return
    lastCelebrationId.current = celebration.id

    const canvas = canvasRef.current
    let stopConfetti: (() => void) | undefined
    if (canvas) {
      stopConfetti = spawnConfetti(canvas, canvas.width * 0.5, canvas.height * 0.42)
    }
    playUnlockSound(celebration.leveledUp)

    const highlightTimer = window.setTimeout(() => clearRecentlyUnlockedTool(), 6000)

    return () => {
      stopConfetti?.()
      window.clearTimeout(highlightTimer)
    }
  }, [celebration, clearRecentlyUnlockedTool])

  return (
    <>
      <canvas ref={canvasRef} className="effects-canvas" aria-hidden="true" />
      <AnimatePresence>
        {celebration && (
          <SkillUnlockModal
            key={celebration.id}
            event={celebration}
            onDismiss={clearCelebration}
          />
        )}
      </AnimatePresence>
    </>
  )
}
