import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listContent } from '../services/contentService'
import ContentCard from '../components/ContentCard'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

function Home() {
  const { user } = useAuth()
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    listContent()
      .then(setContent)
      .catch((err) => setError(err.response?.data?.message || 'Unable to load content.'))
  }, [])

  const displayName = user?.name || user?.email || 'there'

  return (
    <div className="home">
      <h1>Welcome, {displayName.split(' ')[0]}</h1>

      {error && <ErrorMessage message={error} />}

      {!error && !content && <Loading />}

      {content && content.length === 0 && (
        <p className="empty-state">No content available yet.</p>
      )}

      {content && content.length > 0 && (
        <>
          <p className="muted">Select an item to view it.</p>
          <ul className="content-list">
            {content.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default Home