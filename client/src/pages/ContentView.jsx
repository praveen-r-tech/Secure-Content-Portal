import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getContent, getViewUrl } from '../services/contentService'
import PdfViewer from '../components/PdfViewer'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

function ContentView() {
  const { id } = useParams()
  const [content, setContent] = useState(null)
  const [viewUrl, setViewUrl] = useState(null)
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

    getViewUrl(id)
      .then((url) => {
        if (!cancelled) setViewUrl(url)
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

  if (!content || !viewUrl) {
    return <Loading />
  }

  return (
    <div className="content-view">
      <div className="content-view-header">
        <h1>{content.title}</h1>
        {content.description && <p className="content-view-desc">{content.description}</p>}
        <span className="content-type">{content.type}</span>
      </div>

      {content.type === 'video' && (
        <video controls src={viewUrl} className="content-video" />
      )}

      {content.type === 'pdf' && <PdfViewer url={viewUrl} />}

      {content.type === 'html' && (
        <iframe
          sandbox="allow-scripts"
          src={viewUrl}
          className="content-iframe"
          title={content.title}
        />
      )}
    </div>
  )
}

export default ContentView