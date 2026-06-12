export type ReasoningEffort = 'off' | 'low' | 'medium' | 'high'

export const REASONING_EFFORT_OPTIONS: Array<{ value: ReasoningEffort; label: string }> = [
  { value: 'off', label: 'Swift' },
  { value: 'low', label: 'Focused' },
  { value: 'medium', label: 'Tactical' },
  { value: 'high', label: 'Deep scan' },
]

export function isReasoningEffort(value: string): value is ReasoningEffort {
  return REASONING_EFFORT_OPTIONS.some((option) => option.value === value)
}

export function normalizeReasoningEffort(value: string | undefined, fallback: ReasoningEffort = 'low'): ReasoningEffort {
  if (value && isReasoningEffort(value)) return value
  return fallback
}
