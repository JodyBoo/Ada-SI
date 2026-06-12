import type { ProcessStepStatus } from '../../types/events'

type ProcessStepProps = {
  stepId: string
  label: string
  status: ProcessStepStatus
  model?: string
  detail?: string
}

function stepIconSvg(status: ProcessStepStatus) {
  if (status === 'done') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-6" />
      </svg>
    )
  }
  if (status === 'active') {
    return (
      <svg className="icon-active-ring" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    )
  }
  if (status === 'error') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

export function ProcessStep({ label, status, model, detail }: ProcessStepProps) {
  const metaParts = [model, detail].filter(Boolean)
  const statusClass = status === 'skipped' ? 'step-skipped' : `step-${status}`

  return (
    <li className={`process-step ${statusClass}`}>
      <span className="process-step-icon">{stepIconSvg(status)}</span>
      <div className="process-step-content">
        <div className="process-step-label">{label}</div>
        {metaParts.map((m) => (
          <div key={m} className="process-step-meta">
            {m}
          </div>
        ))}
      </div>
    </li>
  )
}
