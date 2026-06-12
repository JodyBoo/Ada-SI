import { useAppStore } from '../../state/store'

export function SystemInstructions() {
  const systemInstructions = useAppStore((s) => s.systemInstructions)
  const systemPanelOpen = useAppStore((s) => s.systemPanelOpen)
  const setSystemInstructions = useAppStore((s) => s.setSystemInstructions)
  const setSystemPanelOpen = useAppStore((s) => s.setSystemPanelOpen)

  return (
    <details
      className="system-panel"
      open={systemPanelOpen}
      onToggle={(e) => setSystemPanelOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary>Agent directives</summary>
      <label className="sr-only" htmlFor="system-input">
        Agent directives
      </label>
      <textarea
        id="system-input"
        rows={2}
        placeholder="Optional directives to shape ADA's behavior..."
        value={systemInstructions}
        onChange={(e) => setSystemInstructions(e.target.value)}
      />
    </details>
  )
}
