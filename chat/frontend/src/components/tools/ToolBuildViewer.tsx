import type { ToolPlanCardState } from '../../types/events'
import { useAppStore } from '../../state/store'

type ToolBuildViewerProps = {
  feedId: string
  card: ToolPlanCardState
}

export function ToolBuildViewer({ feedId, card }: ToolBuildViewerProps) {
  const updateToolPlanCard = useAppStore((s) => s.updateToolPlanCard)
  const showStream = card.showCodeStream
  const activeTab = card.codeTab

  return (
    <div className="tool-plan-code-panel">
      <div className="tool-plan-code-header">
        <span className="tool-plan-code-title">{card.codePanelTitle}</span>
        {card.showCodeTabs && (
          <div className="tool-plan-code-tabs">
            <button
              type="button"
              className={`tool-plan-code-tab${activeTab === 'tool' ? ' active' : ''}`}
              data-tab="tool"
              onClick={() => updateToolPlanCard(feedId, { codeTab: 'tool', showCodeStream: false })}
            >
              tool.py
            </button>
            <button
              type="button"
              className={`tool-plan-code-tab${activeTab === 'test' ? ' active' : ''}`}
              data-tab="test"
              onClick={() => updateToolPlanCard(feedId, { codeTab: 'test', showCodeStream: false })}
            >
              test_run.py
            </button>
            <button
              type="button"
              className={`tool-plan-code-tab${activeTab === 'output' ? ' active' : ''}`}
              data-tab="output"
              onClick={() => updateToolPlanCard(feedId, { codeTab: 'output', showCodeStream: false })}
            >
              Output
            </button>
          </div>
        )}
      </div>
      <div className="tool-plan-code-body scroll-area">
        {card.codeThinking && (
          <details
            className="thinking-block tool-viewer-thinking"
            open={!card.codeStream && !card.toolCode}
          >
            <summary>{card.codeStream || card.toolCode ? 'Thinking' : 'Thinking…'}</summary>
            <div className="thinking-content">{card.codeThinking}</div>
          </details>
        )}

        {showStream && (
          <pre className="tool-plan-code-stream">
            <code>{card.codeStream}</code>
          </pre>
        )}

        {!showStream && activeTab === 'tool' && card.toolCode && (
          <pre className="tool-plan-code-view">
            <code className="language-python">{card.toolCode}</code>
          </pre>
        )}

        {!showStream && activeTab === 'test' && card.testCode && (
          <pre className="tool-plan-code-view">
            <code className="language-python">{card.testCode}</code>
          </pre>
        )}

        {activeTab === 'output' && (
          <pre className="tool-viewer-output">
            <code>{card.viewerOutput.join('\n\n')}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
