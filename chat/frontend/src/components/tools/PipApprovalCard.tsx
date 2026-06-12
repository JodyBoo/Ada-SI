import type { PipInstallState, ToolPlanCardState } from '../../types/events'
import { escapeHtml } from '../../utils/text'
import { useToolBuildStream } from '../../hooks/useToolBuildStream'

type PipApprovalCardProps = {
  feedId: string
  card: ToolPlanCardState
  pip: PipInstallState
}

export function PipApprovalCard({ feedId, card, pip }: PipApprovalCardProps) {
  const { runPipContinuation, handlePipRejection } = useToolBuildStream()

  const pkgItems = pip.packages.map((pkg) => (
    <li key={pkg}>
      <code>{escapeHtml(pkg)}</code>
    </li>
  ))

  return (
    <div className={`pip-install-card${pip.busy ? ' pip-install-busy' : ''}`} data-pip-id={pip.pipId}>
      <div className="pip-install-header">
        <span className="pip-install-badge">Supply drop approval</span>
        <h4 className="pip-install-title">{card.toolName || 'Skill'}</h4>
      </div>
      <div className="pip-install-body">
        <p>This skill forge needs new supply packages in the shared runtime cache:</p>
        <ul className="pip-install-packages">{pkgItems}</ul>
        {pip.alreadyInstalled && pip.alreadyInstalled.length > 0 && (
          <p className="pip-install-note">
            Already in supply cache: {pip.alreadyInstalled.join(', ')}
          </p>
        )}
        <p className="pip-install-warning">
          Approve only supplies you trust. They persist in the shared environment.
        </p>
      </div>
      <div className="pip-install-actions">
        <button
          type="button"
          className="btn-primary"
          disabled={pip.busy}
          onClick={() => void runPipContinuation(feedId, pip.pipId, card.runId)}
        >
          Approve supplies
        </button>
        <button
          type="button"
          className="btn-ghost"
          disabled={pip.busy}
          onClick={() => void handlePipRejection(feedId, pip.pipId, card.runId)}
        >
          Decline
        </button>
      </div>
    </div>
  )
}
