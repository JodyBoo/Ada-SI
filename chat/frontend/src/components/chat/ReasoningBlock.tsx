type ReasoningBlockProps = {
  text: string
  streaming?: boolean
  open?: boolean
  className?: string
}

export function ReasoningBlock({
  text,
  streaming = false,
  open = true,
  className = 'thinking-block',
}: ReasoningBlockProps) {
  if (!text && !streaming) return null

  return (
    <details className={className} open={open}>
      <summary>{streaming && !text ? 'Thinking...' : streaming ? 'Thinking...' : 'Thinking'}</summary>
      <div className="thinking-content">{text}</div>
    </details>
  )
}
