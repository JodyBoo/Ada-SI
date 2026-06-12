import { useEffect } from 'react'
import { fetchConfig, fetchModels } from '../../api/client'
import { THINKING_EFFORT_STORAGE_KEY } from '../../constants'
import { useAppStore } from '../../state/store'
import { getModelLabel, groupModels, isWildcardModel } from '../../utils/models'
import { normalizeReasoningEffort, REASONING_EFFORT_OPTIONS, type ReasoningEffort } from '../../utils/reasoningEffort'
import { SystemInstructions } from './SystemInstructions'
import { PlayerStatsBar } from './PlayerStatsBar'

export function ModelToolbar() {
  const models = useAppStore((s) => s.models)
  const chatModel = useAppStore((s) => s.chatModel)
  const toolCreatorModel = useAppStore((s) => s.toolCreatorModel)
  const thinkingEffort = useAppStore((s) => s.thinkingEffort)
  const setModels = useAppStore((s) => s.setModels)
  const setChatModel = useAppStore((s) => s.setChatModel)
  const setToolCreatorModel = useAppStore((s) => s.setToolCreatorModel)
  const setThinkingEffort = useAppStore((s) => s.setThinkingEffort)
  const setAppConfig = useAppStore((s) => s.setAppConfig)
  const setStatus = useAppStore((s) => s.setStatus)
  const startNewChat = useAppStore((s) => s.startNewChat)
  const setTools = useAppStore((s) => s.setTools)

  const loadModels = async () => {
    setStatus('Loading agents...')
    try {
      const config = await fetchConfig()
      setAppConfig(config)
      const modelList = (await fetchModels()).filter((id) => !isWildcardModel(id))

      if (modelList.length === 0) {
        setModels([])
        setStatus('No agents available. Add API keys to .env and restart.', true)
        return
      }

      setModels(modelList)

      const preferredChat =
        [chatModel, config.lite_model, config.chat_model].find(
          (v) => v && modelList.includes(v),
        ) || modelList[0]
      const preferredTool =
        [toolCreatorModel, config.tool_creator_model, config.second_model].find(
          (v) => v && modelList.includes(v),
        ) || modelList[0]

      setChatModel(preferredChat)
      setToolCreatorModel(preferredTool)
      if (!localStorage.getItem(THINKING_EFFORT_STORAGE_KEY) && config.lite_model_reasoning_effort) {
        setThinkingEffort(normalizeReasoningEffort(config.lite_model_reasoning_effort))
      }
      const { fetchTools } = await import('../../api/client')
      const tools = await fetchTools()
      setTools(tools)
      setStatus('')
    } catch (error) {
      setModels([])
      setStatus(`Could not load agents: ${(error as Error).message}`, true)
    }
  }

  useEffect(() => {
    void loadModels()
  }, [])

  const grouped = groupModels(models)
  const sortedProviders = [...grouped.keys()].sort((a, b) => a.localeCompare(b))

  const renderSelect = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
  ) => (
    <div className="model-picker model-picker-compact">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        disabled={models.length === 0}
        onChange={(e) => onChange(e.target.value)}
      >
        {models.length === 0 ? (
          <option value="">No models found</option>
        ) : (
          sortedProviders.map((provider) => (
            <optgroup key={provider} label={provider}>
              {(grouped.get(provider) || [])
                .sort((a, b) => a.localeCompare(b))
                .map((model) => (
                  <option key={model} value={model}>
                    {getModelLabel(model)}
                  </option>
                ))}
            </optgroup>
          ))
        )}
      </select>
    </div>
  )

  return (
    <header className="header glass-panel">
      <PlayerStatsBar />

      <div className="toolbar">
        <div className="toolbar-models">
          {renderSelect('chat-model-select', 'Scout agent', chatModel, setChatModel)}
          {renderSelect('second-model-select', 'Forge master', toolCreatorModel, setToolCreatorModel)}
          <div className="model-picker model-picker-compact">
            <label htmlFor="thinking-effort-select">Analysis depth</label>
            <select
              id="thinking-effort-select"
              title="Reasoning depth for Scout agent and Forge master"
              value={thinkingEffort}
              onChange={(e) => setThinkingEffort(e.target.value as ReasoningEffort)}
            >
              {REASONING_EFFORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="toolbar-actions">
          <button
            type="button"
            className="btn-icon"
            title="Reload agents"
            aria-label="Reload agents"
            onClick={() => void loadModels()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={startNewChat}>
            New quest
          </button>
        </div>
      </div>
      <SystemInstructions />
    </header>
  )
}
