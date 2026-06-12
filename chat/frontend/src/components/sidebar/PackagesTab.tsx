import { deletePipPackage } from '../../api/client'
import { IconSupply, IconSparkle, IconTrash } from '../icons/GamifiedIcons'
import { useToolBuildStream } from '../../hooks/useToolBuildStream'
import { useAppStore } from '../../state/store'
import type { PipPackage } from '../../types/events'

function PackagesEmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        <IconSparkle size={24} />
      </div>
      <p className="empty-state-title">Supply cache is empty</p>
      <p className="empty-state-text">
        Approved supply packages appear here after skill forges that need new dependencies.
      </p>
    </div>
  )
}

type PackagesTabProps = {
  packages: PipPackage[]
}

export function PackagesTab({ packages }: PackagesTabProps) {
  const setStatus = useAppStore((s) => s.setStatus)
  const { refreshPackages } = useToolBuildStream()

  const handleDelete = async (packageName: string) => {
    if (!confirm(`Remove supply "${packageName}" from the cache?`)) return
    try {
      await deletePipPackage(packageName)
      await refreshPackages()
      setStatus(`Supply "${packageName}" removed from cache.`)
    } catch (error) {
      setStatus(`Remove failed: ${(error as Error).message}`, true)
    }
  }

  if (packages.length === 0) {
    return <PackagesEmptyState />
  }

  return (
    <>
      {packages.map((pkg) => (
        <div key={pkg.name} className="tool-card package-card">
          <button
            type="button"
            className="tool-delete-btn"
            title="Remove supply"
            aria-label={`Remove supply ${pkg.name}`}
            onClick={() => void handleDelete(pkg.name)}
          >
            <IconTrash />
          </button>
          <div className="tool-card-header">
            <span className="tool-card-icon">
              <IconSupply />
            </span>
            <h3 className="tool-card-name">{pkg.name}</h3>
          </div>
          {pkg.version && <p className="tool-card-desc">Version: {pkg.version}</p>}
          {pkg.used_by && pkg.used_by.length > 0 && (
            <p className="tool-card-desc">Powers skills: {pkg.used_by.join(', ')}</p>
          )}
        </div>
      ))}
    </>
  )
}
