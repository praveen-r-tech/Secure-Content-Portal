import { useEffect, useState } from 'react'
import { marked } from 'marked'

function MarkdownViewer({ url, watermarkText }) {
  const [content, setContent] = useState('')
  const [viewMode, setViewMode] = useState('rendered') // 'rendered' or 'raw'
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch(url, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch Markdown document')
        return res.text()
      })
      .then((text) => {
        if (!cancelled) {
          setContent(text)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Unable to load Markdown document.')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [url])

  if (loading) {
    return <div className="page-loading">Loading Markdown…</div>
  }

  if (error) {
    return <p className="error-text">{error}</p>
  }

  const renderedHtml = marked.parse(content || '')

  return (
    <div className="markdown-viewer" onContextMenu={(e) => e.preventDefault()}>
      <div className="markdown-header-bar">
        <div className="markdown-mode-toggle">
          <button
            type="button"
            className={`btn-small ${viewMode === 'rendered' ? 'active-mode' : ''}`}
            onClick={() => setViewMode('rendered')}
          >
            Rendered
          </button>
          <button
            type="button"
            className={`btn-small ${viewMode === 'raw' ? 'active-mode' : ''}`}
            onClick={() => setViewMode('raw')}
          >
            Source
          </button>
        </div>
        <span className="markdown-watermark-text">{watermarkText}</span>
      </div>

      <div className="markdown-body-container">
        {viewMode === 'rendered' ? (
          <div
            className="markdown-rendered-content"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        ) : (
          <pre className="markdown-raw-content">
            <code>{content}</code>
          </pre>
        )}
      </div>
    </div>
  )
}

export default MarkdownViewer
