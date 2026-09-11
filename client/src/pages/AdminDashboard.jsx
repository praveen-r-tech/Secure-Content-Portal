import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { listContent } from '../services/contentService'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

function AdminDashboard() {
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    listContent()
      .then(setContent)
      .catch((err) => setError(err.response?.data?.message || 'Unable to load content.'))
  }, [])

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!content) {
    return <Loading />
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <Link to="/admin/upload" className="btn-primary">
        Upload Content
      </Link>

      {content.length === 0 && (
        <p className="empty-state">No content yet. Upload your first item.</p>
      )}

      {content.length > 0 && (
        <ul className="content-list">
          {content.map((item) => (
            <li key={item.id} className="content-item">
              <div className="content-item-body">
                <h2 className="content-item-title">{item.title}</h2>
                <p className="content-item-desc">{item.description}</p>
              </div>
              <span className="content-type">{item.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AdminDashboard