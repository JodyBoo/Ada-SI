import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import { useCallback } from 'react'

type MarkdownProps = {
  content: string
  className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
  const CodeBlock = useCallback(
    ({ className: codeClass, children, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
      const isInline = !codeClass
      if (isInline) {
        return (
          <code className={codeClass} {...props}>
            {children}
          </code>
        )
      }
      const lang = codeClass?.replace('language-', '') || 'text'
      const text = String(children).replace(/\n$/, '')
      return (
        <div className="code-block-wrapper">
          <div className="code-block-header">
            <span>{lang}</span>
            <button
              type="button"
              className="code-copy-btn"
              onClick={async () => {
                await navigator.clipboard.writeText(text)
              }}
            >
              Copy
            </button>
          </div>
          <pre>
            <code className={codeClass} {...props}>
              {children}
            </code>
          </pre>
        </div>
      )
    },
    [],
  )

  if (!content) return null

  return (
    <div className={className}>
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          pre: ({ children }) => <>{children}</>,
          code: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
