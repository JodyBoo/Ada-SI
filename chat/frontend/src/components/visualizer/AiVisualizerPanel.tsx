import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useVisualizerActivity } from './useVisualizerActivity'

const AiVisualizerCanvas = lazy(() =>
  import('./AiVisualizerCanvas').then((m) => ({ default: m.AiVisualizerCanvas })),
)

function VisualizerFallback() {
  return (
    <div className="ai-visualizer-fallback" aria-hidden="true">
      <span className="ai-visualizer-fallback-pulse" />
    </div>
  )
}

function ReducedMotionFallback({ label }: { label: string }) {
  return (
    <div className="ai-visualizer-static" aria-hidden="true">
      <div className="ai-visualizer-static-core" />
      <div className="ai-visualizer-static-ring ai-visualizer-static-ring-1" />
      <div className="ai-visualizer-static-ring ai-visualizer-static-ring-2" />
      <span className="ai-visualizer-static-label">{label}</span>
    </div>
  )
}

export function AiVisualizerPanel() {
  const activity = useVisualizerActivity()
  const containerRef = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    setMouse({ x: nx, y: ny })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMouse({ x: 0, y: 0 })
  }, [])

  const statusClass = `ai-visualizer-status ai-visualizer-status-${activity.mode}`

  return (
    <section
      className="ai-visualizer-panel glass-panel"
      aria-label="AI neural visualizer"
    >
      <div className="ai-visualizer-header">
        <h2 className="ai-visualizer-title">Neural Core</h2>
        <span className={statusClass} role="status">
          {activity.statusLabel}
        </span>
      </div>
      <div
        ref={containerRef}
        className="ai-visualizer-viewport"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {reducedMotion ? (
          <ReducedMotionFallback label={activity.statusLabel} />
        ) : (
          <Suspense fallback={<VisualizerFallback />}>
            <AiVisualizerCanvas
              activity={activity}
              mouse={mouse}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        )}
      </div>
    </section>
  )
}
