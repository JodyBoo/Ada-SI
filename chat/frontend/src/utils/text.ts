export function truncateText(text: string, max = 80): string {
  if (!text || text.length <= max) return text
  return `${text.slice(0, max)}…`
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function parseErrorMessage(raw: string): string {
  if (!raw) return 'Unknown error'
  try {
    const json = JSON.parse(raw) as Record<string, unknown>
    const detail = json.detail
    if (typeof detail === 'string') return detail
    if (detail && typeof detail === 'object' && 'message' in detail) {
      return String((detail as { message: string }).message)
    }
    const error = json.error as { message?: string } | undefined
    return error?.message || (json.message as string) || raw
  } catch {
    return raw
  }
}
