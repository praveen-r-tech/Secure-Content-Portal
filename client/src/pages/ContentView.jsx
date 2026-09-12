import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getContent } from '../services/contentService'
import PdfViewer from '../components/PdfViewer'
import MarkdownViewer from '../components/MarkdownViewer'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

function ContentView() {
  const { id } = useParams()
  const { user } = useAuth()
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    getContent(id)
      .then((item) => {
        if (!cancelled) setContent(item)
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Unable to load content.')
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!content) {
    return <Loading />
  }

  // Token-gated protected streaming proxy route
  const streamUrl = `/api/content/${id}/stream`
  const watermarkText = `${user?.email || 'viewer@portal'} • Protected View`

  return (
    <div className="content-view">
      <div className="content-view-nav">
        <Link to="/" className="btn-small">
          ← Back to Catalog
        </Link>
      </div>

      <div className="content-view-header">
        <h1>{content.title}</h1>
        {content.description && <p className="content-view-desc">{content.description}</p>}
        <div className="content-badge-row">
          <span className="content-type">{content.type.toUpperCase()}</span>
          <span className="content-category">{content.category}</span>
        </div>
      </div>

      {content.type === 'video' && (
        <div className="video-player-container" onContextMenu={(e) => e.preventDefault()}>
          <video
            controls
            controlsList="nodownload"
            disablePictureInPicture
            src={streamUrl}
            className="content-video"
          />
          <div className="media-watermark">
            <span>{watermarkText}</span>
          </div>
        </div>
      )}

      {content.type === 'pdf' && (
        <PdfViewer url={streamUrl} watermarkText={watermarkText} />
      )}

      {content.type === 'html' && (
        <div className="iframe-container">
          <iframe
            sandbox="allow-scripts"
            src={streamUrl}
            className="content-iframe"
            title={content.title}
          />
          <div className="iframe-watermark-bar">
            <span>Viewing as: {user?.email} • Sandboxed HTML Delivery</span>
          </div>
        </div>
      )}

      {content.type === 'markdown' && (
        <MarkdownViewer url={streamUrl} watermarkText={watermarkText} />
      )}
    </div>
  )
}

export default ContentView