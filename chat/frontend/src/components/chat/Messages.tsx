import { useEffect, useRef } from 'react'
import { SCROLL_THRESHOLD } from '../../constants'
import { useAppStore } from '../../state/store'
import type { FeedItem } from '../../types/events'
import { MessageRow } from './MessageRow'
import { ToolPlanCard } from '../tools/ToolPlanCard'
import { Welcome } from './Welcome'

type MessagesProps = {
  feed: FeedItem[]
}

export function Messages({ feed }: MessagesProps) {
  const messagesRef = useRef<HTMLElement>(null)
  const isSending = useAppStore((s) => s.isSending)
  const setShowScrollBottom = useAppStore((s) => s.setShowScrollBottom)

  const shouldAutoScroll = () => {
    const el = messagesRef.current
    if (!el) return true
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    return distance <= SCROLL_THRESHOLD
  }

  const scrollToBottom = (force = false) => {
    const el = messagesRef.current
    if (!el) return
    if (!force && !shouldAutoScroll()) {
      if (isSending) setShowScrollBottom(true)
      return
    }
    el.scrollTop = el.scrollHeight
    setShowScrollBottom(false)
  }

  useEffect(() => {
    scrollToBottom()
  }, [feed, isSending])

  const onScroll = () => {
    if (shouldAutoScroll()) {
      setShowScrollBottom(false)
    } else if (isSending) {
      setShowScrollBottom(true)
    }
  }

  return (
    <main
      ref={messagesRef}
      className="messages scroll-area"
      aria-live="polite"
      onScroll={onScroll}
    >
      {feed.length === 0 && <Welcome />}
      {feed.map((item) => {
        if (item.type === 'tool-plan') {
          return <ToolPlanCard key={item.id} feedId={item.id} card={item.card} />
        }
        if (item.type === 'user') {
          return <MessageRow key={item.id} item={item} />
        }
        if (item.hidden) return null
        return <MessageRow key={item.id} item={item} />
      })}
    </main>
  )
}
