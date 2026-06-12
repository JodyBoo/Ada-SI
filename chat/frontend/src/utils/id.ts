export function createRunId(): string {
  if (crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '')
  }
  return `run${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function createFeedId(): string {
  return `feed-${createRunId()}`
}
